// Data will be loaded from JSON file
let guardsData = [];
let athletesData = [];
let gameplanData = [];

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

// Load Data from JSON files
async function loadData() {
    try {
        const [guardsResponse, athletesResponse, gameplanResponse] = await Promise.all([
            fetch('data.json'),
            fetch('athletes.json'),
            fetch('gameplan.json')
        ]);
        const guardsJson = await guardsResponse.json();
        guardsData = guardsJson.guards;
        athletesData = await athletesResponse.json();
        const gameplanJson = await gameplanResponse.json();
        gameplanData = gameplanJson.positions;
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Error loading data. Please make sure data.json, athletes.json, and gameplan.json are in the same directory.');
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
    initTrainingLog();
    initWarRoom();
    initGameBoard();
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

            // Auto-scroll to details on mobile
            if (window.innerWidth <= 768) {
                const details = document.getElementById('guard-details');
                setTimeout(() => {
                    details.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
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
                <div class="description-header">
                    <h3>­ƒôï DESCRIPTION</h3>
                    <button class="watch-video-btn" onclick="${guard.video ? `window.open('${guard.video}', '_blank')` : `searchYouTube('${guard.name}', 'BJJ guard')` }">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        <span>Watch Tutorial</span>
                    </button>
                </div>
                <p>${guard.description}</p>
            </div>
            
            <div class="detail-section">
                <h3>ÔÜÖ´©Å EXECUTION</h3>
                <ul>
                    ${guard.execution.map(step => `<li>${step}</li>`).join('')}
                </ul>
            </div>
            
            <div class="pros-cons">
                <div class="pros">
                    <h4>Ô£à ADVANTAGES</h4>
                    <ul>
                        ${guard.pros.map(pro => `<li>${pro}</li>`).join('')}
                    </ul>
                </div>
                <div class="cons">
                    <h4>ÔØî DISADVANTAGES</h4>
                    <ul>
                        ${guard.cons.map(con => `<li>${con}</li>`).join('')}
                    </ul>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>­ƒÆí TIPS & CONCEPTS</h3>
                <ul>
                    ${guard.tips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            </div>
            
            ${guard.sweeps ? `
            <div class="detail-section techniques-section">
                <h3>­ƒöä SWEEP TECHNIQUES</h3>
                <div class="technique-grid">
                    ${guard.sweeps.map((sweep, idx) => {
                        const techId = `${guard.id}-${sweep.name}`;
                        const status = getTechniqueProgress(techId);
                        const statusClass = status !== 'none' ? status : '';
                        const statusEmoji = status === 'mastered' ? 'Ô¡É' : status === 'average' ? '­ƒôè' : status === 'learning' ? '­ƒôÜ' : status === 'bad' ? 'ÔØî' : '';
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
                <h3>­ƒÜÇ GUARD PASS TECHNIQUES</h3>
                <div class="technique-grid">
                    ${guard.passes.map((pass, idx) => {
                        const techId = `${guard.id}-${pass.name}`;
                        const status = getTechniqueProgress(techId);
                        const statusClass = status !== 'none' ? status : '';
                        const statusEmoji = status === 'mastered' ? 'Ô¡É' : status === 'average' ? '­ƒôè' : status === 'learning' ? '­ƒôÜ' : status === 'bad' ? 'ÔØî' : '';
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
                <h3>­ƒÄ» SUBMISSION TECHNIQUES</h3>
                <div class="technique-grid">
                    ${guard.submissions.map((sub, idx) => {
                        const techId = `${guard.id}-${sub.name}`;
                        const status = getTechniqueProgress(techId);
                        const statusClass = status !== 'none' ? status : '';
                        const statusEmoji = status === 'mastered' ? 'Ô¡É' : status === 'average' ? '­ƒôè' : status === 'learning' ? '­ƒôÜ' : status === 'bad' ? 'ÔØî' : '';
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
                <h3>­ƒæñ NOTABLE ATHLETES</h3>
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
        <div class="athlete-card" style="animation-delay: ${Math.min(index * 0.05, 0.5)}s">
            <img src="${athlete.image}" alt="${athlete.name}" class="athlete-image" loading="lazy">
            <div class="athlete-info">
                <h3>${athlete.name}</h3>
                <div class="signature-moves">
                    <h4>ÔÜí SIGNATURE MOVES</h4>
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
    
    // Add click to search YouTube and hover effects
    container.querySelectorAll('.athlete-card').forEach((card, index) => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            const athlete = athletesData[index];
            const query = `${athlete.name} BJJ`;
            const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
            window.open(youtubeUrl, '_blank');
        });
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

// =================================
// TRAINING LOG
// =================================
const LOG_STORAGE_KEY = 'bjj_training_log';

const ACTIVITY_META = {
    bjj:       { label: 'BJJ (Gi)',   emoji: '­ƒÑï', color: '#a855f7' },
    nogi:      { label: 'No-Gi',      emoji: '­ƒñ╝', color: '#00d4ff' },
    wrestling: { label: 'Wrestling',  emoji: '­ƒÅï´©Å', color: '#f59e0b' },
    lifting:   { label: 'Lifting',    emoji: '­ƒÆ¬', color: '#ef4444' },
    yoga:      { label: 'Yoga',       emoji: '­ƒºÿ', color: '#10b981' }
};

function getTrainingLog() {
    const stored = localStorage.getItem(LOG_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

function saveTrainingLog(log) {
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(log));
}

// Initialize log form defaults & listeners
function initTrainingLog() {
    const form = document.getElementById('log-form');
    const dateInput = document.getElementById('log-date');
    const filterSelect = document.getElementById('log-filter-activity');

    // Default date to today
    dateInput.value = new Date().toISOString().slice(0, 10);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        addLogEntry();
    });

    filterSelect.addEventListener('change', () => renderLogEntries());

    renderTrainingLogSection();
}

function addLogEntry() {
    const date = document.getElementById('log-date').value;
    const activity = document.getElementById('log-activity').value;
    const duration = parseInt(document.getElementById('log-duration').value, 10);
    const notes = document.getElementById('log-notes').value.trim();

    if (!date || !activity || !duration) return;

    const log = getTrainingLog();
    log.push({
        id: Date.now(),
        date,
        activity,
        duration,
        notes
    });
    saveTrainingLog(log);

    // Reset form
    document.getElementById('log-duration').value = '';
    document.getElementById('log-notes').value = '';
    document.getElementById('log-date').value = new Date().toISOString().slice(0, 10);

    renderTrainingLogSection();
}

function deleteLogEntry(id) {
    if (!confirm('Delete this session?')) return;
    const log = getTrainingLog().filter(e => e.id !== id);
    saveTrainingLog(log);
    renderTrainingLogSection();
}

function renderTrainingLogSection() {
    renderLogStats();
    renderLogBreakdown();
    renderLogEntries();
}

// Stats
function renderLogStats() {
    const log = getTrainingLog();
    const now = new Date();
    const thisMonth = log.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const totalMinutes = log.reduce((s, e) => s + e.duration, 0);

    // Streak calculation (consecutive days with at least one session, ending today or yesterday)
    const uniqueDays = [...new Set(log.map(e => e.date))].sort().reverse();
    let streak = 0;
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (uniqueDays.length > 0 && (uniqueDays[0] === today || uniqueDays[0] === yesterday)) {
        let checkDate = new Date(uniqueDays[0]);
        for (const day of uniqueDays) {
            if (day === checkDate.toISOString().slice(0, 10)) {
                streak++;
                checkDate = new Date(checkDate.getTime() - 86400000);
            } else {
                break;
            }
        }
    }

    document.getElementById('log-total-sessions').textContent = log.length;
    document.getElementById('log-this-month').textContent = thisMonth.length;
    document.getElementById('log-streak').textContent = streak;
    document.getElementById('log-total-hours').textContent = (totalMinutes / 60).toFixed(1);
}

// Breakdown bars
function renderLogBreakdown() {
    const log = getTrainingLog();
    const container = document.getElementById('log-breakdown-bars');
    const counts = {};
    Object.keys(ACTIVITY_META).forEach(k => counts[k] = 0);
    log.forEach(e => { counts[e.activity] = (counts[e.activity] || 0) + 1; });
    const max = Math.max(1, ...Object.values(counts));

    container.innerHTML = Object.entries(ACTIVITY_META).map(([key, meta]) => {
        const count = counts[key] || 0;
        const pct = Math.round((count / max) * 100);
        return `
            <div class="breakdown-row">
                <span class="breakdown-label">${meta.emoji} ${meta.label}</span>
                <div class="breakdown-bar-track">
                    <div class="breakdown-bar-fill" style="width:${pct}%;background:${meta.color}"></div>
                </div>
                <span class="breakdown-count">${count}</span>
            </div>
        `;
    }).join('');
}

// Session history list
function renderLogEntries() {
    const log = getTrainingLog();
    const filter = document.getElementById('log-filter-activity').value;
    const container = document.getElementById('log-entries');

    let filtered = filter === 'all' ? log : log.filter(e => e.activity === filter);
    filtered = filtered.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="log-empty">
                <p>No sessions logged yet</p>
                <span>Use the form above to log your first training session</span>
            </div>`;
        return;
    }

    container.innerHTML = filtered.map(entry => {
        const meta = ACTIVITY_META[entry.activity] || ACTIVITY_META.bjj;
        const dateStr = new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
        });
        const hours = Math.floor(entry.duration / 60);
        const mins = entry.duration % 60;
        const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

        return `
            <div class="log-entry" style="border-left-color:${meta.color}">
                <div class="log-entry-top">
                    <span class="log-entry-activity" style="background:${meta.color}">${meta.emoji} ${meta.label}</span>
                    <span class="log-entry-date">${dateStr}</span>
                </div>
                <div class="log-entry-body">
                    <span class="log-entry-duration">ÔÅ▒´©Å ${durationStr}</span>
                    ${entry.notes ? `<p class="log-entry-notes">${entry.notes}</p>` : ''}
                </div>
                <button class="log-entry-delete" onclick="deleteLogEntry(${entry.id})">­ƒùæ´©Å</button>
            </div>
        `;
    }).join('');
}

// ==========================================
// WAR ROOM ÔÇö Professor's Class Preparation
// ==========================================

const CATEGORY_META = {
    sweep:      { emoji: '­ƒöä', label: 'Sweep',      color: '#00ff88' },
    pass:       { emoji: '­ƒÜÇ', label: 'Pass',        color: '#00d4ff' },
    submission: { emoji: '­ƒöÑ', label: 'Submission',  color: '#ff4444' },
    escape:     { emoji: '­ƒøí´©Å', label: 'Escape',      color: '#a855f7' }
};

let activePosition = null;
let activeCategory = 'all';

function initWarRoom() {
    renderWarRoomPositions();

    document.getElementById('warroom-back-btn').addEventListener('click', () => {
        activePosition = null;
        document.getElementById('warroom-techniques-panel').style.display = 'none';
        document.getElementById('warroom-positions').style.display = '';
    });

    document.querySelectorAll('.warroom-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.warroom-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCategory = btn.dataset.cat;
            renderWarRoomTechniques();
        });
    });
}

function renderWarRoomPositions() {
    const container = document.getElementById('warroom-positions');
    container.innerHTML = gameplanData.map(pos => {
        const counts = {};
        pos.techniques.forEach(t => { counts[t.category] = (counts[t.category] || 0) + 1; });
        const tags = Object.entries(counts).map(([cat, n]) => {
            const m = CATEGORY_META[cat];
            return `<span class="wr-pos-tag" style="color:${m.color}">${m.emoji} ${n}</span>`;
        }).join('');

        return `
        <div class="wr-position-card" data-id="${pos.id}">
            <span class="wr-pos-emoji">${pos.emoji}</span>
            <h3 class="wr-pos-name">${pos.name}</h3>
            <p class="wr-pos-desc">${pos.description}</p>
            <div class="wr-pos-tags">${tags}</div>
        </div>`;
    }).join('');

    container.querySelectorAll('.wr-position-card').forEach(card => {
        card.addEventListener('click', () => {
            activePosition = gameplanData.find(p => p.id === card.dataset.id);
            activeCategory = 'all';
            document.querySelectorAll('.warroom-filter-btn').forEach(b => b.classList.remove('active'));
            document.querySelector('.warroom-filter-btn[data-cat="all"]').classList.add('active');
            showWarRoomTechniques();
        });
    });
}

function showWarRoomTechniques() {
    document.getElementById('warroom-positions').style.display = 'none';
    const panel = document.getElementById('warroom-techniques-panel');
    panel.style.display = '';
    document.getElementById('warroom-position-title').textContent = `${activePosition.emoji} ${activePosition.name}`;

    // Show only relevant filter buttons
    const available = new Set(activePosition.techniques.map(t => t.category));
    document.querySelectorAll('.warroom-filter-btn').forEach(btn => {
        if (btn.dataset.cat === 'all') return;
        btn.style.display = available.has(btn.dataset.cat) ? '' : 'none';
    });

    renderWarRoomTechniques();

    if (window.innerWidth <= 768) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function renderWarRoomTechniques() {
    const list = document.getElementById('warroom-technique-list');
    let techs = activePosition.techniques;
    if (activeCategory !== 'all') {
        techs = techs.filter(t => t.category === activeCategory);
    }

    list.innerHTML = techs.map((tech, i) => {
        const cat = CATEGORY_META[tech.category];
        const perspLabel = tech.perspective === 'bottom' ? 'Ô¼ç´©Å Bottom' : 'Ô¼å´©Å Top';

        return `
        <div class="wr-technique-card">
            <div class="wr-tech-header" data-idx="${i}">
                <div class="wr-tech-title-row">
                    <span class="wr-tech-cat-badge" style="background:${cat.color}">${cat.emoji} ${cat.label}</span>
                    <span class="wr-tech-persp">${perspLabel}</span>
                </div>
                <h4 class="wr-tech-name">${tech.name}</h4>
                <p class="wr-tech-goal">${tech.goal}</p>
                <span class="wr-tech-expand-icon">Ôû╝</span>
            </div>
            <div class="wr-tech-body" id="wr-tech-body-${i}">
                <!-- Initial Position -->
                <div class="wr-detail-block wr-detail-position">
                    <h5>­ƒôì INITIAL POSITION</h5>
                    <div class="wr-position-grid">
                        <div class="wr-pos-item"><span class="wr-pos-label">Body</span><p>${tech.initialPosition.body}</p></div>
                        <div class="wr-pos-item"><span class="wr-pos-label">Grips</span><p>${tech.initialPosition.grips}</p></div>
                        <div class="wr-pos-item"><span class="wr-pos-label">Legs</span><p>${tech.initialPosition.legs}</p></div>
                        <div class="wr-pos-item"><span class="wr-pos-label">Hips</span><p>${tech.initialPosition.hips}</p></div>
                    </div>
                </div>

                <!-- Green / Red Lights -->
                <div class="wr-lights-row">
                    <div class="wr-detail-block wr-lights-green">
                        <h5>­ƒƒó GREEN LIGHTS</h5>
                        <ul>${tech.greenLights.map(g => `<li>${g}</li>`).join('')}</ul>
                    </div>
                    <div class="wr-detail-block wr-lights-red">
                        <h5>­ƒö┤ RED LIGHTS</h5>
                        <ul>${tech.redLights.map(r => `<li>${r}</li>`).join('')}</ul>
                    </div>
                </div>

                <!-- Key Steps -->
                <div class="wr-detail-block wr-detail-steps">
                    <h5>­ƒôØ KEY STEPS</h5>
                    <ol>${tech.steps.map(s => `<li>${s}</li>`).join('')}</ol>
                </div>

                <!-- Complexification / Simplification -->
                <div class="wr-lights-row">
                    <div class="wr-detail-block wr-detail-complex">
                        <h5>Ô¼å´©Å COMPLEXIFICATION</h5>
                        <ul>${tech.complexpieces.map(c => `<li>${c}</li>`).join('')}</ul>
                    </div>
                    <div class="wr-detail-block wr-detail-simple">
                        <h5>Ô¼ç´©Å SIMPLIFICATION</h5>
                        <ul>${tech.simplifications.map(s => `<li>${s}</li>`).join('')}</ul>
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');

    // Accordion toggle
    list.querySelectorAll('.wr-tech-header').forEach(header => {
        header.addEventListener('click', () => {
            const card = header.closest('.wr-technique-card');
            card.classList.toggle('expanded');
        });
    });
}

// Export ÔÇö dumps ALL localStorage so nothing is lost
function exportTrainingLog() {
    const allData = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        try { allData[key] = JSON.parse(localStorage.getItem(key)); }
        catch { allData[key] = localStorage.getItem(key); }
    }
    const data = {
        localStorage: allData,
        trainingLog: getTrainingLog(),
        techniqueProgress: initializeProgress(),
        exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `griplab-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Import ÔÇö restores full localStorage snapshot when available, falls back to legacy keys
function importTrainingLog(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);

            if (!data.trainingLog || !Array.isArray(data.trainingLog)) {
                alert('Invalid file: missing trainingLog array.');
                return;
            }

            if (!confirm('This will replace your current training log and technique progress. Continue?')) return;

            // Restore full localStorage snapshot if present
            if (data.localStorage && typeof data.localStorage === 'object') {
                for (const [key, value] of Object.entries(data.localStorage)) {
                    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
                }
            } else {
                // Legacy import: only trainingLog + techniqueProgress
                saveTrainingLog(data.trainingLog);
                if (data.techniqueProgress) {
                    saveProgress(data.techniqueProgress);
                }
            }

            renderProgressSection();
            renderGuards();
            renderTrainingLogSection();
            alert('Data imported successfully!');
        } catch {
            alert('Error reading file. Make sure it is a valid GripLab JSON export.');
        }
    };
    reader.readAsText(file);
    // Reset input so the same file can be re-imported
    event.target.value = '';
}

// ==========================================
// GAME BUILDER -- Chapter-Based Game Planner
// ==========================================

const GB_STORAGE_KEY = 'bjj_chapter_builder';
const MAX_MOVES = 3;

let gbChapters = [];
let gbActiveIdx = null;

function gbLoad() {
    const raw = localStorage.getItem(GB_STORAGE_KEY);
    if (raw) {
        try { gbChapters = JSON.parse(raw); } catch { gbChapters = []; }
    }
    if (gbChapters.length > 0) {
        gbActiveIdx = 0;
    }
}

function gbSave() {
    localStorage.setItem(GB_STORAGE_KEY, JSON.stringify(gbChapters));
}

function addChapter() {
    const inp = document.getElementById('chapterInput');
    const name = inp.value.trim();
    if (!name) return;
    if (gbChapters.find(c => c.name.toLowerCase() === name.toLowerCase())) {
        inp.style.borderColor = 'var(--gb-sub)';
        setTimeout(() => inp.style.borderColor = '', 800);
        return;
    }
    gbChapters.push({ name, sweeps: [], passes: [], subs: [] });
    inp.value = '';
    gbActiveIdx = gbChapters.length - 1;
    gbSave();
    renderTabs();
    renderChapter();
}

function setActive(idx) {
    gbActiveIdx = idx;
    renderTabs();
    renderChapter();
}

function deleteChapter(idx) {
    gbChapters.splice(idx, 1);
    if (gbActiveIdx >= gbChapters.length) gbActiveIdx = gbChapters.length - 1;
    if (gbChapters.length === 0) gbActiveIdx = null;
    gbSave();
    renderTabs();
    renderChapter();
}

function addMove(type, inputId) {
    if (gbActiveIdx === null) return;
    const inp = document.getElementById(inputId);
    const name = inp.value.trim();
    if (!name) return;
    const ch = gbChapters[gbActiveIdx];
    const arr = ch[type];
    if (arr.length >= MAX_MOVES) return;
    arr.push(name);
    inp.value = '';
    gbSave();
    renderChapter();
}

function deleteMove(type, idx) {
    if (gbActiveIdx === null) return;
    gbChapters[gbActiveIdx][type].splice(idx, 1);
    gbSave();
    renderChapter();
}

function renderTabs() {
    const container = document.getElementById('chapterTabs');
    if (!container) return;
    container.innerHTML = '';
    gbChapters.forEach((ch, i) => {
        const tab = document.createElement('div');
        tab.className = 'chapter-tab' + (i === gbActiveIdx ? ' active' : '');
        tab.textContent = ch.name;
        tab.onclick = () => setActive(i);
        container.appendChild(tab);
    });
}

function renderChapter() {
    const container = document.getElementById('chapterContent');
    if (!container) return;

    if (gbActiveIdx === null || gbChapters.length === 0) {
        container.innerHTML = `
            <div class="gb-empty-state">
                <div class="gb-empty-icon">&#x2B21;</div>
                <div class="gb-empty-title">NO CHAPTER LOADED</div>
                <div class="gb-empty-sub">// ADD A POSITION TO BEGIN //</div>
            </div>`;
        return;
    }

    const ch = gbChapters[gbActiveIdx];
    const totalMoves = ch.sweeps.length + ch.passes.length + ch.subs.length;
    const sweepPct = (ch.sweeps.length / MAX_MOVES) * 100;
    const passPct  = (ch.passes.length / MAX_MOVES) * 100;
    const subPct   = (ch.subs.length   / MAX_MOVES) * 100;

    container.innerHTML = `
      <div class="chapter-panel">
        <div class="chapter-header">
          <div class="chapter-title">${gbEsc(ch.name)}</div>
          <div style="display:flex;align-items:center;gap:12px;">
            <div class="chapter-badge">CHAPTER ${String(gbActiveIdx + 1).padStart(2,'0')}</div>
            <button class="gb-builder-btn gb-builder-btn-danger" onclick="deleteChapter(${gbActiveIdx})">DELETE</button>
          </div>
        </div>

        <div class="move-grid">
          ${gbRenderColumn('sweeps', ch, 'sweep', 'SWEEPS', 'sweepInput')}
          ${gbRenderColumn('passes', ch, 'pass',  'PASSES', 'passInput')}
          ${gbRenderColumn('subs',   ch, 'sub',   'SUBMISSIONS', 'subInput')}
        </div>

        <div class="stats-bar">
          <div class="gb-stat">
            <div class="gb-stat-label">TOTAL MOVES</div>
            <div class="gb-stat-value">${String(totalMoves).padStart(2,'0')}</div>
          </div>
          <div class="gb-stat">
            <div class="gb-stat-label">SWEEPS</div>
            <div class="gb-stat-value sweep-val">${ch.sweeps.length}/${MAX_MOVES}</div>
          </div>
          <div class="gb-stat">
            <div class="gb-stat-label">PASSES</div>
            <div class="gb-stat-value pass-val">${ch.passes.length}/${MAX_MOVES}</div>
          </div>
          <div class="gb-stat">
            <div class="gb-stat-label">SUBS</div>
            <div class="gb-stat-value sub-val">${ch.subs.length}/${MAX_MOVES}</div>
          </div>
          <div class="prog-bars">
            <div class="prog-row">
              <div class="prog-type">SWP</div>
              <div class="prog-track"><div class="prog-fill s" style="width:${sweepPct}%"></div></div>
              <div class="prog-num">${ch.sweeps.length}</div>
            </div>
            <div class="prog-row">
              <div class="prog-type">PAS</div>
              <div class="prog-track"><div class="prog-fill p" style="width:${passPct}%"></div></div>
              <div class="prog-num">${ch.passes.length}</div>
            </div>
            <div class="prog-row">
              <div class="prog-type">SUB</div>
              <div class="prog-track"><div class="prog-fill u" style="width:${subPct}%"></div></div>
              <div class="prog-num">${ch.subs.length}</div>
            </div>
          </div>
        </div>
      </div>`;

    ['sweepInput','passInput','subInput'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const type = id === 'sweepInput' ? 'sweeps' : id === 'passInput' ? 'passes' : 'subs';
        el.addEventListener('keydown', e => { if (e.key === 'Enter') addMove(type, id); });
    });
}

function gbRenderColumn(type, ch, colorClass, label, inputId) {
    const moves = ch[type];
    const full  = moves.length >= MAX_MOVES;

    const cards = [];
    for (let i = 0; i < MAX_MOVES; i++) {
        if (i < moves.length) {
            cards.push(`
              <div class="move-card ${colorClass}">
                <div class="move-number">// MOVE ${String(i+1).padStart(2,'0')}</div>
                <div class="move-name">${gbEsc(moves[i])}</div>
                <button class="move-delete" onclick="deleteMove('${type}', ${i})" title="Remove">x</button>
              </div>`);
        } else {
            cards.push(`
              <div class="move-slot">
                <div class="slot-label">// SLOT ${String(i+1).padStart(2,'0')} -- EMPTY</div>
              </div>`);
        }
    }

    const btnClass = colorClass;
    const addForm = !full ? `
      <div class="add-move-form">
        <input class="move-input ${colorClass}-input" id="${inputId}"
          type="text" placeholder="Add ${label.toLowerCase().slice(0,-1)}..." maxlength="40">
        <button class="add-move-btn ${btnClass}-btn" onclick="addMove('${type}', '${inputId}')">+</button>
      </div>` : `
      <div class="slot-label" style="font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:3px;text-align:center;padding:6px;opacity:0.6;">
        // SLOTS FULL //
      </div>`;

    return `
      <div class="move-column">
        <div class="column-header col-${colorClass}">
          <div class="column-label">${label}</div>
          <div class="col-count">${moves.length}/${MAX_MOVES}</div>
        </div>
        ${cards.join('')}
        ${addForm}
      </div>`;
}

function gbEsc(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function initGameBoard() {
    gbLoad();
    renderTabs();
    renderChapter();
}