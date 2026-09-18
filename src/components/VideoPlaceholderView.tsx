import React, { useState } from 'react';
import { 
  PlayCircle, 
  Dumbbell, 
  Heart, 
  Salad, 
  ExternalLink, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface VideoItem {
  id: string;
  title: string;
  category: string;
  description: string;
  duration: string;
  bgColor: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  url: string;
}

const VIDEO_LIST: VideoItem[] = [
  {
    id: 'exercise',
    title: '가벼운 운동 영상',
    category: '신체 건강',
    description: '따라하기 쉬운 5분 스트레칭과 즐거운 전신 체조예요.',
    duration: '5분',
    bgColor: 'bg-blue-50/80',
    borderColor: 'border-blue-200',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-700',
    icon: Dumbbell,
    iconColor: 'text-blue-600',
    url: 'https://www.youtube.com/watch?v=LbQFq4HxRYA&list=PLZzJXgd0FSvxLSGK4Cc02mKqiY_mESo2m'
  },
  {
    id: 'mind',
    title: '마음 쉬기 영상',
    category: '정서 건강',
    description: '숨을 천천히 들이마시고 내쉬며 마음을 편안하게 가라앉혀요.',
    duration: '3분',
    bgColor: 'bg-purple-50/80',
    borderColor: 'border-purple-200',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-700',
    icon: Heart,
    iconColor: 'text-purple-600',
    url: 'https://www.youtube.com/watch?v=LbQFq4HxRYA'
  },
  {
    id: 'lifestyle',
    title: '건강 생활 영상',
    category: '생활 습관',
    description: '물 마시기와 골고루 맛있게 식사하는 좋은 습관을 배워요.',
    duration: '4분',
    bgColor: 'bg-emerald-50/80',
    borderColor: 'border-emerald-200',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-700',
    icon: Salad,
    iconColor: 'text-emerald-600',
    url: 'https://www.youtube.com/watch?v=LbQFq4HxRYA'
  }
];

export default function VideoPlaceholderView() {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  const handleOpenVideo = (video: VideoItem) => {
    setSelectedVideo(video);
  };

  return (
    <div className="w-full pb-24 text-left animate-fadeIn">
      {/* Header Section */}
      <header className="py-4 border-b border-surface-container-high mb-6 sticky top-0 bg-background/95 backdrop-blur-md z-30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-100/70 text-blue-700 flex items-center justify-center shadow-3xs">
            <PlayCircle className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-on-surface leading-tight">
              영상 보기
            </h1>
            <p className="text-xs font-bold text-on-surface-variant mt-0.5">
              건강 실천을 도와주는 영상을 볼 수 있어요.
            </p>
          </div>
        </div>
      </header>

      {/* Main Guidance Card */}
      <section className="bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-white rounded-3xl p-5 border border-blue-100 shadow-xs mb-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800 leading-tight">
              언제든 편안하게 영상을 보며 따라해 보세요!
            </h2>
            <p className="text-xs font-medium text-slate-600 mt-1 leading-relaxed">
              몸을 가볍게 움직이거나 마음을 푹 쉬고 싶을 때 영상을 틀어보세요. 천천히 따라하면 기분이 상쾌해져요.
            </p>
          </div>
        </div>
      </section>

      {/* Video Cards Grid */}
      <section className="space-y-3.5">
        {VIDEO_LIST.map((video) => {
          const IconComp = video.icon;
          return (
            <div
              key={video.id}
              className={`p-4 sm:p-5 rounded-3xl border-2 ${video.borderColor} ${video.bgColor} card-shadow transition-all duration-200 hover:shadow-md text-left flex flex-col justify-between gap-3`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white/90 border border-slate-200/60 shadow-3xs flex items-center justify-center shrink-0">
                  <IconComp className={`w-6 h-6 ${video.iconColor} stroke-[2.2]`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${video.badgeBg} ${video.badgeText}`}>
                      {video.category}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      약 {video.duration}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-800 leading-tight">
                    {video.title}
                  </h3>
                  <p className="text-xs font-medium text-slate-600 mt-1 leading-relaxed">
                    {video.description}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-slate-200/50 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => handleOpenVideo(video)}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-black rounded-xl border border-slate-200 shadow-3xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <PlayCircle className="w-4 h-4 text-primary" />
                  <span>영상 재생하기</span>
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* Modal / Video Player Preview Dialog */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm border border-slate-100 shadow-2xl relative text-center space-y-4 animate-scaleUp">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center shadow-xs">
              <PlayCircle className="w-8 h-8" />
            </div>

            <div>
              <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${selectedVideo.badgeBg} ${selectedVideo.badgeText}`}>
                {selectedVideo.category}
              </span>
              <h3 className="text-lg font-black text-slate-800 mt-2">
                {selectedVideo.title}
              </h3>
              <p className="text-xs font-medium text-slate-600 mt-1.5 leading-relaxed">
                {selectedVideo.description}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl text-xs font-bold text-slate-600 leading-relaxed border border-slate-100 text-left flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>영상을 보면서 편안한 속도로 따라해 보세요!</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl cursor-pointer transition-all"
              >
                닫기
              </button>
              <a
                href={selectedVideo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-primary hover:bg-primary-container text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <span>영상 열기</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
