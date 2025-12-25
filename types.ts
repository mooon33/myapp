
export enum ClassType {
  WARRIOR = 'Warrior',
  SCOUT = 'Scout',
  MONK = 'Monk',
}

export enum TrainingPath {
  BODYBUILDING = 'Bodybuilding',
  POWERLIFTING = 'Powerlifting',
  CROSSFIT = 'Crossfit',
  HOME = 'Home Workout',
  STRETCHING = 'Yoga & Stretching'
}

export enum Difficulty {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
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
  [key: string]: number; // Allow index signature
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
  trainingPath?: TrainingPath;
  difficulty?: Difficulty;
  programMode?: 'normal' | 'heavy'; // New field for Powerlifting logic
  level: number;
  current_xp: number;
  max_xp: number;
  gold: number;
  attributes: Attributes;
  stats: Stats;
  streak: number;
  guildId: string | null; // Track current guild
  completedWorkouts: string[]; // Track IDs of completed nodes to unlock next ones
  gender?: 'male' | 'female' | 'other';
  height?: number; // cm
  weight?: number; // kg
  avatar_url?: string; // Custom uploaded avatar
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
  reps: number | string; // Changed to allow "Test" or "1RM" text
  weight?: number; // Fixed weight fallback
  videoUrl?: string;
  // New fields for complex excel logic
  percent1rm?: number; // e.g., 0.75 for 75%
  targetStat?: 'squat_1rm' | 'bench_1rm' | 'deadlift_1rm'; // Which stat to use
  rpe?: number; // Rate of Perceived Exertion (optional alternative)
  customNote?: string; // For things like "Test" or custom instructions
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
  id: string; // The ID of the friendship record
  friendId: string; // The ID of the user
  username: string;
  level: number;
  class: ClassType;
  status: 'pending' | 'accepted'; // Friendship status
  isSender: boolean; // Did I send the request?
  lastSeen?: string;
  guildName?: string;
  stats?: Stats;
}

export interface ChatMessage {
  id: string;
  guild_id: string;
  user_id: string; // senderId
  username: string; // senderName (joined)
  content: string; // text
  created_at: string; // timestamp
}

export interface WorkoutInvite {
  id: string;
  senderId: string;
  senderName: string;
  workoutId: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface AppSettings {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  language: 'en' | 'ru';
  // Theme removed
}

export interface SpriteMilestone {
  level: number;
  title: string;
  imageUrl: string;
}
