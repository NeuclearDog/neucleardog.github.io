const CONFIG = {
    VERSION: '2.0.0',
    SAVE_KEY: 'strengthAscension_v2',
    AUTO_SAVE_INTERVAL: 10000,
    COOLDOWNS: {
        basic: 30000,
        intense: 600000,
        extreme: 1800000,
        legendary: 7200000,
        cosmic: 21600000,
        fight: 3600000,
    },
    TRAINING_BASE: {
        basic: 0.1,
        intense: 0.5,
        extreme: 2.5,
        legendary: 100.0,
        cosmic: 10000.0,
        fight: 50.0,
    },
    MONEY_PER_STRENGTH: 0.01,
    GEMS_PER_PRESTIGE: 1,
    GEMS_PER_HIDDEN_ACHIEVEMENT: 3,
    STRENGTH_TIERS: [
        { threshold: 1, name: "Weakling", emoji: "😴", unlocks: [], autoMoney: 0 },
        { threshold: 10, name: "Beginner", emoji: "🤔", unlocks: [], autoMoney: 5 },
        { threshold: 100, name: "Novice", emoji: "💪", unlocks: ['alien-character'], autoMoney: 25 },
        { threshold: 1000, name: "Amateur", emoji: "🦾", unlocks: ['legendary-training'], autoMoney: 100 },
        { threshold: 10000, name: "Strong", emoji: "⚡", unlocks: [], autoMoney: 500 },
        { threshold: 100000, name: "Powerful", emoji: "🔥", unlocks: ['robot-character'], autoMoney: 2500 },
        { threshold: 1000000, name: "Superhuman", emoji: "🦸", unlocks: ['cosmic-training'], autoMoney: 10000 },
        { threshold: 10000000, name: "Legendary", emoji: "🌟", unlocks: ['hidden-features'], autoMoney: 50000 },
        { threshold: 100000000, name: "Mythical", emoji: "🔮", unlocks: [], autoMoney: 250000 },
        { threshold: 1000000000, name: "Godlike", emoji: "👑", unlocks: [], autoMoney: 1000000 },
        { threshold: 10000000000, name: "Cosmic", emoji: "🌌", unlocks: [], autoMoney: 5000000 },
        { threshold: 100000000000, name: "Universal", emoji: "🌠", unlocks: [], autoMoney: 25000000 },
        { threshold: 1000000000000, name: "Multiversal", emoji: "🌀", unlocks: [], autoMoney: 100000000 },
        { threshold: 5.972e24, name: "EARTH LIFTER", emoji: "🌍", unlocks: ['earth-challenge'], autoMoney: 1000000000 }
    ],
    EQUIPMENT: {
        proteinShake: {
            baseCost: 100,
            costMultiplier: 2.5,
            effect: 0.5,
            maxLevel: 50
        },
        gymMembership: {
            baseCost: 1000,
            costMultiplier: 3.0,
            effect: 2.0,
            maxLevel: 25,
            idleGain: 0.01
        },
        personalTrainer: {
            baseCost: 10000,
            costMultiplier: 5.0,
            effect: 10.0,
            maxLevel: 15
        },
        superSerum: {
            baseCost: 100000,
            costMultiplier: 20.0,
            effect: 1.5,
            maxLevel: 5
        },
        gravityChamber: {
            baseCost: 1000000,
            costMultiplier: 200.0,
            effect: 5.0,
            maxLevel: 3
        },
        quantumEnhancer: {
            baseCost: 100000000,
            costMultiplier: 2000.0,
            effect: 50.0,
            maxLevel: 2
        },
        moonTrainingGround: {
            baseCost: 1e12,
            costMultiplier: 10000.0,
            effect: 1000.0,
            maxLevel: 1,
            description: "Train on the Moon itself - gravity is optional"
        },
        citySlabLifter: {
            baseCost: 1e15,
            costMultiplier: 50000.0,
            effect: 10000.0,
            maxLevel: 1,
            description: "Lift metal slabs the size of entire cities"
        },
        continentalBarbell: {
            baseCost: 1e18,
            costMultiplier: 100000.0,
            effect: 100000.0,
            maxLevel: 1,
            description: "A barbell made from entire continents"
        },
        planetaryDumbbell: {
            baseCost: 1e21,
            costMultiplier: 500000.0,
            effect: 1000000.0,
            maxLevel: 1,
            description: "Dumbbells forged from compressed planets"
        }
    },
    CONSUMABLES: {
        energyDrink: {
            cost: 50,
            effect: 'cooldown_reduction',
            value: 0.5,
            duration: 300000
        },
        doubleXp: {
            cost: 200,
            effect: 'strength_multiplier',
            value: 2.0,
            duration: 600000
        },
        tripleXp: {
            cost: 1000,
            effect: 'strength_multiplier',
            value: 3.0,
            duration: 300000
        },
        megaBoost: {
            cost: 5000,
            effect: 'strength_multiplier',
            value: 10.0,
            duration: 60000
        }
    },
    GEM_UPGRADES: {
        timeWarp: {
            cost: 10,
            effect: 'skip_cooldowns'
        },
        strengthBoost: {
            baseCost: 25,
            costMultiplier: 2.0,
            effect: 0.1,
            maxLevel: 20
        },
        moneyMultiplier: {
            baseCost: 50,
            costMultiplier: 3.0,
            effect: 0.5,
            maxLevel: 10
        },
        gemGenerator: {
            baseCost: 100,
            costMultiplier: 5.0,
            effect: 1,
            maxLevel: 5
        }
    },
    PRESTIGE: {
        minStrength: 10000000,
        baseBonus: 0.5,
        bonusPerLevel: 0.2
    },
    HIDDEN_UNLOCKS: {
        realityBreak: {
            requirement: 'prestige_10',
            cost: 1000000000
        },
        timeLoop: {
            requirement: 'strength_1e15',
            cost: 1000000000000
        },
        dimensionShift: {
            requirement: 'hidden_achievement_5',
            cost: 1000000000000000
        }
    },
    PARTICLES: {
        strength: { color: '#ffd93d', count: 5, duration: 2000 },
        money: { color: '#4ecdc4', count: 3, duration: 2500 },
        gem: { color: '#9c27b0', count: 2, duration: 3000 },
        cosmic: { color: '#8a2be2', count: 10, duration: 4000 }
    },
    NOTIFICATIONS: {
        duration: 4000,
        maxVisible: 5
    },
    STATS_TO_TRACK: [
        'totalStrengthGained',
        'totalMoneyEarned',
        'totalGemsEarned',
        'totalTrainingClicks',
        'totalPrestigeCount',
        'totalPlayTime',
        'maxStrengthReached',
        'achievementsUnlocked',
        'hiddenAchievementsUnlocked',
        'equipmentPurchased',
        'totalFights',
        'fightsWon',
        'fightsLost',
        'strongestOpponentDefeated'
    ],
    FIGHT_OPPONENTS: [
        {
            id: 'weakling',
            name: 'Scrawny Kid',
            emoji: '🧒',
            strength: 5,
            winChance: 0.9,
            reward: { strength: 2, money: 5 },
            description: 'A kid even weaker than you... probably'
        },
        {
            id: 'bully',
            name: 'School Bully',
            emoji: '😠',
            strength: 25,
            winChance: 0.7,
            reward: { strength: 8, money: 20 },
            description: 'The classic school bully - all bark, some bite'
        },
        {
            id: 'athlete',
            name: 'High School Athlete',
            emoji: '🏃',
            strength: 100,
            winChance: 0.6,
            reward: { strength: 25, money: 75 },
            description: 'Varsity team captain with actual muscle'
        },
        {
            id: 'bodybuilder',
            name: 'Gym Bodybuilder',
            emoji: '💪',
            strength: 500,
            winChance: 0.5,
            reward: { strength: 100, money: 300 },
            description: 'Protein powder incarnate'
        },
        {
            id: 'strongman',
            name: 'Professional Strongman',
            emoji: '🏋️',
            strength: 2500,
            winChance: 0.4,
            reward: { strength: 500, money: 1500 },
            description: 'Lifts cars for breakfast'
        },
        {
            id: 'metallic_giant',
            name: 'Metallic Giant',
            emoji: '🤖',
            strength: 10000,
            winChance: 0.3,
            reward: { strength: 2000, money: 8000 },
            description: 'A towering metal behemoth with hydraulic muscles'
        },
        {
            id: 'steel_bug',
            name: 'Steel Beetle',
            emoji: '🪲',
            strength: 50000,
            winChance: 0.25,
            reward: { strength: 10000, money: 40000 },
            description: 'Chitinous armor harder than diamond'
        },
        {
            id: 'iron_mantis',
            name: 'Iron Mantis',
            emoji: '🦂',
            strength: 250000,
            winChance: 0.2,
            reward: { strength: 50000, money: 200000 },
            description: 'Razor-sharp claws that cut through reality'
        },
        {
            id: 'titanium_spider',
            name: 'Titanium Spider Queen',
            emoji: '🕷️',
            strength: 1000000,
            winChance: 0.15,
            reward: { strength: 200000, money: 1000000 },
            description: 'Eight legs of pure destruction'
        },
        {
            id: 'mech_warrior',
            name: 'Mech Warrior',
            emoji: '🦾',
            strength: 5000000,
            winChance: 0.1,
            reward: { strength: 1000000, money: 5000000 },
            description: 'Pilot and machine merged into one unstoppable force'
        },
        {
            id: 'cyber_dragon',
            name: 'Cybernetic Dragon',
            emoji: '🐲',
            strength: 25000000,
            winChance: 0.08,
            reward: { strength: 5000000, money: 25000000 },
            description: 'Ancient wisdom meets modern technology'
        },
        {
            id: 'void_colossus',
            name: 'Void Colossus',
            emoji: '👹',
            strength: 100000000,
            winChance: 0.05,
            reward: { strength: 20000000, money: 100000000 },
            description: 'A being from the space between dimensions'
        },
        {
            id: 'reality_crusher',
            name: 'Reality Crusher',
            emoji: '🌀',
            strength: 1000000000,
            winChance: 0.03,
            reward: { strength: 200000000, money: 1000000000 },
            description: 'It bends the laws of physics with its mere presence'
        },
        {
            id: 'cosmic_entity',
            name: 'Cosmic Entity',
            emoji: '🌌',
            strength: 1e12,
            winChance: 0.01,
            reward: { strength: 2e11, money: 1e12 },
            description: 'A being that exists across multiple universes simultaneously'
        },
        {
            id: 'universe_eater',
            name: 'Universe Eater',
            emoji: '🕳️',
            strength: 1e18,
            winChance: 0.005,
            reward: { strength: 2e17, money: 1e18 },
            description: 'It consumes entire realities for sustenance'
        },
        {
            id: 'existence_itself',
            name: 'Existence Itself',
            emoji: '∞',
            strength: 1e24,
            winChance: 0.001,
            reward: { strength: 2e23, money: 1e24 },
            description: 'The very concept of being given form and malice'
        }
    ]
};

const EARTH_MASS = 5.972e24;

const CHARACTERS = {
    boy: { emoji: '👦', name: 'Boy', unlocked: true },
    girl: { emoji: '👧', name: 'Girl', unlocked: true },
    alien: { emoji: '👽', name: 'Alien', unlocked: false, requirement: 100 },
    robot: { emoji: '🤖', name: 'Robot', unlocked: false, requirement: 100000 }
};

const THEMES = {
    dark: { name: 'Dark', icon: '🌙' },
    light: { name: 'Light', icon: '☀️' },
    neon: { name: 'Neon', icon: '⚡' },
    retro: { name: 'Retro', icon: '🎮' },
    nature: { name: 'Nature', icon: '🌿' },
    space: { name: 'Space', icon: '🌌' }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, EARTH_MASS, CHARACTERS, THEMES };
}
