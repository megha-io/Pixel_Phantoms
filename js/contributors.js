// GitHub Repository Configuration
const REPO_OWNER = 'sayeeg-11';
const REPO_NAME = 'Pixel_Phantoms';
const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

// State
let contributorsData = []; 
let currentPage = 1;
const itemsPerPage = 8;

// Point System Weights (Strict PR Logic)
const POINTS = {
    L3: 11,
    L2: 5,
    L1: 2,
    DEFAULT: 1
};

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    initData();
    fetchRecentActivity();
    setupModalEvents(); // [FIX] Initialize modal listeners safely
});

// 1. Master Initialization Function
async function initData() {
    try {
        // Fetch Repo Info, Contributors, and Total Commits
        const [repoRes, contributorsRes, totalCommits] = await Promise.all([
            fetch(API_BASE),
            fetch(`${API_BASE}/contributors?per_page=100`),
            fetchTotalCommits()
        ]);

        const repoData = await repoRes.json();
        const rawContributors = await contributorsRes.json();
        
        // Fetch Pull Requests (Recursive) to capture history
        const rawPulls = await fetchAllPulls();

        processData(repoData, rawContributors, rawPulls, totalCommits);

    } catch (error) {
        console.error('Error initializing data:', error);
        document.getElementById('contributors-grid').innerHTML = '<p>Failed to load data.</p>';
    }
}

// Helper: Fetch Total Commits using Link Header Strategy
async function fetchTotalCommits() {
    try {
        const res = await fetch(`${API_BASE}/commits?per_page=1`);
        const linkHeader = res.headers.get('Link');
        if (linkHeader) {
            const match = linkHeader.match(/[?&]page=(\d+)[^>]*>; rel="last"/);
            if (match) return match[1];
        }
        const data = await res.json();
        return data.length;
    } catch (e) {
        return "50+"; 
    }
}

// Helper: Fetch up to 300 PRs
async function fetchAllPulls() {
    let pulls = [];
    let page = 1;
    while (page <= 3) {
        try {
            const res = await fetch(`${API_BASE}/pulls?state=all&per_page=100&page=${page}`);
            const data = await res.json();
            if (!data.length) break;
            pulls = pulls.concat(data);
            page++;
        } catch (e) { break; }
    }
    return pulls;
}

// 2. Process & Merge Data
function processData(repoData, contributors, pulls, totalCommits) {
    const leadAvatar = document.getElementById('lead-avatar');
    const statsMap = {};

    let totalProjectPRs = 0;
    let totalProjectPoints = 0;

    pulls.forEach(pr => {
        if (!pr.merged_at) return; 

        const user = pr.user.login;
        if (!statsMap[user]) statsMap[user] = { prs: 0, points: 0 };

        statsMap[user].prs++;
        totalProjectPRs++;

        let prPoints = 0;
        let hasLevel = false;

        pr.labels.forEach(label => {
            const name = label.name.toLowerCase();
            if (name.includes('level 3') || name.includes('level-3')) {
                prPoints += POINTS.L3;
                hasLevel = true;
            } else if (name.includes('level 2') || name.includes('level-2')) {
                prPoints += POINTS.L2;
                hasLevel = true;
            } else if (name.includes('level 1') || name.includes('level-1')) {
                prPoints += POINTS.L1;
                hasLevel = true;
            }
        });

        if (!hasLevel) prPoints += POINTS.DEFAULT;

        statsMap[user].points += prPoints;
        totalProjectPoints += prPoints;
    });

    contributorsData = contributors.map(c => {
        const login = c.login;
        const userStats = statsMap[login] || { prs: 0, points: 0 };
        const totalScore = userStats.points;

        if (login.toLowerCase() === REPO_OWNER.toLowerCase()) {
            if (leadAvatar) leadAvatar.src = c.avatar_url;
        }

        return {
            ...c,
            prs: userStats.prs,
            points: totalScore 
        };
    });

    contributorsData = contributorsData
        .filter(c => c.login.toLowerCase() !== REPO_OWNER.toLowerCase() && c.prs > 0)
        .sort((a, b) => b.points - a.points); 

    updateGlobalStats(
        contributorsData.length, 
        totalProjectPRs, 
        totalProjectPoints, 
        repoData.stargazers_count, 
        repoData.forks_count,
        totalCommits
    );

    renderContributors(1);
}

function updateGlobalStats(count, prs, points, stars, forks, commits) {
    document.getElementById('total-contributors').textContent = count;
    document.getElementById('total-prs').textContent = prs;
    document.getElementById('total-points').textContent = points;
    document.getElementById('total-stars').textContent = stars;
    document.getElementById('total-forks').textContent = forks;
    document.getElementById('total-commits').textContent = commits; 
}

// 3. Get League/Badge Data
function getLeagueData(points) {
    if (points > 150) {
        return { text: 'Gold 🏆', class: 'badge-gold', tier: 'tier-gold', label: 'Gold League' };
    } else if (points > 75) {
        return { text: 'Silver 🥈', class: 'badge-silver', tier: 'tier-silver', label: 'Silver League' };
    } else if (points > 30) {
        return { text: 'Bronze 🥉', class: 'badge-bronze', tier: 'tier-bronze', label: 'Bronze League' };
    } else {
        return { text: 'Contributor 🎖️', class: 'badge-contributor', tier: 'tier-contributor', label: 'Contributor' };
    }
}

// 4. Render Grid
function renderContributors(page) {
    const grid = document.getElementById('contributors-grid');
    grid.innerHTML = '';

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = contributorsData.slice(start, end);

    if (paginatedItems.length === 0) {
        grid.innerHTML = '<p>No active contributors found (Must have at least 1 Merged PR).</p>';
        return;
    }

    paginatedItems.forEach((contributor, index) => {
        const globalRank = start + index + 1;
        const league = getLeagueData(contributor.points);

        const card = document.createElement('div');
        card.className = `contributor-card ${league.tier}`;
        
        card.addEventListener('click', () => openModal(contributor, league, globalRank));

        card.innerHTML = `
            <img src="${contributor.avatar_url}" alt="${contributor.login}">
            <span class="cont-name">${contributor.login}</span>
            <span class="cont-commits-badge ${league.class}">
                PRs: ${contributor.prs} | Pts: ${contributor.points}
            </span>
        `;
        grid.appendChild(card);
    });

    renderPaginationControls(page);
}

function renderPaginationControls(page) {
    const container = document.getElementById('pagination-controls');
    const totalPages = Math.ceil(contributorsData.length / itemsPerPage);

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <button class="pagination-btn" ${page === 1 ? 'disabled' : ''} onclick="changePage(${page - 1})">
            <i class="fas fa-chevron-left"></i> Prev
        </button>
        <span class="page-info">Page ${page} of ${totalPages}</span>
        <button class="pagination-btn" ${page === totalPages ? 'disabled' : ''} onclick="changePage(${page + 1})">
            Next <i class="fas fa-chevron-right"></i>
        </button>
    `;
}

window.changePage = function(newPage) {
    currentPage = newPage;
    renderContributors(newPage);
};

// 5. Modal Logic & Event Listeners
function setupModalEvents() {
    const modal = document.getElementById('contributor-modal');
    const closeBtn = document.querySelector('.close-modal');

    // [FIX] Close on Cross Button Click
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent bubble up
            closeModal();
        });
    }

    // [FIX] Close on Outside Click (Overlay)
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // [FIX] Close on Escape Key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

function openModal(contributor, league, rank) {
    const modal = document.getElementById('contributor-modal');
    const modalContainer = modal.querySelector('.modal-container');

    document.getElementById('modal-avatar').src = contributor.avatar_url;
    document.getElementById('modal-name').textContent = contributor.login;
    document.getElementById('modal-id').textContent = `ID: ${contributor.id}`; 
    
    document.getElementById('modal-rank').textContent = `#${rank}`;
    document.getElementById('modal-score').textContent = contributor.points;
    document.getElementById('modal-prs').textContent = contributor.prs;
    document.getElementById('modal-commits').textContent = contributor.contributions;
    document.getElementById('modal-league-badge').textContent = league.label;

    const prLink = `https://github.com/${REPO_OWNER}/${REPO_NAME}/pulls?q=is%3Apr+author%3A${contributor.login}`;
    document.getElementById('modal-pr-link').href = prLink;
    document.getElementById('modal-profile-link').href = contributor.html_url;

    // Reset & Add League Class for Dynamic Coloring
    modalContainer.className = 'modal-container'; 
    modalContainer.classList.add(league.tier);

    modal.classList.add('active');
}

// Global close function for inline usage compatibility
window.closeModal = function() {
    const modal = document.getElementById('contributor-modal');
    if(modal) modal.classList.remove('active');
}

// 6. Recent Activity
async function fetchRecentActivity() {
    try {
        const response = await fetch(`${API_BASE}/commits?per_page=10`);
        const commits = await response.json();
        const activityList = document.getElementById('activity-list');
        
        if(activityList) {
            activityList.innerHTML = '';
            commits.forEach(item => {
                const date = new Date(item.commit.author.date).toLocaleDateString();
                const message = item.commit.message;
                const author = item.commit.author.name;

                const row = document.createElement('div');
                row.className = 'activity-item';
                row.innerHTML = `
                    <div class="activity-marker"></div>
                    <div class="commit-msg">
                        <span style="color: var(--accent-color)">${author}</span>: ${message}
                    </div>
                    <div class="commit-date">${date}</div>
                `;
                activityList.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error fetching activity:', error);
    }
}