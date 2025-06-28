// Training System

// Training functions
function basicTraining() {
    performTraining('basic');
}

function intenseTraining() {
    performTraining('intense');
}

function extremeTraining() {
    performTraining('extreme');
}

function legendaryTraining() {
    performTraining('legendary');
}

function cosmicTraining() {
    performTraining('cosmic');
}

// Core training function
function performTraining(type) {
    // Check if training is unlocked
    if (!isFeatureUnlocked(type + '-training')) {
        return;
    }
    
    // Check cooldown
    if (gameState.isOnCooldown(type)) {
        const remaining = gameState.getRemainingCooldown(type);
        showNotification({
            title: 'Training on Cooldown',
            message: `Wait ${formatTime(remaining)} before training again`,
            type: 'error'
        });
        return;
    }
    
    // Calculate gains
    const strengthGain = calculateTrainingGain(type);
    const moneyGain = calculateMoneyGain(strengthGain);
    
    // Apply gains
    gameState.add('strength', strengthGain);
    gameState.add('money', moneyGain);
    
    // Update statistics
    gameState.add('statistics.totalStrengthGained', strengthGain);
    gameState.add('statistics.totalMoneyEarned', moneyGain);
    gameState.add('statistics.totalTrainingClicks', 1);
    
    // Set cooldown
    const cooldownDuration = CONFIG.COOLDOWNS[type];
    if (cooldownDuration > 0) {
        gameState.setCooldown(type, cooldownDuration);
    }
    
    // Visual effects
    const button = document.getElementById(type + '-training');
    if (button) {
        const pos = getElementPosition(button);
        createParticles('strength', pos.x, pos.y);
        createParticles('money', pos.x + 20, pos.y + 20, 2);
        
        // Show floating text
        showFloatingText(`+${formatNumber(strengthGain)} STR`, pos.x - 50, pos.y - 30, 'strength-gain');
        showFloatingText(`+${formatMoney(moneyGain)}`, pos.x + 50, pos.y - 30, 'money-gain');
        
        // Button animation
        button.style.animation = 'button-press 0.2s ease-out';
        setTimeout(() => {
            button.style.animation = '';
        }, 200);
    }
    
    // Sound and haptic feedback
    playSound('training_' + type);
    vibrate(50);
    
    // Check for achievements and unlocks
    checkAchievements();
    checkUnlocks();
    
    // Update UI
    updateTrainingDisplay();
    updateStatsDisplay();
}

// Earth Challenge
function earthChallenge() {
    const strength = gameState.get('strength');
    
    if (strength >= EARTH_MASS) {
        if (!gameState.get('earthLifted')) {
            gameState.set('earthLifted', true);
            
            // Massive celebration
            showNotification({
                title: '🌍 EARTH LIFTER ACHIEVED! 🌍',
                message: 'You have achieved the impossible - you can now lift the Earth itself!',
                type: 'earth-lifter',
                duration: 10000
            });
            
            // Special effects
            document.body.classList.add('screen-shake');
            setTimeout(() => document.body.classList.remove('screen-shake'), 2000);
            
            createParticles('cosmic', window.innerWidth / 2, window.innerHeight / 2, 50);
            
            // Unlock hidden features
            unlockFeature('earth-lifter-powers');
            
            // Achievement
            unlockAchievement('earth_lifter');
            
            playSound('earth_lift');
            vibrate([200, 100, 200, 100, 200]);
        } else {
            showNotification({
                title: 'Earth Already Lifted',
                message: 'You have already proven your ultimate strength!',
                type: 'info'
            });
        }
    } else {
        const needed = EARTH_MASS - strength;
        showNotification({
            title: 'Not Strong Enough',
            message: `You need ${formatNumber(needed)} more strength to lift the Earth!`,
            type: 'error'
        });
    }
}

// Update training display
function updateTrainingDisplay() {
    // Update gain displays
    const types = ['basic', 'intense', 'extreme', 'legendary', 'cosmic'];
    
    types.forEach(type => {
        const gainElement = document.getElementById(type + '-gain');
        if (gainElement) {
            const gain = calculateTrainingGain(type);
            gainElement.textContent = formatNumber(gain);
        }
        
        // Update cooldown displays
        updateCooldownDisplay(type);
        
        // Update button states
        const button = document.getElementById(type + '-training');
        if (button) {
            const isOnCooldown = gameState.isOnCooldown(type);
            const isUnlocked = isFeatureUnlocked(type + '-training');
            
            button.disabled = isOnCooldown;
            button.style.display = isUnlocked ? 'block' : 'none';
            
            if (isUnlocked && !button.classList.contains('hidden')) {
                button.classList.remove('hidden');
            }
        }
    });
    
    // Update Earth Challenge
    const earthButton = document.getElementById('earth-challenge');
    if (earthButton) {
        const strength = gameState.get('strength');
        const shouldShow = strength >= EARTH_MASS * 0.1; // Show when 10% of Earth's mass
        
        if (shouldShow) {
            earthButton.classList.remove('hidden');
        }
        
        earthButton.disabled = strength < EARTH_MASS;
    }
}

// Update cooldown display for a specific training type
function updateCooldownDisplay(type) {
    const cooldownElement = document.getElementById(type + '-cooldown');
    if (!cooldownElement) return;
    
    const remaining = gameState.getRemainingCooldown(type);
    
    if (remaining > 0) {
        cooldownElement.textContent = `Cooldown: ${formatTime(remaining)}`;
        cooldownElement.style.display = 'block';
        
        // Add cooldown bar
        const button = document.getElementById(type + '-training');
        if (button && !button.querySelector('.cooldown-bar')) {
            const cooldownBar = document.createElement('div');
            cooldownBar.className = 'cooldown-bar';
            button.appendChild(cooldownBar);
        }
        
        // Update cooldown bar width
        const cooldownBar = button?.querySelector('.cooldown-bar');
        if (cooldownBar) {
            const totalDuration = CONFIG.COOLDOWNS[type];
            const progress = (totalDuration - remaining) / totalDuration;
            cooldownBar.style.width = (progress * 100) + '%';
        }
    } else {
        cooldownElement.textContent = '';
        cooldownElement.style.display = 'none';
        
        // Remove cooldown bar
        const button = document.getElementById(type + '-training');
        const cooldownBar = button?.querySelector('.cooldown-bar');
        if (cooldownBar) {
            cooldownBar.remove();
        }
    }
}

// Auto-training for idle gameplay
function processIdleGains() {
    const gymMembership = gameState.get('equipment.gymMembership');
    
    if (gymMembership > 0) {
        const idleGain = gymMembership * CONFIG.EQUIPMENT.gymMembership.idleGain;
        const strengthGain = idleGain * calculateStrengthMultiplier();
        const moneyGain = calculateMoneyGain(strengthGain);
        
        gameState.add('strength', strengthGain);
        gameState.add('money', moneyGain);
        gameState.add('statistics.totalStrengthGained', strengthGain);
        gameState.add('statistics.totalMoneyEarned', moneyGain);
    }
    
    // Gem generation from gem generator upgrade
    const gemGenerator = gameState.get('gemUpgrades.gemGenerator');
    if (gemGenerator > 0) {
        const gemsPerSecond = gemGenerator * CONFIG.GEM_UPGRADES.gemGenerator.effect / 3600; // Per hour to per second
        const gemGain = gemsPerSecond;
        
        if (Math.random() < gemGain) {
            gameState.add('gems', 1);
            gameState.add('statistics.totalGemsEarned', 1);
            
            // Show gem particle occasionally
            if (Math.random() < 0.1) {
                createParticles('gem', Math.random() * window.innerWidth, Math.random() * window.innerHeight, 1);
            }
        }
    }
}

// Initialize training system
function initTraining() {
    // Set up idle gains interval
    setInterval(processIdleGains, 1000);
    
    // Set up cooldown update interval
    setInterval(() => {
        updateTrainingDisplay();
    }, 100);
    
    // Initial display update
    updateTrainingDisplay();
}

// Keyboard shortcuts for training
document.addEventListener('keydown', (event) => {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return; // Don't trigger shortcuts when typing
    }
    
    switch (event.key.toLowerCase()) {
        case '1':
            basicTraining();
            break;
        case '2':
            intenseTraining();
            break;
        case '3':
            extremeTraining();
            break;
        case '4':
            if (isFeatureUnlocked('legendary-training')) {
                legendaryTraining();
            }
            break;
        case '5':
            if (isFeatureUnlocked('cosmic-training')) {
                cosmicTraining();
            }
            break;
        case 'e':
            if (isFeatureUnlocked('earth-challenge')) {
                earthChallenge();
            }
            break;
    }
});

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        basicTraining,
        intenseTraining,
        extremeTraining,
        legendaryTraining,
        cosmicTraining,
        earthChallenge,
        performTraining,
        updateTrainingDisplay,
        updateCooldownDisplay,
        processIdleGains,
        initTraining
    };
}
