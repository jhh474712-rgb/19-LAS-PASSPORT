import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ChevronRight, 
  Award, 
  Flame, 
  Star, 
  Share2, 
  Footprints,
  Plus,
  Compass,
  Check
} from 'lucide-react';
import { StepLog } from '../types';

interface PedometerViewProps {
  initialLog?: StepLog;
  onBack: () => void;
  onShare: (text: string) => void;
  onUpdateSteps?: (steps: number, goal?: number) => void;
}

const GOAL_OPTIONS = [
  { label: '가볍게 걷기', value: 3000, desc: '3,000보' },
  { label: '오늘 목표', value: 5000, desc: '5,000보' },
  { label: '조금 더 걷기', value: 7000, desc: '7,000보' },
  { label: '많이 걷기', value: 10000, desc: '10,000보' },
];

export default function PedometerView({ initialLog, onBack, onShare, onUpdateSteps }: PedometerViewProps) {
  const [steps, setSteps] = useState<number>(initialLog?.count ?? 0);
  const [goal, setGoal] = useState<number>(initialLog?.goal ?? 5000);
  const [showGoalSelector, setShowGoalSelector] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [showDebug, setShowDebug] = useState<boolean>(false);

  // Derive distance and calories from step count
  const distanceKm = parseFloat((steps * 0.00074).toFixed(1));
  const caloriesKcal = Math.round(steps * 0.04);

  // Progress ring variables
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = goal > 0 ? Math.min(steps / goal, 1.0) : 0;
  const strokeDashoffset = circumference - (progressRatio * circumference);

  const isGoalReached = steps >= goal;

  const addSteps = (amount: number) => {
    const nextSteps = Math.max(0, steps + amount);
    setSteps(nextSteps);
    onUpdateSteps?.(nextSteps, goal);
  };

  const handleUpdateGoal = (newGoal: number) => {
    if (isGoalReached) return; // Prevent changing goal if already achieved
    setGoal(newGoal);
    onUpdateSteps?.(steps, newGoal);
  };

  const handleShare = () => {
    onShare(`민수님이 오늘 ${steps.toLocaleString()}걸음을 달성했습니다! 목표: ${goal.toLocaleString()}보, 거리: ${distanceKm}km, 소모 칼로리: ${caloriesKcal}kcal. 함께 응원해주세요!`);
  };

  return (
    <div className="w-full pb-12">
      {/* Sub Header */}
      <header className="flex items-center justify-between py-4 border-b border-surface-container-high mb-6 sticky top-0 bg-background/95 backdrop-blur-md z-10">
        <button 
          onClick={onBack}
          className="w-12 h-12 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold text-center flex-1 pr-12">활동 기록지</h2>
      </header>

      {/* Main Content */}
      <div className="space-y-6">
        <div className="text-left space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">오늘 얼마나 걸었나요?</h1>
          <p className="text-sm text-on-surface-variant">오늘은 5,000보를 걸어볼까요? 힘들면 목표를 바꿔도 괜찮아요.</p>
        </div>

        {/* 1. Today's Steps Circular Card */}
        <section className="bg-surface-container-lowest rounded-2xl p-6 card-shadow relative overflow-hidden border border-surface-container">
          {/* Badge */}
          {isGoalReached && (
            <div className="absolute top-4 right-4 animate-bounce z-10">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-white rounded-full font-bold text-xs shadow-sm">
                <Award className="w-3.5 h-3.5" />
                목표 달성!
              </span>
            </div>
          )}

          <div className="flex flex-col items-center justify-center text-center space-y-4 mt-2">
            <h2 className="font-bold text-lg text-on-surface-variant">오늘의 걸음 수</h2>
            
            {/* SVG Ring */}
            <div className="relative w-64 h-64 flex items-center justify-center my-2">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Circle */}
                <circle 
                  className="text-surface-container-high" 
                  cx="50" 
                  cy="50" 
                  fill="none" 
                  r={radius} 
                  stroke="currentColor" 
                  strokeWidth="8"
                ></circle>
                {/* Progress Circle */}
                <circle 
                  className={`${isGoalReached ? 'text-secondary' : 'text-primary'} transition-all duration-500 ease-out`} 
                  cx="50" 
                  cy="50" 
                  fill="none" 
                  r={radius} 
                  stroke="currentColor" 
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                ></circle>
              </svg>

              <div className="flex flex-col items-center z-10">
                <div className="text-4xl font-extrabold text-on-surface tracking-tight font-sans">
                  {steps.toLocaleString()}
                </div>
                <div className="text-sm text-on-surface-variant flex items-center gap-1 mt-1.5 font-bold">
                  <Footprints className="w-4 h-4 text-primary" />
                  <span>현재 {steps.toLocaleString()}보 / {goal.toLocaleString()}보</span>
                </div>
              </div>
            </div>

            {/* Target remaining display */}
            <div className="bg-slate-50/80 rounded-2xl py-3 px-5 border border-slate-150 inline-block font-extrabold text-sm text-on-surface-variant">
              {isGoalReached ? (
                <span className="text-secondary flex items-center gap-1 justify-center">
                  🎉 오늘 목표를 달성했어요!
                </span>
              ) : (
                <span>오늘 목표까지 <strong className="text-primary font-black">{(goal - steps).toLocaleString()}보</strong> 남았어요.</span>
              )}
            </div>

            {/* Primary Step Recording Button */}
            <div className="w-full max-w-sm pt-2">
              <button
                onClick={() => addSteps(1000)}
                className="w-full h-12 bg-primary hover:bg-primary-container text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 transition-all"
              >
                <Plus className="w-5 h-5 stroke-[3]" />
                걸음 기록하기 (+1,000보) 🚶
              </button>
            </div>

            {/* Goal changer section */}
            <div className="w-full max-w-sm pt-1">
              {isGoalReached ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                  <p className="text-xs font-bold text-emerald-800 leading-relaxed">
                    오늘 목표를 달성했어요. 내일 다시 목표를 바꿀 수 있어요. 🌟
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => setShowGoalSelector(!showGoalSelector)}
                    className="w-full h-11 bg-blue-50/50 hover:bg-blue-100 text-primary border border-blue-200/60 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    🎯 목표 바꾸기 {showGoalSelector ? '닫기 ▲' : '열기 ▼'}
                  </button>

                  {showGoalSelector && (
                    <div className="bg-white border border-slate-150 rounded-2xl p-4 space-y-4 animate-slideDown text-left">
                      <div className="text-center space-y-1 pb-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-500">
                          오늘 내 몸에 맞는 목표를 골라보세요.
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold">
                          목표를 바꿔도 실제 걸음 수는 바뀌지 않아요.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {GOAL_OPTIONS.map((opt) => {
                          const isSelected = goal === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => handleUpdateGoal(opt.value)}
                              className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer text-center relative ${
                                isSelected 
                                  ? 'bg-blue-50/70 border-blue-500 text-primary shadow-xs' 
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {isSelected && (
                                <div className="absolute top-1 right-1.5 text-blue-500">
                                  <Check className="w-4.5 h-4.5 stroke-[3]" />
                                </div>
                              )}
                              <span className="text-[10px] font-bold text-slate-400">{opt.label}</span>
                              <span className="text-xs font-black tracking-tight">{opt.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Details Accordion for Distance & Calories */}
          <div className="w-full max-w-sm mx-auto mt-4 border border-slate-150 rounded-2xl overflow-hidden bg-white">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full py-3.5 px-4 flex items-center justify-between text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <span>📊 거리와 칼로리 자세히 보기</span>
              <span className="text-primary">{showDetails ? '닫기 ▲' : '열기 ▼'}</span>
            </button>
            
            {showDetails && (
              <div className="grid grid-cols-2 gap-4 p-4 border-t border-slate-100 bg-slate-50/30 text-left animate-slideDown">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-on-surface-variant">걸은 거리</div>
                    <div className="text-sm font-black text-on-surface font-sans">{distanceKm} km</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-on-surface-variant">소모 열량</div>
                    <div className="text-sm font-black text-on-surface font-sans">{caloriesKcal} kcal</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 2. Weekly Trends */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="md:col-span-2 bg-surface-container-lowest rounded-2xl p-6 card-shadow border border-surface-container">
            <div className="flex flex-col mb-4">
              <h3 className="font-bold text-base text-on-surface">이번 주 걷기</h3>
              <p className="text-xs text-on-surface-variant">많이 걸은 날을 볼 수 있어요.</p>
            </div>

            {/* Custom Bar Chart with Wednesday marked as current day */}
            <div className="h-44 flex items-end justify-between gap-2.5 mt-4 px-1">
              {/* Day Mon */}
              <div className="flex flex-col items-center flex-1 gap-2 group h-full justify-end">
                <div className="w-full bg-primary-container/30 rounded-t-md relative group flex flex-col justify-end hover:bg-primary-container/50 transition-colors cursor-pointer" style={{ height: '60%' }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[10px] py-1 px-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md font-sans">6,200</div>
                </div>
                <span className="text-xs font-semibold text-on-surface-variant">월</span>
              </div>

              {/* Day Tue */}
              <div className="flex flex-col items-center flex-1 gap-2 group h-full justify-end">
                <div className="w-full bg-primary-container/30 rounded-t-md relative group flex flex-col justify-end hover:bg-primary-container/50 transition-colors cursor-pointer" style={{ height: '45%' }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[10px] py-1 px-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md font-sans">4,500</div>
                </div>
                <span className="text-xs font-semibold text-on-surface-variant">화</span>
              </div>

              {/* Day Wed - Current Day */}
              <div className="flex flex-col items-center flex-1 gap-2 group h-full justify-end">
                <div className="w-full bg-secondary rounded-t-md relative group flex flex-col justify-end hover:bg-secondary/90 transition-colors cursor-pointer" style={{ height: `${Math.min((steps / goal) * 100, 100)}%` }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[10px] py-1 px-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md font-sans">{steps.toLocaleString()}</div>
                </div>
                <span className="text-xs font-bold text-primary">수</span>
              </div>

              {/* Day Thu */}
              <div className="flex flex-col items-center flex-1 gap-2 group h-full justify-end">
                <div className="w-full bg-surface-container-high rounded-t-md relative group flex flex-col justify-end" style={{ height: '0%' }}></div>
                <span className="text-xs font-semibold text-on-surface-variant">목</span>
              </div>

              {/* Day Fri */}
              <div className="flex flex-col items-center flex-1 gap-2 group h-full justify-end">
                <div className="w-full bg-surface-container-high rounded-t-md relative group flex flex-col justify-end" style={{ height: '0%' }}></div>
                <span className="text-xs font-semibold text-on-surface-variant">금</span>
              </div>

              {/* Day Sat */}
              <div className="flex flex-col items-center flex-1 gap-2 group h-full justify-end">
                <div className="w-full bg-surface-container-high rounded-t-md relative group flex flex-col justify-end" style={{ height: '0%' }}></div>
                <span className="text-xs font-semibold text-on-surface-variant">토</span>
              </div>

              {/* Day Sun */}
              <div className="flex flex-col items-center flex-1 gap-2 group h-full justify-end">
                <div className="w-full bg-surface-container-high rounded-t-md relative group flex flex-col justify-end" style={{ height: '0%' }}></div>
                <span className="text-xs font-semibold text-on-surface-variant">일</span>
              </div>
            </div>
          </div>

          {/* Star/Badge widget */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 card-shadow flex flex-col items-center text-center justify-center relative overflow-hidden border border-surface-container">
            {/* background dot pattern */}
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
            
            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 mb-4 z-10 shadow-xs animate-pulse">
              <Star className="w-8 h-8 fill-amber-400 stroke-amber-500" />
            </div>
            
            <h3 className="font-bold text-lg text-on-surface mb-1 z-10">멋진 속도예요!</h3>
            <p className="text-xs text-on-surface-variant z-10 leading-relaxed max-w-[200px] mx-auto">
              주간 걸음수 목표 달성을 위해 무척 훌륭하게 걷고 있어요. 계속해서 기분 좋게 움직여봐요!
            </p>
            
            <button 
              onClick={handleShare}
              className="mt-6 w-full py-3 bg-primary hover:bg-primary-container text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 z-10 interactive-card cursor-pointer shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              기록 공유하기
            </button>
          </div>
        </section>

        {/* Prototype testing collapsible area (Placed discreetly at the bottom) */}
        <section className="w-full text-center">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="inline-flex py-1.5 px-3 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-200 rounded-lg text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            ⚙️ 프로토타입 테스트용 개발자 메뉴 {showDebug ? '닫기 ▲' : '열기 ▼'}
          </button>
          
          {showDebug && (
            <div className="mt-2 p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex gap-2 justify-center items-center max-w-xs mx-auto animate-slideDown">
              <button
                onClick={() => addSteps(1000)}
                className="px-2.5 py-1 bg-primary text-white rounded text-[10px] font-extrabold active:scale-95 cursor-pointer shadow-xs"
              >
                걸음 수 +1,000
              </button>
              <button
                onClick={() => {
                  setSteps(0);
                  onUpdateSteps?.(0, goal);
                }}
                className="px-2.5 py-1 bg-surface-container text-on-surface-variant rounded text-[10px] font-extrabold active:scale-95 cursor-pointer"
              >
                걸음 수 초기화
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
