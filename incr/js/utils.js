// Utility Functions

// Format large numbers with suffixes
function formatNumber(num, precision = 2) {
    if (num === 0) return '0';
    if (num < 0) return '-' + formatNumber(-num, precision);
    
    const suffixes = [
        { value: 1e63, suffix: 'Vigintillion' },
        { value: 1e60, suffix: 'Novemdecillion' },
        { value: 1e57, suffix: 'Octodecillion' },
        { value: 1e54, suffix: 'Septendecillion' },
        { value: 1e51, suffix: 'Sexdecillion' },
        { value: 1e48, suffix: 'Quindecillion' },
        { value: 1e45, suffix: 'Quattuordecillion' },
        { value: 1e42, suffix: 'Tredecillion' },
        { value: 1e39, suffix: 'Duodecillion' },
        { value: 1e36, suffix: 'Undecillion' },
        { value: 1e33, suffix: 'Decillion' },
        { value: 1e30, suffix: 'Nonillion' },
        { value: 1e27, suffix: 'Octillion' },
        { value: 1e24, suffix: 'Septillion' },
        { value: 1e21, suffix: 'Sextillion' },
        { value: 1e18, suffix: 'Quintillion' },
        { value: 1e15, suffix: 'Quadrillion' },
        { value: 1e12, suffix: 'Trillion' },
        { value: 1e9, suffix: 'Billion' },
        { value: 1e6, suffix: 'Million' },
        { value: 1e3, suffix: 'Thousand' }
    ];
    
    for (const { value, suffix } of suffixes) {
        if (num >= value) {
            return (num / value).toFixed(precision) + ' ' + suffix;
        }
    }
    
    return num.toFixed(precision);
}

// Format time duration
function formatTime(milliseconds) {
    if (milliseconds <= 0) return '0s';
    
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
        return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    } else {
        return `${seconds}s`;
    }
}

// Format money
function formatMoney(amount, precision = 2) {
    return '$' + formatNumber(amount, precision);
}

// Format percentage
function formatPercent(value, precision = 1) {
    return (value * 100).toFixed(precision) + '%';
}

// Get current strength tier
function getCurrentTier() {
    const strength = gameState.get('strength');
    
    for (let i = CONFIG.STRENGTH_TIERS.length - 1; i >= 0; i--) {
        if (strength >= CONFIG.STRENGTH_TIERS[i].threshold) {
            return CONFIG.STRENGTH_TIERS[i];
        }
    }
    
    return CONFIG.STRENGTH_TIERS[0];
}

// Get next strength tier
function getNextTier() {
    const strength = gameState.get('strength');
    
    for (const tier of CONFIG.STRENGTH_TIERS) {
        if (strength < tier.threshold) {
            return tier;
        }
    }
    
    return null;
}

// Calculate equipment cost
function calculateEquipmentCost(equipmentType, currentLevel) {
    const config = CONFIG.EQUIPMENT[equipmentType];
    if (!config) return Infinity;
    
    return Math.floor(config.baseCost * Math.pow(config.costMultiplier, currentLevel));
}

// Calculate gem upgrade cost
function calculateGemUpgradeCost(upgradeType, currentLevel) {
    const config = CONFIG.GEM_UPGRADES[upgradeType];
    if (!config) return Infinity;
    
    if (config.baseCost) {
        return Math.floor(config.baseCost * Math.pow(config.costMultiplier, currentLevel));
    }
    
    return config.cost;
}

// Calculate total strength multiplier
function calculateStrengthMultiplier() {
    let multiplier = gameState.get('strengthMultiplier');
    
    // Add equipment bonuses
    const equipment = gameState.get('equipment');
    
    // Additive bonuses
    multiplier += equipment.proteinShake * CONFIG.EQUIPMENT.proteinShake.effect;
    multiplier += equipment.gymMembership * CONFIG.EQUIPMENT.gymMembership.effect;
    multiplier += equipment.personalTrainer * CONFIG.EQUIPMENT.personalTrainer.effect;
    
    // Multiplicative bonuses
    if (equipment.superSerum > 0) {
        multiplier *= Math.pow(CONFIG.EQUIPMENT.superSerum.effect, equipment.superSerum);
    }
    if (equipment.gravityChamber > 0) {
        multiplier *= Math.pow(CONFIG.EQUIPMENT.gravityChamber.effect, equipment.gravityChamber);
    }
    if (equipment.quantumEnhancer > 0) {
        multiplier *= Math.pow(CONFIG.EQUIPMENT.quantumEnhancer.effect, equipment.quantumEnhancer);
    }
    
    // Gem upgrade bonuses
    const gemUpgrades = gameState.get('gemUpgrades');
    multiplier *= (1 + gemUpgrades.strengthBoost * CONFIG.GEM_UPGRADES.strengthBoost.effect);
    
    // Active effect bonuses
    const activeMultiplier = gameState.getActiveEffectValue('strength_multiplier');
    if (activeMultiplier > 0) {
        multiplier *= activeMultiplier;
    }
    
    return multiplier;
}

// Calculate training gain
function calculateTrainingGain(trainingType) {
    const baseGain = CONFIG.TRAINING_BASE[trainingType];
    const multiplier = calculateStrengthMultiplier();
    
    return baseGain * multiplier;
}

// Calculate money gain from strength
function calculateMoneyGain(strengthGained) {
    const baseGain = strengthGained * CONFIG.MONEY_PER_STRENGTH;
    const gemUpgrades = gameState.get('gemUpgrades');
    const moneyMultiplier = 1 + (gemUpgrades.moneyMultiplier * CONFIG.GEM_UPGRADES.moneyMultiplier.effect);
    
    return baseGain * moneyMultiplier;
}

// Create particle effect
function createParticles(type, x, y, count) {
    if (!gameState.get('settings.particles')) return;
    
    const config = CONFIG.PARTICLES[type] || CONFIG.PARTICLES.strength;
    const actualCount = count || config.count;
    
    for (let i = 0; i < actualCount; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = `particle ${type}`;
            
            // Position
            const offsetX = (Math.random() - 0.5) * 100;
            const offsetY = (Math.random() - 0.5) * 50;
            particle.style.left = (x || Math.random() * window.innerWidth) + offsetX + 'px';
            particle.style.top = (y || Math.random() * window.innerHeight) + offsetY + 'px';
            
            // Color
            particle.style.background = config.color;
            
            document.body.appendChild(particle);
            
            // Remove after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, config.duration);
        }, i * 50);
    }
}

// Show floating text
function showFloatingText(text, x, y, className = '') {
    const element = document.createElement('div');
    element.textContent = text;
    element.className = `floating-text ${className}`;
    element.style.position = 'absolute';
    element.style.left = x + 'px';
    element.style.top = y + 'px';
    element.style.pointerEvents = 'none';
    element.style.zIndex = '2000';
    element.style.fontWeight = 'bold';
    element.style.fontSize = '1.2em';
    element.style.animation = 'money-gain 2s ease-out forwards';
    
    document.body.appendChild(element);
    
    setTimeout(() => {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }, 2000);
}

// Random number between min and max
function random(min, max) {
    return Math.random() * (max - min) + min;
}

// Random integer between min and max (inclusive)
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Clamp value between min and max
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// Linear interpolation
function lerp(a, b, t) {
    return a + (b - a) * t;
}

// Ease in-out function
function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// Deep clone object
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (obj instanceof Set) return new Set(Array.from(obj).map(item => deepClone(item)));
    if (obj instanceof Map) return new Map(Array.from(obj).map(([key, value]) => [deepClone(key), deepClone(value)]));
    
    const cloned = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Get element position
function getElementPosition(element) {
    const rect = element.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}

// Check if element is visible
function isElementVisible(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Animate number change
function animateNumber(element, from, to, duration = 1000) {
    const startTime = Date.now();
    const difference = to - from;
    
    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeInOut(progress);
        const current = from + (difference * eased);
        
        element.textContent = formatNumber(current);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// Play sound effect (placeholder for future implementation)
function playSound(soundName) {
    if (!gameState.get('settings.soundEffects')) return;
    
    // TODO: Implement sound effects
    console.log(`Playing sound: ${soundName}`);
}

// Vibrate device (if supported)
function vibrate(pattern = 100) {
    if (navigator.vibrate) {
        navigator.vibrate(pattern);
    }
}

// Check if feature is unlocked
function isFeatureUnlocked(featureName) {
    return gameState.hasInSet('unlockedFeatures', featureName);
}

// Unlock feature
function unlockFeature(featureName) {
    if (!isFeatureUnlocked(featureName)) {
        gameState.addToSet('unlockedFeatures', featureName);
        
        // Show unlock notification
        showNotification({
            title: 'Feature Unlocked!',
            message: `${featureName.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} is now available!`,
            type: 'milestone'
        });
        
        // Update UI
        updateUI();
    }
}

// Check unlocks based on current state
function checkUnlocks() {
    const strength = gameState.get('strength');
    const prestigeLevel = gameState.get('prestigeLevel');
    
    // Check tier-based unlocks
    for (const tier of CONFIG.STRENGTH_TIERS) {
        if (strength >= tier.threshold) {
            for (const unlock of tier.unlocks) {
                if (unlock.endsWith('-character')) {
                    const character = unlock.replace('-character', '');
                    if (!gameState.hasInSet('unlockedCharacters', character)) {
                        gameState.addToSet('unlockedCharacters', character);
                        document.getElementById(character + '-btn').classList.remove('hidden');
                    }
                } else {
                    unlockFeature(unlock);
                }
            }
        }
    }
    
    // Check prestige-based unlocks
    if (prestigeLevel >= 10 && !isFeatureUnlocked('reality-break')) {
        unlockFeature('reality-break');
    }
    
    // Check hidden achievement unlocks
    const hiddenCount = gameState.get('hiddenAchievements').size;
    if (hiddenCount >= 5 && !isFeatureUnlocked('dimension-shift')) {
        unlockFeature('dimension-shift');
    }
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatNumber,
        formatTime,
        formatMoney,
        formatPercent,
        getCurrentTier,
        getNextTier,
        calculateEquipmentCost,
        calculateGemUpgradeCost,
        calculateStrengthMultiplier,
        calculateTrainingGain,
        calculateMoneyGain,
        createParticles,
        showFloatingText,
        random,
        randomInt,
        clamp,
        lerp,
        easeInOut,
        deepClone,
        debounce,
        throttle,
        getElementPosition,
        isElementVisible,
        animateNumber,
        playSound,
        vibrate,
        isFeatureUnlocked,
        unlockFeature,
        checkUnlocks
    };
}
