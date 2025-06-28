// Game State Management
class GameState {
    constructor() {
        this.data = {
            // Basic Stats
            character: 'boy',
            strength: 1.0,
            money: 0.0,
            gems: 0,
            
            // Prestige
            prestigeLevel: 0,
            strengthMultiplier: 1.0,
            
            // Equipment
            equipment: {
                proteinShake: 0,
                gymMembership: 0,
                personalTrainer: 0,
                superSerum: 0,
                gravityChamber: 0,
                quantumEnhancer: 0
            },
            
            // Gem Upgrades
            gemUpgrades: {
                strengthBoost: 0,
                moneyMultiplier: 0,
                gemGenerator: 0
            },
            
            // Active Effects
            activeEffects: {
                // { type: 'cooldown_reduction', value: 0.5, endTime: timestamp }
            },
            
            // Cooldowns
            cooldowns: {
                basic: 0,
                intense: 0,
                extreme: 0,
                legendary: 0,
                cosmic: 0
            },
            
            // Achievements
            achievements: new Set(),
            hiddenAchievements: new Set(),
            
            // Unlocks
            unlockedFeatures: new Set(['basic-training', 'intense-training']),
            unlockedCharacters: new Set(['boy', 'girl']),
            
            // Statistics
            statistics: {
                totalStrengthGained: 0,
                totalMoneyEarned: 0,
                totalGemsEarned: 0,
                totalTrainingClicks: 0,
                totalPrestigeCount: 0,
                totalPlayTime: 0,
                maxStrengthReached: 1.0,
                achievementsUnlocked: 0,
                hiddenAchievementsUnlocked: 0,
                equipmentPurchased: 0,
                gameStartTime: Date.now(),
                lastPlayTime: Date.now()
            },
            
            // Hidden Features
            hiddenFeatures: {
                realityBreakUsed: 0,
                timeLoopUsed: 0,
                dimensionShiftUsed: 0,
                secretsDiscovered: new Set()
            },
            
            // Settings
            settings: {
                theme: 'dark',
                notifications: true,
                particles: true,
                autoSave: true,
                soundEffects: false
            },
            
            // Special States
            earthLifted: false,
            realityBroken: false,
            timeLooping: false,
            dimensionShifted: false,
            
            // Version
            version: CONFIG.VERSION
        };
        
        this.listeners = new Map();
        this.updateInterval = null;
    }
    
    // Get a value from the game state
    get(path) {
        const keys = path.split('.');
        let current = this.data;
        
        for (const key of keys) {
            if (current === null || current === undefined) {
                return undefined;
            }
            current = current[key];
        }
        
        return current;
    }
    
    // Set a value in the game state
    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        let current = this.data;
        
        for (const key of keys) {
            if (!(key in current)) {
                current[key] = {};
            }
            current = current[key];
        }
        
        const oldValue = current[lastKey];
        current[lastKey] = value;
        
        // Trigger listeners
        this.triggerListeners(path, value, oldValue);
        
        return value;
    }
    
    // Add a value to an existing number
    add(path, value) {
        const current = this.get(path) || 0;
        return this.set(path, current + value);
    }
    
    // Multiply a value
    multiply(path, value) {
        const current = this.get(path) || 1;
        return this.set(path, current * value);
    }
    
    // Add to a Set
    addToSet(path, value) {
        const set = this.get(path);
        if (set instanceof Set) {
            set.add(value);
            this.triggerListeners(path, set);
        }
    }
    
    // Remove from a Set
    removeFromSet(path, value) {
        const set = this.get(path);
        if (set instanceof Set) {
            set.delete(value);
            this.triggerListeners(path, set);
        }
    }
    
    // Check if Set has value
    hasInSet(path, value) {
        const set = this.get(path);
        return set instanceof Set ? set.has(value) : false;
    }
    
    // Add event listener for state changes
    on(path, callback) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, []);
        }
        this.listeners.get(path).push(callback);
    }
    
    // Remove event listener
    off(path, callback) {
        const listeners = this.listeners.get(path);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }
    
    // Trigger listeners for a path
    triggerListeners(path, newValue, oldValue) {
        const listeners = this.listeners.get(path);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(newValue, oldValue, path);
                } catch (error) {
                    console.error('Error in state listener:', error);
                }
            });
        }
    }
    
    // Update active effects
    updateActiveEffects() {
        const now = Date.now();
        const effects = this.get('activeEffects');
        
        for (const [id, effect] of Object.entries(effects)) {
            if (effect.endTime <= now) {
                delete effects[id];
                this.triggerListeners('activeEffects', effects);
            }
        }
    }
    
    // Add active effect
    addActiveEffect(type, value, duration) {
        const id = Date.now() + Math.random();
        const effect = {
            type,
            value,
            endTime: Date.now() + duration
        };
        
        const effects = this.get('activeEffects');
        effects[id] = effect;
        this.set('activeEffects', effects);
        
        return id;
    }
    
    // Get total effect value for a type
    getActiveEffectValue(type) {
        const effects = this.get('activeEffects');
        let total = 0;
        
        for (const effect of Object.values(effects)) {
            if (effect.type === type) {
                total += effect.value;
            }
        }
        
        return total;
    }
    
    // Update cooldowns
    updateCooldowns() {
        const now = Date.now();
        const cooldowns = this.get('cooldowns');
        let updated = false;
        
        for (const [type, endTime] of Object.entries(cooldowns)) {
            if (endTime > 0 && endTime <= now) {
                cooldowns[type] = 0;
                updated = true;
            }
        }
        
        if (updated) {
            this.set('cooldowns', cooldowns);
        }
    }
    
    // Set cooldown
    setCooldown(type, duration) {
        const cooldowns = this.get('cooldowns');
        const reduction = this.getActiveEffectValue('cooldown_reduction');
        const actualDuration = duration * (1 - reduction);
        
        cooldowns[type] = Date.now() + actualDuration;
        this.set('cooldowns', cooldowns);
    }
    
    // Check if action is on cooldown
    isOnCooldown(type) {
        const cooldowns = this.get('cooldowns');
        return cooldowns[type] > Date.now();
    }
    
    // Get remaining cooldown time
    getRemainingCooldown(type) {
        const cooldowns = this.get('cooldowns');
        const remaining = cooldowns[type] - Date.now();
        return Math.max(0, remaining);
    }
    
    // Update statistics
    updateStatistics() {
        const now = Date.now();
        const lastPlayTime = this.get('statistics.lastPlayTime');
        const sessionTime = now - lastPlayTime;
        
        this.add('statistics.totalPlayTime', sessionTime);
        this.set('statistics.lastPlayTime', now);
        
        // Update max strength
        const currentStrength = this.get('strength');
        const maxStrength = this.get('statistics.maxStrengthReached');
        if (currentStrength > maxStrength) {
            this.set('statistics.maxStrengthReached', currentStrength);
        }
    }
    
    // Start update loop
    startUpdateLoop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        this.updateInterval = setInterval(() => {
            this.updateActiveEffects();
            this.updateCooldowns();
            this.updateStatistics();
        }, 1000);
    }
    
    // Stop update loop
    stopUpdateLoop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
    
    // Save to localStorage
    save() {
        try {
            const saveData = {
                ...this.data,
                achievements: Array.from(this.data.achievements),
                hiddenAchievements: Array.from(this.data.hiddenAchievements),
                unlockedFeatures: Array.from(this.data.unlockedFeatures),
                unlockedCharacters: Array.from(this.data.unlockedCharacters),
                hiddenFeatures: {
                    ...this.data.hiddenFeatures,
                    secretsDiscovered: Array.from(this.data.hiddenFeatures.secretsDiscovered)
                }
            };
            
            localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(saveData));
            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            return false;
        }
    }
    
    // Load from localStorage
    load() {
        try {
            const saveData = localStorage.getItem(CONFIG.SAVE_KEY);
            if (!saveData) return false;
            
            const parsed = JSON.parse(saveData);
            
            // Merge with default data to handle new properties
            this.data = {
                ...this.data,
                ...parsed,
                achievements: new Set(parsed.achievements || []),
                hiddenAchievements: new Set(parsed.hiddenAchievements || []),
                unlockedFeatures: new Set(parsed.unlockedFeatures || ['basic-training', 'intense-training']),
                unlockedCharacters: new Set(parsed.unlockedCharacters || ['boy', 'girl']),
                hiddenFeatures: {
                    ...this.data.hiddenFeatures,
                    ...parsed.hiddenFeatures,
                    secretsDiscovered: new Set(parsed.hiddenFeatures?.secretsDiscovered || [])
                }
            };
            
            // Update version if needed
            if (this.data.version !== CONFIG.VERSION) {
                this.migrateData();
            }
            
            return true;
        } catch (error) {
            console.error('Failed to load game:', error);
            return false;
        }
    }
    
    // Migrate data between versions
    migrateData() {
        console.log(`Migrating from version ${this.data.version} to ${CONFIG.VERSION}`);
        
        // Add migration logic here for future versions
        
        this.data.version = CONFIG.VERSION;
    }
    
    // Reset game state
    reset() {
        this.stopUpdateLoop();
        this.data = new GameState().data;
        this.listeners.clear();
        localStorage.removeItem(CONFIG.SAVE_KEY);
    }
    
    // Export save data
    export() {
        return btoa(JSON.stringify({
            ...this.data,
            achievements: Array.from(this.data.achievements),
            hiddenAchievements: Array.from(this.data.hiddenAchievements),
            unlockedFeatures: Array.from(this.data.unlockedFeatures),
            unlockedCharacters: Array.from(this.data.unlockedCharacters),
            hiddenFeatures: {
                ...this.data.hiddenFeatures,
                secretsDiscovered: Array.from(this.data.hiddenFeatures.secretsDiscovered)
            }
        }));
    }
    
    // Import save data
    import(saveString) {
        try {
            const parsed = JSON.parse(atob(saveString));
            
            this.data = {
                ...this.data,
                ...parsed,
                achievements: new Set(parsed.achievements || []),
                hiddenAchievements: new Set(parsed.hiddenAchievements || []),
                unlockedFeatures: new Set(parsed.unlockedFeatures || []),
                unlockedCharacters: new Set(parsed.unlockedCharacters || []),
                hiddenFeatures: {
                    ...this.data.hiddenFeatures,
                    ...parsed.hiddenFeatures,
                    secretsDiscovered: new Set(parsed.hiddenFeatures?.secretsDiscovered || [])
                }
            };
            
            return true;
        } catch (error) {
            console.error('Failed to import save:', error);
            return false;
        }
    }
}

// Create global game state instance
const gameState = new GameState();
