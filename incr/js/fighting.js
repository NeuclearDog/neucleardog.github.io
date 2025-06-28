// Fighting System

let currentOpponent = null;
let fightStreak = 0;

// Get available opponents based on player strength
function getAvailableOpponents() {
    const playerStrength = gameState.get('strength');
    return CONFIG.FIGHT_OPPONENTS.filter(opponent => {
        // Can fight opponents up to 10x stronger than you
        return opponent.strength <= playerStrength * 10;
    });
}

// Calculate win chance against opponent
function calculateWinChance(opponent) {
    const playerStrength = gameState.get('strength');
    const strengthRatio = playerStrength / opponent.strength;
    
    // Base win chance from opponent config
    let winChance = opponent.winChance;
    
    // Modify based on strength difference
    if (strengthRatio > 1) {
        // Player is stronger - increase win chance
        winChance = Math.min(0.95, winChance + (strengthRatio - 1) * 0.2);
    } else {
        // Opponent is stronger - decrease win chance dramatically
        winChance = Math.max(0.01, winChance * Math.pow(strengthRatio, 2));
    }
    
    // Equipment bonuses
    const equipment = gameState.get('equipment');
    if (equipment.superSerum > 0) winChance += 0.05;
    if (equipment.gravityChamber > 0) winChance += 0.1;
    if (equipment.quantumEnhancer > 0) winChance += 0.15;
    
    return Math.min(0.99, Math.max(0.001, winChance));
}

// Start a fight
function startFight(opponentId) {
    // Check cooldown
    if (gameState.isOnCooldown('fight')) {
        const remaining = gameState.getRemainingCooldown('fight');
        showNotification({
            title: 'Still Recovering',
            message: `Wait ${formatTime(remaining)} before fighting again`,
            type: 'error'
        });
        return;
    }
    
    const opponent = CONFIG.FIGHT_OPPONENTS.find(o => o.id === opponentId);
    if (!opponent) return;
    
    currentOpponent = opponent;
    const winChance = calculateWinChance(opponent);
    
    // Show fight confirmation
    const confirmMessage = `🥊 FIGHT CHALLENGE 🥊\n\n` +
        `Opponent: ${opponent.emoji} ${opponent.name}\n` +
        `Opponent Strength: ${formatNumber(opponent.strength)} kg\n` +
        `Your Strength: ${formatNumber(gameState.get('strength'))} kg\n` +
        `Win Chance: ${formatPercent(winChance)}\n\n` +
        `${opponent.description}\n\n` +
        `Potential Rewards:\n` +
        `+${formatNumber(opponent.reward.strength)} strength\n` +
        `+${formatMoney(opponent.reward.money)}\n\n` +
        `Accept the challenge?`;
    
    if (confirm(confirmMessage)) {
        performFight(opponent, winChance);
    }
}

// Perform the actual fight
function performFight(opponent, winChance) {
    const playerStrength = gameState.get('strength');
    
    // Set cooldown
    gameState.setCooldown('fight', CONFIG.COOLDOWNS.fight);
    
    // Update statistics
    gameState.add('statistics.totalFights', 1);
    
    // Determine fight outcome
    const roll = Math.random();
    const victory = roll < winChance;
    
    // Create dramatic fight sequence
    showFightSequence(opponent, victory, () => {
        if (victory) {
            handleVictory(opponent);
        } else {
            handleDefeat(opponent);
        }
    });
}

// Show dramatic fight sequence
function showFightSequence(opponent, victory, callback) {
    const messages = [
        `${opponent.emoji} ${opponent.name} approaches menacingly...`,
        `The ground shakes under their immense power!`,
        `You steel yourself for the battle of your life!`,
        `The fight begins with earth-shattering force!`,
        `Fists clash with the power of colliding planets!`,
        victory ? 
            `Against all odds, you emerge victorious! 🏆` : 
            `You fought valiantly, but fall to their superior might... 💀`
    ];
    
    let messageIndex = 0;
    
    function showNextMessage() {
        if (messageIndex < messages.length) {
            showNotification({
                title: 'EPIC BATTLE',
                message: messages[messageIndex],
                type: 'fight',
                duration: 2000
            });
            
            messageIndex++;
            setTimeout(showNextMessage, 2500);
        } else {
            callback();
        }
    }
    
    // Start the sequence
    showNextMessage();
    
    // Visual effects during fight
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            createParticles('cosmic', Math.random() * window.innerWidth, Math.random() * window.innerHeight, 3);
            if (i % 3 === 0) {
                document.body.classList.add('screen-shake');
                setTimeout(() => document.body.classList.remove('screen-shake'), 200);
            }
        }, i * 300);
    }
}

// Handle fight victory
function handleVictory(opponent) {
    fightStreak++;
    
    // Apply rewards
    gameState.add('strength', opponent.reward.strength);
    gameState.add('money', opponent.reward.money);
    
    // Update statistics
    gameState.add('statistics.fightsWon', 1);
    gameState.add('statistics.totalStrengthGained', opponent.reward.strength);
    gameState.add('statistics.totalMoneyEarned', opponent.reward.money);
    
    // Track strongest opponent defeated
    const currentStrongest = gameState.get('statistics.strongestOpponentDefeated') || 0;
    if (opponent.strength > currentStrongest) {
        gameState.set('statistics.strongestOpponentDefeated', opponent.strength);
    }
    
    // Check for perfect streak
    if (fightStreak >= 100) {
        gameState.get('hiddenFeatures.secretsDiscovered').add('perfect_streak_100');
    }
    
    // Victory notification
    showNotification({
        title: `🏆 VICTORY! 🏆`,
        message: `You defeated ${opponent.emoji} ${opponent.name}!\n` +
                `+${formatNumber(opponent.reward.strength)} strength\n` +
                `+${formatMoney(opponent.reward.money)}\n` +
                `Win Streak: ${fightStreak}`,
        type: 'success',
        duration: 6000
    });
    
    // Special victory effects
    createParticles('strength', window.innerWidth / 2, window.innerHeight / 2, 15);
    createParticles('money', window.innerWidth / 2 + 50, window.innerHeight / 2, 8);
    
    playSound('fight_victory');
    vibrate([200, 100, 200, 100, 400]);
    
    // Check achievements
    checkAchievements();
    updateUI();
}

// Handle fight defeat
function handleDefeat(opponent) {
    fightStreak = 0;
    
    // Lose some strength and money
    const strengthLoss = Math.min(gameState.get('strength') * 0.1, opponent.strength * 0.05);
    const moneyLoss = Math.min(gameState.get('money') * 0.2, opponent.reward.money * 0.5);
    
    gameState.add('strength', -strengthLoss);
    gameState.add('money', -moneyLoss);
    
    // Update statistics
    gameState.add('statistics.fightsLost', 1);
    
    // Defeat notification
    showNotification({
        title: `💀 DEFEAT 💀`,
        message: `${opponent.emoji} ${opponent.name} overwhelmed you!\n` +
                `-${formatNumber(strengthLoss)} strength\n` +
                `-${formatMoney(moneyLoss)}\n` +
                `Win streak broken!`,
        type: 'error',
        duration: 6000
    });
    
    // Defeat effects
    createParticles('cosmic', window.innerWidth / 2, window.innerHeight / 2, 10);
    
    playSound('fight_defeat');
    vibrate([400, 200, 400]);
    
    updateUI();
}

// Update fight display
function updateFightDisplay() {
    const container = document.getElementById('fight-opponents');
    if (!container) return;
    
    const availableOpponents = getAvailableOpponents();
    container.innerHTML = '';
    
    availableOpponents.forEach(opponent => {
        const winChance = calculateWinChance(opponent);
        
        const button = document.createElement('button');
        button.className = 'fight-btn';
        button.onclick = () => startFight(opponent.id);
        
        // Color code by difficulty
        if (winChance > 0.7) button.classList.add('easy');
        else if (winChance > 0.3) button.classList.add('medium');
        else button.classList.add('hard');
        
        button.innerHTML = `
            <div class="opponent-info">
                <div class="opponent-header">
                    <span class="opponent-emoji">${opponent.emoji}</span>
                    <span class="opponent-name">${opponent.name}</span>
                </div>
                <div class="opponent-strength">💪 ${formatNumber(opponent.strength)} kg</div>
                <div class="win-chance">🎯 ${formatPercent(winChance)} win chance</div>
                <div class="opponent-rewards">
                    🏆 +${formatNumber(opponent.reward.strength)} STR, +${formatMoney(opponent.reward.money)}
                </div>
                <div class="opponent-desc">${opponent.description}</div>
            </div>
        `;
        
        // Disable if on cooldown
        if (gameState.isOnCooldown('fight')) {
            button.disabled = true;
        }
        
        container.appendChild(button);
    });
    
    // Update cooldown display
    updateFightCooldown();
}

// Update fight cooldown display
function updateFightCooldown() {
    const cooldownElement = document.getElementById('fight-cooldown');
    if (!cooldownElement) return;
    
    const remaining = gameState.getRemainingCooldown('fight');
    
    if (remaining > 0) {
        cooldownElement.textContent = `Next fight in: ${formatTime(remaining)}`;
        cooldownElement.style.display = 'block';
    } else {
        cooldownElement.textContent = '';
        cooldownElement.style.display = 'none';
    }
}

// Initialize fighting system
function initFighting() {
    // Update fight display periodically
    setInterval(updateFightDisplay, 1000);
    
    // Initial update
    updateFightDisplay();
    
    // Keyboard shortcut for fighting (F key)
    document.addEventListener('keydown', (event) => {
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        if (event.key.toLowerCase() === 'f' && !gameState.isOnCooldown('fight')) {
            // Fight the strongest available opponent
            const available = getAvailableOpponents();
            if (available.length > 0) {
                const strongest = available[available.length - 1];
                startFight(strongest.id);
            }
        }
    });
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getAvailableOpponents,
        calculateWinChance,
        startFight,
        performFight,
        handleVictory,
        handleDefeat,
        updateFightDisplay,
        updateFightCooldown,
        initFighting
    };
}
