import React, { useState } from 'react';
import { 
  ClipboardList,
  Check
} from 'lucide-react';
import { MealLog, HealthLog, StepLog } from '../types';

export const PRACTICE_GOALS = [
  {
    id: 'physical-activity',
    label: '더 잘 해보고 싶은 신체활동 한 가지 수행하기',
  },
  {
    id: 'exercise-snack',
    label: 'Exercise Snack(생활 속 짧은 신체활동) 실천하기',
  },
  {
    id: 'communication',
    label: '대화의 3단계에 따라 친구와 소통하기',
  },
  {
    id: 'leisure-with-friend',
    label: '새로운 또는 이미 아는 친구와 연락하고 여가활동 하기',
  },
  {
    id: 'conflict-management',
    label: '갈등상황 확인하고 적절한 대처전략 사용하기',
  },
  {
    id: 'color-food',
    label: '5가지 컬러푸드 섭취하기',
  },
  {
    id: 'healthy-eating',
    label: '건강한 식사·식품안전 습관 실천하기',
  },
  {
    id: 'positive-emotion',
    label: '긍정적 감정을 느끼는 활동 실천하기',
  },
  {
    id: 'negative-emotion',
    label: '부정적 감정을 해결하는 활동 실천하기',
  },
  {
    id: 'sleep-habit',
    label: '편안한 수면습관 계획 실천하기',
  },
] as const;

export type PracticeAnswer = 'yes' | 'no' | null;

export type PracticeAnswers = Record<string, PracticeAnswer>;

interface PracticeHubViewProps {
  mealLogs?: MealLog[];
  healthLog?: HealthLog | null;
  stepLog?: StepLog;
  onNavigateToSubpage?: (pageId: string) => void;
  answers?: PracticeAnswers;
  onToggleAnswer?: (goalId: string, answer: 'yes' | 'no') => void;
}

export default function PracticeHubView({ 
  mealLogs, 
  healthLog, 
  stepLog, 
  onNavigateToSubpage,
  answers: propAnswers,
  onToggleAnswer: propOnToggleAnswer
}: PracticeHubViewProps) {
  const todayStr = new Date().toISOString().split('T')[0];
  const storageKey = `las_practice_answers_${todayStr}`;

  const [localAnswers, setLocalAnswers] = useState<PracticeAnswers>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load practice answers:', e);
    }
    return {};
  });

  const answers = propAnswers ?? localAnswers;

  const handleToggleAnswer = (goalId: string, answer: 'yes' | 'no') => {
    if (propOnToggleAnswer) {
      propOnToggleAnswer(goalId, answer);
      return;
    }

    setLocalAnswers((prev) => {
      const current = prev[goalId];
      const nextValue: PracticeAnswer = current === answer ? null : answer;
      const updated: PracticeAnswers = {
        ...prev,
        [goalId]: nextValue,
      };
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save practice answers:', e);
      }
      return updated;
    });
  };

  return (
    <div className="w-full pb-12">
      {/* 1. Header with updated title */}
      <header className="flex justify-between items-center py-4 border-b border-surface-container-high mb-6 sticky top-0 bg-background/95 backdrop-blur-md z-30">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-extrabold text-on-surface">실천 기록하기</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="space-y-6">
        {/* 2. Banner with single updated notice text */}
        <div className="text-left">
          <p className="text-base font-extrabold text-on-surface leading-relaxed break-keep">
            실천 목표를 지켰는지 점검해요.
          </p>
        </div>

        {/* 3 & 4 & 5. 10 Practice Goals with Yes/No Check */}
        <div className="space-y-3.5 text-left">
          {PRACTICE_GOALS.map((goal, index) => {
            const currentAnswer = answers[goal.id];
            return (
              <div 
                key={goal.id}
                id={`practice-goal-${goal.id}`}
                className="bg-white rounded-2xl p-4 border border-surface-container card-shadow transition-all"
              >
                {/* Number (1~10) + Goal Label */}
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary/10 text-primary font-black text-sm flex items-center justify-center shrink-0 mt-0.5 select-none">
                    {index + 1}
                  </span>
                  <p className="text-sm sm:text-base font-extrabold text-on-surface leading-snug break-keep flex-1 pt-0.5">
                    {goal.label}
                  </p>
                </div>

                {/* Yes / No Check Buttons */}
                <div className="grid grid-cols-2 gap-2.5 mt-3.5 pt-3 border-t border-slate-100">
                  {/* 예 버튼 */}
                  <button
                    type="button"
                    onClick={() => handleToggleAnswer(goal.id, 'yes')}
                    className={`min-h-[48px] py-2 px-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all cursor-pointer select-none active:scale-98 ${
                      currentAnswer === 'yes'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-black shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600 font-bold'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                      currentAnswer === 'yes'
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'bg-white border-slate-300 text-transparent'
                    }`}>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="text-sm sm:text-base">예</span>
                  </button>

                  {/* 아니오 버튼 */}
                  <button
                    type="button"
                    onClick={() => handleToggleAnswer(goal.id, 'no')}
                    className={`min-h-[48px] py-2 px-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all cursor-pointer select-none active:scale-98 ${
                      currentAnswer === 'no'
                        ? 'bg-rose-50 border-rose-400 text-rose-700 font-black shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600 font-bold'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                      currentAnswer === 'no'
                        ? 'bg-rose-500 border-rose-400 text-white'
                        : 'bg-white border-slate-300 text-transparent'
                    }`}>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="text-sm sm:text-base">아니오</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
