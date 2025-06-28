// Statistics System

// Update detailed statistics display
function updateDetailedStats() {
    const container = document.getElementById('detailed-stats');
    if (!container) return;
    
    const stats = gameState.get('statistics');
    const strength = gameState.get('strength');
    const money = gameState.get('money');
    const gems = gameState.get('gems');
    const prestigeLevel = gameState.get('prestigeLevel');
    
    // Calculate additional stats
    const playTimeHours = stats.totalPlayTime / (1000 * 60 * 60);
    const strengthPerHour = playTimeHours > 0 ? stats.totalStrengthGained / playTimeHours : 0;
    const moneyPerHour = playTimeHours > 0 ? stats.totalMoneyEarned / playTimeHours : 0;
    const clicksPerMinute = stats.totalPlayTime > 0 ? (stats.totalTrainingClicks * 60000) / stats.totalPlayTime : 0;
    
    const statsData = [
        {
            name: 'Total Strength Gained',
            value: formatNumber(stats.totalStrengthGained) + ' kg',
            icon: '💪'
        },
        {
            name: 'Total Money Earned',
            value: formatMoney(stats.totalMoneyEarned),
            icon: '💰'
        },
        {
            name: 'Total Gems Earned',
            value: formatNumber(stats.totalGemsEarned),
            icon: '💎'
        },
        {
            name: 'Training Sessions',
            value: formatNumber(stats.totalTrainingClicks),
            icon: '🏋️'
        },
        {
            name: 'Prestige Count',
            value: formatNumber(stats.totalPrestigeCount),
            icon: '✨'
        },
        {
            name: 'Play Time',
            value: formatTime(stats.totalPlayTime),
            icon: '⏰'
        },
        {
            name: 'Max Strength',
            value: formatNumber(stats.maxStrengthReached) + ' kg',
            icon: '🏆'
        },
        {
            name: 'Achievements',
            value: `${stats.achievementsUnlocked}/${ACHIEVEMENTS.length}`,
            icon: '🏅'
        },
        {
            name: 'Hidden Achievements',
            value: `${stats.hiddenAchievementsUnlocked}/${HIDDEN_ACHIEVEMENTS.length}`,
            icon: '🔮'
        },
        {
            name: 'Equipment Purchased',
            value: formatNumber(stats.equipmentPurchased),
            icon: '🛒'
        },
        {
            name: 'Strength/Hour',
            value: formatNumber(strengthPerHour) + ' kg/h',
            icon: '📈'
        },
        {
            name: 'Money/Hour',
            value: formatMoney(moneyPerHour) + '/h',
            icon: '💵'
        },
        {
            name: 'Clicks/Minute',
            value: formatNumber(clicksPerMinute, 1) + ' CPM',
            icon: '👆'
        },
        {
            name: 'Current Tier',
            value: getCurrentTier().name,
            icon: getCurrentTier().emoji
        }
    ];
    
    // Clear container
    container.innerHTML = '';
    
    // Create stat cards
    statsData.forEach(stat => {
        const card = document.createElement('div');
        card.className = 'stat-card hover-lift';
        
        const value = document.createElement('div');
        value.className = 'stat-value';
        value.textContent = stat.value;
        
        const name = document.createElement('div');
        name.className = 'stat-name';
        name.textContent = `${stat.icon} ${stat.name}`;
        
        card.appendChild(value);
        card.appendChild(name);
        container.appendChild(card);
    });
}

// Calculate efficiency stats
function calculateEfficiencyStats() {
    const stats = gameState.get('statistics');
    const playTime = stats.totalPlayTime;
    
    if (playTime === 0) return {};
    
    return {
        strengthPerSecond: stats.totalStrengthGained / (playTime / 1000),
        moneyPerSecond: stats.totalMoneyEarned / (playTime / 1000),
        clicksPerSecond: stats.totalTrainingClicks / (playTime / 1000),
        prestigePerHour: stats.totalPrestigeCount / (playTime / (1000 * 60 * 60)),
        achievementRate: stats.achievementsUnlocked / (playTime / (1000 * 60 * 60))
    };
}

// Get milestone statistics
function getMilestoneStats() {
    const strength = gameState.get('strength');
    const stats = gameState.get('statistics');
    
    const milestones = [];
    
    // Strength milestones
    const strengthMilestones = [1e3, 1e6, 1e9, 1e12, 1e15, 1e18, 1e21, 1e24];
    strengthMilestones.forEach(milestone => {
        if (strength >= milestone) {
            milestones.push({
                name: `${formatNumber(milestone)} kg Strength`,
                achieved: true,
                icon: '💪'
            });
        }
    });
    
    // Training milestones
    const trainingMilestones = [100, 1000, 10000, 100000];
    trainingMilestones.forEach(milestone => {
        if (stats.totalTrainingClicks >= milestone) {
            milestones.push({
                name: `${formatNumber(milestone)} Training Sessions`,
                achieved: true,
                icon: '🏋️'
            });
        }
    });
    
    // Time milestones
    const timeMilestones = [
        { time: 60000, name: '1 Minute' },
        { time: 3600000, name: '1 Hour' },
        { time: 86400000, name: '1 Day' },
        { time: 604800000, name: '1 Week' }
    ];
    timeMilestones.forEach(milestone => {
        if (stats.totalPlayTime >= milestone.time) {
            milestones.push({
                name: `${milestone.name} Played`,
                achieved: true,
                icon: '⏰'
            });
        }
    });
    
    return milestones;
}

// Export statistics
function exportStatistics() {
    const stats = gameState.get('statistics');
    const efficiency = calculateEfficiencyStats();
    const milestones = getMilestoneStats();
    
    const exportData = {
        basicStats: stats,
        efficiency: efficiency,
        milestones: milestones,
        gameState: {
            strength: gameState.get('strength'),
            money: gameState.get('money'),
            gems: gameState.get('gems'),
            prestigeLevel: gameState.get('prestigeLevel'),
            strengthMultiplier: gameState.get('strengthMultiplier')
        },
        exportTime: new Date().toISOString()
    };
    
    return JSON.stringify(exportData, null, 2);
}

// Compare statistics with previous session
function compareWithPrevious() {
    const currentStats = gameState.get('statistics');
    const previousStats = JSON.parse(localStorage.getItem('strengthGame_previousStats') || '{}');
    
    const comparison = {};
    
    Object.keys(currentStats).forEach(key => {
        if (typeof currentStats[key] === 'number' && previousStats[key]) {
            comparison[key] = {
                current: currentStats[key],
                previous: previousStats[key],
                change: currentStats[key] - previousStats[key],
                percentChange: ((currentStats[key] - previousStats[key]) / previousStats[key]) * 100
            };
        }
    });
    
    return comparison;
}

// Save current stats as previous for next comparison
function saveStatsForComparison() {
    const stats = gameState.get('statistics');
    localStorage.setItem('strengthGame_previousStats', JSON.stringify(stats));
}

// Get achievement progress
function getAchievementProgress() {
    const unlockedAchievements = gameState.get('achievements').size;
    const unlockedHiddenAchievements = gameState.get('hiddenAchievements').size;
    const totalAchievements = ACHIEVEMENTS.length;
    const totalHiddenAchievements = HIDDEN_ACHIEVEMENTS.length;
    
    return {
        regular: {
            unlocked: unlockedAchievements,
            total: totalAchievements,
            percentage: (unlockedAchievements / totalAchievements) * 100
        },
        hidden: {
            unlocked: unlockedHiddenAchievements,
            total: totalHiddenAchievements,
            percentage: (unlockedHiddenAchievements / totalHiddenAchievements) * 100
        },
        overall: {
            unlocked: unlockedAchievements + unlockedHiddenAchievements,
            total: totalAchievements + totalHiddenAchievements,
            percentage: ((unlockedAchievements + unlockedHiddenAchievements) / (totalAchievements + totalHiddenAchievements)) * 100
        }
    };
}

// Initialize statistics system
function initStatistics() {
    // Update detailed stats periodically
    setInterval(updateDetailedStats, 2000);
    
    // Initial update
    updateDetailedStats();
    
    // Save stats for comparison on page unload
    window.addEventListener('beforeunload', saveStatsForComparison);
    
    // Track session start time
    gameState.set('statistics.sessionStartTime', Date.now());
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateDetailedStats,
        calculateEfficiencyStats,
        getMilestoneStats,
        exportStatistics,
        compareWithPrevious,
        saveStatsForComparison,
        getAchievementProgress,
        initStatistics
    };
}
