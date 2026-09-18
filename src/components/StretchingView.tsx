import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw,
  CheckCircle, 
  Sparkles, 
  Dumbbell, 
  Lightbulb, 
  Footprints, 
  Heart,
  Volume2,
  VolumeX
} from 'lucide-react';

interface StretchingViewProps {
  onBack: () => void;
  onComplete: () => void;
}

export default function StretchingView({ onBack, onComplete }: StretchingViewProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Timer simulation
  useEffect(() => {
    let timer: any;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isCompleted) {
      setIsPlaying(false);
      setIsCompleted(true);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, isCompleted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = ((600 - timeLeft) / 600) * 100;

  const handleCompleteClick = () => {
    setIsPlaying(false);
    onComplete();
  };

  return (
    <div className="w-full pb-24">
      {/* Sub header / Navigation bar */}
      <header className="flex items-center justify-between py-4 border-b border-surface-container-high mb-6 sticky top-0 bg-background/95 backdrop-blur-md z-10">
        <button 
          onClick={onBack}
          className="w-12 h-12 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="text-sm font-semibold text-on-surface-variant">실천하기 (Practice)</span>
        <div className="w-12 h-12"></div> {/* spacing */}
      </header>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Hero Video / Instruction Placeholder */}
        <section className="relative w-full rounded-2xl overflow-hidden card-shadow bg-surface-container-lowest group border border-surface-container">
          <div className="w-full aspect-video relative">
            <img 
              src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80" 
              alt="Stretching Guide" 
              className={`w-full h-full object-cover transition-transform duration-500 ${isPlaying ? 'scale-105' : 'group-hover:scale-102'}`}
              referrerPolicy="no-referrer"
            />
            {/* Dark overlay */}
            <div className={`absolute inset-0 bg-black/35 flex flex-col justify-between p-4 transition-all ${isPlaying ? 'bg-black/10' : ''}`}>
              {/* Top controls info */}
              <div className="flex justify-between items-center">
                <span className="bg-black/60 text-white text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  코칭 동영상
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                  className="w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Central play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                {isPlaying ? (
                  <button 
                    onClick={() => setIsPlaying(false)}
                    className="w-16 h-16 bg-white/90 text-primary rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                  >
                    <Pause className="w-8 h-8 fill-primary ml-0" />
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsPlaying(true)}
                    className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                  >
                    <Play className="w-8 h-8 fill-white ml-1" />
                  </button>
                )}
              </div>

              {/* Bottom progress bar */}
              <div className="w-full space-y-1 bg-black/60 p-3 rounded-lg backdrop-blur-xs">
                <div className="flex justify-between items-center text-white text-xs font-bold font-mono">
                  <span>스트레칭 진행 중</span>
                  <span>{formatTime(timeLeft)}</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-primary-container h-1.5 rounded-full transition-all duration-1000"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Session Title & Objective */}
        <section className="text-left space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
            <Dumbbell className="w-3.5 h-3.5" />
            <span>신체 건강 (Physical Health)</span>
          </div>
          <h1 className="text-2xl font-bold text-on-surface">가벼운 전신 스트레칭</h1>
          <p className="text-base text-on-surface-variant leading-relaxed">
            몸의 긴장을 풀고 유연성을 기르는 10분 스트레칭입니다. 영상을 보며 천천히 나의 속도에 맞춰 따라해보세요.
          </p>
        </section>

        {/* Steps Breakdown */}
        <section className="text-left space-y-4">
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-1.5 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            진행 순서
          </h2>

          {/* Step 1: Preparation */}
          <article className="bg-surface-container-lowest rounded-xl p-5 flex items-start gap-4 shadow-sm border border-surface-container hover:border-primary/20 transition-all">
            <div className="w-12 h-12 shrink-0 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-on-surface">1. 준비하기</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                편안한 옷을 입고 주변 물건들을 한쪽으로 치워 몸을 넓게 움직일 수 있는 안전한 공간을 확보하세요.
              </p>
            </div>
          </article>

          {/* Step 2: Main Stretching */}
          <article className={`rounded-xl p-5 flex items-start gap-4 shadow-sm border transition-all ${isPlaying ? 'bg-primary/5 border-primary/30' : 'bg-surface-container-lowest border-surface-container'}`}>
            <div className="w-12 h-12 shrink-0 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Footprints className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                2. 영상 따라하기
                {isPlaying && <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-md animate-pulse">동작 중</span>}
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                위 코칭 동영상을 재생한 뒤, 스트레칭 강사의 부드러운 움직임을 무리하지 않는 선에서 기분 좋게 따라합니다.
              </p>
            </div>
          </article>

          {/* Step 3: Rest & Breath */}
          <article className="bg-surface-container-lowest rounded-xl p-5 flex items-start gap-4 shadow-sm border border-surface-container hover:border-primary/20 transition-all">
            <div className="w-12 h-12 shrink-0 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
              <Heart className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-on-surface">3. 휴식 및 호흡</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                운동 세션이 모두 끝나면 바닥에 편안히 주저앉아 1분 동안 코로 깊게 숨을 들이마시고 입으로 내쉬며 정돈합니다.
              </p>
            </div>
          </article>
        </section>

        {/* Sticky bottom CTA action bar */}
        <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto w-full bg-background/90 backdrop-blur-md px-4 py-4 border-t border-surface-container-high z-40">
          <button 
            onClick={handleCompleteClick}
            className="w-full h-14 bg-primary hover:bg-primary-container text-white rounded-xl flex items-center justify-center gap-2 shadow-lg interactive-card font-bold text-lg cursor-pointer"
          >
            <CheckCircle className="w-6 h-6 text-white" />
            완료 표시하기
          </button>
        </div>
      </div>
    </div>
  );
}
