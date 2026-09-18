import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Scale, 
  Moon, 
  Sun, 
  Smile, 
  Save, 
  Sparkles,
  Frown,
  Meh,
  SmilePlus
} from 'lucide-react';
import { HealthLog } from '../types';

interface HealthLogViewProps {
  initialLog?: HealthLog;
  onBack: () => void;
  onSave: (log: HealthLog) => void;
}

export default function HealthLogView({ initialLog, onBack, onSave }: HealthLogViewProps) {
  const [weight, setWeight] = useState<number>(initialLog?.weight ?? 65.0);
  const [sleepTime, setSleepTime] = useState<string>(initialLog?.sleepTime ?? '23:00');
  const [wakeTime, setWakeTime] = useState<string>(initialLog?.wakeTime ?? '07:00');
  const [sleepDurationText, setSleepDurationText] = useState<string>('8시간 0분');
  const [mood, setMood] = useState<number>(initialLog?.mood ?? 4);

  // Calculate sleep duration whenever sleepTime or wakeTime changes
  useEffect(() => {
    const [sHour, sMin] = sleepTime.split(':').map(Number);
    const [wHour, wMin] = wakeTime.split(':').map(Number);

    let sleepMinutes = sHour * 60 + sMin;
    let wakeMinutes = wHour * 60 + wMin;

    let diffMinutes = 0;
    if (wakeMinutes >= sleepMinutes) {
      diffMinutes = wakeMinutes - sleepMinutes;
    } else {
      diffMinutes = (24 * 60 - sleepMinutes) + wakeMinutes;
    }

    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    setSleepDurationText(`${hours}시간 ${mins}분`);
  }, [sleepTime, wakeTime]);

  const handleSave = () => {
    // Calculate total duration in minutes
    const [sHour, sMin] = sleepTime.split(':').map(Number);
    const [wHour, wMin] = wakeTime.split(':').map(Number);
    let sleepMinutes = sHour * 60 + sMin;
    let wakeMinutes = wHour * 60 + wMin;
    let diffMinutes = wakeMinutes >= sleepMinutes ? wakeMinutes - sleepMinutes : (24 * 60 - sleepMinutes) + wakeMinutes;

    onSave({
      date: new Date().toISOString().split('T')[0],
      weight,
      sleepTime,
      wakeTime,
      sleepDurationMinutes: diffMinutes,
      mood
    });
  };

  const moodTexts: Record<number, string> = {
    1: '매우 우울하고 힘들어요 😭',
    2: '조금 기분이 가라앉아요 😢',
    3: '그냥 보통이에요 😐',
    4: '기분이 아주 괜찮아요 🙂',
    5: '날아갈 듯이 매우 좋아요! 😄',
  };

  return (
    <div className="w-full pb-12">
      {/* Sub Header */}
      <header className="flex items-center justify-between py-4 border-b border-surface-container-high mb-6 sticky top-0 bg-background/95 backdrop-blur-md z-10">
        <button 
          onClick={onBack}
          className="w-12 h-12 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold text-center flex-1 pr-12">오늘의 건강 기록</h2>
      </header>

      {/* Main Content */}
      <div className="space-y-6">
        <div className="text-left space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">오늘의 건강 기록</h1>
          <p className="text-sm text-on-surface-variant">매일 조금씩 무게, 수면, 기분을 기록하며 어제와 오늘의 건강 상태를 비교해봐요.</p>
        </div>

        {/* 1. Weight tracking */}
        <section className="bg-surface-container-lowest rounded-2xl p-6 card-shadow border border-surface-container hover:border-primary/10 transition-all">
          <div className="flex items-center gap-3 mb-6 text-left">
            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container shadow-xs">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface">몸무게 기록</h2>
              <p className="text-xs text-on-surface-variant">체중 변화는 내 몸 상태의 중요한 신호예요</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-4">
            <div className="flex items-baseline gap-2 mb-4 justify-center">
              <input 
                type="number"
                step="0.1"
                min="30"
                max="150"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                className="text-3xl font-extrabold text-center w-28 bg-surface-container-low border-b-3 border-primary focus:border-primary-container focus:ring-0 px-2 py-1 rounded-t-lg transition-colors text-primary font-mono"
              />
              <span className="text-lg font-bold text-on-surface-variant">kg</span>
            </div>

            <div className="w-full max-w-md px-4 mt-2">
              <input 
                type="range"
                min="40"
                max="120"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value))}
                className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary focus:outline-hidden"
              />
              <div className="flex justify-between text-xs text-on-surface-variant mt-2 px-1 font-mono">
                <span>40.0 kg</span>
                <span>80.0 kg</span>
                <span>120.0 kg</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Sleep Tracking Card */}
        <section className="bg-surface-container-lowest rounded-2xl p-6 card-shadow border border-surface-container hover:border-primary/10 transition-all">
          <div className="flex items-center gap-3 mb-6 text-left">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-xs">
              <Moon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface">수면 시간 기록</h2>
              <p className="text-xs text-on-surface-variant">충분한 수면은 면역력을 높여주고 머리를 상쾌하게 만들어요</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-on-surface-variant mb-2 pl-1 flex items-center gap-1">
                <Moon className="w-3.5 h-3.5 text-primary" /> 취침 시간 (잠든 시간)
              </label>
              <input 
                type="time"
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
                className="w-full h-12 px-4 bg-surface-container border-2 border-surface-variant rounded-xl text-base font-bold focus:border-primary focus:ring-0 transition-colors"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-bold text-on-surface-variant mb-2 pl-1 flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-amber-500" /> 기상 시간 (일어난 시간)
              </label>
              <input 
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full h-12 px-4 bg-surface-container border-2 border-surface-variant rounded-xl text-base font-bold focus:border-primary focus:ring-0 transition-colors"
              />
            </div>
          </div>

          <div className="mt-6 bg-surface-container-low rounded-xl p-4 flex items-center justify-between border border-surface-variant shadow-xs">
            <span className="text-sm font-semibold text-on-surface-variant">오늘 나의 총 수면 시간:</span>
            <span className="text-xl font-extrabold text-primary font-sans">{sleepDurationText}</span>
          </div>
        </section>

        {/* 3. Mood tracking */}
        <section className="bg-surface-container-lowest rounded-2xl p-6 card-shadow border border-surface-container hover:border-primary/10 transition-all">
          <div className="flex items-center gap-3 mb-6 text-left">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shadow-xs">
              <Smile className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface">오늘의 기분 기록</h2>
              <p className="text-xs text-on-surface-variant">나의 감정 변화를 들여다보면 마음 건강 관리에 도움이 돼요</p>
            </div>
          </div>

          {/* Emoji row */}
          <div className="flex justify-between items-center py-4 px-2 max-w-sm mx-auto">
            {/* Very sad (1) */}
            <button
              onClick={() => setMood(1)}
              className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all group ${
                mood === 1 
                  ? 'bg-red-500 border-red-500 text-white scale-110 shadow-md' 
                  : 'border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container-low'
              }`}
              title="매우 우울함"
            >
              <Frown className={`w-8 h-8 group-hover:scale-110 transition-transform ${mood === 1 ? 'stroke-white' : 'stroke-red-500'}`} />
            </button>

            {/* Sad (2) */}
            <button
              onClick={() => setMood(2)}
              className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all group ${
                mood === 2 
                  ? 'bg-orange-400 border-orange-400 text-white scale-110 shadow-md' 
                  : 'border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container-low'
              }`}
              title="조금 우울함"
            >
              <Frown className={`w-8 h-8 group-hover:scale-110 transition-transform ${mood === 2 ? 'stroke-white' : 'stroke-orange-400'}`} />
            </button>

            {/* Neutral (3) */}
            <button
              onClick={() => setMood(3)}
              className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all group ${
                mood === 3 
                  ? 'bg-amber-400 border-amber-400 text-white scale-110 shadow-md' 
                  : 'border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container-low'
              }`}
              title="보통"
            >
              <Meh className={`w-8 h-8 group-hover:scale-110 transition-transform ${mood === 3 ? 'stroke-white' : 'stroke-amber-500'}`} />
            </button>

            {/* Happy (4) */}
            <button
              onClick={() => setMood(4)}
              className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all group ${
                mood === 4 
                  ? 'bg-primary border-primary text-white scale-110 shadow-md' 
                  : 'border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container-low'
              }`}
              title="좋음"
            >
              <Smile className={`w-8 h-8 group-hover:scale-110 transition-transform ${mood === 4 ? 'stroke-white' : 'stroke-primary'}`} />
            </button>

            {/* Very Happy (5) */}
            <button
              onClick={() => setMood(5)}
              className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all group ${
                mood === 5 
                  ? 'bg-emerald-500 border-emerald-500 text-white scale-110 shadow-md' 
                  : 'border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container-low'
              }`}
              title="매우 좋음"
            >
              <SmilePlus className={`w-8 h-8 group-hover:scale-110 transition-transform ${mood === 5 ? 'stroke-white' : 'stroke-emerald-500'}`} />
            </button>
          </div>

          <p className="text-center text-sm font-bold text-primary mt-2 min-h-6 bg-primary/5 py-2.5 rounded-lg border border-primary/10 max-w-xs mx-auto">
            {moodTexts[mood]}
          </p>
        </section>

        {/* Save Button */}
        <button 
          onClick={handleSave}
          className="w-full h-14 bg-primary hover:bg-primary-container text-white rounded-xl flex items-center justify-center gap-2 text-lg font-bold shadow-md interactive-card cursor-pointer"
        >
          <Save className="w-5 h-5" />
          기록 저장하기
        </button>
      </div>
    </div>
  );
}
