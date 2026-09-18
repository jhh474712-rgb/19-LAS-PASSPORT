import React, { useState, useEffect } from 'react';
import { 
  Sparkles,
  X,
  Lock,
  Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MealLog, HealthLog, StepLog, WaterLog, UserProfile, CharacterAvatar, HealthGoalFootprint, HealthGoalAnswer } from '../types';
import { CHARACTER_AVATAR_MAP, getUserProfile } from '../utils/profile';
import { getLocalDateKey, getHealthGoalFootprint, saveHealthGoalFootprint } from '../utils/date';

interface HomeViewProps {
  mealLogs: MealLog[];
  healthLog: HealthLog | null;
  stepLog: StepLog;
  waterLog: WaterLog;
  onNavigateToTab: (tabId: string) => void;
  onNavigateToSubpage: (pageId: string) => void;
  onAddWater: () => void;
  onResetWater?: () => void;
  userProfile?: UserProfile | null;
  
  // Companion Props
  nickname: string;
  companion: string | null;
  companionName: string;
  companionLevel: number;
  companionStars: number;
  equippedItem: string | null;
  unlockedItems: string[];
  completedMissions: string[];
  praiseCardReceived?: boolean;
  praiseMessageText?: string;
  onAddStars: (amount: number, reason: string) => void;
  onEquipItem: (itemId: string | null) => void;
  onUnlockItem: (itemId: string) => void;
  onCompleteMission: (missionId: string) => void;
  onSendPraiseRequest?: () => void;
  onReceivePraiseCard?: (messageText: string) => void;
  onClearPraise?: () => void;
  
  // New props for reactive actions
  recentAction: string | null;
  onClearRecentAction: () => void;
  appointmentKept: boolean;
  onCompleteAppointment: () => void;
  hasAppointmentToday: boolean;

  // Health Goal Footprint
  footprintAnswers?: HealthGoalFootprint;
  onUpdateFootprintAnswer?: (category: 'physical' | 'social' | 'emotional', answer: HealthGoalAnswer) => void;
}

const DECORATION_ITEMS = [
  { id: 'hat', name: '물방울 모자', emoji: '💧', cost: 5, minLevel: 1, description: '머리에 얹으면 시원한 기분이 드는 맑은 물방울 모자예요.' },
  { id: 'bag', name: '산책 가방', emoji: '🎒', cost: 10, minLevel: 1, description: '가볍게 걸을 때 간식과 물통을 쏙 넣는 빨간 가방이에요.' },
  { id: 'box', name: '건강 도시락', emoji: '🍱', cost: 15, minLevel: 2, description: '채소와 과일이 정성스럽게 담긴 영양 가득 도시락이에요.' },
  { id: 'sticker', name: '반짝반짝 별', emoji: '⭐', cost: 20, minLevel: 2, description: '캐릭터 주변에 반짝이는 건강한 에너지 스티커예요.' },
  { id: 'bg', name: '잠자는 달 밤', emoji: '🌙', cost: 25, minLevel: 3, description: '숙면을 도와주는 은은한 밤하늘과 노란 초승달 배경이에요.' }
];

export default function HomeView({ 
  mealLogs, 
  healthLog, 
  stepLog, 
  waterLog, 
  onNavigateToTab, 
  onNavigateToSubpage,
  onAddWater,
  userProfile,
  
  nickname,
  companion,
  companionName,
  companionLevel,
  companionStars,
  equippedItem,
  unlockedItems = [],
  praiseCardReceived,
  praiseMessageText,
  onAddStars,
  onEquipItem,
  onUnlockItem,
  onSendPraiseRequest,
  onClearPraise,
  
  recentAction,
  onClearRecentAction,
  appointmentKept,
  onCompleteAppointment,
  hasAppointmentToday,
  footprintAnswers,
  onUpdateFootprintAnswer
}: HomeViewProps) {
  const [isDressUpModalOpen, setIsDressUpModalOpen] = useState<boolean>(false);

  const [consecutiveDays, setConsecutiveDays] = useState<number>(0);

  // Health Goal Footprint state (local time based)
  const [answers, setAnswers] = useState<HealthGoalFootprint>(() => {
    return footprintAnswers || getHealthGoalFootprint(getLocalDateKey());
  });

  useEffect(() => {
    if (footprintAnswers) {
      setAnswers(footprintAnswers);
    }
  }, [footprintAnswers]);

  const handleSelectAnswer = (category: 'physical' | 'social' | 'emotional', answer: 'yes' | 'no') => {
    const todayKey = getLocalDateKey();
    const updated = {
      ...answers,
      [category]: answer,
    };
    setAnswers(updated);
    saveHealthGoalFootprint(todayKey, updated);
    if (onUpdateFootprintAnswer) {
      onUpdateFootprintAnswer(category, answer);
    }
  };

  const isPhysicalActive = answers.physical === 'yes';
  const isSocialActive = answers.social === 'yes';
  const isEmotionalActive = answers.emotional === 'yes';

  // Sync consecutive days from localStorage
  useEffect(() => {
    const streak = parseInt(localStorage.getItem('las_consecutive_days') || '0');
    setConsecutiveDays(streak);
  }, [recentAction, stepLog, waterLog, mealLogs]);

  const [activeReaction, setActiveReaction] = useState<string | null>(null);
  const [isLevelingUp, setIsLevelingUp] = useState<boolean>(false);
  const [prevLevel, setPrevLevel] = useState<number>(companionLevel);
  
  const todayStr = new Date().toISOString().split('T')[0];

  const healthGoals = [
    {
      id: 'physical',
      label: '신체 건강',
      emoji: '💪',
      goal:
        localStorage.getItem('las_physical_health_goal')?.trim() ||
        '아직 입력한 목표가 없어요.',
    },
    {
      id: 'social',
      label: '사회 건강',
      emoji: '🤝',
      goal:
        localStorage.getItem('las_social_health_goal')?.trim() ||
        '아직 입력한 목표가 없어요.',
    },
    {
      id: 'emotional',
      label: '정서 건강',
      emoji: '💖',
      goal:
        localStorage.getItem('las_emotional_health_goal')?.trim() ||
        '아직 입력한 목표가 없어요.',
    },
  ];

  // Track recentAction to trigger reactions
  useEffect(() => {
    if (recentAction) {
      setActiveReaction(recentAction);
      const timer = setTimeout(() => {
        setActiveReaction(null);
        onClearRecentAction();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [recentAction]);

  // Track level up to trigger celebration
  useEffect(() => {
    if (companionLevel > prevLevel) {
      setIsLevelingUp(true);
      const timer = setTimeout(() => {
        setIsLevelingUp(false);
        setPrevLevel(companionLevel);
      }, 4500);
      return () => clearTimeout(timer);
    } else if (companionLevel < prevLevel) {
      setPrevLevel(companionLevel);
    }
  }, [companionLevel, prevLevel]);

  const todayMeals = mealLogs.filter(m => m.date === todayStr);
  const mealsCount = todayMeals.length;

  // Companion Character Emoji
  const getCompanionEmoji = () => {
    switch (companion) {
      case 'dog': return '🐶';
      case 'rabbit': return '🐰';
      case 'bear': return '🐻';
      case 'sprout': return '🌱';
      default: return '🐶';
    }
  };

  const getLevelTitle = (lvl: number) => {
    if (lvl <= 1) return '처음 만난 친구 🐾';
    if (lvl === 2) return '건강 새싹 🌱';
    if (lvl === 3) return '튼튼 친구 💪';
    if (lvl === 4) return '반짝 친구 ✨';
    return '건강 수호자 👑';
  };

  // Passport Stamp evaluation (Water mission target is now 7)
  const isWaterStampActive = waterLog.count >= 7;
  const isWalkStampActive = stepLog.count >= stepLog.goal;
  const isMealStampActive = mealsCount >= 1;

  const handleItemClick = (item: typeof DECORATION_ITEMS[0]) => {
    const isUnlocked = unlockedItems.includes(item.id);
    const isEquipped = equippedItem === item.id;
    const canUnlock = companionStars >= item.cost && companionLevel >= item.minLevel;

    if (isUnlocked) {
      // Toggle equip/unequip
      onEquipItem(isEquipped ? null : item.id);
    } else {
      if (canUnlock) {
        // Unlock and automatically equip for convenient UX
        onUnlockItem(item.id);
        onEquipItem(item.id);
      }
    }
  };

  // Find the next locked item to show in preview
  const nextItem = DECORATION_ITEMS.find(item => !unlockedItems.includes(item.id));

  // Active Profile and Dynamic Title
  const activeProfile = userProfile || getUserProfile();
  
  // Resolve display nickname:
  // - Trim any incoming name/nickname
  // - If empty, undefined, null, or matching fallback defaults like '민수' or '김민수', display only '라스 패스포트'
  // - Only when a valid custom nickname is entered, display '{별명} 라스 패스포트'
  const rawDisplayName = userProfile?.name ?? activeProfile?.name ?? (nickname !== '김민수' && nickname !== '민수' ? nickname : '');
  const trimmedNickname = typeof rawDisplayName === 'string' ? rawDisplayName.trim() : '';
  const isCustomNickname = Boolean(trimmedNickname && trimmedNickname !== '민수' && trimmedNickname !== '김민수');
  const headerTitle = isCustomNickname ? `${trimmedNickname} 라스 패스포트` : '라스 패스포트';

  const renderProfileAvatar = () => {
    if (activeProfile?.avatarType === 'photo' && activeProfile.avatarValue) {
      return (
        <img 
          alt="프로필 사진" 
          className="w-full h-full object-cover rounded-full" 
          src={activeProfile.avatarValue} 
          referrerPolicy="no-referrer"
        />
      );
    }

    const val = activeProfile?.avatarValue;
    let emoji = '🙂';
    if (val === 'dog') emoji = '🐶';
    else if (val === 'rabbit') emoji = '🐰';
    else if (val === 'bear') emoji = '🐻';
    else if (val === 'sprout') emoji = '🌱';
    else if (val === 'smile') emoji = '🙂';
    else if (val && CHARACTER_AVATAR_MAP[val as CharacterAvatar]) {
      emoji = CHARACTER_AVATAR_MAP[val as CharacterAvatar].emoji;
    }

    return (
      <span className="text-3xl sm:text-4xl select-none leading-none flex items-center justify-center" aria-hidden="true">
        {emoji}
      </span>
    );
  };

  return (
    <div 
      className="w-full pb-6 relative animate-fadeIn max-w-md mx-auto min-h-screen bg-[#fbf9f4] rounded-3xl p-3 sm:p-4 shadow-sm border-2 border-[#e6decf] overflow-hidden"
      style={{
        backgroundImage: `
          radial-gradient(#d6cbb8 0.85px, transparent 0.85px),
          radial-gradient(#e4dacb 0.85px, #fbf9f4 0.85px)
        `,
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 10px 10px'
      }}
    >
      {/* Subtle Guilloche / Passport Security Background Watermark */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] flex items-center justify-center select-none overflow-hidden" aria-hidden="true">
        <svg width="400" height="400" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="92" stroke="#5c4d37" strokeWidth="1.5" strokeDasharray="3 3"/>
          <circle cx="100" cy="100" r="76" stroke="#5c4d37" strokeWidth="1.2"/>
          <circle cx="100" cy="100" r="60" stroke="#5c4d37" strokeWidth="1"/>
          <circle cx="100" cy="100" r="44" stroke="#5c4d37" strokeWidth="1.5" strokeDasharray="2 2"/>
          <circle cx="100" cy="100" r="28" stroke="#5c4d37" strokeWidth="1"/>
          <path d="M100 8 L100 192 M8 100 L192 100" stroke="#5c4d37" strokeWidth="0.8"/>
        </svg>
      </div>

      {/* Level-up Celebratory Overlay */}
      <AnimatePresence>
        {isLevelingUp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-primary/40 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: -50 }}
              transition={{ type: 'spring', damping: 15 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border-4 border-amber-400 relative overflow-hidden"
            >
              <div className="absolute -top-10 left-10 text-4xl animate-bounce delay-100">🎉</div>
              <div className="absolute top-10 -right-10 text-4xl animate-bounce delay-300">⭐</div>
              <div className="absolute -bottom-10 left-1/2 text-4xl animate-bounce delay-500">✨</div>
              <div className="absolute top-1/2 -left-10 text-4xl animate-bounce delay-200">💖</div>
              
              <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6 border-2 border-amber-300 shadow-lg">
                <span className="text-6xl animate-pulse">{getCompanionEmoji()}</span>
              </div>
              
              <h2 className="text-3xl font-black text-amber-500 tracking-tight mb-2">레벨 업! 🎉</h2>
              <p className="text-sm font-bold text-on-surface-variant leading-relaxed">
                축하합니다! 대단해요!<br />
                {companionName}의 레벨이 <span className="text-primary font-extrabold text-lg">Lv.{companionLevel}</span>로 올랐어요!<br />
                더 튼튼하고 멋진 모습으로 변신했습니다!
              </p>
              
              <div className="mt-4 px-4 py-2.5 bg-amber-50 rounded-2xl text-xs font-black text-amber-700 flex items-center justify-center gap-1.5 border border-amber-200">
                <Sparkles className="w-4 h-4 fill-amber-400 stroke-amber-500" />
                <span>{getLevelTitle(companionLevel)} 칭호 획득!</span>
              </div>

              <button 
                onClick={() => setIsLevelingUp(false)}
                className="mt-6 w-full py-3 bg-amber-400 hover:bg-amber-500 text-on-surface font-extrabold rounded-2xl transition-transform active:scale-95 shadow-md cursor-pointer"
              >
                고마워, {companionName}! ❤️
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Top Header App Bar */}
      <header className="flex items-center justify-between py-2.5 sm:py-3 border-b border-[#e8dfcf] mb-4 sticky top-0 bg-[#fbf9f4]/95 backdrop-blur-md z-30">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
          <div 
            className="w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 border-2 border-[#d8cbba] shadow-xs"
            aria-label="프로필"
          >
            {renderProfileAvatar()}
          </div>
          <div className="text-left min-w-0 flex-1">
            <h1 className="text-[24px] sm:text-[28px] md:text-[30px] font-black text-primary tracking-tight leading-tight break-keep">
              {headerTitle}
            </h1>
          </div>
        </div>
      </header>

      {/* 2. 나의 건강 목표 */}
      <section className="bg-white/95 backdrop-blur-[2px] rounded-2xl p-4 border border-[#e8dfcf] text-left mb-4 shadow-3xs relative z-10">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-blue-50 border border-blue-100/80 flex items-center justify-center text-primary shrink-0 shadow-3xs">
            <span className="text-[20px] sm:text-[22px] leading-none select-none" aria-hidden="true">🎯</span>
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-lg sm:text-[19px] text-on-surface leading-tight break-keep">
              나의 건강 목표
            </h3>
            <p className="text-xs font-bold text-on-surface-variant mt-0.5 break-keep">
              내가 세운 세 가지 목표를 자주 확인해요.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {healthGoals.map((item) => (
            <div
              key={item.id}
              className="p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 bg-white/90 flex items-center gap-2.5 sm:gap-3 transition-all min-h-[78px] sm:min-h-[86px]"
            >
              {/* 왼쪽 영역: 큰 건강 영역 아이콘 (약 48~56px) + 건강 영역 이름 (중앙 정렬, 너비 약 80~88px) */}
              <div className="w-[80px] sm:w-[88px] shrink-0 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 sm:w-[70px] sm:h-[70px] rounded-2xl bg-slate-50/90 border border-slate-200/70 flex items-center justify-center shadow-3xs">
                  <span 
                    className="text-[46px] sm:text-[52px] leading-none select-none" 
                    aria-hidden="true"
                  >
                    {item.emoji}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-black text-slate-800 mt-1.5 leading-tight tracking-tight text-center break-keep whitespace-nowrap">
                  {item.label}
                </h4>
              </div>

              {/* 오른쪽 영역: 입력된 목표 텍스트 박스 */}
              <div className="flex-1 min-w-0 h-[64px] sm:h-[70px] px-3.5 py-2.5 rounded-xl sm:rounded-2xl bg-slate-50/90 border border-slate-200/60 flex items-center">
                <p className="text-xs sm:text-[13px] font-bold text-slate-700 leading-relaxed break-words whitespace-pre-wrap line-clamp-2">
                  {item.goal}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. 오늘의 건강 발자국 */}
      <section className="bg-white/95 backdrop-blur-[2px] rounded-2xl p-4 border border-[#e8dfcf] text-left mb-4 shadow-3xs relative z-10">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-blue-50 border border-blue-100/80 flex items-center justify-center text-primary shrink-0 shadow-3xs">
            <span className="text-[22px] sm:text-[24px] leading-none select-none" aria-hidden="true">👣</span>
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-lg sm:text-[19px] text-on-surface leading-tight break-keep">
              오늘의 건강 발자국
            </h3>
            <p className="text-xs font-bold text-on-surface-variant mt-0.5 break-keep">
              내가 세운 건강 목표를 지켰나요?
            </p>
          </div>
        </div>

        {/* 3대 건강 목표 예/아니오 카드 */}
        <div className="space-y-3">
          {[
            {
              id: 'physical' as const,
              label: '신체 건강',
              emoji: '💪',
              isActive: isPhysicalActive,
              selected: answers.physical,
            },
            {
              id: 'social' as const,
              label: '사회 건강',
              emoji: '🤝',
              isActive: isSocialActive,
              selected: answers.social,
            },
            {
              id: 'emotional' as const,
              label: '정서 건강',
              emoji: '💖',
              isActive: isEmotionalActive,
              selected: answers.emotional,
            },
          ].map((item) => (
            <div
              key={item.id}
              className={`p-2.5 sm:p-3 rounded-2xl border flex items-center gap-2.5 sm:gap-3 transition-all min-h-[78px] sm:min-h-[86px] ${
                item.isActive 
                  ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-400/20' 
                  : item.selected === 'no'
                    ? 'bg-orange-50/30 border-orange-200/80'
                    : 'bg-white/90 border-slate-200/80'
              }`}
            >
              {/* 왼쪽 영역: 큰 건강 영역 아이콘 (약 48~56px) + 건강 영역 이름 (중앙 정렬, 너비 약 80~88px) */}
              <div className="w-[80px] sm:w-[88px] shrink-0 flex flex-col items-center justify-center text-center">
                <div
                  className={`w-16 h-16 sm:w-[70px] sm:h-[70px] rounded-2xl bg-slate-50/90 border border-slate-200/70 flex items-center justify-center shadow-3xs transition-opacity duration-200 ${
                    item.isActive ? 'opacity-100' : 'opacity-30'
                  }`}
                >
                  <span 
                    className="text-[46px] sm:text-[52px] leading-none select-none transition-transform" 
                    aria-hidden="true"
                  >
                    {item.emoji}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-black text-slate-800 mt-1.5 leading-tight tracking-tight text-center break-keep whitespace-nowrap">
                  {item.label}
                </h4>
              </div>

              {/* 오른쪽 영역: 예 / 아니오 버튼 2개를 나란히 균등 배치 */}
              <div 
                className="flex-1 min-w-0 grid grid-cols-2 gap-1.5 sm:gap-2 h-[64px] sm:h-[70px]" 
                role="group" 
                aria-label={`${item.label} 달성 여부`}
              >
                {/* 예 버튼 */}
                <button
                  type="button"
                  aria-pressed={item.selected === 'yes'}
                  onClick={() => handleSelectAnswer(item.id, 'yes')}
                  className={`w-full h-full px-1.5 sm:px-2 rounded-xl sm:rounded-2xl font-black flex items-center justify-center gap-1 sm:gap-2 transition-all cursor-pointer active:scale-95 touch-manipulation ${
                    item.selected === 'yes'
                      ? 'bg-emerald-600 text-white border-2 border-emerald-700 shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-[28px] sm:text-[32px] leading-none select-none shrink-0" aria-hidden="true">
                    😊
                  </span>
                  <span className="text-[15px] sm:text-[16px] font-black leading-none whitespace-nowrap break-keep">
                    예
                  </span>
                </button>

                {/* 아니오 버튼 */}
                <button
                  type="button"
                  aria-pressed={item.selected === 'no'}
                  onClick={() => handleSelectAnswer(item.id, 'no')}
                  className={`w-full h-full px-1.5 sm:px-2 rounded-xl sm:rounded-2xl font-black flex items-center justify-center gap-1 sm:gap-2 transition-all cursor-pointer active:scale-95 touch-manipulation ${
                    item.selected === 'no'
                      ? 'bg-amber-100/90 text-amber-950 border-2 border-amber-400 shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-[28px] sm:text-[32px] leading-none select-none shrink-0" aria-hidden="true">
                    😔
                  </span>
                  <span className="text-[15px] sm:text-[16px] font-black leading-none whitespace-nowrap break-keep">
                    아니오
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- POPUP DRESS-UP MODAL (라미 꾸미기 방) --- */}
      <AnimatePresence>
        {isDressUpModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-white rounded-3xl p-5 max-w-sm w-full text-center shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-left">
                  <span className="text-xl">🎒</span>
                  <div>
                    <h3 className="font-extrabold text-base text-on-surface">라미 꾸미기 방</h3>
                    <p className="text-[10px] text-on-surface-variant font-bold">건강별로 악세사리를 수집해 봐요!</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsDressUpModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
                  aria-label="닫기"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Stars summary & Level */}
              <div className="my-3 py-2 px-3 bg-amber-50 border border-amber-200/50 rounded-xl flex justify-between items-center text-xs font-bold">
                <span className="text-slate-600">내 성장: Lv.{companionLevel}</span>
                <span className="text-amber-600 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                  현재 {companionStars} 별 보유 중
                </span>
              </div>

              {/* List Container with Scrolling */}
              <div className="overflow-y-auto pr-1 flex-1 space-y-2 max-h-[50vh]">
                {DECORATION_ITEMS.map((item) => {
                  const isUnlocked = unlockedItems.includes(item.id);
                  const isEquipped = equippedItem === item.id;
                  const levelLocked = companionLevel < item.minLevel;
                  const starsLocked = companionStars < item.cost && !isUnlocked;
                  const canUnlock = !levelLocked && !starsLocked;

                  return (
                    <div 
                      key={item.id}
                      onClick={() => !levelLocked && (!starsLocked || isUnlocked) && handleItemClick(item)}
                      className={`p-3 rounded-2xl border text-left transition-all relative flex items-center gap-3 cursor-pointer ${
                        isEquipped 
                          ? 'border-primary bg-blue-50/50 ring-2 ring-primary/20 shadow-xs' 
                          : isUnlocked 
                            ? 'border-slate-200 bg-white hover:bg-slate-50/50'
                            : levelLocked 
                              ? 'border-slate-100 bg-slate-50/60 opacity-60 cursor-not-allowed'
                              : starsLocked 
                                ? 'border-slate-200 bg-stone-50/60'
                                : 'border-amber-200 bg-amber-50/30 hover:bg-amber-50/50'
                      }`}
                    >
                      {/* Avatar Item Emoji */}
                      <div className="w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center text-3xl border border-slate-100 shrink-0">
                        {item.emoji}
                      </div>

                      {/* Info block */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 justify-between">
                          <h4 className="text-xs font-black text-on-surface leading-none">{item.name}</h4>
                          
                          {/* Badges */}
                          {levelLocked ? (
                            <span className="bg-slate-200 text-slate-500 text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0">
                              <Lock className="w-2 h-2" />
                              Lv.{item.minLevel} 필요
                            </span>
                          ) : isEquipped ? (
                            <span className="bg-primary text-white text-[8px] font-black px-1.5 py-0.5 rounded shrink-0">
                              장착 중 👕
                            </span>
                          ) : isUnlocked ? (
                            <span className="bg-emerald-100 text-emerald-700 text-[8px] font-black px-1.5 py-0.5 rounded shrink-0">
                              보유 중
                            </span>
                          ) : (
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0 ${
                              canUnlock ? 'bg-amber-400 text-on-surface' : 'bg-stone-200 text-stone-500'
                            }`}>
                              ⭐ {item.cost}개
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-on-surface-variant font-semibold mt-1 leading-normal">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Close Button at bottom */}
              <button 
                onClick={() => setIsDressUpModalOpen(false)}
                className="mt-4 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-xl transition-transform active:scale-95 cursor-pointer"
              >
                닫기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
