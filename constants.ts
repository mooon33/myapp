import { UserProfile, ClassType, WorkoutNode, InventoryItem } from './types';

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

export const CAMPAIGN_MAP: WorkoutNode[] = [
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
  },
];