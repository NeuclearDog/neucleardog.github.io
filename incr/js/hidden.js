// Hidden Features System

// Reality Break - Distorts the game world
function realityBreak() {
    const cost = CONFIG.HIDDEN_UNLOCKS.realityBreak.cost;
    const strength = gameState.get('strength');
    
    if (strength < cost) {
        showNotification({
            title: 'Reality Remains Stable',
            message: `You need ${formatNumber(cost)} kg strength to break reality!`,
            type: 'error'
        });
        return;
    }
    
    // Consume strength
    gameState.add('strength', -cost);
    gameState.add('hiddenFeatures.realityBreakUsed', 1);
    
    // Reality break effects
    document.body.style.animation = 'reality-break 5s ease-in-out';
    
    // Randomize some values temporarily
    const originalStrength = gameState.get('strength');
    const randomMultiplier = random(0.1, 10);
    gameState.multiply('strength', randomMultiplier);
    
    // Show reality break notification
    showNotification({
        title: '🌀 REALITY BROKEN! 🌀',
        message: 'The fabric of existence bends to your will!\nStrength multiplied by ' + formatNumber(randomMultiplier) + 'x!',
        type: 'hidden',
        duration: 8000
    });
    
    // Create chaotic particle effects
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            createParticles('cosmic', Math.random() * window.innerWidth, Math.random() * window.innerHeight, 1);
        }, i * 100);
    }
    
    // Restore normal animation after effect
    setTimeout(() => {
        document.body.style.animation = '';
    }, 5000);
    
    // Sound and haptic feedback
    playSound('reality_break');
    vibrate([300, 100, 300, 100, 300]);
    
    // Check for reality bender achievement
    checkAchievements();
    
    updateUI();
}

// Time Loop - Repeats recent actions
function timeLoop() {
    const cost = CONFIG.HIDDEN_UNLOCKS.timeLoop.cost;
    const strength = gameState.get('strength');
    
    if (strength < cost) {
        showNotification({
            title: 'Time Flows Normally',
            message: `You need ${formatNumber(cost)} kg strength to loop time!`,
            type: 'error'
        });
        return;
    }
    
    // Consume strength
    gameState.add('strength', -cost);
    gameState.add('hiddenFeatures.timeLoopUsed', 1);
    
    // Time loop effects - duplicate recent gains
    const recentStrengthGain = gameState.get('statistics.totalStrengthGained') * 0.1; // 10% of total
    const recentMoneyGain = gameState.get('statistics.totalMoneyEarned') * 0.1;
    
    gameState.add('strength', recentStrengthGain);
    gameState.add('money', recentMoneyGain);
    
    // Visual time loop effect
    document.body.style.animation = 'time-loop 3s ease-in-out';
    
    showNotification({
        title: '🔄 TIME LOOP ACTIVATED! 🔄',
        message: `Recent progress repeated!\n+${formatNumber(recentStrengthGain)} kg strength\n+${formatMoney(recentMoneyGain)}`,
        type: 'hidden',
        duration: 6000
    });
    
    // Create swirling particle effects
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const angle = (i / 30) * Math.PI * 2;
            const x = window.innerWidth / 2 + Math.cos(angle) * 200;
            const y = window.innerHeight / 2 + Math.sin(angle) * 200;
            createParticles('gem', x, y, 1);
        }, i * 50);
    }
    
    setTimeout(() => {
        document.body.style.animation = '';
    }, 3000);
    
    playSound('time_loop');
    vibrate([150, 75, 150, 75, 150, 75, 150]);
    
    checkAchievements();
    updateUI();
}

// Dimension Shift - Changes game rules temporarily
function dimensionShift() {
    const cost = CONFIG.HIDDEN_UNLOCKS.dimensionShift.cost;
    const strength = gameState.get('strength');
    
    if (strength < cost) {
        showNotification({
            title: 'Dimensions Remain Stable',
            message: `You need ${formatNumber(cost)} kg strength to shift dimensions!`,
            type: 'error'
        });
        return;
    }
    
    // Consume strength
    gameState.add('strength', -cost);
    gameState.add('hiddenFeatures.dimensionShiftUsed', 1);
    
    // Dimension shift effects
    gameState.set('dimensionShifted', true);
    
    // Temporarily modify game rules
    const originalMultiplier = gameState.get('strengthMultiplier');
    gameState.multiply('strengthMultiplier', 100); // 100x multiplier
    
    // Visual dimension shift effect
    document.body.style.animation = 'dimension-shift 10s ease-in-out';
    
    showNotification({
        title: '🌈 DIMENSION SHIFTED! 🌈',
        message: 'You exist in a higher dimension!\n100x strength multiplier for 60 seconds!',
        type: 'hidden',
        duration: 8000
    });
    
    // Create dimensional particle effects
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            createParticles('cosmic', Math.random() * window.innerWidth, Math.random() * window.innerHeight, 1);
        }, i * 50);
    }
    
    // Restore normal state after 60 seconds
    setTimeout(() => {
        gameState.set('strengthMultiplier', originalMultiplier);
        gameState.set('dimensionShifted', false);
        document.body.style.animation = '';
        
        showNotification({
            title: 'Dimension Restored',
            message: 'You have returned to normal reality.',
            type: 'info'
        });
        
        updateUI();
    }, 60000);
    
    playSound('dimension_shift');
    vibrate([200, 100, 200, 100, 200, 100, 200, 100, 200]);
    
    checkAchievements();
    updateUI();
}

// Secret code sequences
const SECRET_CODES = {
    // Konami code already handled in achievements.js
    
    // Secret strength code: up, up, down, down, left, right, left, right, s, t, r
    strengthCode: {
        sequence: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyS', 'KeyT', 'KeyR'],
        current: [],
        effect: () => {
            gameState.multiply('strength', 1000);
            showNotification({
                title: '💪 SECRET STRENGTH CODE! 💪',
                message: 'Strength multiplied by 1000x!',
                type: 'hidden'
            });
            gameState.get('hiddenFeatures.secretsDiscovered').add('strength_code');
        }
    },
    
    // Money code: m, o, n, e, y
    moneyCode: {
        sequence: ['KeyM', 'KeyO', 'KeyN', 'KeyE', 'KeyY'],
        current: [],
        effect: () => {
            gameState.add('money', 1000000);
            showNotification({
                title: '💰 SECRET MONEY CODE! 💰',
                message: '+$1,000,000!',
                type: 'hidden'
            });
            gameState.get('hiddenFeatures.secretsDiscovered').add('money_code');
        }
    },
    
    // Gem code: g, e, m, s
    gemCode: {
        sequence: ['KeyG', 'KeyE', 'KeyM', 'KeyS'],
        current: [],
        effect: () => {
            gameState.add('gems', 100);
            showNotification({
                title: '💎 SECRET GEM CODE! 💎',
                message: '+100 gems!',
                type: 'hidden'
            });
            gameState.get('hiddenFeatures.secretsDiscovered').add('gem_code');
        }
    }
};

// Handle secret code input
function handleSecretCodes(event) {
    Object.keys(SECRET_CODES).forEach(codeName => {
        const code = SECRET_CODES[codeName];
        
        code.current.push(event.code);
        if (code.current.length > code.sequence.length) {
            code.current.shift();
        }
        
        if (code.current.length === code.sequence.length &&
            code.current.every((key, index) => key === code.sequence[index])) {
            code.effect();
            code.current = [];
            checkAchievements();
        }
    });
}

// Easter eggs
function initEasterEggs() {
    // Secret click combinations
    let clickSequence = [];
    const secretClickPattern = [1, 1, 2, 3, 5, 8]; // Fibonacci
    
    document.addEventListener('click', (event) => {
        // Track click timing for pattern detection
        const now = Date.now();
        clickSequence.push(now);
        
        // Keep only recent clicks (within 5 seconds)
        clickSequence = clickSequence.filter(time => now - time < 5000);
        
        // Check for rapid clicking pattern
        if (clickSequence.length >= 20) {
            const intervals = [];
            for (let i = 1; i < clickSequence.length; i++) {
                intervals.push(clickSequence[i] - clickSequence[i-1]);
            }
            
            // Check if clicking follows a pattern
            const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
            if (avgInterval < 100) { // Very fast clicking
                gameState.get('hiddenFeatures.secretsDiscovered').add('rapid_clicker');
                showNotification({
                    title: '👆 RAPID CLICKER! 👆',
                    message: 'Your clicking speed is inhuman!',
                    type: 'hidden'
                });
                checkAchievements();
                clickSequence = [];
            }
        }
    });
    
    // Secret hover effects
    let hoverCount = 0;
    document.querySelectorAll('.training-btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            hoverCount++;
            if (hoverCount >= 100) {
                gameState.get('hiddenFeatures.secretsDiscovered').add('hover_master');
                showNotification({
                    title: '🖱️ HOVER MASTER! 🖱️',
                    message: 'You love hovering over buttons!',
                    type: 'hidden'
                });
                checkAchievements();
                hoverCount = 0;
            }
        });
    });
    
    // Secret idle detection
    let idleTime = 0;
    let lastActivity = Date.now();
    
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, () => {
            lastActivity = Date.now();
            idleTime = 0;
        });
    });
    
    setInterval(() => {
        idleTime = Date.now() - lastActivity;
        
        // 10 minutes of idle time
        if (idleTime >= 600000 && !gameState.get('hiddenFeatures.secretsDiscovered').has('idle_master')) {
            gameState.get('hiddenFeatures.secretsDiscovered').add('idle_master');
            showNotification({
                title: '😴 IDLE MASTER! 😴',
                message: 'You mastered the art of doing nothing!',
                type: 'hidden'
            });
            checkAchievements();
        }
    }, 60000);
}

// Update hidden features panel
function updateHiddenFeaturesPanel() {
    const panel = document.getElementById('hidden-features');
    if (!panel) return;
    
    const shouldShow = gameState.get('prestigeLevel') >= 10 || 
                      gameState.get('strength') >= 1e15 || 
                      gameState.get('hiddenAchievements').size >= 3;
    
    if (shouldShow) {
        panel.classList.remove('hidden');
    }
    
    // Update button states
    const realityBtn = document.getElementById('reality-break');
    const timeBtn = document.getElementById('time-loop');
    const dimensionBtn = document.getElementById('dimension-shift');
    
    if (realityBtn) {
        realityBtn.disabled = gameState.get('strength') < CONFIG.HIDDEN_UNLOCKS.realityBreak.cost;
    }
    
    if (timeBtn) {
        timeBtn.disabled = gameState.get('strength') < CONFIG.HIDDEN_UNLOCKS.timeLoop.cost;
    }
    
    if (dimensionBtn) {
        dimensionBtn.disabled = gameState.get('strength') < CONFIG.HIDDEN_UNLOCKS.dimensionShift.cost;
    }
}

// Initialize hidden features system
function initHiddenFeatures() {
    // Set up secret code detection
    document.addEventListener('keydown', handleSecretCodes);
    
    // Initialize easter eggs
    initEasterEggs();
    
    // Update hidden features panel periodically
    setInterval(updateHiddenFeaturesPanel, 1000);
    
    // Initial update
    updateHiddenFeaturesPanel();
    
    console.log('Hidden features initialized. Good luck finding them all! 🔮');
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        realityBreak,
        timeLoop,
        dimensionShift,
        handleSecretCodes,
        initEasterEggs,
        updateHiddenFeaturesPanel,
        initHiddenFeatures,
        SECRET_CODES
    };
}
