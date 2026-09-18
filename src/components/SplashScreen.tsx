import React, { useState } from 'react';
import passportCoverImg from '../assets/images/las-passport-cover.png';

interface SplashScreenProps {
  onStart: () => void;
}

export default function SplashScreen({ onStart }: SplashScreenProps) {
  const [hasStarted, setHasStarted] = useState(false);

  const handleTriggerStart = () => {
    if (hasStarted) return;
    setHasStarted(true);
    onStart();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTriggerStart();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="라스 패스포트 시작하기"
      onClick={handleTriggerStart}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 w-[100vw] h-[100dvh] overflow-hidden bg-[#16325c] m-0 p-0 border-0 shadow-none select-none cursor-pointer outline-none flex items-center justify-center"
    >
      {/* 
        두 번째 첨부 이미지 여권 커버: 
        화면 중앙에 찌그러짐 없이(object-cover / object-contain 반응형) 배치,
        핵심 텍스트와 상징이 항상 온전히 보이도록 구성.
      */}
      <img
        src={passportCoverImg}
        alt="라스 패스포트 여권 커버"
        className="w-full h-full object-cover object-center pointer-events-none select-none block m-0 p-0 border-0 rounded-none shadow-none"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

