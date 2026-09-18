export type MealPeriod = 'morning' | 'lunch' | 'dinner' | 'snack';
export type MealType = 'healthy' | 'normal' | 'sweet';

export interface MealLog {
  id: string;
  date: string; // YYYY-MM-DD
  period: MealPeriod;
  photoUrl?: string;
  mealType: MealType;
  feedback?: string;
}

export interface HealthLog {
  date: string; // YYYY-MM-DD
  weight: number;
  sleepTime: string; // "23:00"
  wakeTime: string; // "07:00"
  sleepDurationMinutes: number; // calculated
  mood: number; // 1 to 5
}

export interface StepLog {
  date: string;
  count: number;
  goal: number;
  distanceKm: number;
  caloriesKcal: number;
}

export type CommunityTab = 'myPractice' | 'friendPractice';

export type PracticeCategory = 'physical' | 'mental' | 'social';

export type HealthCategory =
  | PracticeCategory
  | '신체적 건강'
  | '사회적 건강'
  | '정서적 건강'
  | '정신적 건강'
  | 'water'
  | 'walk'
  | 'meal'
  | 'exercise'
  | 'sleep'
  | 'mood'
  | '물 마시기'
  | '걷기'
  | '식사 기록'
  | '운동하기'
  | '수면 기록'
  | '기분 기록'
  | '식단'
  | '운동'
  | '기분'
  | '일상'
  | '신체활동';

export interface Comment {
  id: string;
  postId?: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  authorId?: string;
  authorName: string;
  authorAvatar?: string;
  authorAvatarType?: 'character' | 'photo';
  authorAvatarValue?: string;
  title?: string;
  category: HealthCategory | string;
  icon?: string;
  content: string;
  likes: number;
  hasLiked?: boolean;
  likedBy?: string[];
  createdAt: string;
  imageUrl?: string;
  comments?: Comment[];
  postScope?: 'myPractice' | 'friendPractice';
  isMine?: boolean;
}

export interface FriendProfile {
  id: string;
  name: string;
  avatarType: 'character' | 'photo';
  avatarValue: string;
  recordCount: number;
}

export interface WaterLog {
  date: string;
  count: number; // glasses drank
  goal: number;
}

export interface CelebrationPopupData {
  id: string;
  type: 'water' | 'steps' | 'meal' | 'sleep' | 'mood' | 'hospital' | 'family';
  title: string;
  message: string;
  rewardText?: string;
  stampText?: string;
}

export type AvatarType = 'character' | 'photo';
export type CharacterAvatar = 'smile' | 'dog' | 'rabbit' | 'bear' | 'sprout';

export interface UserProfile {
  name: string;
  role: 'challenger';
  avatarType: AvatarType;
  avatarValue: CharacterAvatar | string;
}

export type HealthGoalAnswer = 'yes' | 'no' | null;

export interface HealthGoalFootprint {
  physical: HealthGoalAnswer;
  social: HealthGoalAnswer;
  emotional: HealthGoalAnswer;
  isDemo?: boolean;
}

