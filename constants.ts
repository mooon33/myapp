
import { UserProfile, ClassType, WorkoutNode, InventoryItem, Guild, ChatMessage, ShopItem, Friend, SpriteMilestone } from './types';

export const TRANSLATIONS = {
  en: {
    // Navigation
    map: 'Map',
    social: 'Social',
    evolve: 'Evolve',
    shop: 'Shop',
    hero: 'Hero',
    
    // Auth
    checkScrolls: 'Check your Scrolls',
    verificationSent: 'We have sent a verification rune to',
    confirmEmail: 'Please confirm your email to begin your journey.',
    returnLogin: 'Return to Login',
    heroName: 'Hero Name',
    emailScroll: 'Email Scroll',
    secretRune: 'Secret Rune',
    beginJourney: 'Begin Journey',
    enterRealm: 'Enter Realm',
    alreadyHero: 'Already have a hero? Sign In',
    newHero: 'New to the realm? Create Account',
    usernameError: 'Username must be at least 3 characters long.',
    usernameTaken: 'This Hero Name is already taken.',
    authError: 'An error occurred during authentication.',
    
    // Onboarding
    charCreation: 'Character Creation',
    step1: 'Physical Stats',
    step2: 'Choose your Path',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    height: 'Height (cm)',
    weight: 'Weight (kg)',
    nextStep: 'Next Step',
    selectClass: 'Select Class',
    completeSetup: 'Complete Setup',
    warriorDesc: 'Masters of heavy iron. Focus on Strength and Power.',
    scoutDesc: 'Agile and enduring. Focus on Stamina and Cardio.',
    monkDesc: 'Disciplined mind and body. Focus on Bodyweight and Flexibility.',

    // Map & Campaign
    xp: 'XP',
    chapter: 'Chapter',
    campaign: 'Campaign Map',
    loading: 'Loading Realm...',
    levelUp: 'LEVEL UP!',
    questComplete: 'Quest Complete!',
    
    // Character Profile
    lvl: 'Lvl',
    experience: 'Experience',
    personalRecords: 'Personal Records',
    updateRecords: 'Update Records',
    cancel: 'Cancel',
    save: 'Save',
    squat: 'Squat',
    bench: 'Bench',
    deadlift: 'Deadlift',
    attributes: {
      str: 'Strength (STR)',
      strDesc: 'Increases physical power, lifting capacity, and heavy weapon effectiveness.',
      sta: 'Stamina (STA)',
      staDesc: 'Boosts energy reserves, recovery speed, and cardio performance.',
      will: 'Willpower (WILL)',
      willDesc: 'Enhances mental focus, streak protection, and resistance to fatigue.'
    },

    // Guilds & Friends
    socialHub: 'Social Hub',
    guild: 'Guild',
    addFriend: 'Add Friend',
    searchUser: 'Search Hero by Name',
    sendRequest: 'Send Request',
    requestSent: 'Friend request sent!',
    userNotFound: 'Hero not found.',
    chat: 'Chat',
    friends: 'Friends',
    guilds: 'Guilds',
    rankings: 'Rankings',
    createGuild: 'Establish a Guild',
    guildName: 'Guild Name',
    manifesto: 'Manifesto (Description)',
    members: 'Members',
    join: 'Join',
    leave: 'Leave',
    full: 'Full',
    confirmJoin: 'Join Guild?',
    confirmLeave: 'Leave Guild?',
    joinText: 'Are you sure you want to join',
    leaveText: 'Are you sure you want to leave',
    confirm: 'Confirm',
    myGuild: 'My Guild',
    messagePlaceholder: 'Message guild...',
    challenge: 'Train Together',
    startingWorkout: 'Starting shared workout...',
    online: 'Online',
    offline: 'Offline',

    // Shop
    merchant: 'Merchant',
    buy: 'Buy',
    locked: 'Locked',
    tooExpensive: 'Too Expensive',
    requiresLvl: 'Requires Level',
    noviceGear: 'Novice Gear',
    tier: 'Tier',
    purchased: 'Purchased',
    notEnoughGold: 'Not enough gold!',

    // Active Session
    reward: 'Reward',
    oracleGuidance: 'Oracle Guidance',
    techniqueTip: 'Technique Tip',
    restTimer: 'Rest Timer',
    gotIt: 'Got it',
    completeQuest: 'Complete Quest',
    completed: 'Completed',
    
    // Evolution
    evolutionPath: 'Evolution Path',
    evolutionDesc: 'Your journey from novice to legend. Train hard to unlock new forms.',
    unlocked: 'Unlocked',
    nextMilestone: 'Next Milestone',
    moreComing: 'More coming soon',

    // Inventory
    equipment: 'Equipment',
    equip: 'Equip',
    unequip: 'Unequip',

    // Settings
    settings: 'Settings',
    general: 'General',
    sound: 'Sound Effects',
    notifications: 'Notifications',
    language: 'Language',
    account: 'Account',
    privacy: 'Privacy Policy',
    logout: 'Log Out',
    selectLanguage: 'Select Language',
    english: 'English',
    russian: 'Russian'
  },
  ru: {
    // Navigation
    map: 'Карта',
    social: 'Союз',
    evolve: 'Развитие',
    shop: 'Магазин',
    hero: 'Герой',

    // Auth
    checkScrolls: 'Проверьте Свитки',
    verificationSent: 'Мы отправили руну подтверждения на',
    confirmEmail: 'Пожалуйста, подтвердите email, чтобы начать путь.',
    returnLogin: 'Вернуться ко входу',
    heroName: 'Имя Героя',
    emailScroll: 'Email Свиток',
    secretRune: 'Тайная Руна (Пароль)',
    beginJourney: 'Начать Путь',
    enterRealm: 'Войти в Мир',
    alreadyHero: 'Уже есть герой? Войти',
    newHero: 'Новый герой? Создать аккаунт',
    usernameError: 'Имя должно быть не короче 3 символов.',
    usernameTaken: 'Это имя героя уже занято.',
    authError: 'Ошибка при авторизации.',

    // Onboarding
    charCreation: 'Создание Персонажа',
    step1: 'Физические Данные',
    step2: 'Выберите Путь',
    gender: 'Пол',
    male: 'Мужской',
    female: 'Женский',
    other: 'Другой',
    height: 'Рост (см)',
    weight: 'Вес (кг)',
    nextStep: 'Далее',
    selectClass: 'Выберите Класс',
    completeSetup: 'Завершить',
    warriorDesc: 'Мастера тяжелого железа. Упор на Силу и Мощь.',
    scoutDesc: 'Ловкие и выносливые. Упор на Выносливость и Кардио.',
    monkDesc: 'Дисциплина ума и тела. Упор на Собственный вес и Гибкость.',

    // Map & Campaign
    xp: 'Опыт',
    chapter: 'Глава',
    campaign: 'Карта Кампании',
    loading: 'Загрузка мира...',
    levelUp: 'НОВЫЙ УРОВЕНЬ!',
    questComplete: 'Квест Завершен!',

    // Character Profile
    lvl: 'Ур',
    experience: 'Опыт',
    personalRecords: 'Личные Рекорды',
    updateRecords: 'Обновить Рекорды',
    cancel: 'Отмена',
    save: 'Сохранить',
    squat: 'Присед',
    bench: 'Жим',
    deadlift: 'Тяга',
    attributes: {
      str: 'Сила (STR)',
      strDesc: 'Увеличивает физическую мощь, грузоподъемность и эффективность тяжелого оружия.',
      sta: 'Выносливость (STA)',
      staDesc: 'Повышает запасы энергии, скорость восстановления и кардио-результаты.',
      will: 'Воля (WILL)',
      willDesc: 'Улучшает ментальный фокус, защиту серии тренировок и сопротивление усталости.'
    },

    // Guilds & Friends
    socialHub: 'Центр Сообщества',
    guild: 'Гильдия',
    addFriend: 'Добавить друга',
    searchUser: 'Поиск героя по имени',
    sendRequest: 'Отправить запрос',
    requestSent: 'Запрос дружбы отправлен!',
    userNotFound: 'Герой не найден.',
    chat: 'Чат',
    friends: 'Друзья',
    guilds: 'Гильдии',
    rankings: 'Рейтинг',
    createGuild: 'Основать Гильдию',
    guildName: 'Название Гильдии',
    manifesto: 'Манифест (Описание)',
    members: 'Участники',
    join: 'Вступить',
    leave: 'Покинуть',
    full: 'Полная',
    confirmJoin: 'Вступить в гильдию?',
    confirmLeave: 'Покинуть гильдию?',
    joinText: 'Вы уверены, что хотите вступить в',
    leaveText: 'Вы уверены, что хотите покинуть',
    confirm: 'Подтвердить',
    myGuild: 'Моя Гильдия',
    messagePlaceholder: 'Сообщение гильдии...',
    challenge: 'Совместная тренировка',
    startingWorkout: 'Запуск совместной тренировки...',
    online: 'В сети',
    offline: 'Не в сети',

    // Shop
    merchant: 'Торговец',
    buy: 'Купить',
    locked: 'Закрыто',
    tooExpensive: 'Дорого',
    requiresLvl: 'Нужен уровень',
    noviceGear: 'Снаряжение Новичка',
    tier: 'Тир',
    purchased: 'Куплено',
    notEnoughGold: 'Недостаточно золота!',

    // Active Session
    reward: 'Награда',
    oracleGuidance: 'Совет Оракула',
    techniqueTip: 'Совет по Технике',
    restTimer: 'Таймер Отдыха',
    gotIt: 'Понятно',
    completeQuest: 'Завершить Квест',
    completed: 'Выполнено',

    // Evolution
    evolutionPath: 'Путь Эволюции',
    evolutionDesc: 'Твой путь от новичка до легенды. Тренируйся, чтобы открыть новые формы.',
    unlocked: 'Открыто',
    nextMilestone: 'Следующая цель',
    moreComing: 'Скоро будет больше',

    // Inventory
    equipment: 'Снаряжение',
    equip: 'Надеть',
    unequip: 'Снять',

    // Settings
    settings: 'Настройки',
    general: 'Общие',
    sound: 'Звуки',
    notifications: 'Уведомления',
    language: 'Язык',
    account: 'Аккаунт',
    privacy: 'Конфиденциальность',
    logout: 'Выйти',
    selectLanguage: 'Выберите Язык',
    english: 'Английский',
    russian: 'Русский'
  }
};

export const MOCK_USER: UserProfile = {
  id: 'u-123',
  username: 'IronLifter',
  class: ClassType.WARRIOR,
  level: 5,
  current_xp: 750,
  max_xp: 1200,
  gold: 450,
  attributes: {
    str: 18,
    sta: 12,
    will: 8,
  },
  stats: {
    squat_1rm: 140,
    bench_1rm: 100,
    deadlift_1rm: 180,
  },
  streak: 12,
  guildId: null,
};

export const MOCK_INVENTORY: InventoryItem[] = [
  {
    id: 'i-1',
    name: 'Rusty Dumbbell',
    type: 'weapon',
    rarity: 'common',
    statBonus: { str: 2 },
    image_url: 'https://picsum.photos/100/100',
    is_equipped: true,
  },
  {
    id: 'i-2',
    name: 'Sweatband of Focus',
    type: 'accessory',
    rarity: 'rare',
    statBonus: { will: 3 },
    image_url: 'https://picsum.photos/101/101',
    is_equipped: true,
  },
  {
    id: 'i-3',
    name: 'Canvas Sneakers',
    type: 'armor',
    rarity: 'common',
    statBonus: { sta: 1 },
    image_url: 'https://picsum.photos/102/102',
    is_equipped: false,
  },
];

export const MOCK_SHOP_ITEMS: ShopItem[] = [
  {
    id: 's-1',
    name: 'Protein Potion',
    type: 'consumable',
    rarity: 'common',
    price: 50,
    minLevel: 1,
    description: 'Instantly restores energy and boosts recovery.',
    image_url: 'https://picsum.photos/seed/potion/100/100',
  },
  {
    id: 's-4',
    name: 'Chalk of Grip',
    type: 'consumable',
    rarity: 'common',
    price: 25,
    minLevel: 1,
    description: 'Never let go. Increases grip strength for one session.',
    image_url: 'https://picsum.photos/seed/chalk/100/100',
  },
  {
    id: 's-2',
    name: 'Iron Belt',
    type: 'accessory',
    rarity: 'rare',
    price: 350,
    minLevel: 5,
    statBonus: { str: 5 },
    description: 'Increases core stability. Adds +5 STR.',
    image_url: 'https://picsum.photos/seed/belt/100/100',
  },
  {
    id: 's-3',
    name: 'Berserker Wraps',
    type: 'weapon',
    rarity: 'epic',
    price: 800,
    minLevel: 10,
    statBonus: { will: 8, str: 3 },
    description: 'Wrist wraps infused with ancient rage.',
    image_url: 'https://picsum.photos/seed/wraps/100/100',
  },
  {
    id: 's-5',
    name: 'Golden Dumbbell',
    type: 'weapon',
    rarity: 'legendary',
    price: 2500,
    minLevel: 20,
    statBonus: { str: 15 },
    description: 'Forged in the heart of a dying star.',
    image_url: 'https://picsum.photos/seed/golddumb/100/100',
  },
];

export const CAMPAIGN_MAP: WorkoutNode[] = [
  // CHAPTER 1
  {
    id: 'w-1',
    title: 'The Awakening',
    description: 'Basic full body conditioning to wake up your muscles.',
    type: 'story',
    status: 'completed',
    xpReward: 100,
    goldReward: 50,
    position: { x: 50, y: 10 },
    exercises: [],
    chapter: 1,
  },
  {
    id: 'w-2',
    title: 'Goblin Drill',
    description: 'High volume squats and pushups.',
    type: 'workout',
    status: 'completed',
    xpReward: 150,
    goldReward: 75,
    position: { x: 30, y: 30 },
    exercises: [
      { id: 'ex-1', name: 'Goblet Squat', sets: 3, reps: 12, weight: 20 },
      { id: 'ex-2', name: 'Pushups', sets: 3, reps: 15 },
    ],
    chapter: 1,
  },
  {
    id: 'w-3',
    title: 'Orc Stronghold',
    description: 'Heavy compound movements.',
    type: 'workout',
    status: 'available',
    xpReward: 300,
    goldReward: 120,
    position: { x: 70, y: 50 },
    exercises: [
      { id: 'ex-3', name: 'Barbell Squat', sets: 5, reps: 5, weight: 100 },
      { id: 'ex-4', name: 'Overhead Press', sets: 5, reps: 5, weight: 45 },
    ],
    chapter: 1,
  },
  {
    id: 'w-4',
    title: 'The Iron Giant',
    description: 'Boss Battle: Test your 1RM.',
    type: 'boss',
    status: 'locked',
    xpReward: 1000,
    goldReward: 500,
    position: { x: 50, y: 80 },
    exercises: [
      { id: 'ex-5', name: 'Deadlift PR Attempt', sets: 1, reps: 1, weight: 185 },
    ],
    chapter: 1,
  },
  // CHAPTER 2
  {
    id: 'w-5',
    title: 'Valley of Cardio',
    description: 'Endurance testing in the misty valley.',
    type: 'story',
    status: 'locked',
    xpReward: 200,
    goldReward: 100,
    position: { x: 50, y: 20 },
    exercises: [],
    chapter: 2,
  },
  {
    id: 'w-6',
    title: 'Troll Bridge',
    description: 'High intensity interval training.',
    type: 'workout',
    status: 'locked',
    xpReward: 350,
    goldReward: 150,
    position: { x: 20, y: 50 },
    exercises: [
        { id: 'ex-6', name: 'Burpees', sets: 4, reps: 15 },
        { id: 'ex-7', name: 'Jump Squats', sets: 4, reps: 20 },
    ],
    chapter: 2,
  }
];

export const MOCK_GUILDS: Guild[] = [
  { 
    id: 'g-1', 
    name: 'Iron Legion', 
    description: 'We lift heavy things and never skip leg day.', 
    members: 42, 
    maxMembers: 50, 
    totalXp: 150000, 
    rank: 1, 
    icon: 'shield' 
  },
  { 
    id: 'g-2', 
    name: 'Morning Crew', 
    description: '5AM workouts only. Discipline is key.', 
    members: 10, 
    maxMembers: 20, 
    totalXp: 112000, 
    rank: 2, 
    icon: 'zap' 
  },
  { 
    id: 'g-3', 
    name: 'Cardio Kings', 
    description: 'Run until you drop. Stamina builds character.', 
    members: 28, 
    maxMembers: 50, 
    totalXp: 98000, 
    rank: 3, 
    icon: 'sword' 
  },
  { 
    id: 'g-4', 
    name: 'Squat Squad', 
    description: 'Deep squats for deep thoughts.', 
    members: 33, 
    maxMembers: 40, 
    totalXp: 88000, 
    rank: 4, 
    icon: 'crown' 
  },
  { 
    id: 'g-5', 
    name: 'Flex & Chill', 
    description: 'Casual lifting and post-workout coffee.', 
    members: 15, 
    maxMembers: 30, 
    totalXp: 45000, 
    rank: 5, 
    icon: 'shield' 
  },
];

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  { id: 'm-1', senderId: 'u-55', senderName: 'GymRat99', text: 'Anyone hitting legs today?', timestamp: '10:30 AM' },
  { id: 'm-2', senderId: 'u-42', senderName: 'BuffWizard', text: 'Always. Never skip leg day.', timestamp: '10:32 AM' },
  { id: 'm-3', senderId: 'u-55', senderName: 'GymRat99', text: 'My squat max is stuck at 140kg though :/', timestamp: '10:33 AM' },
  { id: 'm-4', senderId: 'u-42', senderName: 'BuffWizard', text: 'Have you tried a deload week? Works wonders for the nervous system.', timestamp: '10:35 AM' },
];

export const MOCK_FRIENDS: Friend[] = [
  { 
    id: 'f-1', 
    username: 'SarahSquats', 
    level: 12, 
    class: ClassType.WARRIOR, 
    status: 'online',
    guildName: 'Iron Legion',
    stats: { squat_1rm: 120, bench_1rm: 65, deadlift_1rm: 140 }
  },
  { 
    id: 'f-2', 
    username: 'MikeMarathon', 
    level: 8, 
    class: ClassType.SCOUT, 
    status: 'offline', 
    lastSeen: '2h ago',
    guildName: 'Cardio Kings',
    stats: { squat_1rm: 80, bench_1rm: 60, deadlift_1rm: 100 }
  },
  { 
    id: 'f-3', 
    username: 'ZenMaster', 
    level: 15, 
    class: ClassType.MONK, 
    status: 'online',
    guildName: 'Morning Crew',
    stats: { squat_1rm: 100, bench_1rm: 80, deadlift_1rm: 130 }
  },
];

export const SPRITE_EVOLUTION: SpriteMilestone[] = [
  { level: 1, title: 'Novice', imageUrl: 'https://picsum.photos/seed/lvl1/200/200' },
  { level: 5, title: 'Apprentice', imageUrl: 'https://picsum.photos/seed/lvl5/200/200' },
  { level: 10, title: 'Adept', imageUrl: 'https://picsum.photos/seed/lvl10/200/200' },
  { level: 20, title: 'Expert', imageUrl: 'https://picsum.photos/seed/lvl20/200/200' },
  { level: 30, title: 'Master', imageUrl: 'https://picsum.photos/seed/lvl30/200/200' },
  { level: 50, title: 'Legend', imageUrl: 'https://picsum.photos/seed/lvl50/200/200' },
];
