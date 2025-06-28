// Achievement System

// Achievement definitions
const ACHIEVEMENTS = [
    // Basic Achievements
    {
        id: 'first_lift',
        name: 'First Steps',
        description: 'Lift your first weight',
        icon: '💪',
        type: 'basic',
        requirement: { type: 'strength', value: 1 },
        reward: { type: 'money', value: 10 }
    },
    {
        id: 'hundred_club',
        name: 'Hundred Club',
        description: 'Reach 100kg strength',
        icon: '🏋️',
        type: 'basic',
        requirement: { type: 'strength', value: 100 },
        reward: { type: 'money', value: 100 }
    },
    {
        id: 'thousand_warrior',
        name: 'Thousand Warrior',
        description: 'Reach 1,000kg strength',
        icon: '⚔️',
        type: 'basic',
        requirement: { type: 'strength', value: 1000 },
        reward: { type: 'gems', value: 1 }
    },
    {
        id: 'ten_thousand_titan',
        name: 'Ten Thousand Titan',
        description: 'Reach 10,000kg strength',
        icon: '🗿',
        type: 'basic',
        requirement: { type: 'strength', value: 10000 },
        reward: { type: 'gems', value: 2 }
    },
    {
        id: 'superhuman',
        name: 'Superhuman',
        description: 'Reach 1,000,000kg strength',
        icon: '🦸',
        type: 'milestone',
        requirement: { type: 'strength', value: 1000000 },
        reward: { type: 'gems', value: 5 }
    },
    {
        id: 'earth_lifter',
        name: 'EARTH LIFTER',
        description: 'Lift the weight of Earth itself!',
        icon: '🌍',
        type: 'legendary',
        requirement: { type: 'strength', value: 5.972e24 },
        reward: { type: 'gems', value: 100 }
    },
    
    // Prestige Achievements
    {
        id: 'first_prestige',
        name: 'Rebirth',
        description: 'Complete your first prestige',
        icon: '✨',
        type: 'prestige',
        requirement: { type: 'prestige', value: 1 },
        reward: { type: 'gems', value: 3 }
    },
    {
        id: 'prestige_master',
        name: 'Prestige Master',
        description: 'Complete 10 prestiges',
        icon: '👑',
        type: 'prestige',
        requirement: { type: 'prestige', value: 10 },
        reward: { type: 'gems', value: 10 }
    },
    {
        id: 'prestige_legend',
        name: 'Prestige Legend',
        description: 'Complete 50 prestiges',
        icon: '🌟',
        type: 'prestige',
        requirement: { type: 'prestige', value: 50 },
        reward: { type: 'gems', value: 25 }
    },
    
    // Training Achievements
    {
        id: 'training_addict',
        name: 'Training Addict',
        description: 'Perform 1,000 training sessions',
        icon: '🔥',
        type: 'training',
        requirement: { type: 'training_clicks', value: 1000 },
        reward: { type: 'money', value: 1000 }
    },
    {
        id: 'training_master',
        name: 'Training Master',
        description: 'Perform 10,000 training sessions',
        icon: '🏆',
        type: 'training',
        requirement: { type: 'training_clicks', value: 10000 },
        reward: { type: 'gems', value: 5 }
    },
    
    // Money Achievements
    {
        id: 'first_dollar',
        name: 'First Dollar',
        description: 'Earn your first dollar',
        icon: '💵',
        type: 'money',
        requirement: { type: 'money', value: 1 },
        reward: { type: 'money', value: 10 }
    },
    {
        id: 'millionaire',
        name: 'Millionaire',
        description: 'Accumulate $1,000,000',
        icon: '💰',
        type: 'money',
        requirement: { type: 'money', value: 1000000 },
        reward: { type: 'gems', value: 5 }
    },
    
    // Equipment Achievements
    {
        id: 'first_purchase',
        name: 'First Purchase',
        description: 'Buy your first equipment',
        icon: '🛒',
        type: 'equipment',
        requirement: { type: 'equipment_purchased', value: 1 },
        reward: { type: 'money', value: 50 }
    },
    {
        id: 'equipment_collector',
        name: 'Equipment Collector',
        description: 'Purchase 100 pieces of equipment',
        icon: '📦',
        type: 'equipment',
        requirement: { type: 'equipment_purchased', value: 100 },
        reward: { type: 'gems', value: 3 }
    }
];

// Hidden achievements (only visible after unlock) - Made MUCH harder
const HIDDEN_ACHIEVEMENTS = [
    {
        id: 'secret_strength',
        name: 'Secret Strength',
        description: 'Discover the hidden power within',
        icon: '🔮',
        type: 'hidden',
        requirement: { type: 'custom', check: () => {
            const strength = gameState.get('strength');
            return strength > 13371337 && strength < 13371338; // Extremely specific range
        }},
        reward: { type: 'gems', value: 3 }
    },
    {
        id: 'time_traveler',
        name: 'Time Traveler',
        description: 'Play for exactly 24 hours, 13 minutes, and 37 seconds',
        icon: '⏰',
        type: 'hidden',
        requirement: { type: 'custom', check: () => {
            const playTime = gameState.get('statistics.totalPlayTime');
            const target = (24 * 60 * 60 + 13 * 60 + 37) * 1000; // 24h 13m 37s in ms
            return Math.abs(playTime - target) < 5000; // Within 5 seconds
        }},
        reward: { type: 'gems', value: 5 }
    },
    {
        id: 'reality_bender',
        name: 'Reality Bender',
        description: 'Break reality 100 times',
        icon: '🌀',
        type: 'hidden',
        requirement: { type: 'custom', check: () => gameState.get('hiddenFeatures.realityBreakUsed') >= 100 },
        reward: { type: 'gems', value: 10 }
    },
    {
        id: 'dimension_walker',
        name: 'Dimension Walker',
        description: 'Shift between dimensions 50 times',
        icon: '🌈',
        type: 'hidden',
        requirement: { type: 'custom', check: () => gameState.get('hiddenFeatures.dimensionShiftUsed') >= 50 },
        reward: { type: 'gems', value: 8 }
    },
    {
        id: 'loop_master',
        name: 'Loop Master',
        description: 'Master the art of time loops (1000 loops)',
        icon: '🔄',
        type: 'hidden',
        requirement: { type: 'custom', check: () => gameState.get('hiddenFeatures.timeLoopUsed') >= 1000 },
        reward: { type: 'gems', value: 15 }
    },
    {
        id: 'theme_explorer',
        name: 'Theme Explorer',
        description: 'Switch themes 500 times',
        icon: '🎨',
        type: 'hidden',
        requirement: { type: 'custom', check: () => {
            const secrets = gameState.get('hiddenFeatures.secretsDiscovered');
            return secrets.has('theme_switcher_500');
        }},
        reward: { type: 'gems', value: 3 }
    },
    {
        id: 'konami_code',
        name: 'Konami Warrior',
        description: 'Enter the legendary code 100 times',
        icon: '🎮',
        type: 'hidden',
        requirement: { type: 'custom', check: () => {
            const secrets = gameState.get('hiddenFeatures.secretsDiscovered');
            return secrets.has('konami_code_100');
        }},
        reward: { type: 'gems', value: 20 }
    },
    {
        id: 'click_master',
        name: 'Click Master',
        description: 'Perform 10,000 clicks in 60 seconds',
        icon: '👆',
        type: 'hidden',
        requirement: { type: 'custom', check: () => {
            const secrets = gameState.get('hiddenFeatures.secretsDiscovered');
            return secrets.has('click_master_10000');
        }},
        reward: { type: 'gems', value: 12 }
    },
    {
        id: 'midnight_lifter',
        name: 'Midnight Lifter',
        description: 'Train at exactly midnight for 7 consecutive days',
        icon: '🌙',
        type: 'hidden',
        requirement: { type: 'custom', check: () => {
            const secrets = gameState.get('hiddenFeatures.secretsDiscovered');
            return secrets.has('midnight_training_week');
        }},
        reward: { type: 'gems', value: 25 }
    },
    {
        id: 'easter_egg_hunter',
        name: 'Easter Egg Hunter',
        description: 'Find 50 hidden secrets',
        icon: '🥚',
        type: 'hidden',
        requirement: { type: 'custom', check: () => {
            const secrets = gameState.get('hiddenFeatures.secretsDiscovered');
            return secrets.size >= 50;
        }},
        reward: { type: 'gems', value: 50 }
    },
    {
        id: 'fight_champion',
        name: 'Fight Champion',
        description: 'Win 1000 fights',
        icon: '🥊',
        type: 'hidden',
        requirement: { type: 'custom', check: () => gameState.get('statistics.fightsWon') >= 1000 },
        reward: { type: 'gems', value: 30 }
    },
    {
        id: 'cosmic_fighter',
        name: 'Cosmic Fighter',
        description: 'Defeat the Cosmic Entity in combat',
        icon: '🌌',
        type: 'hidden',
        requirement: { type: 'custom', check: () => {
            const defeated = gameState.get('statistics.strongestOpponentDefeated');
            return defeated >= 1e12; // Cosmic Entity strength
        }},
        reward: { type: 'gems', value: 100 }
    },
    {
        id: 'existence_slayer',
        name: 'Existence Slayer',
        description: 'Defeat Existence Itself',
        icon: '∞',
        type: 'hidden',
        requirement: { type: 'custom', check: () => {
            const defeated = gameState.get('statistics.strongestOpponentDefeated');
            return defeated >= 1e24; // Existence Itself strength
        }},
        reward: { type: 'gems', value: 1000 }
    },
    {
        id: 'perfect_fighter',
        name: 'Perfect Fighter',
        description: 'Win 100 fights in a row without losing',
        icon: '👑',
        type: 'hidden',
        requirement: { type: 'custom', check: () => {
            const secrets = gameState.get('hiddenFeatures.secretsDiscovered');
            return secrets.has('perfect_streak_100');
        }},
        reward: { type: 'gems', value: 75 }
    },
    {
        id: 'equipment_master',
        name: 'Equipment Master',
        description: 'Own all absurd training equipment',
        icon: '🌙',
        type: 'hidden',
        requirement: { type: 'custom', check: () => {
            const equipment = gameState.get('equipment');
            return equipment.moonTrainingGround > 0 && 
                   equipment.citySlabLifter > 0 && 
                   equipment.continentalBarbell > 0 && 
                   equipment.planetaryDumbbell > 0;
        }},
        reward: { type: 'gems', value: 200 }
    }
];

// All achievements combined
const ALL_ACHIEVEMENTS = [...ACHIEVEMENTS, ...HIDDEN_ACHIEVEMENTS];

// Check achievements
function checkAchievements() {
    const strength = gameState.get('strength');
    const money = gameState.get('money');
    const prestigeLevel = gameState.get('prestigeLevel');
    const stats = gameState.get('statistics');
    
    ALL_ACHIEVEMENTS.forEach(achievement => {
        // Skip if already unlocked
        const isHidden = HIDDEN_ACHIEVEMENTS.includes(achievement);
        const achievementSet = isHidden ? 'hiddenAchievements' : 'achievements';
        
        if (gameState.hasInSet(achievementSet, achievement.id)) {
            return;
        }
        
        let unlocked = false;
        
        // Check requirement
        switch (achievement.requirement.type) {
            case 'strength':
                unlocked = strength >= achievement.requirement.value;
                break;
            case 'money':
                unlocked = money >= achievement.requirement.value;
                break;
            case 'prestige':
                unlocked = prestigeLevel >= achievement.requirement.value;
                break;
            case 'training_clicks':
                unlocked = stats.totalTrainingClicks >= achievement.requirement.value;
                break;
            case 'equipment_purchased':
                unlocked = stats.equipmentPurchased >= achievement.requirement.value;
                break;
            case 'custom':
                unlocked = achievement.requirement.check();
                break;
        }
        
        if (unlocked) {
            unlockAchievement(achievement.id, isHidden);
        }
    });
}

// Unlock achievement
function unlockAchievement(achievementId, isHidden = false) {
    const achievement = ALL_ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return;
    
    const achievementSet = isHidden ? 'hiddenAchievements' : 'achievements';
    
    // Add to unlocked set
    gameState.addToSet(achievementSet, achievementId);
    
    // Update statistics
    const statKey = isHidden ? 'hiddenAchievementsUnlocked' : 'achievementsUnlocked';
    gameState.add(`statistics.${statKey}`, 1);
    
    // Apply reward
    if (achievement.reward) {
        switch (achievement.reward.type) {
            case 'money':
                gameState.add('money', achievement.reward.value);
                break;
            case 'gems':
                gameState.add('gems', achievement.reward.value);
                gameState.add('statistics.totalGemsEarned', achievement.reward.value);
                break;
        }
    }
    
    // Show notification
    showNotification({
        title: `${isHidden ? '🔮 Hidden ' : '🏆 '}Achievement Unlocked!`,
        message: `${achievement.icon} ${achievement.name}\n${achievement.description}`,
        type: isHidden ? 'hidden' : 'achievement',
        duration: 6000
    });
    
    // Special effects
    createParticles(isHidden ? 'gem' : 'strength', window.innerWidth / 2, window.innerHeight / 2, isHidden ? 10 : 5);
    
    // Sound and haptic feedback
    playSound(isHidden ? 'hidden_achievement' : 'achievement');
    vibrate(isHidden ? [100, 50, 100, 50, 100] : [200, 100, 200]);
    
    // Update achievements display
    renderAchievements();
    
    // Check for meta-achievements
    setTimeout(checkAchievements, 100);
}

// Render achievements list
function renderAchievements() {
    const container = document.getElementById('achievements-list');
    if (!container) return;
    
    const currentFilter = document.querySelector('.filter-btn.active')?.textContent.toLowerCase() || 'all';
    
    container.innerHTML = '';
    
    ALL_ACHIEVEMENTS.forEach(achievement => {
        const isHidden = HIDDEN_ACHIEVEMENTS.includes(achievement);
        const achievementSet = isHidden ? 'hiddenAchievements' : 'achievements';
        const isUnlocked = gameState.hasInSet(achievementSet, achievement.id);
        
        // Filter logic
        if (currentFilter === 'unlocked' && !isUnlocked) return;
        if (currentFilter === 'locked' && isUnlocked) return;
        if (currentFilter === 'hidden' && !isHidden) return;
        if (currentFilter !== 'all' && currentFilter !== 'hidden' && isHidden && !isUnlocked) return;
        
        const div = document.createElement('div');
        div.className = `achievement ${isUnlocked ? '' : 'locked'} ${isHidden ? 'hidden' : ''}`;
        
        const title = document.createElement('div');
        title.className = 'achievement-title';
        title.innerHTML = `${achievement.icon} ${achievement.name}`;
        
        const desc = document.createElement('div');
        desc.className = 'achievement-desc';
        desc.textContent = isUnlocked || !isHidden ? achievement.description : '???';
        
        const reward = document.createElement('div');
        reward.className = 'achievement-reward';
        if (achievement.reward && (isUnlocked || !isHidden)) {
            const rewardText = achievement.reward.type === 'money' 
                ? formatMoney(achievement.reward.value)
                : `${achievement.reward.value} 💎`;
            reward.textContent = `Reward: ${rewardText}`;
        }
        
        div.appendChild(title);
        div.appendChild(desc);
        if (reward.textContent) div.appendChild(reward);
        
        container.appendChild(div);
    });
}

// Filter achievements
function filterAchievements(filter) {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Re-render achievements
    renderAchievements();
}

// Hidden achievement triggers
function initHiddenAchievements() {
    // Konami code detection
    let konamiCode = [];
    const konamiSequence = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'KeyB', 'KeyA'
    ];
    
    document.addEventListener('keydown', (event) => {
        konamiCode.push(event.code);
        if (konamiCode.length > konamiSequence.length) {
            konamiCode.shift();
        }
        
        if (konamiCode.length === konamiSequence.length &&
            konamiCode.every((code, index) => code === konamiSequence[index])) {
            gameState.get('hiddenFeatures.secretsDiscovered').add('konami_code');
            checkAchievements();
        }
    });
    
    // Click master detection
    let clickCount = 0;
    let clickTimer = null;
    
    document.addEventListener('click', () => {
        clickCount++;
        
        if (clickTimer) {
            clearTimeout(clickTimer);
        }
        
        clickTimer = setTimeout(() => {
            if (clickCount >= 100) {
                gameState.get('hiddenFeatures.secretsDiscovered').add('click_master');
                checkAchievements();
            }
            clickCount = 0;
        }, 10000);
    });
    
    // Midnight training detection
    const originalPerformTraining = performTraining;
    window.performTraining = function(type) {
        const now = new Date();
        if (now.getHours() === 0 && now.getMinutes() === 0) {
            gameState.get('hiddenFeatures.secretsDiscovered').add('midnight_training');
            checkAchievements();
        }
        return originalPerformTraining(type);
    };
    
    // Theme usage tracking
    let usedThemes = new Set();
    const originalSwitchTheme = switchTheme;
    window.switchTheme = function(theme) {
        usedThemes.add(theme);
        if (usedThemes.size >= Object.keys(THEMES).length) {
            gameState.get('hiddenFeatures.secretsDiscovered').add('all_themes_used');
            checkAchievements();
        }
        return originalSwitchTheme(theme);
    };
}

// Initialize achievement system
function initAchievements() {
    renderAchievements();
    initHiddenAchievements();
    
    // Check achievements periodically
    setInterval(checkAchievements, 5000);
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ACHIEVEMENTS,
        HIDDEN_ACHIEVEMENTS,
        ALL_ACHIEVEMENTS,
        checkAchievements,
        unlockAchievement,
        renderAchievements,
        filterAchievements,
        initAchievements
    };
}
