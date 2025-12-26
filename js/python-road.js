document.addEventListener('DOMContentLoaded', () => {
    loadPythonRoadmap();
});

async function loadPythonRoadmap() {
    const container = document.getElementById('roadmap-content');
    const ROADMAP_KEY = 'ai'; // Using 'ai' as fallback since you requested its inspiration
    
    try {
        const response = await fetch('../data/roadmaps.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        // Take chapters from the 'ai' key as inspiration or 'python' if added
        const roadmap = data[ROADMAP_KEY];
        container.innerHTML = ''; // Clear loading state

        roadmap.phases.forEach((phase, index) => {
            const side = index % 2 === 0 ? 'left' : 'right';
            const phaseBlock = document.createElement('div');
            phaseBlock.className = `chapter-node ${side}`;
            
            phaseBlock.innerHTML = `
                <div class="node-header">
                    <h3>${phase.title}</h3>
                    <button class="toggle-btn" onclick="togglePythonModule(this)">+</button>
                </div>
                <div class="chapter-details">
                    <p class="phase-desc">${phase.status === 'locked' ? ' [LOCKED] ' : ''} Initialize phase parameters...</p>
                    <div class="module-list">
                        ${phase.modules.map(mod => `
                            <a href="${mod.link}" target="_blank" class="module-link">
                                <i class="fas fa-code-branch"></i> ${mod.title}
                            </a>
                        `).join('')}
                    </div>
                </div>
            `;
            container.appendChild(phaseBlock);
        });

        animatePythonRoadmap();
    } catch (error) {
        console.error("Compilation Error:", error);
        container.innerHTML = `<div class="error-text">[ERROR] MODULE_NOT_FOUND</div>`;
    }
}

function togglePythonModule(btn) {
    const details = btn.parentElement.nextElementSibling;
    btn.classList.toggle('active');
    details.classList.toggle('open');
    btn.innerText = btn.classList.contains('active') ? '×' : '+';
}

function animatePythonRoadmap() {
    gsap.registerPlugin(ScrollTrigger);
    gsap.from('.roadmap-spine', { height: 0, duration: 1.5 });
    gsap.from('.chapter-node', {
        scrollTrigger: { trigger: '.roadmap-wrapper', start: "top 80%" },
        opacity: 0,
        y: 30,
        stagger: 0.2,
        duration: 0.8
    });
}