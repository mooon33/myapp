import { UserProfile, ClassType, WorkoutNode, InventoryItem, Guild, ChatMessage, ShopItem } from './types';

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
    description: 'Instantly restores energy and boosts recovery.',
    image_url: 'https://picsum.photos/seed/potion/100/100',
  },
  {
    id: 's-2',
    name: 'Iron Belt',
    type: 'accessory',
    rarity: 'rare',
    price: 350,
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
    statBonus: { will: 8, str: 3 },
    description: 'Wrist wraps infused with ancient rage.',
    image_url: 'https://picsum.photos/seed/wraps/100/100',
  },
  {
    id: 's-4',
    name: 'Chalk of Grip',
    type: 'consumable',
    rarity: 'common',
    price: 25,
    description: 'Never let go. Increases grip strength for one session.',
    image_url: 'https://picsum.photos/seed/chalk/100/100',
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