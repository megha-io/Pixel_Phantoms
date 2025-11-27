document.addEventListener('DOMContentLoaded', () => {
    initFilters();
});

function initFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // 1. Update Active State
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 2. Get Filter Value
            const filterValue = btn.getAttribute('data-filter');

            // 3. Filter Cards
            cards.forEach(card => {
                // Reset Animation
                card.style.animation = 'none';
                card.offsetHeight; /* Trigger reflow */
                
                const cardCategory = card.getAttribute('data-category');

                if (filterValue === 'all' || filterValue === cardCategory) {
                    card.style.display = 'flex';
                    // Re-apply animation with delay for visual effect
                    card.style.animation = 'fadeInUp 0.5s ease forwards';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}