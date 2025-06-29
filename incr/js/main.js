let lastTierIndex = 0;
let fightStreak = 0;

function initGame() {
    console.log('Initializing Strength Ascension v' + CONFIG.VERSION);
    
    showLoadingScreen();
    
    gameState.load();
    gameState.startUpdateLoop();
    
    initThemes();
    initTraining();
    initFighting();
    initShop();
    initAchievements();
    initPrestige();
    initNotifications();
    initStatistics();
    initHiddenFeatures();
    
    setInterval(() => {
        if (gameState.get('settings.autoSave')) {
            gameState.save();
        }
    }, CONFIG.AUTO_SAVE_INTERVAL);
    
    setInterval(updateUI, 100);
    setInterval(checkTierProgression, 500);
    
    updateUI();
    
    setTimeout(hideLoadingScreen, 2000);
    
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

function checkTierProgression() {
    const currentStrength = gameState.get('strength');
    const currentTierIndex = getCurrentTierIndex();
    
    if (currentTierIndex > lastTierIndex) {
        const tier = CONFIG.STRENGTH_TIERS[currentTierIndex];
        if (tier.autoMoney > 0) {
            gameState.add('money', tier.autoMoney);
            gameState.add('statistics.totalMoneyEarned', tier.autoMoney);
            
            showNotification({
                title: `${tier.emoji} ${tier.name} Achieved!`,
                message: `Auto-collected ${formatMoney(tier.autoMoney)}!\nNew tier unlocked!`,
                type: 'milestone',
                duration: 5000
            });
            
            createParticles('money', window.innerWidth / 2, window.innerHeight / 2, 8);
            playSound('tier_up');
            vibrate([200, 100, 200]);
        }
        lastTierIndex = currentTierIndex;
    }
}

function getCurrentTierIndex() {
    const strength = gameState.get('strength');
    for (let i = CONFIG.STRENGTH_TIERS.length - 1; i >= 0; i--) {
        if (strength >= CONFIG.STRENGTH_TIERS[i].threshold) {
            return i;
        }
    }
    return 0;
}

function showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
}

function updateUI() {
    updateStatsDisplay();
    updateTrainingDisplay();
    updateShopDisplay();
    updateProgressBar();
    updateMilestone();
    checkUnlocks();
}

function updateStatsDisplay() {
    const strength = gameState.get('strength');
    const money = gameState.get('money');
    const gems = gameState.get('gems');
    const prestigeLevel = gameState.get('prestigeLevel');
    const multiplier = calculateStrengthMultiplier();
    const fightsWon = gameState.get('statistics.fightsWon') || 0;
    
    const strengthDisplay = document.getElementById('strength-display');
    if (strengthDisplay) {
        strengthDisplay.textContent = formatNumber(strength) + ' kg';
        
        if (strength > gameState.get('statistics.maxStrengthReached')) {
            strengthDisplay.style.animation = 'strength-surge 0.5s ease-out';
            setTimeout(() => {
                strengthDisplay.style.animation = '';
            }, 500);
        }
    }
    
    const moneyDisplay = document.getElementById('money-display');
    if (moneyDisplay) {
        moneyDisplay.textContent = formatMoney(money);
    }
    
    const gemsDisplay = document.getElementById('gems-display');
    if (gemsDisplay) {
        gemsDisplay.textContent = formatNumber(gems);
    }
    
    const prestigeLevelDisplay = document.getElementById('prestige-level');
    if (prestigeLevelDisplay) {
        prestigeLevelDisplay.textContent = prestigeLevel;
    }
    
    const multiplierDisplay = document.getElementById('strength-multiplier');
    if (multiplierDisplay) {
        multiplierDisplay.textContent = formatNumber(multiplier) + 'x';
    }
    
    const fightsWonDisplay = document.getElementById('fights-won');
    if (fightsWonDisplay) {
        fightsWonDisplay.textContent = formatNumber(fightsWon);
    }
    
    const winStreakDisplay = document.getElementById('win-streak');
    if (winStreakDisplay) {
        winStreakDisplay.textContent = formatNumber(fightStreak || 0);
    }
    
    const tier = getCurrentTier();
    const tierDisplay = document.getElementById('strength-tier');
    if (tierDisplay) {
        tierDisplay.textContent = `${tier.emoji} ${tier.name}`;
    }
}

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
    
    const avatar = document.getElementById('character-avatar');
    if (avatar) {
        avatar.textContent = CHARACTERS[character].emoji;
    }
    
    document.querySelectorAll('.character-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.getElementById(character + '-btn').classList.add('selected');
    
    showNotification({
        title: 'Character Selected',
        message: `You are now playing as ${CHARACTERS[character].name}!`,
        type: 'info'
    });
    
    gameState.save();
}

document.addEventListener('keydown', (event) => {
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
    }
});

window.addEventListener('beforeunload', () => {
    gameState.save();
    gameState.stopUpdateLoop();
});

window.addEventListener('focus', () => {
    gameState.startUpdateLoop();
});

window.addEventListener('blur', () => {
    gameState.save();
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        gameState.save();
    } else {
        gameState.startUpdateLoop();
        updateUI();
    }
});

window.addEventListener('error', (event) => {
    console.error('Game error:', event.error);
    
    try {
        gameState.save();
    } catch (e) {
        console.error('Failed to save game after error:', e);
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

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
        
        if (fps < 30) {
            console.warn('Low FPS detected:', fps);
        }
    }
    
    requestAnimationFrame(updateFPS);
}

requestAnimationFrame(updateFPS);

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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}

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
