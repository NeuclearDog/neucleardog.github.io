// Notification System

let notificationQueue = [];
let activeNotifications = [];

// Show notification
function showNotification(options) {
    if (!gameState.get('settings.notifications')) {
        return;
    }
    
    const notification = {
        id: Date.now() + Math.random(),
        title: options.title || 'Notification',
        message: options.message || '',
        type: options.type || 'info',
        duration: options.duration || CONFIG.NOTIFICATIONS.duration,
        timestamp: Date.now()
    };
    
    // Add to queue
    notificationQueue.push(notification);
    
    // Process queue
    processNotificationQueue();
}

// Process notification queue
function processNotificationQueue() {
    // Remove expired notifications
    activeNotifications = activeNotifications.filter(notification => {
        const element = document.getElementById(`notification-${notification.id}`);
        if (!element || Date.now() - notification.timestamp > notification.duration) {
            if (element) {
                element.remove();
            }
            return false;
        }
        return true;
    });
    
    // Add new notifications if there's space
    while (notificationQueue.length > 0 && activeNotifications.length < CONFIG.NOTIFICATIONS.maxVisible) {
        const notification = notificationQueue.shift();
        displayNotification(notification);
        activeNotifications.push(notification);
    }
}

// Display notification
function displayNotification(notification) {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    const element = document.createElement('div');
    element.id = `notification-${notification.id}`;
    element.className = `notification ${notification.type}`;
    
    // Create notification content
    const title = document.createElement('div');
    title.className = 'notification-title';
    title.textContent = notification.title;
    
    const message = document.createElement('div');
    message.className = 'notification-desc';
    message.textContent = notification.message;
    
    element.appendChild(title);
    element.appendChild(message);
    
    // Add click to dismiss
    element.addEventListener('click', () => {
        dismissNotification(notification.id);
    });
    
    // Add to container
    container.appendChild(element);
    
    // Auto-dismiss after duration
    setTimeout(() => {
        dismissNotification(notification.id);
    }, notification.duration);
    
    // Play notification sound
    playNotificationSound(notification.type);
}

// Dismiss notification
function dismissNotification(notificationId) {
    const element = document.getElementById(`notification-${notificationId}`);
    if (element) {
        element.style.animation = 'fade-out 0.3s ease-out forwards';
        setTimeout(() => {
            element.remove();
        }, 300);
    }
    
    // Remove from active notifications
    activeNotifications = activeNotifications.filter(n => n.id !== notificationId);
    
    // Process queue to show next notification
    setTimeout(processNotificationQueue, 100);
}

// Play notification sound based on type
function playNotificationSound(type) {
    switch (type) {
        case 'achievement':
            playSound('achievement');
            break;
        case 'milestone':
            playSound('milestone');
            break;
        case 'prestige':
            playSound('prestige');
            break;
        case 'hidden':
            playSound('hidden_achievement');
            break;
        case 'error':
            playSound('error');
            break;
        case 'success':
            playSound('success');
            break;
        default:
            playSound('notification');
            break;
    }
}

// Clear all notifications
function clearAllNotifications() {
    const container = document.getElementById('notification-container');
    if (container) {
        container.innerHTML = '';
    }
    
    activeNotifications = [];
    notificationQueue = [];
}

// Notification presets
const NOTIFICATION_PRESETS = {
    strengthMilestone: (amount) => ({
        title: 'Strength Milestone!',
        message: `You've reached ${formatNumber(amount)} kg of strength!`,
        type: 'milestone',
        duration: 5000
    }),
    
    moneyMilestone: (amount) => ({
        title: 'Money Milestone!',
        message: `You've earned ${formatMoney(amount)}!`,
        type: 'milestone',
        duration: 4000
    }),
    
    equipmentPurchase: (equipment, level) => ({
        title: 'Equipment Upgraded!',
        message: `${equipment} upgraded to level ${level}!`,
        type: 'success',
        duration: 3000
    }),
    
    featureUnlock: (feature) => ({
        title: 'Feature Unlocked!',
        message: `${feature} is now available!`,
        type: 'milestone',
        duration: 6000
    }),
    
    cooldownReady: (training) => ({
        title: 'Training Ready!',
        message: `${training} training is off cooldown!`,
        type: 'info',
        duration: 2000
    }),
    
    lowResources: (resource) => ({
        title: 'Low Resources',
        message: `You're running low on ${resource}!`,
        type: 'warning',
        duration: 3000
    })
};

// Show preset notification
function showPresetNotification(preset, ...args) {
    if (NOTIFICATION_PRESETS[preset]) {
        const options = NOTIFICATION_PRESETS[preset](...args);
        showNotification(options);
    }
}

// Initialize notification system
function initNotifications() {
    // Process notification queue periodically
    setInterval(processNotificationQueue, 1000);
    
    // Set up notification settings listener
    gameState.on('settings.notifications', (enabled) => {
        if (!enabled) {
            clearAllNotifications();
        }
    });
    
    // Welcome notification for new players
    if (gameState.get('statistics.totalPlayTime') === 0) {
        setTimeout(() => {
            showNotification({
                title: 'Welcome to Strength Ascension!',
                message: 'Your journey from weakling to cosmic entity begins now!',
                type: 'info',
                duration: 6000
            });
        }, 1000);
    }
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showNotification,
        showPresetNotification,
        dismissNotification,
        clearAllNotifications,
        processNotificationQueue,
        displayNotification,
        initNotifications,
        NOTIFICATION_PRESETS
    };
}
