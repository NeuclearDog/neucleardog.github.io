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

function formatMoney(amount, precision = 2) {
    return '$' + formatNumber(amount, precision);
}

function formatPercent(value, precision = 1) {
    return (value * 100).toFixed(precision) + '%';
}

function getCurrentTier() {
    const strength = gameState.get('strength');
    
    for (let i = CONFIG.STRENGTH_TIERS.length - 1; i >= 0; i--) {
        if (strength >= CONFIG.STRENGTH_TIERS[i].threshold) {
            return CONFIG.STRENGTH_TIERS[i];
        }
    }
    
    return CONFIG.STRENGTH_TIERS[0];
}

function getNextTier() {
    const strength = gameState.get('strength');
    
    for (const tier of CONFIG.STRENGTH_TIERS) {
        if (strength < tier.threshold) {
            return tier;
        }
    }
    
    return null;
}

function calculateEquipmentCost(equipmentType, currentLevel) {
    const config = CONFIG.EQUIPMENT[equipmentType];
    if (!config) return Infinity;
    
    return Math.floor(config.baseCost * Math.pow(config.costMultiplier, currentLevel));
}

function calculateGemUpgradeCost(upgradeType, currentLevel) {
    const config = CONFIG.GEM_UPGRADES[upgradeType];
    if (!config) return Infinity;
    
    if (config.baseCost) {
        return Math.floor(config.baseCost * Math.pow(config.costMultiplier, currentLevel));
    }
    
    return config.cost;
}

function calculateStrengthMultiplier() {
    let multiplier = gameState.get('strengthMultiplier');
    
    const equipment = gameState.get('equipment');
    
    multiplier += equipment.proteinShake * CONFIG.EQUIPMENT.proteinShake.effect;
    multiplier += equipment.gymMembership * CONFIG.EQUIPMENT.gymMembership.effect;
    multiplier += equipment.personalTrainer * CONFIG.EQUIPMENT.personalTrainer.effect;
    
    if (equipment.superSerum > 0) {
        multiplier *= Math.pow(CONFIG.EQUIPMENT.superSerum.effect, equipment.superSerum);
    }
    if (equipment.gravityChamber > 0) {
        multiplier *= Math.pow(CONFIG.EQUIPMENT.gravityChamber.effect, equipment.gravityChamber);
    }
    if (equipment.quantumEnhancer > 0) {
        multiplier *= Math.pow(CONFIG.EQUIPMENT.quantumEnhancer.effect, equipment.quantumEnhancer);
    }
    
    if (equipment.moonTrainingGround > 0) {
        multiplier *= Math.pow(CONFIG.EQUIPMENT.moonTrainingGround.effect, equipment.moonTrainingGround);
    }
    if (equipment.citySlabLifter > 0) {
        multiplier *= Math.pow(CONFIG.EQUIPMENT.citySlabLifter.effect, equipment.citySlabLifter);
    }
    if (equipment.continentalBarbell > 0) {
        multiplier *= Math.pow(CONFIG.EQUIPMENT.continentalBarbell.effect, equipment.continentalBarbell);
    }
    if (equipment.planetaryDumbbell > 0) {
        multiplier *= Math.pow(CONFIG.EQUIPMENT.planetaryDumbbell.effect, equipment.planetaryDumbbell);
    }
    
    const gemUpgrades = gameState.get('gemUpgrades');
    multiplier *= (1 + gemUpgrades.strengthBoost * CONFIG.GEM_UPGRADES.strengthBoost.effect);
    
    const activeMultiplier = gameState.getActiveEffectValue('strength_multiplier');
    if (activeMultiplier > 0) {
        multiplier *= activeMultiplier;
    }
    
    return multiplier;
}

function calculateTrainingGain(trainingType) {
    const baseGain = CONFIG.TRAINING_BASE[trainingType];
    const multiplier = calculateStrengthMultiplier();
    
    return baseGain * multiplier;
}

function calculateMoneyGain(strengthGained) {
    const baseGain = strengthGained * CONFIG.MONEY_PER_STRENGTH;
    const gemUpgrades = gameState.get('gemUpgrades');
    const moneyMultiplier = 1 + (gemUpgrades.moneyMultiplier * CONFIG.GEM_UPGRADES.moneyMultiplier.effect);
    
    return baseGain * moneyMultiplier;
}

function createParticles(type, x, y, count) {
    if (!gameState.get('settings.particles')) return;
    
    const config = CONFIG.PARTICLES[type] || CONFIG.PARTICLES.strength;
    const actualCount = count || config.count;
    
    for (let i = 0; i < actualCount; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = `particle ${type}`;
            
            const offsetX = (Math.random() - 0.5) * 100;
            const offsetY = (Math.random() - 0.5) * 50;
            particle.style.left = (x || Math.random() * window.innerWidth) + offsetX + 'px';
            particle.style.top = (y || Math.random() * window.innerHeight) + offsetY + 'px';
            
            particle.style.background = config.color;
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, config.duration);
        }, i * 50);
    }
}

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

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

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

function getElementPosition(element) {
    const rect = element.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}

function isElementVisible(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

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

function playSound(soundName) {
    if (!gameState.get('settings.soundEffects')) return;
    
    console.log(`Playing sound: ${soundName}`);
}

function vibrate(pattern = 100) {
    if (navigator.vibrate) {
        navigator.vibrate(pattern);
    }
}

function isFeatureUnlocked(featureName) {
    return gameState.hasInSet('unlockedFeatures', featureName);
}

function unlockFeature(featureName) {
    if (!isFeatureUnlocked(featureName)) {
        gameState.addToSet('unlockedFeatures', featureName);
        
        showNotification({
            title: 'Feature Unlocked!',
            message: `${featureName.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} is now available!`,
            type: 'milestone'
        });
        
        updateUI();
    }
}

function checkUnlocks() {
    const strength = gameState.get('strength');
    const prestigeLevel = gameState.get('prestigeLevel');
    
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
    
    if (prestigeLevel >= 10 && !isFeatureUnlocked('reality-break')) {
        unlockFeature('reality-break');
    }
    
    const hiddenCount = gameState.get('hiddenAchievements').size;
    if (hiddenCount >= 5 && !isFeatureUnlocked('dimension-shift')) {
        unlockFeature('dimension-shift');
    }
}

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
