export interface ChallengerFriend {
  userId: string;
  name: string;
  tag: string;
  avatarType: 'photo' | 'character';
  avatarUrl: string;
  characterEmoji: string;
  intro: string;
}

export const ALL_SAMPLE_FRIENDS: ChallengerFriend[] = [
  {
    userId: 'friend-kim',
    name: '김민수',
    tag: '#1842',
    avatarType: 'photo',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    characterEmoji: '🙂',
    intro: '오늘 5,000보 걷기 달성! 매일매일 건강하게 걸어요.'
  },
  {
    userId: 'friend-park',
    name: '박지훈',
    tag: '#2359',
    avatarType: 'photo',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    characterEmoji: '🐶',
    intro: '아침 스트레칭과 가벼운 운동으로 활기찬 하루를 열어요!'
  },
  {
    userId: 'friend-lee-jieun',
    name: '이지은',
    tag: '#3148',
    avatarType: 'photo',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    characterEmoji: '🐰',
    intro: '시원한 물 자주 마시기와 규칙적인 수면을 실천해요.'
  },
  {
    userId: 'friend-jeon',
    name: '전유지',
    tag: '#4792',
    avatarType: 'photo',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    characterEmoji: '🌱',
    intro: '골고루 식사하고 영양 가득 밥상을 매일 기록해요.'
  },
  {
    userId: 'friend-lee-seojin',
    name: '이서진',
    tag: '#5821',
    avatarType: 'photo',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    characterEmoji: '🐻',
    intro: '기분과 마음을 기록하며 따뜻한 하루를 만들어요.'
  }
];

export const STORAGE_KEYS = {
  FRIENDSHIPS: 'las_friendships',
  SENT_REQUESTS: 'las_sent_friend_requests',
  RECEIVED_REQUESTS: 'las_received_friend_requests'
} as const;

export const getDefaultFriendships = (currentUserName?: string): string[] => {
  const isKim = (currentUserName || '').trim() === '김민수';
  if (isKim) {
    return ['friend-lee-jieun', 'friend-jeon'];
  }
  return ['friend-kim', 'friend-lee-jieun', 'friend-jeon'];
};

export const getFriendships = (currentUserName?: string): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FRIENDSHIPS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to read las_friendships:', e);
  }
  const defaults = getDefaultFriendships(currentUserName);
  saveFriendships(defaults);
  return defaults;
};

export const getReceivedRequests = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECEIVED_REQUESTS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to read las_received_friend_requests:', e);
  }
  const defaults = ['friend-park'];
  saveReceivedRequests(defaults);
  return defaults;
};

export const getSentRequests = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SENT_REQUESTS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to read las_sent_friend_requests:', e);
  }
  const defaults: string[] = [];
  saveSentRequests(defaults);
  return defaults;
};

export const saveFriendships = (ids: string[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.FRIENDSHIPS, JSON.stringify(ids));
  } catch (e) {
    console.error('Failed to save las_friendships:', e);
  }
};

export const saveReceivedRequests = (ids: string[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.RECEIVED_REQUESTS, JSON.stringify(ids));
  } catch (e) {
    console.error('Failed to save las_received_friend_requests:', e);
  }
};

export const saveSentRequests = (ids: string[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SENT_REQUESTS, JSON.stringify(ids));
  } catch (e) {
    console.error('Failed to save las_sent_friend_requests:', e);
  }
};

export const resetFriendshipData = (currentUserName?: string) => {
  const friendships = getDefaultFriendships(currentUserName);
  const received = ['friend-park'];
  const sent: string[] = [];
  saveFriendships(friendships);
  saveReceivedRequests(received);
  saveSentRequests(sent);
  return { friendships, receivedRequests: received, sentRequests: sent };
};

export const getFriendById = (userId: string): ChallengerFriend | undefined => {
  return ALL_SAMPLE_FRIENDS.find((f) => f.userId === userId);
};
