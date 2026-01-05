// Data will be loaded from JSON file
let guardsData = [];
let athletesData = [];

// State Management
let currentGuard = null;

// Progress Tracking with localStorage
const STORAGE_KEY = 'bjj_progress';

// Status levels
const STATUS_LEVELS = ['bad', 'learning', 'average', 'mastered'];

// Initialize Progress
function initializeProgress() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        const initialProgress = {
            techniques: {},
            lastVisit: new Date().toDateString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProgress));
        return initialProgress;
    }
    return JSON.parse(stored);
}

// Save Progress
function saveProgress(progress) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

// Get Technique Progress
function getTechniqueProgress(techniqueId) {
    const progress = initializeProgress();
    return progress.techniques[techniqueId] || 'none';
}

// Set Technique Progress
function setTechniqueProgress(techniqueId, status) {
    const progress = initializeProgress();
    
    // Update progress
    if (status === 'none') {
        delete progress.techniques[techniqueId];
    } else {
        progress.techniques[techniqueId] = status;
    }
    
    progress.lastVisit = new Date().toDateString();
    
    saveProgress(progress);
    renderProgressSection();
    renderGuards(); // Re-render to update badges
}

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
    renderProgressSection();
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
    const progress = initializeProgress();
    
    container.innerHTML = guardsData.map((guard, index) => {
        // Calculate completion for this guard
        const allTechniques = [
            ...(guard.sweeps || []),
            ...(guard.passes || []),
            ...(guard.submissions || [])
        ];
        const totalTechniques = allTechniques.length;
        const masteredTechniques = allTechniques.filter(tech => {
            const techId = `${guard.id}-${tech.name}`;
            return getTechniqueProgress(techId) === 'mastered';
        }).length;
        const completionPercentage = totalTechniques > 0 
            ? Math.round((masteredTechniques / totalTechniques) * 100) 
            : 0;
        
        return `
        <div class="guard-card" data-id="${guard.id}" style="animation-delay: ${index * 0.05}s">
            <h3>${guard.name}</h3>
            ${completionPercentage > 0 ? `<div class="guard-completion-badge">${completionPercentage}%</div>` : ''}
        </div>
    `}).join('');
    
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
                    ${guard.sweeps.map((sweep, idx) => {
                        const techId = `${guard.id}-${sweep.name}`;
                        const status = getTechniqueProgress(techId);
                        const statusClass = status !== 'none' ? status : '';
                        const statusEmoji = status === 'mastered' ? '⭐' : status === 'average' ? '📊' : status === 'learning' ? '📚' : status === 'bad' ? '❌' : '';
                        return `
                        <div class="technique-card ${statusClass}" style="animation-delay: ${idx * 0.1}s" onclick="searchYouTube('${sweep.name}', '${guard.name}')">
                            <span class="technique-type sweep">SWEEP</span>
                            ${statusEmoji ? `<span style="position: absolute; top: 10px; right: 10px; font-size: 1.5rem;">${statusEmoji}</span>` : ''}
                            <h5>${sweep.name}</h5>
                            <p>${sweep.description}</p>
                        </div>
                    `}).join('')}
                </div>
            </div>
            ` : ''}
            
            ${guard.passes ? `
            <div class="detail-section techniques-section">
                <h3>🚀 GUARD PASS TECHNIQUES</h3>
                <div class="technique-grid">
                    ${guard.passes.map((pass, idx) => {
                        const techId = `${guard.id}-${pass.name}`;
                        const status = getTechniqueProgress(techId);
                        const statusClass = status !== 'none' ? status : '';
                        const statusEmoji = status === 'mastered' ? '⭐' : status === 'average' ? '📊' : status === 'learning' ? '📚' : status === 'bad' ? '❌' : '';
                        return `
                        <div class="technique-card ${statusClass}" style="animation-delay: ${idx * 0.1}s" onclick="searchYouTube('${pass.name}', '${guard.name}')">
                            <span class="technique-type pass">PASS</span>
                            ${statusEmoji ? `<span style="position: absolute; top: 10px; right: 10px; font-size: 1.5rem;">${statusEmoji}</span>` : ''}
                            <h5>${pass.name}</h5>
                            <p>${pass.description}</p>
                        </div>
                    `}).join('')}
                </div>
            </div>
            ` : ''}
            
            ${guard.submissions ? `
            <div class="detail-section techniques-section">
                <h3>🎯 SUBMISSION TECHNIQUES</h3>
                <div class="technique-grid">
                    ${guard.submissions.map((sub, idx) => {
                        const techId = `${guard.id}-${sub.name}`;
                        const status = getTechniqueProgress(techId);
                        const statusClass = status !== 'none' ? status : '';
                        const statusEmoji = status === 'mastered' ? '⭐' : status === 'average' ? '📊' : status === 'learning' ? '📚' : status === 'bad' ? '❌' : '';
                        return `
                        <div class="technique-card ${statusClass}" style="animation-delay: ${idx * 0.1}s" onclick="searchYouTube('${sub.name}', '${guard.name}')">
                            <span class="technique-type submission">SUBMISSION</span>
                            ${statusEmoji ? `<span style="position: absolute; top: 10px; right: 10px; font-size: 1.5rem;">${statusEmoji}</span>` : ''}
                            <h5>${sub.name}</h5>
                            <p>${sub.description}</p>
                        </div>
                    `}).join('')}
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

// Render Progress Section
function renderProgressSection() {
    const progress = initializeProgress();
    
    // Count techniques by status
    const learningCount = Object.values(progress.techniques).filter(s => s === 'learning').length;
    const averageCount = Object.values(progress.techniques).filter(s => s === 'average').length;
    const masteredCount = Object.values(progress.techniques).filter(s => s === 'mastered').length;
    
    // Update stats
    const learningCountEl = document.getElementById('learning-count');
    const averageCountEl = document.getElementById('average-count');
    const masteredCountEl = document.getElementById('mastered-count');
    
    if (learningCountEl) learningCountEl.textContent = learningCount;
    if (averageCountEl) averageCountEl.textContent = averageCount;
    if (masteredCountEl) masteredCountEl.textContent = masteredCount;
    
    // Render Moves of the Week (techniques marked as learning)
    const movesOfWeek = document.getElementById('moves-of-week');
    if (movesOfWeek && guardsData.length > 0) {
        const learningTechniques = [];
        
        guardsData.forEach(guard => {
            const allTechniques = [
                ...(guard.sweeps || []).map(t => ({...t, guard: guard.name, type: 'Sweep'})),
                ...(guard.passes || []).map(t => ({...t, guard: guard.name, type: 'Pass'})),
                ...(guard.submissions || []).map(t => ({...t, guard: guard.name, type: 'Submission'}))
            ];
            
            allTechniques.forEach(tech => {
                const techId = `${guard.id}-${tech.name}`;
                if (getTechniqueProgress(techId) === 'learning') {
                    learningTechniques.push({...tech, guardId: guard.id});
                }
            });
        });
        
        if (learningTechniques.length === 0) {
            movesOfWeek.innerHTML = `
                <div class="empty-moves">
                    <p>No techniques selected for learning yet</p>
                    <span>Mark techniques as "Learning" to add them here</span>
                </div>
            `;
        } else {
            movesOfWeek.innerHTML = learningTechniques.map(tech => `
                <div class="move-of-week-card" onclick="searchYouTube('${tech.name}', '${tech.guard}')">
                    <span class="move-type-badge ${tech.type.toLowerCase()}">${tech.type}</span>
                    <h4>${tech.name}</h4>
                    <p class="move-guard">${tech.guard}</p>
                    <p class="move-description">${tech.description}</p>
                </div>
            `).join('');
        }
    }
    
    // Render guard progress cards
    const progressGrid = document.getElementById('progress-grid');
    if (!progressGrid || guardsData.length === 0) return;
    
    progressGrid.innerHTML = guardsData.map(guard => {
        const allTechniques = [
            ...(guard.sweeps || []),
            ...(guard.passes || []),
            ...(guard.submissions || [])
        ];
        
        const totalTechniques = allTechniques.length;
        const completedTechniques = allTechniques.filter(tech => {
            const techId = `${guard.id}-${tech.name}`;
            const status = getTechniqueProgress(techId);
            return status === 'mastered';
        }).length;
        
        const completionPercentage = totalTechniques > 0 
            ? Math.round((completedTechniques / totalTechniques) * 100) 
            : 0;
        
        return `
            <div class="guard-progress-card">
                <div class="guard-progress-header">
                    <h4>${guard.name}</h4>
                    <span class="guard-completion">${completedTechniques}/${totalTechniques}</span>
                </div>
                
                <div class="progress-bar-container">
                    <div class="progress-bar-label">
                        <span>Mastery Progress</span>
                        <span>${completionPercentage}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${completionPercentage}%"></div>
                    </div>
                </div>
                
                <div class="technique-status-list">
                    ${allTechniques.map(tech => {
                        const techId = `${guard.id}-${tech.name}`;
                        const status = getTechniqueProgress(techId);
                        return `
                            <div class="technique-status-item ${status}">
                                <span class="technique-name">${tech.name}</span>
                                <div class="status-buttons">
                                    <button class="status-btn bad ${status === 'bad' ? 'active' : ''}" 
                                            onclick="setTechniqueProgress('${techId}', '${status === 'bad' ? 'none' : 'bad'}')">
                                        Bad
                                    </button>
                                    <button class="status-btn learning ${status === 'learning' ? 'active' : ''}" 
                                            onclick="setTechniqueProgress('${techId}', '${status === 'learning' ? 'none' : 'learning'}')">
                                        Learning
                                    </button>
                                    <button class="status-btn average ${status === 'average' ? 'active' : ''}" 
                                            onclick="setTechniqueProgress('${techId}', '${status === 'average' ? 'none' : 'average'}')">
                                        Average
                                    </button>
                                    <button class="status-btn mastered ${status === 'mastered' ? 'active' : ''}" 
                                            onclick="setTechniqueProgress('${techId}', '${status === 'mastered' ? 'none' : 'mastered'}')">
                                        Master
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
}

// Reset Progress
function resetProgress() {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
        localStorage.removeItem(STORAGE_KEY);
        renderProgressSection();
        renderGuards();
        alert('Progress has been reset!');
    }
}
