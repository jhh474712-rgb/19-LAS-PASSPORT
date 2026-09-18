import React, { useState, useEffect } from 'react';
import { 
  Award, 
  User, 
  Footprints,
  ChevronLeft,
  Activity,
  Camera,
  Check,
  Smile,
  X
} from 'lucide-react';
import { MealLog, HealthLog, StepLog, WaterLog, UserProfile, AvatarType, CharacterAvatar, HealthGoalFootprint } from '../types';
import { PRACTICE_GOALS, PracticeAnswers } from './PracticeHubView';
import { CHARACTER_AVATARS, CHARACTER_AVATAR_MAP, getUserProfile, saveUserProfile } from '../utils/profile';
import { getWeekFootprintRecords, getMonthFootprintData, getLocalDateKey } from '../utils/date';

const STAMP_ANGLES = [-6, 5, -4, 7, -5, 4, -7, 6, -3, 5];

const PRACTICE_GOAL_SHORT_NAMES: Record<string, string> = {
  'physical-activity': '신체활동 실천',
  'exercise-snack': '생활 속 운동',
  'communication': '친구와 소통',
  'leisure-with-friend': '친구와 여가',
  'conflict-management': '갈등 대처하기',
  'color-food': '컬러푸드 섭취',
  'healthy-eating': '건강한 식사',
  'positive-emotion': '긍정적 마음',
  'negative-emotion': '마음 돌보기',
  'sleep-habit': '편안한 수면',
};

function MissionClearStamp({ dateStr, angle }: { dateStr: string; angle: number }) {
  const formattedDate = dateStr 
    ? dateStr.replace(/-/g, '.') 
    : new Date().toISOString().split('T')[0].replace(/-/g, '.');

  return (
    <div
      className="relative flex items-center justify-center select-none pointer-events-none transition-transform duration-300 transform-gpu my-auto"
      style={{ transform: `rotate(${angle}deg)` }}
    >
      {/* Outer thick stamp border */}
      <div className="w-[94px] h-[94px] sm:w-[102px] sm:h-[102px] rounded-full border-[2.5px] border-rose-600 p-[3px] flex items-center justify-center bg-rose-50/75 shadow-sm">
        {/* Inner concentric stamp border */}
        <div className="w-full h-full rounded-full border-[1.5px] border-dashed border-rose-500 flex flex-col items-center justify-between py-1.5 px-1 relative text-rose-600">
          {/* Top Stamp Decorative Stars */}
          <div className="flex items-center justify-center gap-1.5 text-[8px] sm:text-[9px] font-black tracking-widest text-rose-600 uppercase mt-0.5" aria-hidden="true">
            <span>★</span>
            <span>★</span>
            <span>★</span>
          </div>

          {/* Central Eye-Catching Stamp Typography (MISSION CLEAR) */}
          <div className="text-center my-auto flex flex-col items-center justify-center">
            <span className="block text-[14px] sm:text-[15.5px] font-black tracking-tight text-rose-600 leading-none drop-shadow-3xs uppercase">
              MISSION
            </span>
            <span className="block text-[15px] sm:text-[16.5px] font-black tracking-tight text-rose-600 leading-tight drop-shadow-3xs uppercase mt-0.5">
              CLEAR
            </span>
          </div>

          {/* Bottom Date with Stamp Rule - Enlarged & High Contrast */}
          <div className="w-full flex flex-col items-center mb-1">
            <div className="w-14 h-[1px] bg-rose-400/80 mb-1"></div>
            <span className="text-[10px] sm:text-[11.5px] font-black font-mono tracking-tight text-rose-700 leading-none">
              {formattedDate}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MyInfoViewProps {
  totalStepsThisWeek: number;
  waterDrunkThisWeek: number;
  averageWeight: number;
  userRole?: string;
  nickname?: string;
  userProfile?: UserProfile | null;
  onUpdateProfile?: (profile: UserProfile) => void;
  onResetOnboarding?: () => void;
  onNavigateToSubpage?: (pageId: string) => void;
  onNavigateToTab?: (tabId: string) => void;
  waterLog?: WaterLog;
  stepLog?: StepLog;
  mealLogs?: MealLog[];
  healthLog?: HealthLog | null;
  praiseCardReceived?: boolean;
  practiceAnswers?: PracticeAnswers;
  todayFootprint?: HealthGoalFootprint;
}

export default function MyInfoView({ 
  totalStepsThisWeek, 
  waterDrunkThisWeek, 
  averageWeight,
  userRole = 'youth',
  nickname = '김민수',
  userProfile,
  onUpdateProfile,
  onResetOnboarding,
  onNavigateToSubpage,
  onNavigateToTab,
  waterLog = { date: '', count: 0, goal: 4 },
  stepLog = { date: '', count: 0, goal: 5000, distanceKm: 0, caloriesKcal: 0 },
  mealLogs = [],
  healthLog = null,
  praiseCardReceived = false,
  practiceAnswers,
  todayFootprint
}: MyInfoViewProps) {
  const [profile, setProfile] = useState<UserProfile>(() => {
    return userProfile || getUserProfile() || {
      name: nickname || '김민수',
      role: 'challenger',
      avatarType: 'character',
      avatarValue: 'smile',
    };
  });

  useEffect(() => {
    if (userProfile) {
      setProfile(userProfile);
    } else {
      const p = getUserProfile();
      if (p) setProfile(p);
    }
  }, [userProfile]);

  // Profile Edit Modal State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [editAvatarType, setEditAvatarType] = useState<AvatarType>('character');
  const [editAvatarValue, setEditAvatarValue] = useState<CharacterAvatar | string>('smile');
  const modalPhotoInputRef = React.useRef<HTMLInputElement | null>(null);

  const openEditModal = () => {
    setEditName(profile.name || nickname || '');
    setEditAvatarType(profile.avatarType || 'character');
    setEditAvatarValue(profile.avatarValue || 'smile');
    setIsEditProfileOpen(true);
  };

  const handleModalPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setEditAvatarType('photo');
        setEditAvatarValue(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    const trimmedName = editName.trim();
    const updated: UserProfile = {
      name: trimmedName || profile.name || nickname || '사용자',
      role: 'challenger',
      avatarType: editAvatarType,
      avatarValue: editAvatarValue,
    };
    saveUserProfile(updated);
    setProfile(updated);
    if (onUpdateProfile) {
      onUpdateProfile(updated);
    }
    setIsEditProfileOpen(false);
  };

  const [youthGoals, setYouthGoals] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'week' | 'month' | null>(null);
  const [selectedDayDetail, setSelectedDayDetail] = useState<{
    dayNum: number;
    dateKey: string;
    answers: HealthGoalFootprint;
    yesCount: number;
  } | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const activePracticeAnswers = practiceAnswers ?? (() => {
    try {
      const saved = localStorage.getItem(`las_practice_answers_${todayStr}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error reading practice answers:', e);
    }
    return {};
  })();

  interface DayData {
    dateStr: string;
    dayName: string;
    steps: number;
    stepsGoal: number;
    water: number;
    waterGoal: number;
    hasMood: boolean;
    mood: number;
    sleepHours: number;
    mealCount: number;
    weight: number;
  }

  const getDaysData = (count: number): DayData[] => {
    const list: DayData[] = [];
    
    let allMeals: any[] = [];
    try {
      const savedMeals = localStorage.getItem('las_meals');
      if (savedMeals) allMeals = JSON.parse(savedMeals);
    } catch (e) {}

    for (let i = 0; i < count; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateKey(d);
      const dayName = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];

      const savedSteps = localStorage.getItem(`las_steps_${dateStr}`);
      const savedWater = localStorage.getItem(`las_water_${dateStr}`);
      const savedHealth = localStorage.getItem(`las_health_${dateStr}`);
      
      const dayMealsCount = allMeals.filter((m: any) => m.date === dateStr).length;

      let steps = 0;
      let stepsGoal = 10000;
      let water = 0;
      let waterGoal = 8;
      let hasMood = false;
      let mood = 0;
      let sleepHours = 0;
      let mealCount = dayMealsCount;
      let weight = 65.0;

      if (savedSteps) {
        try {
          const parsed = JSON.parse(savedSteps);
          steps = parsed.count || 0;
          stepsGoal = parsed.goal || 10000;
        } catch (e) {}
      }
      if (savedWater) {
        try {
          const parsed = JSON.parse(savedWater);
          water = parsed.count || 0;
          waterGoal = parsed.goal || 8;
        } catch (e) {}
      }
      if (savedHealth) {
        try {
          const parsed = JSON.parse(savedHealth);
          hasMood = true;
          mood = parsed.mood || 0;
          if (parsed.sleepDurationMinutes) {
            sleepHours = parseFloat((parsed.sleepDurationMinutes / 60).toFixed(1));
          } else if (parsed.sleepTime && parsed.wakeTime) {
            const [sh, sm] = parsed.sleepTime.split(':').map(Number);
            const [wh, wm] = parsed.wakeTime.split(':').map(Number);
            let diffMin = (wh * 60 + wm) - (sh * 60 + sm);
            if (diffMin < 0) diffMin += 24 * 60;
            sleepHours = parseFloat((diffMin / 60).toFixed(1));
          } else {
            sleepHours = 0;
          }
          weight = parsed.weight || 65.0;
        } catch (e) {}
      }

      list.push({
        dateStr,
        dayName,
        steps,
        stepsGoal,
        water,
        waterGoal,
        hasMood,
        mood,
        sleepHours,
        mealCount,
        weight
      });
    }
    return list;
  };

  const renderDailyFootprintsSection = (isParent = false) => {
    const isWeek = viewMode === 'week';
    const weekRecords = getWeekFootprintRecords(new Date(), todayFootprint);
    const monthData = getMonthFootprintData(new Date(), todayFootprint);

    const weeklyPhysicalDays = weekRecords.filter(d => !d.isFuture && d.answers.physical === 'yes').length;
    const weeklySocialDays = weekRecords.filter(d => !d.isFuture && d.answers.social === 'yes').length;
    const weeklyEmotionalDays = weekRecords.filter(d => !d.isFuture && d.answers.emotional === 'yes').length;

    return (
      <section className="bg-white rounded-2xl p-4 sm:p-5 border border-surface-container card-shadow space-y-5">
        {!isWeek && (
          <div className="text-left">
            <h2 className="text-[20px] sm:text-[22px] font-black text-slate-900 tracking-tight">
              {monthData.year}년 {monthData.month}월
            </h2>
          </div>
        )}

        {isWeek ? (
          <div className="space-y-6">
            {/* 요일 목록 (첫째 줄: 일, 월, 화, 수 / 둘째 줄: 목, 금, 토 가운데 정렬) */}
            <div className="space-y-2.5">
              {/* 첫째 줄: 일, 월, 화, 수 (4개) */}
              <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
                {weekRecords.slice(0, 4).map((day, idx) => {
                  const hasPhysical = !day.isFuture && day.answers.physical === 'yes';
                  const hasSocial = !day.isFuture && day.answers.social === 'yes';
                  const hasEmotional = !day.isFuture && day.answers.emotional === 'yes';
                  const hasAny = hasPhysical || hasSocial || hasEmotional;

                  return (
                    <div 
                      key={idx} 
                      className={`flex flex-col items-center justify-between p-2 rounded-2xl border text-center transition-all min-h-[110px] ${
                        day.isToday 
                          ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-400/30 shadow-xs' 
                          : day.isFuture 
                            ? 'bg-slate-50/40 border-slate-100 opacity-40' 
                            : 'bg-slate-50/70 border-slate-200/80'
                      }`}
                    >
                      <div>
                        <span className={`text-sm sm:text-base font-black block leading-tight ${
                          day.dayName === '일' 
                            ? 'text-rose-500' 
                            : day.dayName === '토' 
                              ? 'text-blue-500' 
                              : 'text-slate-800'
                        }`}>
                          {day.dayName}
                        </span>
                        <span className="text-xs sm:text-[13px] font-bold text-slate-400 mt-0.5 block leading-tight">
                          {day.date.getDate()}일
                        </span>
                      </div>

                      {/* 건강 아이콘들 (크기 32~36px, 세 아이콘 겹치지 않게 배치) */}
                      <div className="flex flex-wrap items-center justify-center gap-1 my-1">
                        {hasPhysical && (
                          <span title="신체 건강 달성" className="text-[30px] sm:text-[34px] leading-none select-none" aria-hidden="true">💪</span>
                        )}
                        {hasSocial && (
                          <span title="사회 건강 달성" className="text-[30px] sm:text-[34px] leading-none select-none" aria-hidden="true">🤝</span>
                        )}
                        {hasEmotional && (
                          <span title="정서 건강 달성" className="text-[30px] sm:text-[34px] leading-none select-none" aria-hidden="true">💖</span>
                        )}
                        {!hasAny && (
                          <span className="text-sm font-bold text-slate-300 select-none">-</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 둘째 줄: 목, 금, 토 (3개, 동일한 카드 너비로 가운데 정렬) */}
              <div className="flex justify-center">
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5 w-[75%]">
                  {weekRecords.slice(4, 7).map((day, idx) => {
                    const hasPhysical = !day.isFuture && day.answers.physical === 'yes';
                    const hasSocial = !day.isFuture && day.answers.social === 'yes';
                    const hasEmotional = !day.isFuture && day.answers.emotional === 'yes';
                    const hasAny = hasPhysical || hasSocial || hasEmotional;

                    return (
                      <div 
                        key={idx + 4} 
                        className={`flex flex-col items-center justify-between p-2 rounded-2xl border text-center transition-all min-h-[110px] ${
                          day.isToday 
                            ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-400/30 shadow-xs' 
                            : day.isFuture 
                              ? 'bg-slate-50/40 border-slate-100 opacity-40' 
                              : 'bg-slate-50/70 border-slate-200/80'
                        }`}
                      >
                        <div>
                          <span className={`text-sm sm:text-base font-black block leading-tight ${
                            day.dayName === '일' 
                              ? 'text-rose-500' 
                              : day.dayName === '토' 
                                ? 'text-blue-500' 
                                : 'text-slate-800'
                          }`}>
                            {day.dayName}
                          </span>
                          <span className="text-xs sm:text-[13px] font-bold text-slate-400 mt-0.5 block leading-tight">
                            {day.date.getDate()}일
                          </span>
                        </div>

                        {/* 건강 아이콘들 (크기 32~36px) */}
                        <div className="flex flex-wrap items-center justify-center gap-1 my-1">
                          {hasPhysical && (
                            <span title="신체 건강 달성" className="text-[30px] sm:text-[34px] leading-none select-none" aria-hidden="true">💪</span>
                          )}
                          {hasSocial && (
                            <span title="사회 건강 달성" className="text-[30px] sm:text-[34px] leading-none select-none" aria-hidden="true">🤝</span>
                          )}
                          {hasEmotional && (
                            <span title="정서 건강 달성" className="text-[30px] sm:text-[34px] leading-none select-none" aria-hidden="true">💖</span>
                          )}
                          {!hasAny && (
                            <span className="text-sm font-bold text-slate-300 select-none">-</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 이번 주 실천은 (성공 일수 큰 시각 카드 3종) */}
            <div className="space-y-3 pt-1">
              <h4 className="text-sm sm:text-base font-black text-slate-800 tracking-tight">
                이번 주 실천은
              </h4>

              <div className="space-y-2.5">
                {/* 신체 건강 카드 (연한 파란색 배경) */}
                <div className="p-3 sm:p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-2xl flex items-center justify-between gap-3 shadow-3xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[44px] sm:text-[50px] leading-none select-none shrink-0" aria-hidden="true">
                      💪
                    </span>
                    <span className="text-sm sm:text-base font-black text-slate-800 whitespace-nowrap break-keep">
                      신체 건강
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="min-w-[46px] sm:min-w-[52px] h-10 sm:h-11 px-2.5 bg-white border-2 border-blue-300 rounded-xl flex items-center justify-center shadow-3xs">
                      <span className="text-2xl sm:text-[28px] font-black text-blue-700 leading-none">
                        {weeklyPhysicalDays}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-black text-slate-600 whitespace-nowrap">
                      / 7일
                    </span>
                  </div>
                </div>

                {/* 사회 건강 카드 (연한 인디고/보라색 배경) */}
                <div className="p-3 sm:p-3.5 bg-indigo-50/80 border border-indigo-200/80 rounded-2xl flex items-center justify-between gap-3 shadow-3xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[44px] sm:text-[50px] leading-none select-none shrink-0" aria-hidden="true">
                      🤝
                    </span>
                    <span className="text-sm sm:text-base font-black text-slate-800 whitespace-nowrap break-keep">
                      사회 건강
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="min-w-[46px] sm:min-w-[52px] h-10 sm:h-11 px-2.5 bg-white border-2 border-indigo-300 rounded-xl flex items-center justify-center shadow-3xs">
                      <span className="text-2xl sm:text-[28px] font-black text-indigo-700 leading-none">
                        {weeklySocialDays}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-black text-slate-600 whitespace-nowrap">
                      / 7일
                    </span>
                  </div>
                </div>

                {/* 정서 건강 카드 (연한 로즈/핑크색 배경) */}
                <div className="p-3 sm:p-3.5 bg-rose-50/80 border border-rose-200/80 rounded-2xl flex items-center justify-between gap-3 shadow-3xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[44px] sm:text-[50px] leading-none select-none shrink-0" aria-hidden="true">
                      💖
                    </span>
                    <span className="text-sm sm:text-base font-black text-slate-800 whitespace-nowrap break-keep">
                      정서 건강
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="min-w-[46px] sm:min-w-[52px] h-10 sm:h-11 px-2.5 bg-white border-2 border-rose-300 rounded-xl flex items-center justify-center shadow-3xs">
                      <span className="text-2xl sm:text-[28px] font-black text-rose-700 leading-none">
                        {weeklyEmotionalDays}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-black text-slate-600 whitespace-nowrap">
                      / 7일
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-1 text-center pb-1 border-b border-slate-100">
              {['일', '월', '화', '수', '목', '금', '토'].map((name, i) => (
                <span 
                  key={name} 
                  className={`text-xs font-black ${
                    i === 0 ? 'text-rose-500' : i === 6 ? 'text-blue-500' : 'text-slate-500'
                  }`}
                >
                  {name}
                </span>
              ))}
            </div>

            {/* 달력 그리드 */}
            <div className="grid grid-cols-7 gap-1 pt-0.5">
              {/* 앞쪽 빈칸 */}
              {Array.from({ length: monthData.firstDayOfWeek }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-[58px] sm:h-[62px]" />
              ))}

              {monthData.days.map((day) => {
                // Only future days or today with no inputs are non-button states
                if (day.isFuture) {
                  return (
                    <div 
                      key={day.dayNum} 
                      className="flex flex-col items-center justify-between p-1 rounded-xl border border-[#D9DEE8] bg-[#F5F6F8] text-center h-[58px] sm:h-[62px] select-none pointer-events-none opacity-50"
                      aria-disabled="true"
                    >
                      <span className="text-[11px] font-bold text-[#9AA5B8]">
                        {day.dayNum}
                      </span>
                      <div className="h-7 w-full" />
                    </div>
                  );
                }

                // Today without completed inputs (neutral state)
                if (day.isToday && !day.hasRecord) {
                  return (
                    <div 
                      key={day.dayNum} 
                      className="flex flex-col items-center justify-between p-1 rounded-xl border border-blue-200/80 bg-white text-center h-[58px] sm:h-[62px] select-none ring-2 sm:ring-[3px] ring-[#4169E1] ring-offset-1 z-10"
                    >
                      <span className="text-[11px] font-black text-[#1E3A8A]">
                        {day.dayNum}
                      </span>
                      <div className="h-7 w-full flex items-center justify-center">
                        <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-md">오늘</span>
                      </div>
                    </div>
                  );
                }

                const hasPracticed = day.statusSymbol === '😊';

                return (
                  <button
                    key={day.dayNum} 
                    type="button"
                    onClick={() => setSelectedDayDetail({
                      dayNum: day.dayNum,
                      dateKey: day.dateKey,
                      answers: day.answers,
                      yesCount: day.yesCount
                    })}
                    aria-label={`${monthData.month}월 ${day.dayNum}일 실천 기록 확인하기`}
                    className={`relative flex flex-col items-center justify-between p-1 rounded-xl border text-center h-[58px] sm:h-[62px] transition-all cursor-pointer active:scale-95 shadow-3xs ${
                      hasPracticed 
                        ? 'bg-[#E8F7EF] border-[#49A36F]' 
                        : 'bg-[#FDECEC] border-[#E57373]'
                    } ${
                      day.isToday 
                        ? 'ring-2 sm:ring-[3px] ring-[#4169E1] ring-offset-1 z-10' 
                        : ''
                    }`}
                  >
                    <span className={`text-[11px] font-black leading-tight ${
                      day.isToday 
                        ? 'text-[#1E3A8A]' 
                        : hasPracticed 
                          ? 'text-[#1B5E20]' 
                          : 'text-[#C62828]'
                    }`}>
                      {day.dayNum}
                    </span>
                    
                    <div className="flex items-center justify-center h-7 w-full">
                      <span 
                        className="text-[26px] sm:text-[28px] leading-none select-none flex items-center justify-center"
                        role="img"
                        aria-label={hasPracticed ? '1개 이상 실천' : '실천한 목표 없음'}
                      >
                        {day.statusSymbol}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 범례 */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs font-bold text-slate-600 pt-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#E8F7EF] border border-[#49A36F] text-[#1B5E20]">
                <span className="text-sm leading-none" role="img" aria-label="1개 이상 실천">😊</span>
                <span>1개 이상 실천</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FDECEC] border border-[#E57373] text-[#C62828]">
                <span className="text-sm leading-none" role="img" aria-label="실천한 목표 없음">😟</span>
                <span>실천한 목표 없음</span>
              </span>
            </div>

            {/* 이번 달 실천은 */}
            <div className="space-y-3 pt-2">
              <h4 className="text-sm sm:text-base font-black text-slate-800 tracking-tight text-left">
                이번 달 실천은
              </h4>

              <div className="space-y-2.5">
                {/* 신체 건강 카드 */}
                <div className="p-3 sm:p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-2xl flex items-center justify-between gap-3 shadow-3xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[46px] sm:text-[50px] leading-none select-none shrink-0" aria-hidden="true">
                      💪
                    </span>
                    <span className="text-sm sm:text-base font-black text-slate-800 whitespace-nowrap break-keep">
                      신체 건강
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="min-w-[48px] sm:min-w-[54px] h-11 sm:h-12 px-2.5 bg-white border-2 border-blue-300 rounded-xl flex items-center justify-center shadow-3xs">
                      <span className="text-[28px] sm:text-[32px] font-black text-blue-700 leading-none">
                        {monthData.physicalCount}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-black text-slate-600 whitespace-nowrap">
                      / {monthData.daysInMonth}일
                    </span>
                  </div>
                </div>

                {/* 사회 건강 카드 */}
                <div className="p-3 sm:p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex items-center justify-between gap-3 shadow-3xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[46px] sm:text-[50px] leading-none select-none shrink-0" aria-hidden="true">
                      🤝
                    </span>
                    <span className="text-sm sm:text-base font-black text-slate-800 whitespace-nowrap break-keep">
                      사회 건강
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="min-w-[48px] sm:min-w-[54px] h-11 sm:h-12 px-2.5 bg-white border-2 border-emerald-300 rounded-xl flex items-center justify-center shadow-3xs">
                      <span className="text-[28px] sm:text-[32px] font-black text-emerald-700 leading-none">
                        {monthData.socialCount}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-black text-slate-600 whitespace-nowrap">
                      / {monthData.daysInMonth}일
                    </span>
                  </div>
                </div>

                {/* 정서 건강 카드 */}
                <div className="p-3 sm:p-3.5 bg-rose-50/80 border border-rose-200/80 rounded-2xl flex items-center justify-between gap-3 shadow-3xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[46px] sm:text-[50px] leading-none select-none shrink-0" aria-hidden="true">
                      💖
                    </span>
                    <span className="text-sm sm:text-base font-black text-slate-800 whitespace-nowrap break-keep">
                      정서 건강
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="min-w-[48px] sm:min-w-[54px] h-11 sm:h-12 px-2.5 bg-white border-2 border-rose-300 rounded-xl flex items-center justify-center shadow-3xs">
                      <span className="text-[28px] sm:text-[32px] font-black text-rose-700 leading-none">
                        {monthData.emotionalCount}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-black text-slate-600 whitespace-nowrap">
                      / {monthData.daysInMonth}일
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 날짜별 상세 팝업 */}
        {selectedDayDetail && (
          <div 
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
            role="dialog"
            aria-modal="true"
            onClick={() => setSelectedDayDetail(null)}
          >
            <div 
              className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-sm shadow-2xl border border-slate-100 space-y-4 animate-scaleUp text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 팝업 헤더: 선택한 날짜와 닫기 X 버튼 */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-[20px] sm:text-[22px] font-black text-slate-900 tracking-tight">
                  {monthData.month}월 {selectedDayDetail.dayNum}일
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedDayDetail(null)}
                  aria-label="팝업 닫기"
                  className="min-w-[44px] min-h-[44px] rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* 팝업 내용: 영역별 실천 상태 */}
              {selectedDayDetail.yesCount > 0 ? (
                <div className="space-y-2.5 py-1">
                  {/* 신체 건강 */}
                  <div className={`p-3.5 rounded-2xl flex items-center gap-3.5 shadow-3xs border ${
                    selectedDayDetail.answers.physical === 'yes'
                      ? 'bg-blue-50/90 border-blue-200/80'
                      : 'bg-slate-50/80 border-slate-200/60 opacity-85'
                  }`}>
                    <span className="text-[42px] sm:text-[46px] leading-none select-none shrink-0" aria-hidden="true">
                      💪
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-base sm:text-lg font-black text-slate-900 block">
                        신체 건강
                      </span>
                      <span className={`text-xs font-black block mt-0.5 ${
                        selectedDayDetail.answers.physical === 'yes' ? 'text-blue-600' : 'text-slate-400'
                      }`}>
                        {selectedDayDetail.answers.physical === 'yes' ? '실천 완료! (예)' : '실천하지 않음 (아니오)'}
                      </span>
                    </div>
                  </div>

                  {/* 사회 건강 */}
                  <div className={`p-3.5 rounded-2xl flex items-center gap-3.5 shadow-3xs border ${
                    selectedDayDetail.answers.social === 'yes'
                      ? 'bg-emerald-50/90 border-emerald-200/80'
                      : 'bg-slate-50/80 border-slate-200/60 opacity-85'
                  }`}>
                    <span className="text-[42px] sm:text-[46px] leading-none select-none shrink-0" aria-hidden="true">
                      🤝
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-base sm:text-lg font-black text-slate-900 block">
                        사회 건강
                      </span>
                      <span className={`text-xs font-black block mt-0.5 ${
                        selectedDayDetail.answers.social === 'yes' ? 'text-emerald-600' : 'text-slate-400'
                      }`}>
                        {selectedDayDetail.answers.social === 'yes' ? '실천 완료! (예)' : '실천하지 않음 (아니오)'}
                      </span>
                    </div>
                  </div>

                  {/* 정서 건강 */}
                  <div className={`p-3.5 rounded-2xl flex items-center gap-3.5 shadow-3xs border ${
                    selectedDayDetail.answers.emotional === 'yes'
                      ? 'bg-rose-50/90 border-rose-200/80'
                      : 'bg-slate-50/80 border-slate-200/60 opacity-85'
                  }`}>
                    <span className="text-[42px] sm:text-[46px] leading-none select-none shrink-0" aria-hidden="true">
                      💖
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-base sm:text-lg font-black text-slate-900 block">
                        정서 건강
                      </span>
                      <span className={`text-xs font-black block mt-0.5 ${
                        selectedDayDetail.answers.emotional === 'yes' ? 'text-rose-600' : 'text-slate-400'
                      }`}>
                        {selectedDayDetail.answers.emotional === 'yes' ? '실천 완료! (예)' : '실천하지 않음 (아니오)'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-5 px-4 bg-[#FDECEC]/80 rounded-2xl border border-[#E57373]/60 text-center space-y-3">
                  <span className="text-[48px] sm:text-[52px] block leading-none select-none" aria-hidden="true">
                    😟
                  </span>
                  <p className="text-base font-black text-[#C62828] leading-snug">
                    이날은 실천한 건강 목표가 없어요.
                  </p>
                  <div className="pt-2 border-t border-[#E57373]/30 space-y-1.5 text-left text-xs font-bold text-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">💪 신체 건강</span>
                      <span className="text-rose-600 font-extrabold">아니오</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">🤝 사회 건강</span>
                      <span className="text-rose-600 font-extrabold">아니오</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">💖 정서 건강</span>
                      <span className="text-rose-600 font-extrabold">아니오</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 하단 확인 버튼 */}
              <button
                type="button"
                onClick={() => setSelectedDayDetail(null)}
                className="w-full min-h-[44px] py-3 bg-primary hover:bg-primary-container active:scale-98 text-white font-black text-sm rounded-xl shadow-sm transition-all cursor-pointer"
              >
                확인
              </button>
            </div>
          </div>
        )}
      </section>
    );
  };

  const renderYouthView = () => {
    return (
      <div className="w-full text-left animate-fadeIn">
        {renderDailyFootprintsSection(false)}
      </div>
    );
  };

  useEffect(() => {
    try {
      const yg = localStorage.getItem('las_youth_goals');
      if (yg) setYouthGoals(JSON.parse(yg));
    } catch (e) {
      console.error('Error reading goals from localStorage:', e);
    }
  }, []);

  const getRoleLabel = () => {
    return '건강 도전자';
  };

  const renderInterestChips = () => {
    const goalsToDisplay: string[] = youthGoals && youthGoals.length > 0 ? youthGoals : [];

    if (goalsToDisplay.length === 0) {
      return (
        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[11px] font-extrabold px-2.5 py-1 rounded-full border border-blue-100">
          나에게 맞는 건강 목표를 찾아가는 중
        </span>
      );
    }

    const maxToShow = 3;
    const shownGoals = goalsToDisplay.slice(0, maxToShow);
    const extraCount = goalsToDisplay.length - maxToShow;

    return (
      <div className="flex flex-wrap items-center gap-1.5">
        {shownGoals.map((goal, idx) => (
          <span 
            key={idx} 
            className="inline-flex items-center bg-blue-50 text-blue-700 text-[11px] font-extrabold px-2.5 py-1 rounded-full border border-blue-100 shrink-0"
          >
            {goal}
          </span>
        ))}
        {extraCount > 0 && (
          <span className="text-[11px] font-black text-blue-800 bg-blue-100/60 px-2 py-0.5 rounded-md shrink-0">
            외 {extraCount}개
          </span>
        )}
      </div>
    );
  };

  if (viewMode) {
    return (
      <div className="w-full pb-16 animate-fadeIn text-left">
        {/* Header with Back Button */}
        <header className="flex items-center gap-3 py-3.5 border-b border-surface-container-high mb-4 sticky top-0 bg-background/95 backdrop-blur-md z-30">
          <button 
            type="button"
            onClick={() => {
              setViewMode(null);
              setSelectedDayDetail(null);
            }}
            aria-label="뒤로 가기"
            className="min-w-[44px] min-h-[44px] p-2 hover:bg-surface-container rounded-xl transition-all cursor-pointer text-on-surface-variant flex items-center justify-center bg-slate-50 border border-slate-100 shrink-0"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-[54px] h-[54px] min-w-[54px] rounded-full bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100 shadow-3xs">
              <Footprints className="w-10 h-10 stroke-[2.2]" aria-hidden="true" />
            </div>
            <h1 className="text-lg sm:text-xl font-black text-on-surface leading-tight truncate">
              {viewMode === 'week' ? '이번 주 건강 발자국' : '이번 달 건강 발자국'}
            </h1>
          </div>
        </header>

        {renderYouthView()}
      </div>
    );
  }

  return (
    <div className="w-full pb-12">
      {/* Header */}
      <header className="flex justify-between items-center py-4 border-b border-surface-container-high mb-6 sticky top-0 bg-background/95 backdrop-blur-md z-30">
        <div className="flex items-center gap-2">
          <User className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-extrabold text-on-surface">내 정보</h1>
        </div>
      </header>

      {/* Main Container */}
      <div className="space-y-6">
        
        {/* 1. Profile Section (Thin Horizontal Card) */}
        <section className="bg-white rounded-2xl px-4 py-3.5 sm:px-5 sm:py-4 card-shadow border border-surface-container text-left flex items-center gap-3.5 sm:gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 rounded-bl-full pointer-events-none"></div>
          
          {/* Avatar Display (Left) */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-primary/20 shrink-0 shadow-xs bg-blue-50/80 flex items-center justify-center">
            {profile.avatarType === 'photo' && profile.avatarValue ? (
              <img 
                src={profile.avatarValue} 
                alt="프로필 사진" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-3xl sm:text-4xl select-none">
                {CHARACTER_AVATAR_MAP[profile.avatarValue as CharacterAvatar]?.emoji || '🙂'}
              </span>
            )}
          </div>

          {/* Right Info Area */}
          <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-on-surface truncate leading-tight">
                  {(profile.name?.trim() || nickname?.trim() || '사용자')} 님
                </h2>
                <span className="bg-primary/10 text-primary text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0">
                  {getRoleLabel()}
                </span>
              </div>
            </div>

            {/* Profile Change Button */}
            <button
              type="button"
              onClick={openEditModal}
              className="self-start sm:self-auto px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] sm:text-xs font-black rounded-full border border-blue-200 shadow-3xs flex items-center gap-1 transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <Smile className="w-3 h-3 text-blue-600" />
              <span>프로필 바꾸기</span>
            </button>
          </div>
        </section>

        {/* 나의 건강 여권 도장판 (여권 속지 디자인) */}
        <section 
          id="health-passport-stamp-board"
          className="rounded-3xl border-2 border-[#e6decf] bg-[#fbf9f4] p-4.5 sm:p-6 text-left space-y-4 relative overflow-hidden shadow-xs"
        >
          {/* Subtle Guilloche / Passport Security Background Watermark */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.035] flex items-center justify-center select-none" aria-hidden="true">
            <svg width="340" height="340" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="92" stroke="#5c4d37" strokeWidth="1.5" strokeDasharray="3 3"/>
              <circle cx="100" cy="100" r="76" stroke="#5c4d37" strokeWidth="1.2"/>
              <circle cx="100" cy="100" r="60" stroke="#5c4d37" strokeWidth="1"/>
              <circle cx="100" cy="100" r="44" stroke="#5c4d37" strokeWidth="1.5" strokeDasharray="2 2"/>
              <circle cx="100" cy="100" r="28" stroke="#5c4d37" strokeWidth="1"/>
              <path d="M100 8 L100 192 M8 100 L192 100" stroke="#5c4d37" strokeWidth="0.8"/>
            </svg>
          </div>

          {/* Top Passport Sub-Header Strip */}
          <div className="flex items-center justify-between border-b border-[#e8dfcf] pb-2 text-[10px] sm:text-[11px] font-black text-[#968875] tracking-widest uppercase relative z-10">
            <span>LAS PASSPORT STAMPS</span>
          </div>

          {/* Section Main Header */}
          <div className="flex items-center justify-between gap-2 relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl select-none" role="img" aria-label="여권">🪪</span>
                <h3 className="font-black text-lg sm:text-xl text-[#42392c] tracking-tight">
                  나의 건강 여권 도장판
                </h3>
              </div>
              <p className="text-xs font-bold text-[#7a6f5e] mt-1">
                목표를 이루면 도장이 찍혀요!
              </p>
            </div>

            {/* Stamp Count Counter Badge */}
            <div className="bg-[#ede5d5]/85 border border-[#d8cbba] rounded-2xl px-3 py-1.5 text-center shrink-0 shadow-3xs">
              <span className="block text-[10px] font-bold text-[#7d705e]">완료 도장</span>
              <span className="text-sm sm:text-base font-black text-[#42392c]">
                {PRACTICE_GOALS.filter(g => activePracticeAnswers[g.id] === 'yes').length}
                <span className="text-xs font-semibold text-[#8a7c6a]"> / {PRACTICE_GOALS.length}</span>
              </span>
            </div>
          </div>

          {/* 10 Goals Grid in 2 Columns */}
          <div className="grid grid-cols-2 gap-3 sm:gap-3.5 pt-1 relative z-10">
            {PRACTICE_GOALS.map((goal, index) => {
              const isStamped = activePracticeAnswers[goal.id] === 'yes';
              const shortName = PRACTICE_GOAL_SHORT_NAMES[goal.id] || `목표 ${index + 1}`;

              return (
                <div 
                  key={goal.id} 
                  id={`passport-stamp-slot-${index + 1}`}
                  className={`p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 relative flex flex-col justify-between min-h-[150px] sm:min-h-[160px] overflow-hidden ${
                    isStamped 
                      ? 'bg-[#fffcf7] border-2 border-rose-300 shadow-xs ring-2 ring-rose-500/10' 
                      : 'bg-white/80 border-2 border-dashed border-[#dcd4c3]'
                  }`}
                >
                  {/* Slot Header: Goal number + Goal short name */}
                  <div className="flex items-start justify-between w-full">
                    <div className="text-left">
                      <span className="text-[10px] sm:text-[11px] font-black text-[#877864] tracking-wider uppercase block leading-none">
                        목표 {index + 1}
                      </span>
                      <h4 className="text-xs font-black text-[#42392c] leading-tight mt-1 line-clamp-1">
                        {shortName}
                      </h4>
                    </div>
                  </div>

                  {/* Stamp Display Area */}
                  <div className="flex-1 flex items-center justify-center py-1">
                    {isStamped ? (
                      <MissionClearStamp 
                        dateStr={todayStr} 
                        angle={STAMP_ANGLES[index % STAMP_ANGLES.length]} 
                      />
                    ) : (
                      <div className="w-[80px] h-[80px] sm:w-[88px] sm:h-[88px] rounded-full border-2 border-dashed border-[#ded4c3] flex flex-col items-center justify-center select-none bg-[#fbf9f4]/80 text-center">
                        <span className="text-base opacity-45">💮</span>
                        <span className="text-[10px] text-[#a89b88] font-black mt-0.5">도장 자리</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 나의 건강 발자국 카드 */}
        <section className="bg-white rounded-2xl p-4 sm:p-5 card-shadow border border-surface-container text-left space-y-3 animate-fadeIn">
          {/* 제목 영역: Footprints 아이콘 + 제목 (설명 문구는 완전 삭제) */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 shadow-3xs border border-purple-100">
              <Footprints className="w-6 h-6 sm:w-6.5 sm:h-6.5 stroke-[2.2]" aria-hidden="true" />
            </div>
            <h3 className="font-black text-base sm:text-lg text-on-surface leading-tight break-keep">
              나의 건강 발자국
            </h3>
          </div>
          
          {/* 이번 주 / 이번 달 보기 버튼 (모바일에서도 2열 나란히 유지, 76~80px 대형 그림 아이콘) */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
            {/* 이번 주 보기 버튼 (가로형 7일 주간 달력 아이콘) */}
            <button
              type="button"
              onClick={() => setViewMode('week')}
              aria-label="이번 주 건강 발자국 보기 (7일)"
              className="p-3 sm:p-4 bg-blue-50/90 hover:bg-blue-100/90 active:scale-97 text-slate-800 rounded-2xl flex flex-col items-center justify-center border-2 border-blue-200/90 transition-all cursor-pointer shadow-3xs min-h-[188px] sm:min-h-[196px]"
            >
              {/* 가로로 배열된 7일 큰 그림 아이콘 (76~80px) */}
              <div 
                className="w-[76px] h-[76px] sm:w-[80px] sm:h-[80px] rounded-2xl bg-white border-[2.5px] border-blue-400 shadow-sm flex flex-col justify-between overflow-hidden shrink-0 select-none"
                aria-hidden="true"
              >
                {/* 달력 상단 바인더 헤더 */}
                <div className="h-5 sm:h-5.5 bg-blue-500 flex items-center justify-between px-2.5 shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/95" />
                  <span className="text-[9px] font-black text-white tracking-widest leading-none">WEEK</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/95" />
                </div>

                {/* 7개 가로 날짜 칸 / 점 배열 */}
                <div className="flex-1 flex items-center justify-center px-1.5 bg-blue-50/40 py-1">
                  <div className="grid grid-cols-7 gap-0.5 w-full">
                    {Array.from({ length: 7 }).map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`h-7 rounded-[3px] flex flex-col items-center justify-center gap-0.5 ${
                          idx === 0 ? 'bg-rose-100' : idx === 6 ? 'bg-blue-100' : 'bg-slate-100'
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          idx === 0 ? 'bg-rose-500' : idx === 6 ? 'bg-blue-600' : 'bg-slate-500'
                        }`} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 아이콘 내부 7일 표시 */}
                <div className="bg-blue-600 py-1 text-center shrink-0">
                  <span className="text-[10px] font-black text-white leading-none block">
                    7일
                  </span>
                </div>
              </div>

              {/* 아이콘과 제목 사이 약 8~10px 간격 (mt-2.5), 16~18px 제목 및 보조 글자 */}
              <div className="flex flex-col items-center text-center mt-2.5">
                <span className="text-[16px] sm:text-[17px] font-black text-slate-900 leading-tight whitespace-nowrap">
                  이번 주 보기
                </span>
                <span className="text-xs sm:text-[13px] font-bold text-blue-700 bg-white border border-blue-200/90 px-2.5 py-0.5 rounded-full shadow-3xs mt-1.5 leading-none">
                  7일
                </span>
              </div>
            </button>

            {/* 이번 달 보기 버튼 (월간 달력 격자 아이콘) */}
            <button
              type="button"
              onClick={() => setViewMode('month')}
              aria-label="이번 달 건강 발자국 보기 (한 달)"
              className="p-3 sm:p-4 bg-purple-50/90 hover:bg-purple-100/90 active:scale-97 text-slate-800 rounded-2xl flex flex-col items-center justify-center border-2 border-purple-200/90 transition-all cursor-pointer shadow-3xs min-h-[188px] sm:min-h-[196px]"
            >
              {/* 월간 달력 격자 큰 그림 아이콘 (76~80px) */}
              <div 
                className="w-[76px] h-[76px] sm:w-[80px] sm:h-[80px] rounded-2xl bg-white border-[2.5px] border-purple-400 shadow-sm flex flex-col justify-between overflow-hidden shrink-0 select-none"
                aria-hidden="true"
              >
                {/* 달력 상단 바인더 헤더 */}
                <div className="h-5 sm:h-5.5 bg-purple-500 flex items-center justify-between px-2.5 shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/95" />
                  <span className="text-[9px] font-black text-white tracking-widest leading-none">MONTH</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/95" />
                </div>

                {/* 4줄 월간 날짜 칸 격자 (4x7 = 28칸) */}
                <div className="flex-1 flex items-center justify-center px-1.5 bg-purple-50/40 py-1">
                  <div className="grid grid-cols-7 gap-0.5 w-full">
                    {Array.from({ length: 28 }).map((_, idx) => (
                      <div 
                        key={idx} 
                        className="h-3 rounded-[2px] bg-purple-100 flex items-center justify-center"
                      >
                        <div className="w-1 h-1 rounded-full bg-purple-500" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 아이콘 내부 한 달 표시 */}
                <div className="bg-purple-600 py-1 text-center shrink-0">
                  <span className="text-[10px] font-black text-white leading-none block">
                    한 달
                  </span>
                </div>
              </div>

              {/* 아이콘과 제목 사이 약 8~10px 간격 (mt-2.5), 16~18px 제목 및 보조 글자 */}
              <div className="flex flex-col items-center text-center mt-2.5">
                <span className="text-[16px] sm:text-[17px] font-black text-slate-900 leading-tight whitespace-nowrap">
                  이번 달 보기
                </span>
                <span className="text-xs sm:text-[13px] font-bold text-purple-700 bg-white border border-purple-200/90 px-2.5 py-0.5 rounded-full shadow-3xs mt-1.5 leading-none">
                  한 달
                </span>
              </div>
            </button>
          </div>
        </section>

        {/* 6. Restart Onboarding Settings Action */}
        <section className="bg-white rounded-2xl p-5 border border-surface-container text-center space-y-2.5">
          <p className="text-xs text-on-surface-variant">
            회원정보 질문을 다시 답변하고 싶으신가요?
          </p>
          <button
            onClick={onResetOnboarding}
            className="w-full h-11 bg-surface-container hover:bg-primary/10 hover:text-primary text-on-surface-variant font-bold text-xs rounded-xl border border-surface-container-high flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>시작하기 / 온보딩 설정 다시 하기</span>
          </button>
        </section>
      </div>

      {/* Profile Edit Modal */}
      {isEditProfileOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-surface-container space-y-5 animate-scaleUp text-left max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <h3 className="text-lg font-black text-on-surface flex items-center gap-2">
                <Smile className="w-5 h-5 text-primary" />
                프로필을 바꿀까요?
              </h3>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* 1) Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-on-surface-variant block">
                이름 또는 닉네임
              </label>
              <input
                type="text"
                placeholder="이름을 적어주세요"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full h-12 px-3.5 bg-surface-container border-2 border-surface-variant rounded-xl text-base font-bold focus:border-primary focus:ring-0 text-left"
              />
            </div>

            {/* 2) 5 Default Characters */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-on-surface-variant block">
                기본 캐릭터 고르기
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {CHARACTER_AVATARS.map((char) => {
                  const isSelected = editAvatarType === 'character' && editAvatarValue === char.id;
                  return (
                    <button
                      key={char.id}
                      type="button"
                      onClick={() => {
                        setEditAvatarType('character');
                        setEditAvatarValue(char.id);
                      }}
                      className={`p-2 rounded-2xl border-2 flex flex-col items-center justify-between text-center transition-all cursor-pointer relative active:scale-95 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/90 ring-2 ring-blue-500/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xs">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                      <span className="text-2xl mb-1 select-none">{char.emoji}</span>
                      <span className={`text-[10px] font-black leading-tight ${isSelected ? 'text-blue-700 font-black' : 'text-slate-600'}`}>
                        {char.name.replace(' 친구', '').replace('기본 ', '')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3) Photo Upload & Preview */}
            <div className="space-y-2 pt-1 border-t border-surface-container">
              <label className="text-xs font-extrabold text-on-surface-variant block">
                내 사진으로 설정
              </label>
              <input
                ref={modalPhotoInputRef}
                type="file"
                accept="image/*"
                onChange={handleModalPhotoUpload}
                className="hidden"
              />

              {editAvatarType === 'photo' && typeof editAvatarValue === 'string' ? (
                <div className="p-3 bg-blue-50/80 border-2 border-blue-600 rounded-2xl flex items-center justify-between gap-3 animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-blue-600 shadow-sm shrink-0 bg-white">
                      <img
                        src={editAvatarValue}
                        alt="내 프로필 사진"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xs">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-black text-blue-950">내 사진 선택됨</p>
                      <p className="text-[10px] font-bold text-blue-700">이 사진으로 프로필이 바뀌어요.</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => modalPhotoInputRef.current?.click()}
                      className="px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-700 text-[11px] font-black rounded-lg border border-blue-200 transition-all cursor-pointer active:scale-95"
                    >
                      다른 사진
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => modalPhotoInputRef.current?.click()}
                  className="w-full py-2.5 px-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/40 text-slate-700 font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                >
                  <Camera className="w-4 h-4 text-blue-600" />
                  <span>내 사진 넣기</span>
                </button>
              )}
            </div>

            {/* 4) Modal Action Buttons: Cancel and Save */}
            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-surface-container">
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-black text-sm rounded-xl transition-all cursor-pointer active:scale-95"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="w-full py-3 bg-primary hover:bg-primary-container text-white font-black text-sm rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
