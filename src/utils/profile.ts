import { UserProfile, CharacterAvatar, AvatarType } from '../types';

export const USER_PROFILE_KEY = 'las_user_profile';

export interface CharacterItem {
  id: CharacterAvatar;
  emoji: string;
  name: string;
}

export const CHARACTER_AVATARS: CharacterItem[] = [
  { id: 'smile', emoji: '🙂', name: '기본 얼굴' },
  { id: 'dog', emoji: '🐶', name: '강아지 친구' },
  { id: 'rabbit', emoji: '🐰', name: '토끼 친구' },
  { id: 'bear', emoji: '🐻', name: '곰 친구' },
  { id: 'sprout', emoji: '🌱', name: '새싹 친구' },
];

export const CHARACTER_AVATAR_MAP: Record<CharacterAvatar, CharacterItem> = {
  smile: { id: 'smile', emoji: '🙂', name: '기본 얼굴' },
  dog: { id: 'dog', emoji: '🐶', name: '강아지 친구' },
  rabbit: { id: 'rabbit', emoji: '🐰', name: '토끼 친구' },
  bear: { id: 'bear', emoji: '🐻', name: '곰 친구' },
  sprout: { id: 'sprout', emoji: '🌱', name: '새싹 친구' },
};

export const getDefaultUserProfile = (): UserProfile => ({
  name: '',
  role: 'challenger',
  avatarType: 'character',
  avatarValue: 'smile',
});

export const getUserProfile = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(USER_PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          ...parsed,
          role: 'challenger',
        } as UserProfile;
      }
    }
  } catch (e) {
    console.error('Error reading user profile from localStorage:', e);
  }

  // Fallback to legacy keys if las_user_profile does not exist yet
  const legacyNickname = localStorage.getItem('las_nickname');
  if (legacyNickname) {
    return {
      name: legacyNickname,
      role: 'challenger',
      avatarType: 'character',
      avatarValue: 'smile',
    };
  }

  return null;
};

export const saveUserProfile = (profile: UserProfile): void => {
  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
    // Keep las_nickname synced for any existing code that reads it directly
    if (profile.name) {
      localStorage.setItem('las_nickname', profile.name);
    }
  } catch (e) {
    console.error('Error saving user profile to localStorage:', e);
  }
};
