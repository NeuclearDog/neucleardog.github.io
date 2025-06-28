// Prestige System

// Perform prestige
function prestige() {
    const strength = gameState.get('strength');
    const minStrength = CONFIG.PRESTIGE.minStrength;
    
    if (strength < minStrength) {
        showNotification({
            title: 'Cannot Prestige',
            message: `You need at least ${formatNumber(minStrength)} kg strength to prestige!`,
            type: 'error'
        });
        return;
    }
    
    // Calculate prestige bonus
    const currentPrestige = gameState.get('prestigeLevel');
    const strengthBonus = Math.floor(Math.log10(strength / minStrength)) + 1;
    const gemReward = CONFIG.GEMS_PER_PRESTIGE + Math.floor(currentPrestige / 5);
    
    // Confirmation dialog
    const confirmMessage = `Prestige Confirmation\n\n` +
        `Current Strength: ${formatNumber(strength)} kg\n` +
        `Strength Multiplier Bonus: +${strengthBonus}\n` +
        `Gem Reward: ${gemReward} 💎\n\n` +
        `This will reset your strength and equipment but keep prestige bonuses.\n\n` +
        `Continue?`;
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    // Store old values for comparison
    const oldMultiplier = gameState.get('strengthMultiplier');
    
    // Reset progress
    gameState.set('strength', 1.0);
    gameState.set('money', 0);
    gameState.set('equipment', {
        proteinShake: 0,
        gymMembership: 0,
        personalTrainer: 0,
        superSerum: 0,
        gravityChamber: 0,
        quantumEnhancer: 0
    });
    
    // Clear active effects
    gameState.set('activeEffects', {});
    
    // Clear cooldowns
    gameState.set('cooldowns', {
        basic: 0,
        intense: 0,
        extreme: 0,
        legendary: 0,
        cosmic: 0
    });
    
    // Apply prestige bonuses
    gameState.add('prestigeLevel', 1);
    gameState.add('strengthMultiplier', strengthBonus);
    gameState.add('gems', gemReward);
    gameState.add('statistics.totalPrestigeCount', 1);
    gameState.add('statistics.totalGemsEarned', gemReward);
    
    // Unlock prestige achievement
    unlockAchievement('first_prestige');
    
    // Special prestige milestones
    const newPrestigeLevel = gameState.get('prestigeLevel');
    if (newPrestigeLevel === 10) {
        unlockAchievement('prestige_master');
        unlockFeature('reality-break');
    }
    if (newPrestigeLevel === 50) {
        unlockAchievement('prestige_legend');
    }
    
    // Massive visual celebration
    document.body.classList.add('flash-effect');
    setTimeout(() => document.body.classList.remove('flash-effect'), 300);
    
    createParticles('gem', window.innerWidth / 2, window.innerHeight / 2, 20);
    createParticles('cosmic', window.innerWidth / 3, window.innerHeight / 2, 15);
    createParticles('cosmic', (window.innerWidth * 2) / 3, window.innerHeight / 2, 15);
    
    // Show prestige notification
    showNotification({
        title: '✨ PRESTIGE COMPLETE! ✨',
        message: `Prestige Level: ${newPrestigeLevel}\n` +
                `Strength Multiplier: ${formatNumber(gameState.get('strengthMultiplier'))}x\n` +
                `Gems Earned: ${gemReward} 💎`,
        type: 'prestige',
        duration: 8000
    });
    
    // Sound and haptic feedback
    playSound('prestige');
    vibrate([200, 100, 200, 100, 200, 100, 200]);
    
    // Update all displays
    updateUI();
    renderAchievements();
    
    // Save game
    gameState.save();
    
    console.log(`Prestige complete! Level ${newPrestigeLevel}, Multiplier: ${gameState.get('strengthMultiplier')}x`);
}

// Calculate prestige bonus preview
function calculatePrestigeBonus() {
    const strength = gameState.get('strength');
    const minStrength = CONFIG.PRESTIGE.minStrength;
    
    if (strength < minStrength) {
        return 0;
    }
    
    return Math.floor(Math.log10(strength / minStrength)) + 1;
}

// Update prestige button
function updatePrestigeButton() {
    const button = document.getElementById('prestige-btn');
    if (!button) return;
    
    const strength = gameState.get('strength');
    const minStrength = CONFIG.PRESTIGE.minStrength;
    const canPrestige = strength >= minStrength;
    
    button.disabled = !canPrestige;
    
    if (canPrestige) {
        const bonus = calculatePrestigeBonus();
        const currentPrestige = gameState.get('prestigeLevel');
        const gemReward = CONFIG.GEMS_PER_PRESTIGE + Math.floor(currentPrestige / 5);
        
        button.innerHTML = `
            ✨ PRESTIGE ✨<br>
            <small>+${bonus} Strength Multiplier</small><br>
            <small>+${gemReward} 💎 Gems</small>
        `;
    } else {
        const needed = minStrength - strength;
        button.innerHTML = `
            ✨ PRESTIGE ✨<br>
            <small>Need ${formatNumber(needed)} more strength</small>
        `;
    }
}

// Hidden prestige types
function secretPrestige() {
    const strength = gameState.get('strength');
    const prestigeLevel = gameState.get('prestigeLevel');
    
    // Secret prestige requirements
    if (strength >= 1e15 && prestigeLevel >= 25) {
        if (confirm('Perform SECRET PRESTIGE? This will give massive bonuses but reset everything including prestige level!')) {
            // Reset everything
            gameState.set('strength', 1.0);
            gameState.set('money', 0);
            gameState.set('prestigeLevel', 0);
            gameState.set('equipment', {
                proteinShake: 0,
                gymMembership: 0,
                personalTrainer: 0,
                superSerum: 0,
                gravityChamber: 0,
                quantumEnhancer: 0
            });
            
            // Massive permanent bonuses
            gameState.multiply('strengthMultiplier', 10);
            gameState.add('gems', 1000);
            
            // Unlock hidden features
            unlockFeature('secret-prestige-powers');
            gameState.get('hiddenFeatures.secretsDiscovered').add('secret_prestige');
            
            showNotification({
                title: '🌀 SECRET PRESTIGE! 🌀',
                message: 'You have transcended normal limits!\n10x Strength Multiplier!\n+1000 💎 Gems!',
                type: 'hidden',
                duration: 10000
            });
            
            updateUI();
        }
    }
}

// Initialize prestige system
function initPrestige() {
    // Update prestige button periodically
    setInterval(updatePrestigeButton, 1000);
    
    // Initial update
    updatePrestigeButton();
    
    // Secret prestige key combination (Ctrl+Shift+P)
    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.shiftKey && event.key === 'P') {
            event.preventDefault();
            secretPrestige();
        }
    });
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        prestige,
        calculatePrestigeBonus,
        updatePrestigeButton,
        secretPrestige,
        initPrestige
    };
}
