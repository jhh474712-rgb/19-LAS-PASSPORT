import React, { useState, useEffect } from 'react';
import { 
  MealLog, 
  HealthLog, 
  StepLog, 
  WaterLog, 
  CommunityPost,
  Comment,
  CelebrationPopupData,
  UserProfile,
  HealthCategory,
  HealthGoalFootprint,
  HealthGoalAnswer
} from './types';
import { getUserProfile } from './utils/profile';
import { 
  getLocalDateKey, 
  getHealthGoalFootprint, 
  saveHealthGoalFootprint, 
  getHealthGoalFootprintKey,
  cleanTodayDemoData,
  ensureDemoFootprintRecords
} from './utils/date';
import HomeView from './components/HomeView';
import PracticeHubView, { PracticeAnswer, PracticeAnswers } from './components/PracticeHubView';
import MealLogView from './components/MealLogView';
import StretchingView from './components/StretchingView';
import HealthLogView from './components/HealthLogView';
import PedometerView from './components/PedometerView';
import CommunityView from './components/CommunityView';
import MyInfoView from './components/MyInfoView';
import VideoPlaceholderView from './components/VideoPlaceholderView';
import BottomNavBar from './components/BottomNavBar';
import OnboardingView, { OnboardingStep } from './components/OnboardingView';
import { normalizeCategory } from './utils/category';
import { Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Default mock community posts
const DEFAULT_POSTS: CommunityPost[] = [
  {
    id: 'post-kim',
    authorId: 'friend-kim',
    authorName: '김민수',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    category: '신체적 건강',
    content: '오늘 5,000보 걷기를 해냈어요. 조금 힘들었지만 끝까지 걸어서 기분이 좋아요!',
    likes: 8,
    hasLiked: false,
    createdAt: '오늘 오후 3:10',
    comments: [],
    postScope: 'friendPractice',
    isMine: false
  },
  {
    id: 'post-park',
    authorId: 'friend-park',
    authorName: '박지훈',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    category: '신체적 건강',
    content: '아침에 10분 스트레칭을 했어요. 몸이 가벼워졌어요!',
    likes: 12,
    hasLiked: false,
    createdAt: '오늘 오전 8:15',
    comments: [],
    postScope: 'friendPractice',
    isMine: false
  },
  {
    id: 'post-lee-jieun',
    authorId: 'friend-lee-jieun',
    authorName: '이지은',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    category: '신체적 건강',
    content: '오늘 물을 자주 마시려고 노력했어요. 건강해지는 느낌이에요!',
    likes: 15,
    hasLiked: false,
    createdAt: '오늘 오후 1:20',
    comments: [],
    postScope: 'friendPractice',
    isMine: false
  },
  {
    id: 'post-jeon',
    authorId: 'friend-jeon',
    authorName: '전유지',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    category: '신체적 건강',
    content: '오늘 먹은 밥을 기록했어요. 내 건강을 잘 챙긴 것 같아요!',
    likes: 20,
    hasLiked: false,
    createdAt: '오늘 오후 2:40',
    comments: [
      {
        id: 'comment-jeon-1',
        authorName: '민수 엄마',
        content: '스스로 식사 챙기는 모습이 참 기특하고 멋져요! 화이팅! 👏',
        createdAt: '오늘 오후 3:05'
      }
    ],
    postScope: 'friendPractice',
    isMine: false
  },
  {
    id: 'post-lee-seojin',
    authorId: 'friend-lee-seojin',
    authorName: '이서진',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    category: '정서적 건강',
    content: '오늘 기분을 기록했어요. 내 마음을 알아보는 시간이 좋았어요!',
    likes: 18,
    hasLiked: false,
    createdAt: '오늘 오후 4:20',
    comments: [
      {
        id: 'comment-lee-seojin-1',
        authorName: '지은이 엄마',
        content: '오늘도 마음을 잘 돌아봤네요 서진 학생! 매일 건강하게 응원해요! ❤️',
        createdAt: '오늘 오후 5:10'
      }
    ],
    postScope: 'friendPractice',
    isMine: false
  }
];

export default function App() {
  const todayStr = new Date().toISOString().split('T')[0];

  // 0. Onboarding State
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    return localStorage.getItem('las_onboarded') === 'true';
  });
  const [userRole, setUserRole] = useState<string>(() => {
    const role = localStorage.getItem('las_user_role');
    if (role === 'together' || role === 'parent') {
      localStorage.setItem('las_user_role', 'challenger');
      return 'challenger';
    }
    return role || 'challenger';
  });
  const [nickname, setNickname] = useState<string>(() => {
    return localStorage.getItem('las_nickname') || '김민수';
  });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    return getUserProfile();
  });
  const [onboardingInitialStep, setOnboardingInitialStep] = useState<OnboardingStep>('splash');
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Companion States (Default is 'rami' / '라미')
  const [companion, setCompanion] = useState<string>(() => {
    return localStorage.getItem('las_companion') || 'rami';
  });
  const [companionName, setCompanionName] = useState<string>(() => {
    return localStorage.getItem('las_companion_name') || '라미';
  });
  const [companionLevel, setCompanionLevel] = useState<number>(() => {
    return parseInt(localStorage.getItem('las_companion_level') || '1');
  });
  const [companionStars, setCompanionStars] = useState<number>(() => {
    return parseInt(localStorage.getItem('las_companion_stars') || '0');
  });
  const [equippedItem, setEquippedItem] = useState<string | null>(() => {
    return localStorage.getItem('las_equipped_item') || null;
  });
  const [unlockedItems, setUnlockedItems] = useState<string[]>(() => {
    const saved = localStorage.getItem('las_unlocked_items');
    return saved ? JSON.parse(saved) : [];
  });
  const [completedMissions, setCompletedMissions] = useState<string[]>(() => {
    const saved = localStorage.getItem('las_completed_missions');
    return saved ? JSON.parse(saved) : [];
  });
  const [praiseCardReceived, setPraiseCardReceived] = useState<boolean>(() => {
    return localStorage.getItem('las_praise_received') === 'true';
  });
  const [praiseMessageText, setPraiseMessageText] = useState<string>(() => {
    return localStorage.getItem('las_praise_message') || '';
  });

  // Health Goal Footprint State
  const [todayFootprint, setTodayFootprint] = useState<HealthGoalFootprint>(() => {
    const todayKey = getLocalDateKey();
    cleanTodayDemoData(todayKey);
    ensureDemoFootprintRecords();
    return getHealthGoalFootprint(todayKey);
  });

  const handleUpdateFootprintAnswer = (category: 'physical' | 'social' | 'emotional', answer: HealthGoalAnswer) => {
    const todayKey = getLocalDateKey();
    setTodayFootprint((prev) => {
      const updated: HealthGoalFootprint = {
        ...prev,
        [category]: answer,
      };
      saveHealthGoalFootprint(todayKey, updated);
      return updated;
    });
  };

  // 1. Navigation State
  const [activeTab, setActiveTab] = useState<string>('home');
  const [activeSubpage, setActiveSubpage] = useState<string | null>(null);

  // 2. Health & Log States
  const [mealLogs, setMealLogs] = useState<MealLog[]>(() => {
    const saved = localStorage.getItem('las_meals');
    return saved ? JSON.parse(saved) : [];
  });

  const [healthLog, setHealthLog] = useState<HealthLog | null>(() => {
    const saved = localStorage.getItem(`las_health_${todayStr}`);
    return saved ? JSON.parse(saved) : null;
  });

  const [stepLog, setStepLog] = useState<StepLog>(() => {
    const saved = localStorage.getItem(`las_steps_${todayStr}`);
    return saved ? JSON.parse(saved) : {
      date: todayStr,
      count: 0,
      goal: 5000,
      distanceKm: 0,
      caloriesKcal: 0
    };
  });

  const [waterLog, setWaterLog] = useState<WaterLog>(() => {
    const saved = localStorage.getItem(`las_water_${todayStr}`);
    return saved ? JSON.parse(saved) : {
      date: todayStr,
      count: 0,
      goal: 7
    };
  });

  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(() => {
    const saved = localStorage.getItem('las_community_posts') || localStorage.getItem('las_posts');
    let postsList: CommunityPost[] = saved ? JSON.parse(saved) : DEFAULT_POSTS;
    // Filter out unwanted legacy mock post
    postsList = postsList.filter((post) => {
      const isUnwanted = 
        (post.authorName === '김민수' && (
          post.content.includes('아침에 산책') || 
          post.content.includes('기분이 좋아요') || 
          post.imageUrl?.includes('photo-1546069901-ba9599a7e63c')
        )) ||
        post.content?.includes('images.unsplash.com/photo-1546069901-ba9599a7e63c');
      return !isUnwanted;
    });

    // Ensure all 5 default friend posts are guaranteed if no posts exist
    if (postsList.length === 0) {
      return DEFAULT_POSTS;
    }

    // Ensure posts for '김민수', '박지훈', '이지은', '전유지', '이서진' are present
    const baseFriends = ['김민수', '박지훈', '이지은', '전유지', '이서진'];
    baseFriends.forEach((friendName) => {
      const exists = postsList.some((p) => p.authorName === friendName);
      if (!exists) {
        const defaultPost = DEFAULT_POSTS.find((p) => p.authorName === friendName);
        if (defaultPost) postsList.push(defaultPost);
      }
    });

    // Convert legacy/saved categories to the 3 standard categories:
    // 물 마시기, 걷기, 식사 기록, 운동하기, 수면 기록 -> 신체적 건강
    // 기분 기록, 정신적 건강 -> 정서적 건강
    // 사회적 건강 -> 사회적 건강
    postsList = postsList.map((p) => ({
      ...p,
      category: normalizeCategory(p.category)
    }));

    return postsList;
  });

  const [recentAction, setRecentAction] = useState<string | null>(null);
  
  // Celebration Popup Queue State
  const [celebrationQueue, setCelebrationQueue] = useState<CelebrationPopupData[]>([]);

  const triggerCelebration = (data: Omit<CelebrationPopupData, 'id'>) => {
    const newCelebration: CelebrationPopupData = {
      ...data,
      id: `${data.type}-${Date.now()}`
    };
    setCelebrationQueue((prev) => {
      // Check if a celebration of this type is already in the queue to prevent double triggers in rapid updates
      if (prev.some(item => item.type === data.type)) return prev;
      return [...prev, newCelebration];
    });
  };
  const [appointmentKept, setAppointmentKept] = useState<boolean>(() => {
    return localStorage.getItem(`las_appointment_kept_${todayStr}`) === 'true';
  });
  const [hasAppointmentToday, setHasAppointmentToday] = useState<boolean>(() => {
    const saved = localStorage.getItem(`las_has_appointment_today_${todayStr}`);
    return saved ? saved === 'true' : true;
  });

  // 2-1. Practice Answers State (shared single source of truth for today)
  const [practiceAnswers, setPracticeAnswers] = useState<PracticeAnswers>(() => {
    try {
      const saved = localStorage.getItem(`las_practice_answers_${todayStr}`);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error('Failed to parse practice answers:', e);
      return {};
    }
  });

  const handleTogglePracticeAnswer = (goalId: string, answer: 'yes' | 'no') => {
    setPracticeAnswers((prev) => {
      const current = prev[goalId];
      const nextValue: PracticeAnswer = current === answer ? null : answer;
      const updated: PracticeAnswers = {
        ...prev,
        [goalId]: nextValue,
      };
      try {
        localStorage.setItem(`las_practice_answers_${todayStr}`, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save practice answers:', e);
      }
      return updated;
    });
  };

  // Synchronizers to localStorage
  useEffect(() => {
    localStorage.setItem('las_meals', JSON.stringify(mealLogs));
  }, [mealLogs]);

  useEffect(() => {
    if (healthLog) {
      localStorage.setItem(`las_health_${todayStr}`, JSON.stringify(healthLog));
    } else {
      localStorage.removeItem(`las_health_${todayStr}`);
    }
  }, [healthLog, todayStr]);

  useEffect(() => {
    localStorage.setItem(`las_steps_${todayStr}`, JSON.stringify(stepLog));
  }, [stepLog, todayStr]);

  useEffect(() => {
    localStorage.setItem(`las_water_${todayStr}`, JSON.stringify(waterLog));
  }, [waterLog, todayStr]);

  useEffect(() => {
    localStorage.setItem('las_community_posts', JSON.stringify(communityPosts));
    localStorage.setItem('las_posts', JSON.stringify(communityPosts));
  }, [communityPosts]);

  useEffect(() => {
    if (companion) {
      localStorage.setItem('las_companion', companion);
    } else {
      localStorage.removeItem('las_companion');
    }
  }, [companion]);

  useEffect(() => {
    localStorage.setItem('las_companion_name', companionName);
  }, [companionName]);

  useEffect(() => {
    localStorage.setItem('las_companion_level', companionLevel.toString());
  }, [companionLevel]);

  useEffect(() => {
    localStorage.setItem('las_companion_stars', companionStars.toString());
  }, [companionStars]);

  useEffect(() => {
    if (equippedItem) {
      localStorage.setItem('las_equipped_item', equippedItem);
    } else {
      localStorage.removeItem('las_equipped_item');
    }
  }, [equippedItem]);

  useEffect(() => {
    localStorage.setItem('las_unlocked_items', JSON.stringify(unlockedItems));
  }, [unlockedItems]);

  useEffect(() => {
    localStorage.setItem('las_completed_missions', JSON.stringify(completedMissions));
  }, [completedMissions]);

  useEffect(() => {
    localStorage.setItem('las_praise_received', praiseCardReceived ? 'true' : 'false');
  }, [praiseCardReceived]);

  useEffect(() => {
    localStorage.setItem('las_praise_message', praiseMessageText);
  }, [praiseMessageText]);

  const showToast = (_message?: string, _type?: 'success' | 'info' | 'drink' | 'star') => {
    // Toast notification popup removed
  };

  // 4. State Handlers
  const addStars = (amount: number, reason: string) => {
    setCompanionStars((prevStars) => {
      const nextStars = prevStars + amount;
      const starsPerLevel = 15;
      const nextLevel = Math.floor(nextStars / starsPerLevel) + 1;
      
      localStorage.setItem('las_companion_stars', nextStars.toString());
      
      if (nextLevel > companionLevel) {
        setCompanionLevel(nextLevel);
        localStorage.setItem('las_companion_level', nextLevel.toString());
        showToast(`축하합니다! 🎉 건강별 ${amount}개를 받고 ${companionName}가 Lv.${nextLevel}로 무럭무럭 자라났어요!`, 'star');
      } else {
        showToast(`잘했어요! 건강별 ${amount}개를 받았어요. (${reason}) 🌟`, 'star');
      }
      
      return nextStars;
    });
  };

  const logDailyActivity = () => {
    const lastDate = localStorage.getItem('las_last_record_date') || '';
    const streakDaysSaved = parseInt(localStorage.getItem('las_consecutive_days') || '0');
    
    // If we already logged activity today, do nothing to streak count
    if (lastDate === todayStr) {
      return;
    }

    const getYesterdayStr = () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday.toISOString().split('T')[0];
    };

    const yesterdayStr = getYesterdayStr();
    let newStreak = 1;

    if (lastDate === yesterdayStr) {
      newStreak = streakDaysSaved + 1;
    } else {
      newStreak = 1; // broken or first time
    }

    localStorage.setItem('las_last_record_date', todayStr);
    localStorage.setItem('las_consecutive_days', newStreak.toString());

    // Check if 3 days streak reached
    if (newStreak === 3) {
      const bonusClaimedKey = `las_streak_bonus_claimed_${todayStr}`;
      if (localStorage.getItem(bonusClaimedKey) !== 'true') {
        localStorage.setItem(bonusClaimedKey, 'true');
        addStars(10, '3일 연속 기록 보너스 🏆🔥');
        setRecentAction('streak');
        showToast('3일 연속 기록했어요! 정말 대단해요. 건강별 10개를 선물로 받았어요! 🎉👑', 'star');
      }
    } else {
      showToast('오늘 기록 완료! 건강 활동이 등록되었습니다. 😊', 'success');
    }
  };

  const handleCompleteAppointment = () => {
    setAppointmentKept(true);
    localStorage.setItem(`las_appointment_kept_${todayStr}`, 'true');
    setRecentAction('appointment');
    logDailyActivity();

    const awardsGivenKey = `las_awards_given_${todayStr}`;
    const savedAwards = localStorage.getItem(awardsGivenKey);
    const awards: string[] = savedAwards ? JSON.parse(savedAwards) : [];

    if (!awards.includes('appointment_completed')) {
      awards.push('appointment_completed');
      localStorage.setItem(awardsGivenKey, JSON.stringify(awards));
      addStars(3, '병원·약속 완료 🏥');

      triggerCelebration({
        type: 'hospital',
        title: '약속 완료! 🏥',
        message: '병원이나 중요한 약속을 잘 다녀왔어요.',
        rewardText: '건강별 +3',
        stampText: '병원·약속 도장 획득'
      });
    } else {
      showToast('또 기록해줘서 고마워요! 오늘도 잘 챙기고 있어요. 😊', 'success');
    }
  };

  const handleUpdateSteps = (steps: number, goal?: number) => {
    setStepLog((prev) => {
      const distanceKm = parseFloat((steps * 0.00074).toFixed(1));
      const caloriesKcal = Math.round(steps * 0.04);
      const targetGoal = goal !== undefined ? goal : prev.goal;
      const newLog = {
        ...prev,
        count: steps,
        goal: targetGoal,
        distanceKm,
        caloriesKcal
      };

      // Check step achievement thresholds dynamically
      const awardsGivenKey = `las_awards_given_${todayStr}`;
      const savedAwards = localStorage.getItem(awardsGivenKey);
      const awards: string[] = savedAwards ? JSON.parse(savedAwards) : [];
      const alreadyRewarded = awards.includes('walk_completed') || awards.includes('walk_5000');

      if (steps >= targetGoal) {
        if (!alreadyRewarded) {
          awards.push('walk_completed');
          localStorage.setItem(awardsGivenKey, JSON.stringify(awards));
          addStars(3, `${targetGoal.toLocaleString()}보 걷기 목표 달성 완료 🚶`);
          setRecentAction('walk');
          
          triggerCelebration({
            type: 'steps',
            title: '걷기 목표 완료! 🚶',
            message: '오늘 목표만큼 걸었어요. 몸을 잘 움직였어요.',
            rewardText: '건강별 +3',
            stampText: '걷기 도장 획득'
          });
        } else if (steps > prev.count) {
          showToast('또 기록해줘서 고마워요! 오늘도 잘 챙기고 있어요. 😊', 'success');
        }
      }

      return newLog;
    });
    // Record daily activity for streak
    logDailyActivity();
  };

  const handleEquipItem = (itemId: string | null) => {
    setEquippedItem(itemId);
  };

  const handleUnlockItem = (itemId: string) => {
    setUnlockedItems((prev) => {
      if (prev.includes(itemId)) return prev;
      const updated = [...prev, itemId];
      return updated;
    });
  };

  const handleCompleteMission = (missionId: string) => {
    setCompletedMissions((prev) => {
      if (prev.includes(missionId)) return prev;
      const updated = [...prev, missionId];
      return updated;
    });
  };

  const handleSendPraiseRequest = () => {
    showToast('엄마에게 오늘의 건강 활동을 자랑했어요! 💬📬', 'info');

    const awardsGivenKey = `las_awards_given_${todayStr}`;
    const savedAwards = localStorage.getItem(awardsGivenKey);
    const awards: string[] = savedAwards ? JSON.parse(savedAwards) : [];

    if (!awards.includes('family_praised')) {
      awards.push('family_praised');
      localStorage.setItem(awardsGivenKey, JSON.stringify(awards));
      addStars(3, '가족에게 자랑하기 완료 💌');

      triggerCelebration({
        type: 'family',
        title: '가족에게 자랑했어요! 💌',
        message: '오늘 한 일을 가족에게 잘 알려줬어요.',
        rewardText: '건강별 +3',
        stampText: '가족 칭찬 도장 획득'
      });
    } else {
      showToast('또 기록해줘서 고마워요! 오늘도 잘 챙기고 있어요. 😊', 'success');
    }

    setTimeout(() => {
      const praises = [
        "오늘도 멋지게 해냈구나. 정말 우리 딸/아들 최고야! ❤️",
        "우와, 스스로 물도 챙겨 마시고 다 컸네! 자랑스러워! 🌟",
        "오늘도 성실하게 건강을 지켰구나! 엄마가 백 점 만점 줄게! 🏆",
        "몸도 마음도 건강해지는 모습이 참 보기 좋아. 최고야! 👍",
        "건강한 밥 먹기 성공했네! 이따가 같이 산책 갈까? 🥰"
      ];
      const randomPraise = praises[Math.floor(Math.random() * praises.length)];
      setPraiseCardReceived(true);
      setPraiseMessageText(randomPraise);
    }, 2000);
  };

  const handleClearPraise = () => {
    setPraiseCardReceived(false);
    setPraiseMessageText('');
  };

  const handleSaveMeal = (newMeal: Omit<MealLog, 'id' | 'date'>) => {
    const meal: MealLog = {
      ...newMeal,
      id: `meal-${Date.now()}`,
      date: todayStr,
      feedback: newMeal.mealType === 'healthy' 
        ? '참 잘했어요! 야채와 영양소가 아주 풍부한 멋진 선택입니다!' 
        : newMeal.mealType === 'normal' 
        ? '규칙적으로 즐거운 한 끼를 잘 드셨군요!' 
        : '가끔은 기분 좋은 특별한 당 충전도 우리에게 활력을 줘요!'
    };

    setMealLogs((prev) => [meal, ...prev]);
    setActiveSubpage(null);
    setActiveTab('home');
    setRecentAction('meal');
    logDailyActivity();

    const awardsGivenKey = `las_awards_given_${todayStr}`;
    const savedAwards = localStorage.getItem(awardsGivenKey);
    const awards: string[] = savedAwards ? JSON.parse(savedAwards) : [];

    if (!awards.includes('meal_1')) {
      awards.push('meal_1');
      localStorage.setItem(awardsGivenKey, JSON.stringify(awards));
      addStars(3, '오늘 먹은 밥 1번 기록하기 미션 완료 🍚');
      
      triggerCelebration({
        type: 'meal',
        title: '밥 기록 완료! 🍱',
        message: '오늘 먹은 밥을 잘 기록했어요.',
        rewardText: '건강별 +3',
        stampText: '밥 기록 도장 획득'
      });
    } else {
      showToast('또 기록해줘서 고마워요! 오늘도 잘 챙기고 있어요. 😊', 'success');
    }
  };

  const handleCompleteStretching = () => {
    // Increment steps by 1,500 and calories by 80 as stretching award!
    setStepLog((prev) => {
      const newCount = prev.count + 1500;
      return {
        ...prev,
        count: newCount,
        distanceKm: parseFloat((newCount * 0.00074).toFixed(1)),
        caloriesKcal: Math.round(newCount * 0.04)
      };
    });

    // Auto-create a post in the community sharing this achievement
    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      authorName: nickname,
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      category: '운동',
      content: `방금 "가벼운 전신 스트레칭(10분)" 과제를 즐겁게 마쳤어요! 온몸을 쭉쭉 뻗으니 뭉친 피로가 싹 사라져요. 완료 도장 하나 추가 성공! 🧘‍♂️🏅`,
      likes: 1,
      hasLiked: false,
      createdAt: '방금 전',
      imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80'
    };

    setCommunityPosts((prev) => [newPost, ...prev]);
    setActiveSubpage(null);
    setActiveTab('home');
    setRecentAction('stretch');
    logDailyActivity();
  };

  const handleSaveHealthLog = (newHealthLog: HealthLog) => {
    setHealthLog(newHealthLog);
    setActiveSubpage(null);
    setActiveTab('home');
    setRecentAction('mood');
    logDailyActivity();

    const awardsGivenKey = `las_awards_given_${todayStr}`;
    const savedAwards = localStorage.getItem(awardsGivenKey);
    const awards: string[] = savedAwards ? JSON.parse(savedAwards) : [];

    let hasSleepRewarded = awards.includes('sleep_logged');
    let hasMoodRewarded = awards.includes('mood_logged');

    let triggeredAny = false;

    if (!hasSleepRewarded) {
      awards.push('sleep_logged');
      triggerCelebration({
        type: 'sleep',
        title: '잠 기록 완료! 🌙',
        message: '어젯밤 잠을 잘 기록했어요.',
        stampText: '잠 기록 도장 획득'
      });
      triggeredAny = true;
    }

    if (!hasMoodRewarded) {
      awards.push('mood_logged');
      triggerCelebration({
        type: 'mood',
        title: '기분 기록 완료! 😊',
        message: '오늘 마음을 알려줘서 고마워요.',
        stampText: '기분 기록 도장 획득'
      });
      triggeredAny = true;
    }

    if (triggeredAny) {
      localStorage.setItem(awardsGivenKey, JSON.stringify(awards));
    } else {
      showToast('또 기록해줘서 고마워요! 오늘도 잘 챙기고 있어요. 😊', 'success');
    }
  };

  const handleAddWater = () => {
    setWaterLog((prev) => {
      const nextCount = prev.count + 1;
      setRecentAction('water');
      logDailyActivity();

      const awardsGivenKey = `las_awards_given_${todayStr}`;
      const savedAwards = localStorage.getItem(awardsGivenKey);
      const awards: string[] = savedAwards ? JSON.parse(savedAwards) : [];

      if (nextCount >= 7) {
        if (!awards.includes('water_7')) {
          awards.push('water_7');
          localStorage.setItem(awardsGivenKey, JSON.stringify(awards));
          addStars(3, '물 7잔 마시기 미션 완료 💧');
          
          triggerCelebration({
            type: 'water',
            title: '물 마시기 완료! 💧',
            message: '오늘 물 7잔을 마셨어요. 정말 잘했어요.',
            rewardText: '건강별 +3',
            stampText: '물 마시기 도장 획득'
          });
        } else {
          showToast('또 기록해줘서 고마워요! 오늘도 잘 챙기고 있어요. 😊', 'success');
        }
      } else {
        showToast(`꿀꺽꿀꺽! 물을 한 잔 마셨습니다. 오늘의 수분: ${nextCount}/7잔 💧`, 'drink');
      }

      return {
        ...prev,
        count: Math.min(nextCount, 12)
      };
    });
  };

  const handleResetWater = () => {
    setWaterLog((prev) => {
      showToast('오늘의 물 마시기 기록이 0잔으로 초기화되었습니다! 💧', 'info');
      return {
        ...prev,
        count: 0
      };
    });
  };

  const resetDailyEvaluationState = () => {
    // 1. Reset React states
    setStepLog({
      date: todayStr,
      count: 0,
      goal: 10000,
      distanceKm: 0,
      caloriesKcal: 0
    });
    setWaterLog({
      date: todayStr,
      count: 0,
      goal: 8
    });
    setHealthLog(null);
    setMealLogs([]);
    setCompletedMissions([]);
    setAppointmentKept(false);
    setPraiseCardReceived(false);
    setPraiseMessageText('');
    setRecentAction(null);

    // Companion states reset
    setCompanion(null);
    setCompanionName('건강친구');
    setCompanionLevel(1);
    setCompanionStars(0);
    setEquippedItem(null);
    setUnlockedItems([]);

    // 2. Clear from localStorage
    localStorage.removeItem('las_completed_missions');
    localStorage.removeItem(`las_awards_given_${todayStr}`);
    localStorage.removeItem('las_last_record_date');
    localStorage.removeItem('las_consecutive_days');
    localStorage.removeItem(`las_streak_bonus_claimed_${todayStr}`);
    localStorage.removeItem(`las_steps_${todayStr}`);
    localStorage.removeItem(`las_health_${todayStr}`);
    localStorage.removeItem(`las_water_${todayStr}`);
    localStorage.removeItem('las_meals');
    localStorage.removeItem('las_praise_received');
    localStorage.removeItem('las_praise_message');
    localStorage.removeItem(`las_appointment_kept_${todayStr}`);

    localStorage.removeItem('las_companion');
    localStorage.removeItem('las_companion_name');
    localStorage.removeItem('las_companion_level');
    localStorage.removeItem('las_companion_stars');
    localStorage.removeItem('las_equipped_item');
    localStorage.removeItem('las_unlocked_items');

    // Onboarding selections
    localStorage.removeItem('las_youth_goals');
    localStorage.removeItem('las_parent_goals');
    localStorage.removeItem('las_parent_health_concerns');
    localStorage.removeItem('las_parent_health_concerns_etc');
    localStorage.removeItem('las_child_needs_help_in');

    // Clear popup dismissed status for today
    const popupTypes = ['morning', 'lunch', 'afternoon', 'evening', 'night'];
    popupTypes.forEach(type => {
      localStorage.removeItem(`las_popup_dismissed_${type}_${todayStr}`);
    });

    setTodayFootprint({ physical: null, social: null, emotional: null });
    localStorage.removeItem(getHealthGoalFootprintKey(getLocalDateKey()));
  };

  const handleResetOnboarding = () => {
    // 5. localStorage 초기화: las_로 시작하는 사용자 기록 삭제
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('las_')) {
        localStorage.removeItem(key);
      }
    });

    resetDailyEvaluationState();
    setCommunityPosts(DEFAULT_POSTS);
    setIsOnboarded(false);
    setUserRole('challenger');
    setNickname('');
    setUserProfile(null);
    setOnboardingInitialStep('splash');
    setActiveTab('home');
    setActiveSubpage(null);
    setRecentAction(null);
    setCelebrationQueue([]);
  };

  const handleOnboardingComplete = (role: string, name: string) => {
    resetDailyEvaluationState();
    setIsOnboarded(true);
    setUserRole('challenger');
    setNickname(name);
    setUserProfile(getUserProfile());
    setCompanion('rami');
    setCompanionName('라미');
    localStorage.setItem('las_companion', 'rami');
    localStorage.setItem('las_companion_name', '라미');
    localStorage.setItem('las_onboarded', 'true');
    localStorage.setItem('las_user_role', 'challenger');
    localStorage.setItem('las_nickname', name);

    setActiveTab('home');
    setActiveSubpage(null);
  };

  const handleUpdateProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    if (newProfile.name) {
      setNickname(newProfile.name);
      localStorage.setItem('las_nickname', newProfile.name);
    }
  };

  const handleAddCommunityPost = (category: HealthCategory, content: string, imageUrl?: string) => {
    const activeProfile = getUserProfile();
    const author = activeProfile?.name || nickname || '김민수';
    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      authorId: 'me',
      authorName: author,
      authorAvatarType: activeProfile?.avatarType || 'character',
      authorAvatarValue: activeProfile?.avatarValue || 'smile',
      authorAvatar: (activeProfile?.avatarType === 'photo' && activeProfile.avatarValue) ? activeProfile.avatarValue : undefined,
      category: normalizeCategory(category),
      content,
      likes: 0,
      hasLiked: false,
      createdAt: '방금 전',
      imageUrl,
      comments: [],
      postScope: 'myPractice',
      isMine: true
    };

    setCommunityPosts((prev) => [newPost, ...prev]);
    showToast('응원 커뮤니티에 건강 실천이 자랑되었습니다! 🌟👏', 'success');
  };

  const handleLikePost = (postId: string) => {
    setCommunityPosts((prev) => {
      const updated = prev.map((post) => {
        if (post.id === postId) {
          const hasLiked = !post.hasLiked;
          return {
            ...post,
            hasLiked,
            likes: Math.max(0, post.likes + (hasLiked ? 1 : -1))
          };
        }
        return post;
      });
      return updated;
    });
  };

  const handleAddComment = (postId: string, commentContent: string) => {
    const activeProfile = getUserProfile();
    const author = activeProfile?.name || nickname || '나';
    setCommunityPosts((prev) => {
      const updated = prev.map((post) => {
        if (post.id === postId) {
          const currentComments = post.comments || [];
          const newComment: Comment = {
            id: `comment-${Date.now()}`,
            postId,
            authorName: author,
            authorAvatar: activeProfile?.avatarType === 'photo' ? activeProfile.avatarValue : undefined,
            content: commentContent,
            createdAt: '방금 전'
          };
          return {
            ...post,
            comments: [...currentComments, newComment]
          };
        }
        return post;
      });
      return updated;
    });
    showToast('따뜻한 응원 댓글이 등록되었습니다! 💬🌟', 'success');
  };

  const handleDeletePost = (postId: string) => {
    setCommunityPosts((prev) => prev.filter((post) => post.id !== postId));
    showToast('게시글이 삭제되었습니다.', 'info');
  };

  const handleDeleteComment = (postId: string, commentId: string) => {
    setCommunityPosts((prev) => {
      return prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: (post.comments || []).filter((c) => c.id !== commentId)
          };
        }
        return post;
      });
    });
    showToast('댓글이 삭제되었습니다.', 'info');
  };

  // Tab change resolver
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setActiveSubpage(null); // Return to sub-root list of tab whenever switching bottom tabs
  };

  // Nav to specific sub-page helper
  const handleNavigateToSubpage = (pageId: string) => {
    setActiveSubpage(pageId);
  };

  // Derived metrics for MyInfo
  const totalStepsThisWeek = stepLog.count + 16200; // Adding previous days steps
  const waterDrunkThisWeek = waterLog.count + 29; // previous days
  const averageWeight = healthLog ? (healthLog.weight + 64.8) / 2 : 65.0;

  const currentCompanionId = companion || 'dog';
  const getCompanionDetail = () => {
    const defaultName = currentCompanionId === 'rabbit' ? '토찌' : currentCompanionId === 'bear' ? '곰이' : currentCompanionId === 'sprout' ? '리프' : '라미';
    const name = companionName && companionName !== '건강친구' ? companionName : defaultName;
    const emoji = currentCompanionId === 'rabbit' ? '🐰' : currentCompanionId === 'bear' ? '🐻' : currentCompanionId === 'sprout' ? '🌱' : '🐶';
    const bgColor = currentCompanionId === 'rabbit' ? 'bg-pink-100' : currentCompanionId === 'bear' ? 'bg-orange-100' : currentCompanionId === 'sprout' ? 'bg-emerald-100' : 'bg-amber-100';
    return { id: currentCompanionId, name, emoji, bgColor };
  };

  const getCelebrationIcon = (type: string) => {
    switch (type) {
      case 'water': return { emoji: '💧', color: 'bg-cyan-50 border-cyan-200 text-cyan-600' };
      case 'steps': return { emoji: '🚶', color: 'bg-emerald-50 border-emerald-200 text-emerald-600' };
      case 'meal': return { emoji: '🍱', color: 'bg-purple-50 border-purple-200 text-purple-600' };
      case 'sleep': return { emoji: '🌙', color: 'bg-indigo-50 border-indigo-200 text-indigo-600' };
      case 'mood': return { emoji: '😊', color: 'bg-rose-50 border-rose-200 text-rose-600' };
      case 'hospital': return { emoji: '🏥', color: 'bg-amber-50 border-amber-200 text-amber-600' };
      case 'family': return { emoji: '💌', color: 'bg-pink-50 border-pink-200 text-pink-600' };
      default: return { emoji: '⭐', color: 'bg-primary/10 border-primary/20 text-primary' };
    }
  };

  const handleCloseCelebration = () => {
    setCelebrationQueue((prev) => {
      const nextQueue = prev.slice(1);
      return nextQueue;
    });
  };

  // Render current view
  const renderCurrentView = () => {
    if (activeSubpage) {
      switch (activeSubpage) {
        case 'meal-log':
          return (
            <MealLogView 
              onBack={() => setActiveSubpage(null)} 
              onSaveMeal={handleSaveMeal} 
              onAddStars={addStars}
              showToast={showToast}
            />
          );
        case 'stretching':
          return (
            <StretchingView 
              onBack={() => setActiveSubpage(null)} 
              onComplete={handleCompleteStretching} 
            />
          );
        case 'health-log':
          return (
            <HealthLogView 
              initialLog={healthLog || undefined}
              onBack={() => setActiveSubpage(null)} 
              onSave={handleSaveHealthLog} 
            />
          );
        case 'pedometer':
          return (
            <PedometerView 
              initialLog={stepLog}
              onBack={() => setActiveSubpage(null)} 
              onShare={(text) => showToast('공유 링크가 클립보드에 가상 복사되었습니다: ' + text, 'info')}
              onUpdateSteps={handleUpdateSteps}
            />
          );
        default:
          return null;
      }
    }

    switch (activeTab) {
      case 'home':
        return (
          <HomeView 
            mealLogs={mealLogs}
            healthLog={healthLog}
            stepLog={stepLog}
            waterLog={waterLog}
            onNavigateToTab={handleTabChange}
            onNavigateToSubpage={handleNavigateToSubpage}
            onAddWater={handleAddWater}
            onResetWater={handleResetWater}
            userProfile={userProfile}
            
            nickname={nickname}
            companion={companion}
            companionName={companionName}
            companionLevel={companionLevel}
            companionStars={companionStars}
            equippedItem={equippedItem}
            unlockedItems={unlockedItems}
            completedMissions={completedMissions}
            praiseCardReceived={praiseCardReceived}
            praiseMessageText={praiseMessageText}
            onAddStars={addStars}
            onEquipItem={handleEquipItem}
            onUnlockItem={handleUnlockItem}
            onCompleteMission={handleCompleteMission}
            onSendPraiseRequest={handleSendPraiseRequest}
            onReceivePraiseCard={(msg) => {
              setPraiseCardReceived(true);
              setPraiseMessageText(msg);
            }}
            onClearPraise={handleClearPraise}
            
            recentAction={recentAction}
            onClearRecentAction={() => setRecentAction(null)}
            appointmentKept={appointmentKept}
            onCompleteAppointment={handleCompleteAppointment}
            hasAppointmentToday={hasAppointmentToday}
            footprintAnswers={todayFootprint}
            onUpdateFootprintAnswer={handleUpdateFootprintAnswer}
          />
        );
      case 'practice':
        return (
          <PracticeHubView 
            mealLogs={mealLogs}
            healthLog={healthLog}
            stepLog={stepLog}
            onNavigateToSubpage={handleNavigateToSubpage}
            answers={practiceAnswers}
            onToggleAnswer={handleTogglePracticeAnswer}
          />
        );
      case 'community':
        return (
          <CommunityView 
            posts={communityPosts}
            onAddPost={handleAddCommunityPost}
            onLikePost={handleLikePost}
            onAddComment={handleAddComment}
            onDeletePost={handleDeletePost}
            onDeleteComment={handleDeleteComment}
            userProfile={userProfile}
            nickname={nickname}
            praiseCardReceived={praiseCardReceived}
            praiseMessageText={praiseMessageText}
            onSendPraiseRequest={handleSendPraiseRequest}
            onReceivePraiseCard={(msg) => {
              setPraiseCardReceived(true);
              setPraiseMessageText(msg);
              addStars(5, '가족 칭찬 카드 도착 👨‍👩‍👦');
            }}
            onClearPraise={handleClearPraise}
            showToast={showToast}
          />
        );
      case 'my-info':
        return (
          <MyInfoView 
            totalStepsThisWeek={totalStepsThisWeek}
            waterDrunkThisWeek={waterDrunkThisWeek}
            averageWeight={averageWeight}
            userRole={userRole}
            nickname={nickname}
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
            onResetOnboarding={() => setShowResetConfirm(true)}
            onNavigateToSubpage={handleNavigateToSubpage}
            onNavigateToTab={handleTabChange}
            waterLog={waterLog}
            stepLog={stepLog}
            mealLogs={mealLogs}
            healthLog={healthLog}
            praiseCardReceived={praiseCardReceived}
            practiceAnswers={practiceAnswers}
            todayFootprint={todayFootprint}
          />
        );
      case 'video':
        return <VideoPlaceholderView />;
      default:
        return null;
    }
  };

  if (!isOnboarded) {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-[#f0f4ff] text-on-surface antialiased select-none font-sans max-w-lg mx-auto bg-white shadow-2xl relative flex flex-col justify-between">
        <OnboardingView 
          onComplete={handleOnboardingComplete} 
          initialStep={onboardingInitialStep}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32 text-on-surface antialiased select-none font-sans max-w-lg mx-auto bg-white shadow-2xl relative">
      
      {/* Scrollable Main Content Frame */}
      <main className="px-5 pt-2">
        {renderCurrentView()}
      </main>

      {/* Persistent Beautiful Bottom Bar (suppressed on stretching video page for immersion/cognitive ease) */}
      {activeSubpage !== 'stretching' && (
        <BottomNavBar 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
          onResetOnboarding={() => setShowResetConfirm(true)}
        />
      )}

      {/* Global Health Action Celebration Popup Modal */}
      <AnimatePresence>
        {celebrationQueue.length > 0 && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] flex items-center justify-center p-6 animate-fadeIn">
            <motion.div 
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ type: 'spring', damping: 24, stiffness: 320 }}
              className="bg-white rounded-[32px] p-6 w-full max-w-[340px] border-2 border-slate-100 shadow-2xl relative overflow-hidden text-center flex flex-col items-center gap-4.5"
            >
              {/* Confetti / Sparkle Visual Backdrops */}
              <div className="absolute inset-0 pointer-events-none opacity-30">
                <div className="absolute -top-12 -left-12 w-44 h-44 bg-amber-200 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-12 -right-12 w-44 h-44 bg-primary/25 rounded-full blur-3xl animate-pulse" />
              </div>

              {/* Large Companion Character Avatar + Badge Overlay */}
              <div className="relative mt-2 z-10">
                <div className={`w-28 h-28 rounded-full ${getCompanionDetail().bgColor} flex items-center justify-center text-6xl shadow-md border-4 border-white animate-bounce-slow`}>
                  {getCompanionDetail().emoji}
                </div>
                {/* Micro Icon Overlay */}
                <div className={`absolute -bottom-1 -right-1 w-10 h-10 rounded-full ${getCelebrationIcon(celebrationQueue[0].type).color} border-2 border-white flex items-center justify-center text-xl shadow-md`}>
                  {getCelebrationIcon(celebrationQueue[0].type).emoji}
                </div>
              </div>

              {/* Speech Bubble Feedback Content */}
              <div className="w-full bg-slate-50 border border-slate-100/80 rounded-2xl p-4 relative z-10 text-center">
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-slate-50 border-t border-l border-slate-100/80 rotate-45" />
                <span className="text-[10px] font-black text-primary tracking-wide block mb-1">
                  {getCompanionDetail().name}가 함께 기뻐해요! ❤️
                </span>
                <h3 className="text-base font-black text-on-surface leading-tight">
                  {celebrationQueue[0].title}
                </h3>
                <p className="text-xs font-bold text-on-surface-variant mt-1.5 leading-relaxed">
                  {celebrationQueue[0].message}
                </p>
              </div>

              {/* Rewards Segment */}
              {(celebrationQueue[0].rewardText || celebrationQueue[0].stampText) && (
                <div className="w-full bg-amber-50/60 border border-amber-100/70 rounded-2xl p-3.5 space-y-2 z-10">
                  <span className="text-[10px] font-black text-amber-600 tracking-wider uppercase block text-center">획득한 미션 보상 🎁</span>
                  <div className="flex flex-col gap-1.5">
                    {celebrationQueue[0].rewardText && (
                      <div className="flex items-center gap-2 bg-white/95 border border-amber-200/50 rounded-xl px-3 py-2 shadow-3xs text-left">
                        <span className="text-base">🌟</span>
                        <span className="text-xs font-black text-amber-700">{celebrationQueue[0].rewardText}</span>
                      </div>
                    )}
                    {celebrationQueue[0].stampText && (
                      <div className="flex items-center gap-2 bg-white/95 border border-amber-200/50 rounded-xl px-3 py-2 shadow-3xs text-left">
                        <span className="text-base">🏅</span>
                        <span className="text-xs font-black text-amber-700">{celebrationQueue[0].stampText}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Highlight Action Button */}
              <button
                type="button"
                onClick={handleCloseCelebration}
                className="w-full py-4 bg-primary hover:bg-primary-container text-white font-black text-sm rounded-2xl active:scale-95 transition-transform cursor-pointer shadow-md shadow-primary/20 flex items-center justify-center gap-1.5 mt-1 z-10"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                좋아요!
              </button>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 온보딩 다시 시작 확인 모달 */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="reset-modal-title"
            className="bg-white rounded-3xl p-6 max-w-xs sm:max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-4 animate-scaleUp"
          >
            <div className="space-y-1.5 text-center pt-1">
              <h3 id="reset-modal-title" className="text-xl font-black text-slate-800 tracking-tight">
                처음부터 다시 시작할까요?
              </h3>
              <p className="text-xs font-bold text-slate-500 leading-relaxed">
                이전에 기록한 정보와 활동 기록이 지워져요.
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 h-12 rounded-xl bg-slate-100 hover:bg-slate-200/80 active:bg-slate-200 text-slate-700 font-bold text-sm transition-all cursor-pointer active:scale-95"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResetConfirm(false);
                  handleResetOnboarding();
                }}
                className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary-container text-white font-extrabold text-sm shadow-md transition-all cursor-pointer active:scale-95"
              >
                다시 시작
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
