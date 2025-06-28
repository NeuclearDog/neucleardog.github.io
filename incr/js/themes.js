// Theme System

// Switch theme
function switchTheme(themeName) {
    if (!THEMES[themeName]) {
        console.error('Unknown theme:', themeName);
        return;
    }
    
    // Update body data attribute
    document.body.setAttribute('data-theme', themeName);
    
    // Update active theme button
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-theme="${themeName}"]`).classList.add('active');
    
    // Save theme preference
    gameState.set('settings.theme', themeName);
    
    // Show theme change notification
    showNotification({
        title: 'Theme Changed',
        message: `Switched to ${THEMES[themeName].name} theme`,
        type: 'info',
        duration: 2000
    });
    
    // Create theme particles
    createParticles('strength', window.innerWidth / 2, window.innerHeight / 2, 10);
    
    gameState.save();
}

// Initialize theme system
function initThemes() {
    // Load saved theme
    const savedTheme = gameState.get('settings.theme') || 'dark';
    switchTheme(savedTheme);
    
    // Set up theme button event listeners
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            switchTheme(theme);
        });
    });
    
    // Special theme unlocks
    checkThemeUnlocks();
}

// Check for special theme unlocks
function checkThemeUnlocks() {
    const strength = gameState.get('strength');
    const prestigeLevel = gameState.get('prestigeLevel');
    
    // Unlock special themes based on progress
    if (strength >= 1000000 && !gameState.hasInSet('unlockedFeatures', 'neon-theme')) {
        unlockTheme('neon');
    }
    
    if (prestigeLevel >= 5 && !gameState.hasInSet('unlockedFeatures', 'space-theme')) {
        unlockTheme('space');
    }
}

// Unlock a theme
function unlockTheme(themeName) {
    gameState.addToSet('unlockedFeatures', themeName + '-theme');
    
    showNotification({
        title: 'New Theme Unlocked!',
        message: `${THEMES[themeName].name} theme is now available!`,
        type: 'milestone'
    });
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        switchTheme,
        initThemes,
        checkThemeUnlocks,
        unlockTheme
    };
}
