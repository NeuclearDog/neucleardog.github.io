// Main Game Controller

// Game initialization
function initGame() {
    console.log('Initializing Strength Ascension v' + CONFIG.VERSION);
    
    // Show loading screen
    showLoadingScreen();
    
    // Load game state
    gameState.load();
    gameState.startUpdateLoop();
    
    // Initialize all systems
    initThemes();
    initTraining();
    initFighting();
    initShop();
    initAchievements();
    initPrestige();
    initNotifications();
    initStatistics();
    initHiddenFeatures();
    
    // Set up auto-save
    setInterval(() => {
        if (gameState.get('settings.autoSave')) {
            gameState.save();
        }
    }, CONFIG.AUTO_SAVE_INTERVAL);
    
    // Set up UI updates
    setInterval(updateUI, 100);
    
    // Initial UI update
    updateUI();
    
    // Hide loading screen after initialization
    setTimeout(hideLoadingScreen, 2000);
    
    // Welcome message for new players
    if (gameState.get('strength') === 1.0 && gameState.get('statistics.totalTrainingClicks') === 0) {
        setTimeout(() => {
            showNotification({
                title: 'Welcome to Strength Ascension!',
                message: 'Begin your journey from weakling to cosmic entity. Click training buttons to gain strength!',
                type: 'info',
                duration: 8000
            });
        }, 3000);
    }
    
    console.log('Game initialized successfully');
}

// Show loading screen
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
    }
}

// Hide loading screen
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
}

// Main UI update function
function updateUI() {
    updateStatsDisplay();
    updateTrainingDisplay();
    updateShopDisplay();
    updateProgressBar();
    updateMilestone();
    checkUnlocks();
}

// Update stats display
function updateStatsDisplay() {
    const strength = gameState.get('strength');
    const money = gameState.get('money');
    const gems = gameState.get('gems');
    const prestigeLevel = gameState.get('prestigeLevel');
    const multiplier = calculateStrengthMultiplier();
    const fightsWon = gameState.get('statistics.fightsWon') || 0;
    
    // Update strength display
    const strengthDisplay = document.getElementById('strength-display');
    if (strengthDisplay) {
        strengthDisplay.textContent = formatNumber(strength) + ' kg';
        
        // Add animation for large gains
        if (strength > gameState.get('statistics.maxStrengthReached')) {
            strengthDisplay.style.animation = 'strength-surge 0.5s ease-out';
            setTimeout(() => {
                strengthDisplay.style.animation = '';
            }, 500);
        }
    }
    
    // Update money display
    const moneyDisplay = document.getElementById('money-display');
    if (moneyDisplay) {
        moneyDisplay.textContent = formatMoney(money);
    }
    
    // Update gems display
    const gemsDisplay = document.getElementById('gems-display');
    if (gemsDisplay) {
        gemsDisplay.textContent = formatNumber(gems);
    }
    
    // Update prestige level
    const prestigeLevelDisplay = document.getElementById('prestige-level');
    if (prestigeLevelDisplay) {
        prestigeLevelDisplay.textContent = prestigeLevel;
    }
    
    // Update strength multiplier
    const multiplierDisplay = document.getElementById('strength-multiplier');
    if (multiplierDisplay) {
        multiplierDisplay.textContent = formatNumber(multiplier) + 'x';
    }
    
    // Update fights won
    const fightsWonDisplay = document.getElementById('fights-won');
    if (fightsWonDisplay) {
        fightsWonDisplay.textContent = formatNumber(fightsWon);
    }
    
    // Update win streak
    const winStreakDisplay = document.getElementById('win-streak');
    if (winStreakDisplay) {
        winStreakDisplay.textContent = formatNumber(fightStreak || 0);
    }
    
    // Update strength tier
    const tier = getCurrentTier();
    const tierDisplay = document.getElementById('strength-tier');
    if (tierDisplay) {
        tierDisplay.textContent = `${tier.emoji} ${tier.name}`;
    }
}

// Update progress bar
function updateProgressBar() {
    const strength = gameState.get('strength');
    const nextTier = getNextTier();
    const progressFill = document.getElementById('progress-fill');
    
    if (progressFill && nextTier) {
        const currentTier = getCurrentTier();
        const progress = (strength - currentTier.threshold) / (nextTier.threshold - currentTier.threshold);
        const percentage = Math.min(progress * 100, 100);
        
        progressFill.style.width = percentage + '%';
    } else if (progressFill) {
        progressFill.style.width = '100%';
    }
}

// Update milestone display
function updateMilestone() {
    const nextTier = getNextTier();
    const milestoneDisplay = document.getElementById('current-goal');
    
    if (milestoneDisplay) {
        if (nextTier) {
            milestoneDisplay.textContent = `Goal: ${nextTier.name} (${formatNumber(nextTier.threshold)} kg)`;
        } else {
            milestoneDisplay.textContent = 'Maximum Power Achieved!';
            milestoneDisplay.style.background = 'linear-gradient(45deg, #ffd700, #ff6b6b)';
        }
    }
}

// Character selection
function selectCharacter(character) {
    if (!gameState.hasInSet('unlockedCharacters', character)) {
        showNotification({
            title: 'Character Locked',
            message: `${CHARACTERS[character].name} is not yet unlocked!`,
            type: 'error'
        });
        return;
    }
    
    gameState.set('character', character);
    
    // Update character avatar
    const avatar = document.getElementById('character-avatar');
    if (avatar) {
        avatar.textContent = CHARACTERS[character].emoji;
    }
    
    // Update button styles
    document.querySelectorAll('.character-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.getElementById(character + '-btn').classList.add('selected');
    
    // Show selection notification
    showNotification({
        title: 'Character Selected',
        message: `You are now playing as ${CHARACTERS[character].name}!`,
        type: 'info'
    });
    
    gameState.save();
}

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
    // Don't trigger shortcuts when typing in inputs
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
    }
    
    switch (event.key.toLowerCase()) {
        case 'p':
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                prestige();
            }
            break;
        case 's':
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                gameState.save();
                showNotification({
                    title: 'Game Saved',
                    message: 'Your progress has been saved!',
                    type: 'info'
                });
            }
            break;
        case 'r':
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                if (confirm('Are you sure you want to reset your game? This cannot be undone!')) {
                    gameState.reset();
                    location.reload();
                }
            }
            break;
        case 'escape':
            // Close any open modals or menus
            break;
    }
});

// Window events
window.addEventListener('beforeunload', () => {
    gameState.save();
    gameState.stopUpdateLoop();
});

window.addEventListener('focus', () => {
    // Resume game updates
    gameState.startUpdateLoop();
});

window.addEventListener('blur', () => {
    // Save game when losing focus
    gameState.save();
});

// Visibility change handling for mobile
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        gameState.save();
    } else {
        gameState.startUpdateLoop();
        updateUI();
    }
});

// Error handling
window.addEventListener('error', (event) => {
    console.error('Game error:', event.error);
    
    // Try to save game state
    try {
        gameState.save();
    } catch (e) {
        console.error('Failed to save game after error:', e);
    }
});

// Unhandled promise rejection handling
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

// Performance monitoring
let lastFrameTime = performance.now();
let frameCount = 0;
let fps = 60;

function updateFPS() {
    const now = performance.now();
    frameCount++;
    
    if (now - lastFrameTime >= 1000) {
        fps = Math.round((frameCount * 1000) / (now - lastFrameTime));
        frameCount = 0;
        lastFrameTime = now;
        
        // Log performance issues
        if (fps < 30) {
            console.warn('Low FPS detected:', fps);
        }
    }
    
    requestAnimationFrame(updateFPS);
}

// Start FPS monitoring
requestAnimationFrame(updateFPS);

// Debug functions (only in development)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.debugGame = {
        addStrength: (amount) => gameState.add('strength', amount),
        addMoney: (amount) => gameState.add('money', amount),
        addGems: (amount) => gameState.add('gems', amount),
        setPrestige: (level) => gameState.set('prestigeLevel', level),
        unlockAll: () => {
            Object.keys(CHARACTERS).forEach(char => {
                gameState.addToSet('unlockedCharacters', char);
            });
            CONFIG.STRENGTH_TIERS.forEach(tier => {
                tier.unlocks.forEach(unlock => {
                    if (unlock.endsWith('-character')) {
                        const character = unlock.replace('-character', '');
                        gameState.addToSet('unlockedCharacters', character);
                    } else {
                        gameState.addToSet('unlockedFeatures', unlock);
                    }
                });
            });
            updateUI();
        },
        exportSave: () => gameState.export(),
        importSave: (saveString) => {
            if (gameState.import(saveString)) {
                updateUI();
                console.log('Save imported successfully');
            } else {
                console.error('Failed to import save');
            }
        },
        resetGame: () => {
            gameState.reset();
            location.reload();
        }
    };
    
    console.log('Debug functions available: window.debugGame');
}

// Initialize game when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}

// Export main functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initGame,
        updateUI,
        updateStatsDisplay,
        updateProgressBar,
        updateMilestone,
        selectCharacter
    };
}
