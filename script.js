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
                    <h3>📋 DESCRIPTION</h3>
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
    bjj:       { label: 'BJJ (Gi)',   emoji: '🥋', color: '#a855f7' },
    nogi:      { label: 'No-Gi',      emoji: '🤼', color: '#00d4ff' },
    wrestling: { label: 'Wrestling',  emoji: '🏋️', color: '#f59e0b' },
    lifting:   { label: 'Lifting',    emoji: '💪', color: '#ef4444' },
    yoga:      { label: 'Yoga',       emoji: '🧘', color: '#10b981' }
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
                    <span class="log-entry-duration">⏱️ ${durationStr}</span>
                    ${entry.notes ? `<p class="log-entry-notes">${entry.notes}</p>` : ''}
                </div>
                <button class="log-entry-delete" onclick="deleteLogEntry(${entry.id})">🗑️</button>
            </div>
        `;
    }).join('');
}

// ==========================================
// WAR ROOM — Professor's Class Preparation
// ==========================================

const CATEGORY_META = {
    sweep:      { emoji: '🔄', label: 'Sweep',      color: '#00ff88' },
    pass:       { emoji: '🚀', label: 'Pass',        color: '#00d4ff' },
    submission: { emoji: '🔥', label: 'Submission',  color: '#ff4444' },
    escape:     { emoji: '🛡️', label: 'Escape',      color: '#a855f7' }
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
        const perspLabel = tech.perspective === 'bottom' ? '⬇️ Bottom' : '⬆️ Top';

        return `
        <div class="wr-technique-card">
            <div class="wr-tech-header" data-idx="${i}">
                <div class="wr-tech-title-row">
                    <span class="wr-tech-cat-badge" style="background:${cat.color}">${cat.emoji} ${cat.label}</span>
                    <span class="wr-tech-persp">${perspLabel}</span>
                </div>
                <h4 class="wr-tech-name">${tech.name}</h4>
                <p class="wr-tech-goal">${tech.goal}</p>
                <span class="wr-tech-expand-icon">▼</span>
            </div>
            <div class="wr-tech-body" id="wr-tech-body-${i}">
                <!-- Initial Position -->
                <div class="wr-detail-block wr-detail-position">
                    <h5>📍 INITIAL POSITION</h5>
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
                        <h5>🟢 GREEN LIGHTS</h5>
                        <ul>${tech.greenLights.map(g => `<li>${g}</li>`).join('')}</ul>
                    </div>
                    <div class="wr-detail-block wr-lights-red">
                        <h5>🔴 RED LIGHTS</h5>
                        <ul>${tech.redLights.map(r => `<li>${r}</li>`).join('')}</ul>
                    </div>
                </div>

                <!-- Key Steps -->
                <div class="wr-detail-block wr-detail-steps">
                    <h5>📝 KEY STEPS</h5>
                    <ol>${tech.steps.map(s => `<li>${s}</li>`).join('')}</ol>
                </div>

                <!-- Complexification / Simplification -->
                <div class="wr-lights-row">
                    <div class="wr-detail-block wr-detail-complex">
                        <h5>⬆️ COMPLEXIFICATION</h5>
                        <ul>${tech.complexpieces.map(c => `<li>${c}</li>`).join('')}</ul>
                    </div>
                    <div class="wr-detail-block wr-detail-simple">
                        <h5>⬇️ SIMPLIFICATION</h5>
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

// Export — dumps ALL localStorage so nothing is lost
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

// Import — restores full localStorage snapshot when available, falls back to legacy keys
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
// GAME BUILDER — Mind-Map Technique Planner
// ==========================================

const GB_STORAGE_KEY = 'bjj_game_builder';
const GB_CAT_LABELS = {
    position:   '📍 Position',
    sweep:      '🔄 Sweep',
    pass:       '🚀 Pass',
    submission: '🔥 Submission',
    escape:     '🛡️ Escape',
    takedown:   '⬇️ Takedown',
    concept:    '💡 Concept'
};

let gbGames = [];          // [{id, name, nodes:[], connections:[]}]
let gbActiveGameId = null;
let gbZoom = 1;
let gbPanX = 0;
let gbPanY = 0;
let gbIsPanning = false;
let gbPanStart = { x: 0, y: 0 };
let gbDragNode = null;
let gbDragOffset = { x: 0, y: 0 };
let gbConnecting = null;   // { fromId, startX, startY }
let gbPendingPos = { x: 0, y: 0 };
let gbSelectedNodeId = null;

function gbLoad() {
    const raw = localStorage.getItem(GB_STORAGE_KEY);
    if (raw) {
        try { gbGames = JSON.parse(raw); } catch { gbGames = []; }
    }
    if (gbGames.length === 0) {
        gbGames.push(gbCreateGameObject('Game A'));
    }
    gbActiveGameId = gbActiveGameId || gbGames[0].id;
    if (!gbGames.find(g => g.id === gbActiveGameId)) {
        gbActiveGameId = gbGames[0].id;
    }
}

function gbSave() {
    localStorage.setItem(GB_STORAGE_KEY, JSON.stringify(gbGames));
}

function gbCreateGameObject(name) {
    return { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name, nodes: [], connections: [] };
}

function gbActiveGame() {
    return gbGames.find(g => g.id === gbActiveGameId);
}

// ---- Init ----
function initGameBoard() {
    gbLoad();

    const viewport = document.getElementById('gb-viewport');
    const canvas = document.getElementById('gb-canvas');

    // Game selector
    document.getElementById('gb-game-select').addEventListener('change', (e) => {
        gbActiveGameId = e.target.value;
        gbSave();
        gbResetView();
        gbRender();
    });

    document.getElementById('gb-new-game').addEventListener('click', () => {
        const name = prompt('Game name:');
        if (!name || !name.trim()) return;
        const game = gbCreateGameObject(name.trim());
        gbGames.push(game);
        gbActiveGameId = game.id;
        gbSave();
        gbResetView();
        gbRender();
    });

    document.getElementById('gb-rename-game').addEventListener('click', () => {
        const game = gbActiveGame();
        if (!game) return;
        const name = prompt('Rename game:', game.name);
        if (!name || !name.trim()) return;
        game.name = name.trim();
        gbSave();
        gbRenderSelect();
    });

    document.getElementById('gb-delete-game').addEventListener('click', () => {
        if (gbGames.length <= 1) { alert('You need at least one game.'); return; }
        if (!confirm(`Delete "${gbActiveGame().name}"?`)) return;
        gbGames = gbGames.filter(g => g.id !== gbActiveGameId);
        gbActiveGameId = gbGames[0].id;
        gbSave();
        gbResetView();
        gbRender();
    });

    document.getElementById('gb-reset-view').addEventListener('click', gbFitView);

    // Export
    document.getElementById('gb-export').addEventListener('click', () => {
        const game = gbActiveGame();
        const blob = new Blob([JSON.stringify(game, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `game-${game.name.replace(/\s+/g, '_')}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });

    // Import
    document.getElementById('gb-import-file').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                if (!data.nodes || !Array.isArray(data.nodes)) { alert('Invalid game file.'); return; }
                // Ensure it has an id
                data.id = data.id || Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
                data.connections = data.connections || [];
                // Avoid id collision
                if (gbGames.find(g => g.id === data.id)) {
                    data.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
                }
                gbGames.push(data);
                gbActiveGameId = data.id;
                gbSave();
                gbResetView();
                gbRender();
                alert(`Imported "${data.name}"!`);
            } catch {
                alert('Error reading game file.');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    });

    // Modal
    document.getElementById('gb-modal-cancel').addEventListener('click', gbCloseModal);
    document.getElementById('gb-modal-confirm').addEventListener('click', gbConfirmAddNode);
    document.getElementById('gb-node-name').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); gbConfirmAddNode(); }
    });

    // ---- Viewport interactions ----

    // Zoom
    viewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        const rect = viewport.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        const oldZoom = gbZoom;
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        gbZoom = Math.min(3, Math.max(0.15, gbZoom * delta));

        // Zoom toward mouse
        gbPanX = mx - (mx - gbPanX) * (gbZoom / oldZoom);
        gbPanY = my - (my - gbPanY) * (gbZoom / oldZoom);

        gbApplyTransform();
    }, { passive: false });

    // Pan + Drag + Connect
    viewport.addEventListener('mousedown', (e) => {
        if (e.target.closest('.gb-node-delete')) return;
        if (e.target.closest('.gb-connector')) {
            // Start connection
            const nodeEl = e.target.closest('.gb-node');
            const nodeId = nodeEl.dataset.id;
            const game = gbActiveGame();
            const node = game.nodes.find(n => n.id === nodeId);
            if (!node) return;
            gbConnecting = {
                fromId: nodeId,
                startX: node.x + (nodeEl.offsetWidth / 2) / gbZoom,
                startY: node.y + nodeEl.offsetHeight / gbZoom
            };
            e.stopPropagation();
            return;
        }

        const nodeEl = e.target.closest('.gb-node');
        if (nodeEl) {
            // Start drag node
            const rect = viewport.getBoundingClientRect();
            const mx = (e.clientX - rect.left - gbPanX) / gbZoom;
            const my = (e.clientY - rect.top - gbPanY) / gbZoom;
            const game = gbActiveGame();
            const node = game.nodes.find(n => n.id === nodeEl.dataset.id);
            if (!node) return;
            gbDragNode = node;
            gbDragOffset = { x: mx - node.x, y: my - node.y };
            gbSelectedNodeId = node.id;
            gbRenderNodes();
            e.stopPropagation();
            return;
        }

        // Pan
        gbIsPanning = true;
        gbPanStart = { x: e.clientX - gbPanX, y: e.clientY - gbPanY };
    });

    window.addEventListener('mousemove', (e) => {
        if (gbConnecting) {
            const rect = viewport.getBoundingClientRect();
            const mx = (e.clientX - rect.left - gbPanX) / gbZoom;
            const my = (e.clientY - rect.top - gbPanY) / gbZoom;
            gbDrawTempLine(gbConnecting.startX, gbConnecting.startY, mx, my);
            return;
        }
        if (gbDragNode) {
            const rect = viewport.getBoundingClientRect();
            const mx = (e.clientX - rect.left - gbPanX) / gbZoom;
            const my = (e.clientY - rect.top - gbPanY) / gbZoom;
            gbDragNode.x = mx - gbDragOffset.x;
            gbDragNode.y = my - gbDragOffset.y;
            gbPositionNode(gbDragNode.id);
            gbRenderConnections();
            return;
        }
        if (gbIsPanning) {
            gbPanX = e.clientX - gbPanStart.x;
            gbPanY = e.clientY - gbPanStart.y;
            gbApplyTransform();
        }
    });

    window.addEventListener('mouseup', (e) => {
        if (gbConnecting) {
            const nodeEl = e.target.closest('.gb-node');
            if (nodeEl && nodeEl.dataset.id !== gbConnecting.fromId) {
                const game = gbActiveGame();
                const connExists = game.connections.some(c =>
                    (c.from === gbConnecting.fromId && c.to === nodeEl.dataset.id) ||
                    (c.to === gbConnecting.fromId && c.from === nodeEl.dataset.id)
                );
                if (!connExists) {
                    game.connections.push({ from: gbConnecting.fromId, to: nodeEl.dataset.id });
                    gbSave();
                }
            }
            gbConnecting = null;
            gbRemoveTempLine();
            gbRenderConnections();
            return;
        }
        if (gbDragNode) {
            gbDragNode = null;
            gbSave();
            return;
        }
        gbIsPanning = false;
    });

    // Touch support for mobile
    let touchDist = 0;
    viewport.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            touchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
            return;
        }
        if (e.touches.length !== 1) return;
        const touch = e.touches[0];
        const nodeEl = touch.target.closest('.gb-node');
        if (nodeEl && !touch.target.closest('.gb-node-delete') && !touch.target.closest('.gb-connector')) {
            const rect = viewport.getBoundingClientRect();
            const mx = (touch.clientX - rect.left - gbPanX) / gbZoom;
            const my = (touch.clientY - rect.top - gbPanY) / gbZoom;
            const game = gbActiveGame();
            const node = game.nodes.find(n => n.id === nodeEl.dataset.id);
            if (node) {
                gbDragNode = node;
                gbDragOffset = { x: mx - node.x, y: my - node.y };
            }
            return;
        }
        gbIsPanning = true;
        gbPanStart = { x: touch.clientX - gbPanX, y: touch.clientY - gbPanY };
    }, { passive: false });

    viewport.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (e.touches.length === 2) {
            const newDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
            if (touchDist > 0) {
                const scale = newDist / touchDist;
                gbZoom = Math.min(3, Math.max(0.15, gbZoom * scale));
                gbApplyTransform();
            }
            touchDist = newDist;
            return;
        }
        if (e.touches.length !== 1) return;
        const touch = e.touches[0];
        if (gbDragNode) {
            const rect = viewport.getBoundingClientRect();
            const mx = (touch.clientX - rect.left - gbPanX) / gbZoom;
            const my = (touch.clientY - rect.top - gbPanY) / gbZoom;
            gbDragNode.x = mx - gbDragOffset.x;
            gbDragNode.y = my - gbDragOffset.y;
            gbPositionNode(gbDragNode.id);
            gbRenderConnections();
            return;
        }
        if (gbIsPanning) {
            gbPanX = touch.clientX - gbPanStart.x;
            gbPanY = touch.clientY - gbPanStart.y;
            gbApplyTransform();
        }
    }, { passive: false });

    viewport.addEventListener('touchend', () => {
        if (gbDragNode) { gbDragNode = null; gbSave(); }
        gbIsPanning = false;
        touchDist = 0;
    });

    // Double-click to add node
    viewport.addEventListener('dblclick', (e) => {
        if (e.target.closest('.gb-node')) return;
        const rect = viewport.getBoundingClientRect();
        gbPendingPos = {
            x: (e.clientX - rect.left - gbPanX) / gbZoom,
            y: (e.clientY - rect.top - gbPanY) / gbZoom
        };
        gbOpenModal();
    });

    // Keyboard: Delete selected node
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Delete' && gbSelectedNodeId) {
            const section = document.getElementById('gameboard-section');
            if (!section || !section.classList.contains('active')) return;
            if (document.getElementById('gb-modal').style.display !== 'none') return;
            gbDeleteNode(gbSelectedNodeId);
        }
    });

    gbRender();
}

// ---- Rendering ----

function gbRender() {
    gbRenderSelect();
    gbRenderNodes();
    gbRenderConnections();
}

function gbRenderSelect() {
    const select = document.getElementById('gb-game-select');
    select.innerHTML = gbGames.map(g =>
        `<option value="${g.id}" ${g.id === gbActiveGameId ? 'selected' : ''}>${g.name}</option>`
    ).join('');
}

function gbRenderNodes() {
    const canvas = document.getElementById('gb-canvas');
    // Remove old nodes
    canvas.querySelectorAll('.gb-node').forEach(el => el.remove());

    const game = gbActiveGame();
    if (!game) return;

    game.nodes.forEach(node => {
        const el = document.createElement('div');
        el.className = 'gb-node' + (node.id === gbSelectedNodeId ? ' selected' : '');
        el.dataset.id = node.id;
        el.dataset.cat = node.category;
        el.style.left = node.x + 'px';
        el.style.top = node.y + 'px';

        const catLabel = GB_CAT_LABELS[node.category] || node.category;
        el.innerHTML = `
            <span class="gb-node-cat">${catLabel}</span>
            <span class="gb-node-name">${gbEsc(node.name)}</span>
            ${node.notes ? `<span class="gb-node-notes">${gbEsc(node.notes)}</span>` : ''}
            <button class="gb-node-delete" title="Delete node">✕</button>
            <div class="gb-connector" title="Drag to connect"></div>
        `;

        // Delete button
        el.querySelector('.gb-node-delete').addEventListener('click', (e) => {
            e.stopPropagation();
            gbDeleteNode(node.id);
        });

        canvas.appendChild(el);
    });

    gbApplyTransform();
}

function gbPositionNode(nodeId) {
    const canvas = document.getElementById('gb-canvas');
    const el = canvas.querySelector(`.gb-node[data-id="${nodeId}"]`);
    const game = gbActiveGame();
    const node = game.nodes.find(n => n.id === nodeId);
    if (el && node) {
        el.style.left = node.x + 'px';
        el.style.top = node.y + 'px';
    }
}

function gbRenderConnections() {
    const svg = document.getElementById('gb-connections');
    // Keep temp line if exists
    const tempLine = svg.querySelector('.gb-temp-line');
    svg.innerHTML = '';
    if (tempLine) svg.appendChild(tempLine);

    const game = gbActiveGame();
    if (!game) return;

    const canvas = document.getElementById('gb-canvas');

    game.connections.forEach(conn => {
        const fromNode = game.nodes.find(n => n.id === conn.from);
        const toNode = game.nodes.find(n => n.id === conn.to);
        if (!fromNode || !toNode) return;

        const fromEl = canvas.querySelector(`.gb-node[data-id="${conn.from}"]`);
        const toEl = canvas.querySelector(`.gb-node[data-id="${conn.to}"]`);
        if (!fromEl || !toEl) return;

        const x1 = fromNode.x + fromEl.offsetWidth / 2;
        const y1 = fromNode.y + fromEl.offsetHeight / 2;
        const x2 = toNode.x + toEl.offsetWidth / 2;
        const y2 = toNode.y + toEl.offsetHeight / 2;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.classList.add('gb-connection-line');
        line.style.pointerEvents = 'stroke';
        line.addEventListener('click', () => {
            if (confirm('Remove this connection?')) {
                game.connections = game.connections.filter(c => c !== conn);
                gbSave();
                gbRenderConnections();
            }
        });
        svg.appendChild(line);
    });
}

function gbDrawTempLine(x1, y1, x2, y2) {
    const svg = document.getElementById('gb-connections');
    let line = svg.querySelector('.gb-temp-line');
    if (!line) {
        line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.classList.add('gb-temp-line');
        svg.appendChild(line);
    }
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
}

function gbRemoveTempLine() {
    const svg = document.getElementById('gb-connections');
    const line = svg.querySelector('.gb-temp-line');
    if (line) line.remove();
}

function gbApplyTransform() {
    const canvas = document.getElementById('gb-canvas');
    canvas.style.transform = `translate(${gbPanX}px, ${gbPanY}px) scale(${gbZoom})`;
}

function gbResetView() {
    gbZoom = 1;
    gbPanX = 0;
    gbPanY = 0;
    gbApplyTransform();
}

function gbFitView() {
    const game = gbActiveGame();
    if (!game || game.nodes.length === 0) { gbResetView(); return; }

    const viewport = document.getElementById('gb-viewport');
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    game.nodes.forEach(n => {
        minX = Math.min(minX, n.x);
        minY = Math.min(minY, n.y);
        maxX = Math.max(maxX, n.x + 200);
        maxY = Math.max(maxY, n.y + 80);
    });

    const contentW = maxX - minX + 100;
    const contentH = maxY - minY + 100;
    gbZoom = Math.min(vw / contentW, vh / contentH, 1.5);
    gbZoom = Math.max(0.15, gbZoom);
    gbPanX = (vw - contentW * gbZoom) / 2 - minX * gbZoom + 50 * gbZoom;
    gbPanY = (vh - contentH * gbZoom) / 2 - minY * gbZoom + 50 * gbZoom;
    gbApplyTransform();
}

// ---- CRUD ----

function gbOpenModal() {
    document.getElementById('gb-modal').style.display = '';
    document.getElementById('gb-node-name').value = '';
    document.getElementById('gb-node-category').value = 'position';
    document.getElementById('gb-node-notes').value = '';
    setTimeout(() => document.getElementById('gb-node-name').focus(), 50);
}

function gbCloseModal() {
    document.getElementById('gb-modal').style.display = 'none';
}

function gbConfirmAddNode() {
    const name = document.getElementById('gb-node-name').value.trim();
    if (!name) { document.getElementById('gb-node-name').focus(); return; }
    const category = document.getElementById('gb-node-category').value;
    const notes = document.getElementById('gb-node-notes').value.trim();

    const game = gbActiveGame();
    game.nodes.push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        name,
        category,
        notes,
        x: gbPendingPos.x,
        y: gbPendingPos.y
    });
    gbSave();
    gbCloseModal();
    gbRenderNodes();
    gbRenderConnections();
}

function gbDeleteNode(nodeId) {
    const game = gbActiveGame();
    game.nodes = game.nodes.filter(n => n.id !== nodeId);
    game.connections = game.connections.filter(c => c.from !== nodeId && c.to !== nodeId);
    if (gbSelectedNodeId === nodeId) gbSelectedNodeId = null;
    gbSave();
    gbRenderNodes();
    gbRenderConnections();
}

function gbEsc(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Add init to DOMContentLoaded

