// Shop System

// Current shop tab
let currentShopTab = 'equipment';

// Switch shop tab
function switchShopTab(tab) {
    currentShopTab = tab;
    
    // Update tab buttons
    document.querySelectorAll('.shop-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="switchShopTab('${tab}')"]`).classList.add('active');
    
    // Show/hide shop content
    document.querySelectorAll('.shop-content').forEach(content => {
        content.classList.add('hidden');
    });
    document.getElementById(tab + '-shop').classList.remove('hidden');
    
    updateShopDisplay();
}

// Buy equipment upgrade
function buyUpgrade(upgradeType) {
    const currentLevel = gameState.get(`equipment.${upgradeType}`);
    const cost = calculateEquipmentCost(upgradeType, currentLevel);
    const money = gameState.get('money');
    const config = CONFIG.EQUIPMENT[upgradeType];
    
    // Check if at max level
    if (config.maxLevel && currentLevel >= config.maxLevel) {
        showNotification({
            title: 'Max Level Reached',
            message: `${upgradeType} is already at maximum level!`,
            type: 'error'
        });
        return;
    }
    
    // Check if can afford
    if (money < cost) {
        showNotification({
            title: 'Not Enough Money',
            message: `You need ${formatMoney(cost - money)} more to buy this upgrade!`,
            type: 'error'
        });
        return;
    }
    
    // Purchase upgrade
    gameState.add('money', -cost);
    gameState.add(`equipment.${upgradeType}`, 1);
    gameState.add('statistics.equipmentPurchased', 1);
    
    // Visual effects
    const button = document.getElementById(upgradeType);
    if (button) {
        const pos = getElementPosition(button);
        createParticles('money', pos.x, pos.y, 3);
        
        button.style.animation = 'button-press 0.2s ease-out';
        setTimeout(() => {
            button.style.animation = '';
        }, 200);
    }
    
    // Sound and haptic feedback
    playSound('purchase');
    vibrate(100);
    
    // Show purchase notification
    showNotification({
        title: 'Upgrade Purchased!',
        message: `${upgradeType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} level ${currentLevel + 1}`,
        type: 'success'
    });
    
    // Update displays
    updateShopDisplay();
    updateStatsDisplay();
    updateTrainingDisplay();
    
    // Check achievements
    checkAchievements();
}

// Buy consumable
function buyConsumable(consumableType) {
    const config = CONFIG.CONSUMABLES[consumableType];
    const money = gameState.get('money');
    
    if (money < config.cost) {
        showNotification({
            title: 'Not Enough Money',
            message: `You need ${formatMoney(config.cost - money)} more!`,
            type: 'error'
        });
        return;
    }
    
    // Purchase consumable
    gameState.add('money', -config.cost);
    
    // Apply effect
    const effectId = gameState.addActiveEffect(config.effect, config.value, config.duration);
    
    // Visual effects
    const button = document.getElementById(consumableType.replace(/([A-Z])/g, '-$1').toLowerCase());
    if (button) {
        const pos = getElementPosition(button);
        createParticles('strength', pos.x, pos.y, 5);
        
        button.style.animation = 'button-press 0.2s ease-out';
        setTimeout(() => {
            button.style.animation = '';
        }, 200);
    }
    
    // Sound and haptic feedback
    playSound('consumable');
    vibrate(150);
    
    // Show effect notification
    showNotification({
        title: 'Consumable Used!',
        message: `${consumableType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} active for ${formatTime(config.duration)}`,
        type: 'success',
        duration: 3000
    });
    
    updateShopDisplay();
}

// Buy gem upgrade
function buyGemUpgrade(upgradeType) {
    const currentLevel = gameState.get(`gemUpgrades.${upgradeType}`);
    const cost = calculateGemUpgradeCost(upgradeType, currentLevel);
    const gems = gameState.get('gems');
    const config = CONFIG.GEM_UPGRADES[upgradeType];
    
    // Check if at max level
    if (config.maxLevel && currentLevel >= config.maxLevel) {
        showNotification({
            title: 'Max Level Reached',
            message: `${upgradeType} is already at maximum level!`,
            type: 'error'
        });
        return;
    }
    
    // Check if can afford
    if (gems < cost) {
        showNotification({
            title: 'Not Enough Gems',
            message: `You need ${cost - gems} more gems!`,
            type: 'error'
        });
        return;
    }
    
    // Special handling for one-time purchases
    if (upgradeType === 'timeWarp') {
        // Skip all cooldowns
        const cooldowns = gameState.get('cooldowns');
        Object.keys(cooldowns).forEach(type => {
            cooldowns[type] = 0;
        });
        gameState.set('cooldowns', cooldowns);
        
        gameState.add('gems', -cost);
        
        showNotification({
            title: 'Time Warp Activated!',
            message: 'All cooldowns have been reset!',
            type: 'success'
        });
        
        updateTrainingDisplay();
        return;
    }
    
    // Purchase upgrade
    gameState.add('gems', -cost);
    gameState.add(`gemUpgrades.${upgradeType}`, 1);
    
    // Visual effects
    const button = document.getElementById(upgradeType.replace(/([A-Z])/g, '-$1').toLowerCase());
    if (button) {
        const pos = getElementPosition(button);
        createParticles('gem', pos.x, pos.y, 5);
        
        button.style.animation = 'button-press 0.2s ease-out';
        setTimeout(() => {
            button.style.animation = '';
        }, 200);
    }
    
    // Sound and haptic feedback
    playSound('gem_purchase');
    vibrate([100, 50, 100]);
    
    // Show purchase notification
    showNotification({
        title: 'Gem Upgrade Purchased!',
        message: `${upgradeType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} level ${currentLevel + 1}`,
        type: 'gem'
    });
    
    // Update displays
    updateShopDisplay();
    updateStatsDisplay();
    updateTrainingDisplay();
}

// Update shop display
function updateShopDisplay() {
    updateEquipmentShop();
    updateConsumablesShop();
    updateSpecialShop();
}

// Update equipment shop
function updateEquipmentShop() {
    const money = gameState.get('money');
    const equipment = gameState.get('equipment');
    
    Object.keys(CONFIG.EQUIPMENT).forEach(equipmentType => {
        const currentLevel = equipment[equipmentType];
        const cost = calculateEquipmentCost(equipmentType, currentLevel);
        const config = CONFIG.EQUIPMENT[equipmentType];
        
        // Update cost display
        const costElement = document.getElementById(equipmentType.replace(/([A-Z])/g, '-$1').toLowerCase() + '-cost');
        if (costElement) {
            costElement.textContent = formatNumber(cost);
        }
        
        // Update owned display
        const ownedElement = document.getElementById(equipmentType.replace(/([A-Z])/g, '-$1').toLowerCase() + '-owned');
        if (ownedElement) {
            ownedElement.textContent = currentLevel;
        }
        
        // Update button state
        const button = document.getElementById(equipmentType.replace(/([A-Z])/g, '-$1').toLowerCase());
        if (button) {
            const canAfford = money >= cost;
            const atMaxLevel = config.maxLevel && currentLevel >= config.maxLevel;
            
            button.disabled = !canAfford || atMaxLevel;
            
            if (atMaxLevel) {
                button.querySelector('.upgrade-cost').textContent = 'MAX LEVEL';
            }
        }
    });
}

// Update consumables shop
function updateConsumablesShop() {
    const money = gameState.get('money');
    
    Object.keys(CONFIG.CONSUMABLES).forEach(consumableType => {
        const config = CONFIG.CONSUMABLES[consumableType];
        const elementId = consumableType.replace(/([A-Z])/g, '-$1').toLowerCase();
        
        // Update cost display
        const costElement = document.getElementById(elementId + '-cost');
        if (costElement) {
            costElement.textContent = formatNumber(config.cost);
        }
        
        // Update button state
        const button = document.getElementById(elementId);
        if (button) {
            button.disabled = money < config.cost;
        }
    });
}

// Update special shop
function updateSpecialShop() {
    const gems = gameState.get('gems');
    const gemUpgrades = gameState.get('gemUpgrades');
    
    Object.keys(CONFIG.GEM_UPGRADES).forEach(upgradeType => {
        const currentLevel = gemUpgrades[upgradeType];
        const cost = calculateGemUpgradeCost(upgradeType, currentLevel);
        const config = CONFIG.GEM_UPGRADES[upgradeType];
        const elementId = upgradeType.replace(/([A-Z])/g, '-$1').toLowerCase();
        
        // Update cost display
        const costElement = document.getElementById(elementId + '-cost');
        if (costElement) {
            costElement.textContent = formatNumber(cost);
        }
        
        // Update button state
        const button = document.getElementById(elementId);
        if (button) {
            const canAfford = gems >= cost;
            const atMaxLevel = config.maxLevel && currentLevel >= config.maxLevel;
            
            button.disabled = !canAfford || atMaxLevel;
            
            if (atMaxLevel && button.querySelector('.upgrade-cost')) {
                button.querySelector('.upgrade-cost').textContent = 'MAX LEVEL';
            }
        }
    });
}

// Initialize shop system
function initShop() {
    updateShopDisplay();
    
    // Update shop display periodically
    setInterval(updateShopDisplay, 1000);
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        switchShopTab,
        buyUpgrade,
        buyConsumable,
        buyGemUpgrade,
        updateShopDisplay,
        updateEquipmentShop,
        updateConsumablesShop,
        updateSpecialShop,
        initShop
    };
}
