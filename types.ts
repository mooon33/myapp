export enum ClassType {
  WARRIOR = 'Warrior',
  SCOUT = 'Scout',
  MONK = 'Monk',
}

export interface Attributes {
  str: number; // Strength
  sta: number; // Endurance/Stamina
  will: number; // Discipline/Willpower
}

export interface Stats {
  squat_1rm: number;
  bench_1rm: number;
  deadlift_1rm: number;
}

export interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory' | 'consumable';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  statBonus?: Partial<Attributes>;
  image_url: string;
}

export interface ShopItem extends Item {
  price: number;
  description: string;
  minLevel: number; // Tier requirement
}

export interface UserProfile {
  id: string;
  username: string;
  class: ClassType;
  level: number;
  current_xp: number;
  max_xp: number;
  gold: number;
  attributes: Attributes;
  stats: Stats;
  streak: number;
  guildId: string | null; // Track current guild
}

export interface InventoryItem extends Item {
  is_equipped: boolean;
}

export interface WorkoutNode {
  id: string;
  title: string;
  description: string;
  type: 'workout' | 'boss' | 'story';
  status: 'locked' | 'available' | 'completed';
  xpReward: number;
  goldReward: number;
  exercises: Exercise[];
  position: { x: number; y: number }; // For map layout
  chapter: number; // New field for chapter organization
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number; // Target weight
  videoUrl?: string;
}

export interface WorkoutLog {
  id: string;
  program_id: string;
  completed_at: string;
  total_xp_earned: number;
}

export interface Guild {
  id: string;
  name: string;
  description: string;
  members: number;
  maxMembers: number;
  totalXp: number;
  rank: number;
  icon: 'shield' | 'sword' | 'crown' | 'zap';
}

export interface Friend {
  id: string;
  username: string;
  level: number;
  class: ClassType;
  status: 'online' | 'offline';
  lastSeen?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface AppSettings {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  language: 'en' | 'ru' | 'es';
  theme: 'dark' | 'light';
}

export interface SpriteMilestone {
  level: number;
  title: string;
  imageUrl: string;
}