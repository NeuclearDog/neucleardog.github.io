let currentOpponent = null;

function getAvailableOpponents() {
    const playerStrength = gameState.get('strength');
    return CONFIG.FIGHT_OPPONENTS.filter(opponent => {
        return opponent.strength <= playerStrength * 10;
    });
}

function calculateWinChance(opponent) {
    const playerStrength = gameState.get('strength');
    const strengthRatio = playerStrength / opponent.strength;
    
    let winChance = opponent.winChance;
    
    if (strengthRatio > 1) {
        winChance = Math.min(0.95, winChance + (strengthRatio - 1) * 0.2);
    } else {
        winChance = Math.max(0.01, winChance * Math.pow(strengthRatio, 2));
    }
    
    const equipment = gameState.get('equipment');
    if (equipment.superSerum > 0) winChance += 0.05;
    if (equipment.gravityChamber > 0) winChance += 0.1;
    if (equipment.quantumEnhancer > 0) winChance += 0.15;
    
    return Math.min(0.99, Math.max(0.001, winChance));
}

function startFight(opponentId) {
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

function performFight(opponent, winChance) {
    const playerStrength = gameState.get('strength');
    
    gameState.setCooldown('fight', CONFIG.COOLDOWNS.fight);
    
    gameState.add('statistics.totalFights', 1);
    
    const roll = Math.random();
    const victory = roll < winChance;
    
    showFightSequence(opponent, victory, () => {
        if (victory) {
            handleVictory(opponent);
        } else {
            handleDefeat(opponent);
        }
    });
}

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
    
    showNextMessage();
    
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

function handleVictory(opponent) {
    fightStreak++;
    
    gameState.add('strength', opponent.reward.strength);
    gameState.add('money', opponent.reward.money);
    
    gameState.add('statistics.fightsWon', 1);
    gameState.add('statistics.totalStrengthGained', opponent.reward.strength);
    gameState.add('statistics.totalMoneyEarned', opponent.reward.money);
    
    const currentStrongest = gameState.get('statistics.strongestOpponentDefeated') || 0;
    if (opponent.strength > currentStrongest) {
        gameState.set('statistics.strongestOpponentDefeated', opponent.strength);
    }
    
    if (fightStreak >= 100) {
        gameState.get('hiddenFeatures.secretsDiscovered').add('perfect_streak_100');
    }
    
    showNotification({
        title: `🏆 VICTORY! 🏆`,
        message: `You defeated ${opponent.emoji} ${opponent.name}!\n` +
                `+${formatNumber(opponent.reward.strength)} strength\n` +
                `+${formatMoney(opponent.reward.money)}\n` +
                `Win Streak: ${fightStreak}`,
        type: 'success',
        duration: 6000
    });
    
    createParticles('strength', window.innerWidth / 2, window.innerHeight / 2, 15);
    createParticles('money', window.innerWidth / 2 + 50, window.innerHeight / 2, 8);
    
    playSound('fight_victory');
    vibrate([200, 100, 200, 100, 400]);
    
    checkAchievements();
    updateUI();
}

function handleDefeat(opponent) {
    fightStreak = 0;
    
    const strengthLoss = Math.min(gameState.get('strength') * 0.1, opponent.strength * 0.05);
    const moneyLoss = Math.min(gameState.get('money') * 0.2, opponent.reward.money * 0.5);
    
    gameState.add('strength', -strengthLoss);
    gameState.add('money', -moneyLoss);
    
    gameState.add('statistics.fightsLost', 1);
    
    showNotification({
        title: `💀 DEFEAT 💀`,
        message: `${opponent.emoji} ${opponent.name} overwhelmed you!\n` +
                `-${formatNumber(strengthLoss)} strength\n` +
                `-${formatMoney(moneyLoss)}\n` +
                `Win streak broken!`,
        type: 'error',
        duration: 6000
    });
    
    createParticles('cosmic', window.innerWidth / 2, window.innerHeight / 2, 10);
    
    playSound('fight_defeat');
    vibrate([400, 200, 400]);
    
    updateUI();
}

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
        
        if (gameState.isOnCooldown('fight')) {
            button.disabled = true;
        }
        
        container.appendChild(button);
    });
    
    updateFightCooldown();
}

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

function initFighting() {
    setInterval(updateFightDisplay, 1000);
    
    updateFightDisplay();
    
    document.addEventListener('keydown', (event) => {
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        if (event.key.toLowerCase() === 'f' && !gameState.isOnCooldown('fight')) {
            const available = getAvailableOpponents();
            if (available.length > 0) {
                const strongest = available[available.length - 1];
                startFight(strongest.id);
            }
        }
    });
}

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
