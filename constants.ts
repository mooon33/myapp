
import { UserProfile, ClassType, WorkoutNode, InventoryItem, Guild, ChatMessage, ShopItem, Friend, SpriteMilestone, TrainingPath, Difficulty } from './types';

export const TRANSLATIONS = {
  en: {
    // Navigation
    map: 'Map',
    social: 'Social',
    avatar: 'Avatar',
    shop: 'Shop',
    hero: 'Hero',
    history: 'History',
    
    // Auth & Onboarding
    step3: 'Combat Readiness',
    selectPath: 'Select Discipline',
    bodybuilding: 'Bodybuilding (Hypertrophy)',
    powerlifting: 'Powerlifting (Strength)',
    customWorkout: 'AI Custom Program',
    
    // Custom AI
    aiPromptPlaceholder: 'e.g., "Leg day focusing on glutes" or "30 min intense cardio"',
    generateWorkout: 'Generate Workout',
    generating: 'Oracle is divining...',
    swapExercise: 'Swap',
    similarExercises: 'Alternative Exercises',
    selectReplacement: 'Select Replacement',
    noSubstitutes: 'No substitutes found.',
    needs1rm: 'Needs 1RM',

    // History
    noHistory: 'No battles recorded yet.',
    completedOn: 'Completed on',
    totalWorkouts: 'Total Raids',
    viewDetails: 'View Details',
    workoutDetails: 'Workout Log',
    noDetails: 'Details not available for this log.',

    // RPE
    rpeTitle: 'RPE Scale (Rate of Perceived Exertion)',
    rpe10: '10 - Max Effort (Failure)',
    rpe9: '9 - 1 Rep in Reserve',
    rpe8: '8 - 2 Reps in Reserve',
    rpe7: '7 - Move weight quickly',
    rpeDesc: 'RPE helps you choose the right weight. 10 is impossible to do more, 8 means you could do 2 more reps.',

    // General
    difficulty: 'Difficulty',
    beginner: 'Novice',
    intermediate: 'Adept',
    advanced: 'Elite',
    comingSoon: 'Coming Soon',
    
    // ... existing translations ...
    removeFriend: 'Remove Friend',
    acceptFriend: 'Accept',
    declineFriend: 'Decline',
    cancelRequest: 'Cancel Request',
    friendRequestReceived: 'sent you a friend request',
    pending: 'Pending',
    inviteToWorkout: 'Invite to Workout',
    workoutInvite: 'Workout Invite',
    acceptInvite: 'Accept Invite',
    declineInvite: 'Decline',
    partnerTraining: 'Partner Training',
    partnerProgress: 'Partner Progress',

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
    charCreation: 'Character Creation',
    step1: 'Physical Stats',
    step2: 'Choose Class',
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
    xp: 'XP',
    chapter: 'Chapter',
    campaign: 'Campaign',
    loading: 'Loading Realm...',
    levelUp: 'LEVEL UP!',
    questComplete: 'Quest Complete!',
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
    merchant: 'Merchant',
    buy: 'Buy',
    locked: 'Locked',
    tooExpensive: 'Too Expensive',
    requiresLvl: 'Requires Level',
    noviceGear: 'Novice Gear',
    tier: 'Tier',
    purchased: 'Purchased',
    notEnoughGold: 'Not enough gold!',
    reward: 'Reward',
    oracleGuidance: 'Oracle Guidance',
    techniqueTip: 'Technique Tip',
    restTimer: 'Rest Timer',
    gotIt: 'Got it',
    completeQuest: 'Complete Quest',
    completed: 'Completed',
    avatarTitle: 'Hero Avatar',
    bodyProgress: 'Body Evolution',
    nextForm: 'Next Form',
    maxForm: 'Peak Physique Reached',
    inventory: 'Inventory',
    equipped: 'Equipped',
    emptySlot: 'Empty',
    equipment: 'Equipment',
    equip: 'Equip',
    unequip: 'Unequip',
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
    russian: 'Russian',
    evolutionPath: 'Evolution Path',
    evolutionDesc: 'Transform your physique as you level up.',
    unlocked: 'Unlocked',
    nextMilestone: 'Next Milestone',
    moreComing: 'More Coming Soon',
    noFriends: 'No friends found. Add some to get started!',
    noMembers: 'No members info available',
    selfAddError: 'You cannot add yourself.',
    alreadyFriends: 'Already friends.',
    requestPending: 'Request pending.',
    networkError: 'Network error.',
    sendError: 'Failed to send.',
  },
  ru: {
    // Navigation
    map: 'Карта',
    social: 'Союз',
    avatar: 'Аватар',
    shop: 'Магазин',
    hero: 'Герой',
    history: 'История',

    // Auth & Onboarding
    step3: 'Боевая готовность',
    selectPath: 'Выберите путь',
    bodybuilding: 'Бодибилдинг (Гипертрофия)',
    powerlifting: 'Пауэрлифтинг (Сила)',
    customWorkout: 'ИИ Тренировка',
    
    // Custom AI
    aiPromptPlaceholder: 'Например: "День ног с акцентом на ягодицы" или "30 минут кардио"',
    generateWorkout: 'Создать Тренировку',
    generating: 'Оракул предсказывает...',
    swapExercise: 'Заменить',
    similarExercises: 'Похожие упражнения',
    selectReplacement: 'Выберите замену',
    noSubstitutes: 'Замены не найдены.',
    needs1rm: 'Нужен 1ПМ',

    // History
    noHistory: 'Битв пока не зафиксировано.',
    completedOn: 'Завершено',
    totalWorkouts: 'Всего рейдов',
    viewDetails: 'Детали',
    workoutDetails: 'Журнал Тренировки',
    noDetails: 'Детали недоступны для этой записи.',

    // RPE
    rpeTitle: 'Шкала RPE (Уровень Усилий)',
    rpe10: '10 - Отказ (Максимум)',
    rpe9: '9 - 1 повтор в запасе',
    rpe8: '8 - 2 повтора в запасе',
    rpe7: '7 - Тяжело, но быстро',
    rpeDesc: 'RPE помогает выбрать вес. 10 - больше не сделать, 8 - можно сделать еще 2 раза.',

    difficulty: 'Сложность',
    beginner: 'Новичок',
    intermediate: 'Любитель',
    advanced: 'Элита',
    comingSoon: 'Скоро',

    // ... existing translations ...
    removeFriend: 'Удалить друга',
    acceptFriend: 'Принять',
    declineFriend: 'Отклонить',
    cancelRequest: 'Отменить заявку',
    friendRequestReceived: 'отправил заявку в друзья',
    pending: 'Ожидание',
    inviteToWorkout: 'Пригласить на тренировку',
    workoutInvite: 'Приглашение',
    acceptInvite: 'Принять',
    declineInvite: 'Отклонить',
    partnerTraining: 'Парная тренировка',
    partnerProgress: 'Прогресс партнера',

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
    charCreation: 'Создание Персонажа',
    step1: 'Физические Данные',
    step2: 'Выберите Класс',
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
    xp: 'Опыт',
    chapter: 'Глава',
    campaign: 'Кампания',
    loading: 'Загрузка мира...',
    levelUp: 'НОВЫЙ УРОВЕНЬ!',
    questComplete: 'Квест Завершен!',
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
    merchant: 'Торговец',
    buy: 'Купить',
    locked: 'Закрыто',
    tooExpensive: 'Дорого',
    requiresLvl: 'Нужен уровень',
    noviceGear: 'Снаряжение Новичка',
    tier: 'Тир',
    purchased: 'Куплено',
    notEnoughGold: 'Недостаточно золота!',
    reward: 'Награда',
    oracleGuidance: 'Совет Оракула',
    techniqueTip: 'Совет по Технике',
    restTimer: 'Таймер Отдыха',
    gotIt: 'Понятно',
    completeQuest: 'Завершить Квест',
    completed: 'Выполнено',
    avatarTitle: 'Аватар Героя',
    bodyProgress: 'Эволюция Тела',
    nextForm: 'Следующая Форма',
    maxForm: 'Пиковая Форма',
    inventory: 'Инвентарь',
    equipped: 'Надето',
    emptySlot: 'Пусто',
    equipment: 'Снаряжение',
    equip: 'Надеть',
    unequip: 'Снять',
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
    russian: 'Русский',
    evolutionPath: 'Путь Эволюции',
    evolutionDesc: 'Изменяйте свое тело по мере повышения уровня.',
    unlocked: 'Открыто',
    nextMilestone: 'Следующая цель',
    moreComing: 'Скоро будет больше',
    noFriends: 'Друзей пока нет. Добавьте кого-нибудь!',
    noMembers: 'Информация об участниках недоступна',
    selfAddError: 'Нельзя добавить самого себя.',
    alreadyFriends: 'Вы уже друзья.',
    requestPending: 'Заявка уже отправлена.',
    networkError: 'Ошибка сети.',
    sendError: 'Ошибка отправки.',
  }
};

export const MOCK_USER: UserProfile = {
  id: 'u-123',
  username: 'IronLifter',
  class: ClassType.WARRIOR,
  trainingPath: TrainingPath.BODYBUILDING,
  difficulty: Difficulty.INTERMEDIATE,
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
  completedWorkouts: [], 
};

export const MOCK_INVENTORY: InventoryItem[] = [
  {
    id: 'i-1',
    name: 'Ржавая Гантель',
    type: 'weapon',
    rarity: 'common',
    statBonus: { str: 2 },
    image_url: 'https://picsum.photos/100/100',
    is_equipped: true,
  },
  {
    id: 'i-2',
    name: 'Повязка Фокуса',
    type: 'accessory',
    rarity: 'rare',
    statBonus: { will: 3 },
    image_url: 'https://picsum.photos/101/101',
    is_equipped: true,
  },
  {
    id: 'i-3',
    name: 'Старые Кеды',
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
    name: 'Протеиновое Зелье',
    type: 'consumable',
    rarity: 'common',
    price: 50,
    minLevel: 1,
    description: 'Мгновенно восстанавливает энергию и ускоряет восстановление.',
    image_url: 'https://picsum.photos/seed/potion/100/100',
  },
  {
    id: 's-4',
    name: 'Магнезия Хвата',
    type: 'consumable',
    rarity: 'common',
    price: 25,
    minLevel: 1,
    description: 'Больше не соскользнет. Увеличивает силу хвата на одну сессию.',
    image_url: 'https://picsum.photos/seed/chalk/100/100',
  },
  {
    id: 's-2',
    name: 'Железный Пояс',
    type: 'accessory',
    rarity: 'rare',
    price: 350,
    minLevel: 5,
    statBonus: { str: 5 },
    description: 'Укрепляет кор. Добавляет +5 к Силе.',
    image_url: 'https://picsum.photos/seed/belt/100/100',
  },
  {
    id: 's-3',
    name: 'Напульсники Берсерка',
    type: 'weapon',
    rarity: 'epic',
    price: 800,
    minLevel: 10,
    statBonus: { will: 8, str: 3 },
    description: 'Напульсники, пропитанные древней яростью.',
    image_url: 'https://picsum.photos/seed/wraps/100/100',
  },
  {
    id: 's-5',
    name: 'Золотая Гантель',
    type: 'weapon',
    rarity: 'legendary',
    price: 2500,
    minLevel: 20,
    statBonus: { str: 15 },
    description: 'Выкована в сердце умирающей звезды.',
    image_url: 'https://picsum.photos/seed/golddumb/100/100',
  },
];

// --- EXTENDED CAMPAIGN MAPS (4 Weeks / 12 Workouts) ---

const BODYBUILDING_MAP: WorkoutNode[] = [];
const POWERLIFTING_MAP: WorkoutNode[] = [];

// Helper to generate positions
const getPos = (week: number, day: number) => {
    const baseX = day === 1 ? 50 : day === 2 ? 25 : 75;
    const baseY = (week - 1) * 120 + (day * 30);
    return { x: baseX, y: baseY };
};

// --- BODYBUILDING GENERATION (Upper/Lower/Full) ---
for (let w = 1; w <= 4; w++) {
    const isDeload = w === 4;
    const xpBase = 150 + (w * 10);
    const goldBase = 50 + (w * 5);
    
    // Day 1: Upper
    BODYBUILDING_MAP.push({
        id: `bb-w${w}-d1`, 
        title: `Неделя ${w}: Верх тела`, 
        description: isDeload ? 'Легкая тренировка, восстановление.' : 'Акцент на гипертрофию.',
        type: 'workout', status: w === 1 ? 'available' : 'locked', 
        xpReward: isDeload ? 100 : xpBase, goldReward: goldBase, 
        position: getPos(w, 1), chapter: w,
        exercises: [
            { id: `bb-w${w}-d1-1`, name: 'Жим лежа (наклон)', sets: 3, reps: isDeload ? '12' : '8-12', rpe: isDeload ? 6 : 8 },
            { id: `bb-w${w}-d1-2`, name: 'Тяга верхнего блока', sets: 3, reps: '10-15', rpe: isDeload ? 6 : 8 },
            { id: `bb-w${w}-d1-3`, name: 'Армейский жим', sets: 3, reps: '10-12', rpe: isDeload ? 6 : 8 },
            { id: `bb-w${w}-d1-4`, name: 'Сведение рук (кроссовер)', sets: 3, reps: '15-20', rpe: 9 },
            { id: `bb-w${w}-d1-5`, name: 'Сгибание на бицепс', sets: 3, reps: '12-15', rpe: 9 }
        ]
    });

    // Day 2: Lower
    BODYBUILDING_MAP.push({
        id: `bb-w${w}-d2`, 
        title: `Неделя ${w}: Низ тела`, 
        description: 'Рост ног.',
        type: 'workout', status: 'locked', 
        xpReward: xpBase, goldReward: goldBase, 
        position: getPos(w, 2), chapter: w,
        exercises: [
            { id: `bb-w${w}-d2-1`, name: 'Приседания', sets: 3, reps: '8-10', rpe: isDeload ? 6 : 8 },
            { id: `bb-w${w}-d2-2`, name: 'Румынская тяга', sets: 3, reps: '10-12', rpe: isDeload ? 6 : 8 },
            { id: `bb-w${w}-d2-3`, name: 'Жим ногами', sets: 3, reps: '12-15', rpe: 8 },
            { id: `bb-w${w}-d2-4`, name: 'Подъем на носки', sets: 4, reps: '15-20', rpe: 9 },
            { id: `bb-w${w}-d2-5`, name: 'Подъем ног в висе', sets: 3, reps: '15', rpe: 8 }
        ]
    });

    // Day 3: Full Body / Weak Points
    BODYBUILDING_MAP.push({
        id: `bb-w${w}-d3`, 
        title: `Неделя ${w}: Все тело`, 
        description: isDeload ? 'Активный отдых.' : 'Высокая интенсивность.',
        type: w === 4 ? 'boss' : 'workout', status: 'locked', 
        xpReward: xpBase + 50, goldReward: goldBase + 20, 
        position: getPos(w, 3), chapter: w,
        exercises: [
            { id: `bb-w${w}-d3-1`, name: 'Становая тяга', sets: 3, reps: '6-8', rpe: isDeload ? 5 : 8 },
            { id: `bb-w${w}-d3-2`, name: 'Отжимания на брусьях', sets: 3, reps: 'Отказ', customNote: 'Максимум' },
            { id: `bb-w${w}-d3-3`, name: 'Подтягивания', sets: 3, reps: 'Отказ', customNote: 'Максимум' },
            { id: `bb-w${w}-d3-4`, name: 'Махи в стороны', sets: 4, reps: '15-20', customNote: 'Дроп-сет' },
            { id: `bb-w${w}-d3-5`, name: 'Разгибания на трицепс', sets: 3, reps: '12-15', rpe: 9 }
        ]
    });
}

// --- POWERLIFTING GENERATION (SBD Focus + Accessories) ---
for (let w = 1; w <= 4; w++) {
    const isPeak = w === 4;
    const xpBase = 160 + (w * 10);
    const goldBase = 60 + (w * 5);

    // Day 1: Squat Focus
    POWERLIFTING_MAP.push({
        id: `pl-w${w}-d1`, 
        title: `Неделя ${w}: Присед`, 
        description: 'Базовая сила ног.',
        type: 'workout', status: w === 1 ? 'available' : 'locked', 
        xpReward: xpBase, goldReward: goldBase, 
        position: getPos(w, 1), chapter: w,
        exercises: [
            { id: `pl-w${w}-d1-1`, name: 'Соревновательный Присед', sets: isPeak ? 3 : 5, reps: isPeak ? 1 : 5, percent1rm: isPeak ? 0.90 : 0.70, targetStat: 'squat_1rm' },
            { id: `pl-w${w}-d1-2`, name: 'Жим лежа с паузой', sets: 4, reps: 4, rpe: 7 },
            { id: `pl-w${w}-d1-3`, name: 'Сплит-присед', sets: 3, reps: 8, rpe: 7 },
            { id: `pl-w${w}-d1-4`, name: 'Планка', sets: 3, reps: '60с', rpe: 8 }
        ]
    });

    // Day 2: Bench Focus
    POWERLIFTING_MAP.push({
        id: `pl-w${w}-d2`, 
        title: `Неделя ${w}: Жим`, 
        description: 'Сила грудных и трицепса.',
        type: 'workout', status: 'locked', 
        xpReward: xpBase, goldReward: goldBase, 
        position: getPos(w, 2), chapter: w,
        exercises: [
            { id: `pl-w${w}-d2-1`, name: 'Соревновательный Жим', sets: isPeak ? 3 : 5, reps: isPeak ? 1 : 5, percent1rm: isPeak ? 0.92 : 0.70, targetStat: 'bench_1rm' },
            { id: `pl-w${w}-d2-2`, name: 'Жим узким хватом', sets: 3, reps: 8, rpe: 8 },
            { id: `pl-w${w}-d2-3`, name: 'Тяга в наклоне', sets: 4, reps: 8, rpe: 8 },
            { id: `pl-w${w}-d2-4`, name: 'Лицевая тяга', sets: 3, reps: 15, rpe: 8 },
            { id: `pl-w${w}-d2-5`, name: 'Разгибание на трицепс', sets: 3, reps: 12, rpe: 9 }
        ]
    });

    // Day 3: Deadlift Focus
    POWERLIFTING_MAP.push({
        id: `pl-w${w}-d3`, 
        title: `Неделя ${w}: Тяга`, 
        description: 'Становая тяга и спина.',
        type: isPeak ? 'boss' : 'workout', status: 'locked', 
        xpReward: xpBase + 40, goldReward: goldBase + 30, 
        position: getPos(w, 3), chapter: w,
        exercises: [
            { id: `pl-w${w}-d3-1`, name: 'Становая Тяга', sets: isPeak ? 2 : 5, reps: isPeak ? 1 : 3, percent1rm: isPeak ? 0.90 : 0.75, targetStat: 'deadlift_1rm' },
            { id: `pl-w${w}-d3-2`, name: 'Фронтальный присед', sets: 3, reps: 6, rpe: 7 },
            { id: `pl-w${w}-d3-3`, name: 'Подтягивания', sets: 3, reps: 'Макс', rpe: 9 },
            { id: `pl-w${w}-d3-4`, name: 'Сгибание ног', sets: 3, reps: 12, rpe: 8 },
            { id: `pl-w${w}-d3-5`, name: 'Бицепс', sets: 3, reps: 10, rpe: 8 }
        ]
    });
}

const CUSTOM_MAP: WorkoutNode[] = [];

export const CAMPAIGN_DATA: Record<TrainingPath, WorkoutNode[]> = {
    [TrainingPath.BODYBUILDING]: BODYBUILDING_MAP,
    [TrainingPath.POWERLIFTING]: POWERLIFTING_MAP,
    [TrainingPath.CUSTOM]: CUSTOM_MAP,
};

export const MOCK_GUILDS: Guild[] = [
  { 
    id: 'g-1', name: 'Железный Легион', description: 'Мы поднимаем тяжести и никогда не пропускаем день ног.', 
    members: 42, maxMembers: 50, totalXp: 150000, rank: 1, icon: 'shield' 
  },
  { 
    id: 'g-2', name: 'Утренняя Банда', description: 'Только тренировки в 5 утра. Дисциплина - ключ к успеху.', 
    members: 10, maxMembers: 20, totalXp: 112000, rank: 2, icon: 'zap' 
  },
];

export const SPRITE_EVOLUTION: SpriteMilestone[] = [
  { 
    level: 1, title: 'Новичок', 
    imageUrl: 'https://ygvpycmjsrfxismnszir.supabase.co/storage/v1/object/public/avatars/1.png'
  },
  { 
    level: 10, title: 'Атлет', 
    imageUrl: 'https://ygvpycmjsrfxismnszir.supabase.co/storage/v1/object/public/avatars/2.png'
  },
  { 
    level: 30, title: 'Машина', 
    imageUrl: 'https://ygvpycmjsrfxismnszir.supabase.co/storage/v1/object/public/avatars/3.png'
  },
];
