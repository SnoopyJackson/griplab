// Data will be loaded from JSON file
let guardsData = [];
let athletesData = [];

// State Management
let currentGuard = null;

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
    initializeNavigation();
    renderGuards();
    renderAthletes();
});

// Navigation
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

// Render Guards List
function renderGuards() {
    const container = document.getElementById('guards-container');
    
    container.innerHTML = guardsData.map(guard => `
        <div class="guard-card" data-id="${guard.id}">
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

// Select and Display Guard Details
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
                <h3>Description</h3>
                <p>${guard.description}</p>
            </div>
            
            <div class="detail-section">
                <h3>How to Execute</h3>
                <ul>
                    ${guard.execution.map(step => `<li>${step}</li>`).join('')}
                </ul>
            </div>
            
            <div class="pros-cons">
                <div class="pros">
                    <h4>✅ Pros</h4>
                    <ul>
                        ${guard.pros.map(pro => `<li>${pro}</li>`).join('')}
                    </ul>
                </div>
                <div class="cons">
                    <h4>❌ Cons</h4>
                    <ul>
                        ${guard.cons.map(con => `<li>${con}</li>`).join('')}
                    </ul>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Tips & Concepts</h3>
                <ul>
                    ${guard.tips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            </div>
            
            ${guard.sweeps ? `
            <div class="detail-section techniques-section">
                <h3>🔄 Sweeps from ${guard.name}</h3>
                <div class="technique-grid">
                    ${guard.sweeps.map(sweep => `
                        <div class="technique-card">
                            <span class="technique-type sweep">Sweep</span>
                            <h5>${sweep.name}</h5>
                            <p>${sweep.description}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            ${guard.passes ? `
            <div class="detail-section techniques-section">
                <h3>🚀 Guard Passes</h3>
                <div class="technique-grid">
                    ${guard.passes.map(pass => `
                        <div class="technique-card">
                            <span class="technique-type pass">Pass</span>
                            <h5>${pass.name}</h5>
                            <p>${pass.description}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            ${guard.submissions ? `
            <div class="detail-section techniques-section">
                <h3>🎯 Submissions from ${guard.name}</h3>
                <div class="technique-grid">
                    ${guard.submissions.map(sub => `
                        <div class="technique-card">
                            <span class="technique-type submission">Submission</span>
                            <h5>${sub.name}</h5>
                            <p>${sub.description}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            <div class="detail-section">
                <h3>Notable Athletes</h3>
                <div class="athletes-tag">
                    ${guard.athletes.map(athlete => `<span class="athlete-tag">${athlete}</span>`).join('')}
                </div>
            </div>
        </div>
    `;
}

// Render Athletes
function renderAthletes() {
    const container = document.getElementById('athletes-container');
    
    container.innerHTML = athletesData.map(athlete => `
        <div class="athlete-card">
            <img src="${athlete.image}" alt="${athlete.name}" class="athlete-image">
            <div class="athlete-info">
                <h3>${athlete.name}</h3>
                <div class="signature-moves">
                    <h4>Signature Moves</h4>
                    <div class="move-item">
                        <span class="move-type">Guard:</span>
                        <span class="move-name">${athlete.signatures.guard}</span>
                    </div>
                    <div class="move-item">
                        <span class="move-type">Sweep:</span>
                        <span class="move-name">${athlete.signatures.sweep}</span>
                    </div>
                    <div class="move-item">
                        <span class="move-type">Pass:</span>
                        <span class="move-name">${athlete.signatures.pass}</span>
                    </div>
                    <div class="move-item">
                        <span class="move-type">Submission:</span>
                        <span class="move-name">${athlete.signatures.submission}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}
