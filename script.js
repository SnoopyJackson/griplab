// Data will be loaded from JSON file
let guardsData = [];
let athletesData = [];

// State Management
let currentGuard = null;

// Create particles effect
function createParticles() {
    const particlesContainer = document.querySelector('.particles');
    // Reduce particles on mobile for better performance
    const isMobile = window.innerWidth <= 768;
    const particleCount = isMobile ? 15 : 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: var(--primary-glow);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${5 + Math.random() * 10}s infinite ease-in-out;
            animation-delay: ${Math.random() * 5}s;
            opacity: ${0.3 + Math.random() * 0.5};
            box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
        `;
        particlesContainer.appendChild(particle);
    }
}

// Load Data from JSON
async function loadData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        guardsData = data.guards;
        athletesData = data.athletes;
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Error loading data. Please make sure data.json is in the same directory.');
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    createParticles();
    initializeNavigation();
    renderGuards();
    renderAthletes();
});

// Navigation with sound effect simulation
function initializeNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            
            // Update active nav button
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update active section
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            document.getElementById(`${section}-section`).classList.add('active');
        });
    });
}

// Render Guards List - RPG Style
function renderGuards() {
    const container = document.getElementById('guards-container');
    
    container.innerHTML = guardsData.map((guard, index) => `
        <div class="guard-card" data-id="${guard.id}" style="animation-delay: ${index * 0.05}s">
            <h3>${guard.name}</h3>
        </div>
    `).join('');
    
    // Add click listeners
    container.querySelectorAll('.guard-card').forEach(card => {
        card.addEventListener('click', () => {
            const guardId = parseInt(card.dataset.id);
            selectGuard(guardId);
            
            // Update selected state
            container.querySelectorAll('.guard-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        });
    });
}

// Select and Display Guard Details - Gaming UI
function selectGuard(guardId) {
    const guard = guardsData.find(g => g.id === guardId);
    if (!guard) return;
    
    currentGuard = guard;
    const detailsContainer = document.getElementById('guard-details');
    
    detailsContainer.innerHTML = `
        <div class="guard-detail-content">
            <h2>${guard.name}</h2>
            
            <img src="${guard.image}" alt="${guard.name}" class="guard-image">
            
            <div class="detail-section">
                <h3>📋 DESCRIPTION</h3>
                <p>${guard.description}</p>
            </div>
            
            <div class="detail-section">
                <h3>⚙️ EXECUTION</h3>
                <ul>
                    ${guard.execution.map(step => `<li>${step}</li>`).join('')}
                </ul>
            </div>
            
            <div class="pros-cons">
                <div class="pros">
                    <h4>✅ ADVANTAGES</h4>
                    <ul>
                        ${guard.pros.map(pro => `<li>${pro}</li>`).join('')}
                    </ul>
                </div>
                <div class="cons">
                    <h4>❌ DISADVANTAGES</h4>
                    <ul>
                        ${guard.cons.map(con => `<li>${con}</li>`).join('')}
                    </ul>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>💡 TIPS & CONCEPTS</h3>
                <ul>
                    ${guard.tips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            </div>
            
            ${guard.sweeps ? `
            <div class="detail-section techniques-section">
                <h3>🔄 SWEEP TECHNIQUES</h3>
                <div class="technique-grid">
                    ${guard.sweeps.map((sweep, idx) => `
                        <div class="technique-card" style="animation-delay: ${idx * 0.1}s" onclick="searchYouTube('${sweep.name}', '${guard.name}')">
                            <span class="technique-type sweep">SWEEP</span>
                            <h5>${sweep.name}</h5>
                            <p>${sweep.description}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            ${guard.passes ? `
            <div class="detail-section techniques-section">
                <h3>🚀 GUARD PASS TECHNIQUES</h3>
                <div class="technique-grid">
                    ${guard.passes.map((pass, idx) => `
                        <div class="technique-card" style="animation-delay: ${idx * 0.1}s" onclick="searchYouTube('${pass.name}', '${guard.name}')">
                            <span class="technique-type pass">PASS</span>
                            <h5>${pass.name}</h5>
                            <p>${pass.description}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            ${guard.submissions ? `
            <div class="detail-section techniques-section">
                <h3>🎯 SUBMISSION TECHNIQUES</h3>
                <div class="technique-grid">
                    ${guard.submissions.map((sub, idx) => `
                        <div class="technique-card" style="animation-delay: ${idx * 0.1}s" onclick="searchYouTube('${sub.name}', '${guard.name}')">
                            <span class="technique-type submission">SUBMISSION</span>
                            <h5>${sub.name}</h5>
                            <p>${sub.description}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            <div class="detail-section">
                <h3>👤 NOTABLE ATHLETES</h3>
                <div class="athletes-tag">
                    ${guard.athletes.map(athlete => `<span class="athlete-tag">${athlete}</span>`).join('')}
                </div>
            </div>
        </div>
    `;
}

// Render Athletes - Fighter Selection Style
function renderAthletes() {
    const container = document.getElementById('athletes-container');
    
    container.innerHTML = athletesData.map((athlete, index) => `
        <div class="athlete-card" style="animation-delay: ${index * 0.1}s">
            <img src="${athlete.image}" alt="${athlete.name}" class="athlete-image">
            <div class="athlete-info">
                <h3>${athlete.name}</h3>
                <div class="signature-moves">
                    <h4>⚡ SIGNATURE MOVES</h4>
                    <div class="move-item">
                        <span class="move-type">GUARD</span>
                        <span class="move-name">${athlete.signatures.guard}</span>
                    </div>
                    <div class="move-item">
                        <span class="move-type">SWEEP</span>
                        <span class="move-name">${athlete.signatures.sweep}</span>
                    </div>
                    <div class="move-item">
                        <span class="move-type">PASS</span>
                        <span class="move-name">${athlete.signatures.pass}</span>
                    </div>
                    <div class="move-item">
                        <span class="move-type">SUBMISSION</span>
                        <span class="move-name">${athlete.signatures.submission}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add hover sound effect simulation
    container.querySelectorAll('.athlete-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.zIndex = '10';
        });
        card.addEventListener('mouseleave', () => {
            card.style.zIndex = '1';
        });
    });
}

// YouTube Search Function
function searchYouTube(techniqueName, guardName) {
    const query = `${techniqueName} ${guardName} BJJ`;
    const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    window.open(youtubeUrl, '_blank');
}
