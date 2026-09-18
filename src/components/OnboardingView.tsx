import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Smile, 
  Heart, 
  Calendar, 
  Check, 
  Camera,
  Dumbbell,
  MoonStar,
  Salad,
  Users,
  CircleCheck
} from 'lucide-react';
import { FaMale, FaFemale } from 'react-icons/fa';
import { AvatarType, CharacterAvatar, UserProfile } from '../types';
import { CHARACTER_AVATARS, getUserProfile, saveUserProfile } from '../utils/profile';
import SplashScreen from './SplashScreen';

export type OnboardingStep = 'splash' | 'questions' | 'completed';

interface OnboardingViewProps {
  onComplete: (userType: string, nickname: string) => void;
  initialStep?: OnboardingStep;
}

const BathroomScaleIcon = ({
  className = '',
}: {
  className?: string;
}) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <rect
      x="8"
      y="8"
      width="48"
      height="48"
      rx="9"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      d="M20 27C20 20.4 25.4 15 32 15C38.6 15 44 20.4 44 27"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <path
      d="M32 27L38 20"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
    />
  </svg>
);

const HEALTH_CONCERN_OPTIONS = [
  {
    id: 'exercise',
    label: '운동이 힘들어요',
    icon: Dumbbell,
    iconColor: 'text-blue-500',
    isNone: false,
  },
  {
    id: 'weight',
    label: '몸무게가 걱정돼요',
    icon: BathroomScaleIcon,
    iconColor: 'text-orange-500',
    isNone: false,
  },
  {
    id: 'sleep',
    label: '잠자기가 어려워요',
    icon: MoonStar,
    iconColor: 'text-purple-500',
    isNone: false,
  },
  {
    id: 'food',
    label: '음식을 골고루 먹기 어려워요',
    icon: Salad,
    iconColor: 'text-green-600',
    isNone: false,
  },
  {
    id: 'friends',
    label: '친구를 사귀기 어려워요',
    icon: Users,
    iconColor: 'text-teal-500',
    isNone: false,
  },
  {
    id: 'mental',
    label: '마음이 힘들어요',
    icon: Heart,
    iconColor: 'text-pink-500',
    isNone: false,
  },
  {
    id: 'none',
    label: '어려움이 없어요',
    icon: CircleCheck,
    iconColor: 'text-emerald-500',
    isNone: true,
  },
];

const VALID_HEALTH_CONCERN_LABELS = HEALTH_CONCERN_OPTIONS.map(opt => opt.label);

export default function OnboardingView({ onComplete, initialStep = 'splash' }: OnboardingViewProps) {
  // Navigation states: splash -> questions -> completed
  const [step, setStep] = useState<OnboardingStep>(initialStep);
  const [currentQIdx, setCurrentQIdx] = useState<number>(0);

  // Challenger answers state
  const [youthNickname, setYouthNickname] = useState(() => {
    return getUserProfile()?.name || '';
  });
  const [avatarType, setAvatarType] = useState<AvatarType>(() => {
    return getUserProfile()?.avatarType || 'character';
  });
  const [avatarValue, setAvatarValue] = useState<CharacterAvatar | string>(() => {
    return getUserProfile()?.avatarValue || 'smile';
  });
  const photoInputRef = React.useRef<HTMLInputElement | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setAvatarType('photo');
        setAvatarValue(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const [youthGender, setYouthGender] = useState<'남성' | '여성' | ''>(() => {
    const saved = localStorage.getItem('las_youth_gender');
    return (saved === '남성' || saved === '여성') ? saved : '';
  });
  
  // Custom youth age and birthdate states
  const [youthAge, setYouthAge] = useState<string>(() => {
    return localStorage.getItem('las_youth_age') || '';
  });
  const [youthBirthYear, setYouthBirthYear] = useState<string>(() => {
    return localStorage.getItem('las_youth_birth_year') || '';
  });
  const [youthBirthMonth, setYouthBirthMonth] = useState<string>(() => {
    return localStorage.getItem('las_youth_birth_month') || '';
  });
  const [youthBirthDay, setYouthBirthDay] = useState<string>(() => {
    return localStorage.getItem('las_youth_birth_day') || '';
  });

  const [youthHeight, setYouthHeight] = useState(() => {
    return localStorage.getItem('las_youth_height') || '165';
  });
  const [youthWeight, setYouthWeight] = useState(() => {
    return localStorage.getItem('las_youth_weight') || '60';
  });

  // Direct health goals state (Physical, Social, Emotional)
  const [physicalHealthGoal, setPhysicalHealthGoal] = useState<string>(() => {
    return localStorage.getItem('las_physical_health_goal') || '';
  });
  const [socialHealthGoal, setSocialHealthGoal] = useState<string>(() => {
    return localStorage.getItem('las_social_health_goal') || '';
  });
  const [emotionalHealthGoal, setEmotionalHealthGoal] = useState<string>(() => {
    return localStorage.getItem('las_emotional_health_goal') || '';
  });

  const [concernValidationWarning, setConcernValidationWarning] = useState<string>('');

  const [youthHealthNotes, setYouthHealthNotes] = useState<{ label: string; medicalTerm: string }[]>(() => {
    try {
      const saved = localStorage.getItem('las_youth_health_notes');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];

      const validItems: { label: string; medicalTerm: string }[] = [];
      for (const item of parsed) {
        const label = typeof item === 'string' ? item : item?.label;
        if (label && VALID_HEALTH_CONCERN_LABELS.includes(label)) {
          if (!validItems.some(v => v.label === label)) {
            validItems.push({ label, medicalTerm: label });
          }
        }
      }

      // '어려움이 없어요'가 포함되어 있다면 단독 선택으로 정리
      let sanitized = validItems;
      if (validItems.some(v => v.label === '어려움이 없어요')) {
        sanitized = [{ label: '어려움이 없어요', medicalTerm: '어려움이 없어요' }];
      }

      localStorage.setItem('las_youth_health_notes', JSON.stringify(sanitized));
      return sanitized;
    } catch {
      return [];
    }
  });

  const handleToggleConcern = (option: typeof HEALTH_CONCERN_OPTIONS[number]) => {
    setConcernValidationWarning('');
    const isAlreadySelected = youthHealthNotes.some(item => item.label === option.label);

    let nextNotes: { label: string; medicalTerm: string }[];
    if (option.isNone) {
      // 7. '어려움이 없어요' 단독 선택 규칙
      if (isAlreadySelected) {
        nextNotes = [];
      } else {
        // 기존 1~6번 항목 모두 해제 후 단독 선택
        nextNotes = [{ label: option.label, medicalTerm: option.label }];
      }
    } else {
      // 1~6번 다중 선택 규칙
      if (isAlreadySelected) {
        nextNotes = youthHealthNotes.filter(item => item.label !== option.label);
      } else {
        // '어려움이 없어요'가 선택된 상태에서 1~6번을 누르면 '어려움이 없어요' 자동 해제
        const withoutNone = youthHealthNotes.filter(
          item => item.label !== '어려움이 없어요' && item.medicalTerm !== '어려움이 없어요'
        );
        nextNotes = [...withoutNone, { label: option.label, medicalTerm: option.label }];
      }
    }

    setYouthHealthNotes(nextNotes);
    localStorage.setItem('las_youth_health_notes', JSON.stringify(nextNotes));
  };

  interface QuestionItem {
    id: string;
    title?: React.ReactNode;
    subtitle?: string;
    icon?: React.ReactNode;
    component: React.ReactNode;
  }

  // Questions definitions (strictly Health Challenger)
  const questions: QuestionItem[] = [
    {
      id: 'y-nickname',
      title: '별명을 지어봅시다',
      subtitle: '',
      icon: <Smile className="w-16 h-16 text-primary" />,
      component: (
        <div className="space-y-5 text-left">
          {/* Name input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-on-surface-variant pl-1">멋진 별명</label>
            <input 
              type="text" 
              placeholder="별명"
              value={youthNickname}
              onChange={(e) => setYouthNickname(e.target.value)}
              className="w-full min-w-0 h-14 px-3 sm:px-4 bg-surface-container border-2 border-surface-variant rounded-2xl text-base font-bold placeholder:text-base placeholder:text-slate-400 focus:border-primary focus:ring-0 text-center"
            />
          </div>

          {/* Profile Setting Section */}
          <div className="space-y-3 pt-3 border-t border-surface-container">
            <div>
              <h4 className="text-sm font-black text-on-surface">캐릭터 고르기</h4>
            </div>

            {/* 1) 5 Default Characters */}
            <div className="grid grid-cols-5 gap-1.5 w-full pt-1">
              {CHARACTER_AVATARS.map((char) => {
                const isSelected = avatarType === 'character' && avatarValue === char.id;
                return (
                  <button
                    key={char.id}
                    type="button"
                    onClick={() => {
                      setAvatarType('character');
                      setAvatarValue(char.id);
                    }}
                    className={`w-full min-w-0 py-2 px-1 sm:px-1.5 rounded-2xl border-2 flex flex-col items-center justify-between text-center transition-all cursor-pointer relative active:scale-95 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-4.5 sm:h-4.5 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xs">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                    <span className="text-[28px] leading-tight mb-1 select-none flex items-center justify-center h-7 sm:h-7.5">{char.emoji}</span>
                    <span className={`text-xs font-black leading-tight whitespace-nowrap break-keep ${isSelected ? 'text-blue-700 font-black' : 'text-slate-600'}`}>
                      {char.name.replace(' 친구', '').replace('기본 ', '')}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 2) Photo Upload Button & Preview */}
            <div className="pt-2">
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="youth-profile-photo-upload"
              />

              {avatarType === 'photo' && typeof avatarValue === 'string' ? (
                <div className="p-3 bg-blue-50/70 border-2 border-blue-600 rounded-2xl flex items-center justify-between gap-3 animate-fadeIn">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-blue-600 shadow-sm shrink-0 bg-white">
                      <img
                        src={avatarValue}
                        alt="내 프로필 사진"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 right-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-blue-950 truncate">내 사진이 선택되었어요!</p>
                      <p className="text-[10px] font-bold text-blue-700 truncate">프로필에 이 사진이 사용돼요.</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="px-2.5 py-1.5 bg-white hover:bg-blue-100 text-blue-700 text-xs font-black rounded-xl border border-blue-200 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                    >
                      다른 사진
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarType('character');
                        setAvatarValue('smile');
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap"
                    >
                      기본 캐릭터로
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="w-full min-w-0 py-3.5 px-3 sm:px-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/40 text-slate-700 font-black text-sm sm:text-base flex items-center justify-center gap-3 transition-all cursor-pointer active:scale-98"
                >
                  <Camera className="w-9 h-9 sm:w-10 sm:h-10 text-blue-600 shrink-0" />
                  <span className="whitespace-nowrap">내 사진 넣기</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'y-gender',
      title: '',
      subtitle: '',
      icon: null,
      component: (
        <div className="flex flex-col gap-3.5 sm:gap-4 w-full" role="group" aria-label="성별 선택">
          {/* 남성 카드 */}
          <button
            type="button"
            role="button"
            aria-pressed={youthGender === '남성'}
            onClick={() => {
              setYouthGender('남성');
              localStorage.setItem('las_youth_gender', '남성');
            }}
            className={`group relative w-full px-5 sm:px-6 py-4 h-[120px] sm:h-[128px] rounded-3xl border-2 sm:border-[3px] transition-all duration-200 cursor-pointer text-left flex items-center justify-between active:scale-[0.98] ${
              youthGender === '남성'
                ? 'bg-[#dbeafe] border-[#1d4ed8] text-slate-900 shadow-md ring-2 ring-blue-500/20'
                : 'bg-[#f0f7ff] hover:bg-[#e4f0fe] border-[#bae0fd] text-slate-800 shadow-xs'
            }`}
          >
            {/* 왼쪽: '남성' 글자 (text-xl font-bold) */}
            <div className="flex flex-col justify-center pl-1 sm:pl-2">
              <span className={`text-xl sm:text-2xl font-bold tracking-tight ${
                youthGender === '남성' ? 'text-blue-950 font-black' : 'text-slate-800'
              }`}>
                남성
              </span>
            </div>

            {/* 오른쪽: FaMale 아이콘 (바지 형태, 약 72~80px, 진한 남색) */}
            <div className="flex items-center justify-center shrink-0 pr-6 sm:pr-8">
              <FaMale className="w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] text-[#1e293b]" aria-hidden="true" />
            </div>

            {/* 오른쪽 위 체크 아이콘 */}
            <div 
              className={`absolute top-3 right-3 sm:top-3.5 sm:right-3.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                youthGender === '남성'
                  ? 'bg-[#1d4ed8] border-[#1d4ed8] text-white shadow-xs scale-100'
                  : 'border-blue-200 bg-white/90 text-transparent scale-95'
              }`}
              aria-hidden="true"
            >
              <Check className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[3.5]" />
            </div>
          </button>

          {/* 여성 카드 */}
          <button
            type="button"
            role="button"
            aria-pressed={youthGender === '여성'}
            onClick={() => {
              setYouthGender('여성');
              localStorage.setItem('las_youth_gender', '여성');
            }}
            className={`group relative w-full px-5 sm:px-6 py-4 h-[120px] sm:h-[128px] rounded-3xl border-2 sm:border-[3px] transition-all duration-200 cursor-pointer text-left flex items-center justify-between active:scale-[0.98] ${
              youthGender === '여성'
                ? 'bg-[#fce7f1] border-[#db2777] text-slate-900 shadow-md ring-2 ring-pink-500/20'
                : 'bg-[#fdf2f7] hover:bg-[#fce7f1] border-[#fbcfe3] text-slate-800 shadow-xs'
            }`}
          >
            {/* 왼쪽: '여성' 글자 (text-xl font-bold) */}
            <div className="flex flex-col justify-center pl-1 sm:pl-2">
              <span className={`text-xl sm:text-2xl font-bold tracking-tight ${
                youthGender === '여성' ? 'text-pink-950 font-black' : 'text-slate-800'
              }`}>
                여성
              </span>
            </div>

            {/* 오른쪽: FaFemale 아이콘 (치마 형태 명확, 약 72~80px, 진한 남색) */}
            <div className="flex items-center justify-center shrink-0 pr-6 sm:pr-8">
              <FaFemale className="w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] text-[#1e293b]" aria-hidden="true" />
            </div>

            {/* 오른쪽 위 체크 아이콘 */}
            <div 
              className={`absolute top-3 right-3 sm:top-3.5 sm:right-3.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                youthGender === '여성'
                  ? 'bg-[#db2777] border-[#db2777] text-white shadow-xs scale-100'
                  : 'border-pink-200 bg-white/90 text-transparent scale-95'
              }`}
              aria-hidden="true"
            >
              <Check className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[3.5]" />
            </div>
          </button>
        </div>
      )
    },
    {
      id: 'y-birthdate',
      title: '나이를 알려주세요',
      subtitle: '',
      icon: <Calendar className="w-16 h-16 text-primary" />,
      component: (
        <div className="flex flex-col items-center justify-center py-4 sm:py-6 w-full">
          <div className="w-full max-w-xs flex items-center justify-center gap-3 bg-surface-container border-2 border-surface-variant focus-within:border-primary focus-within:bg-white rounded-3xl p-4 sm:p-5 transition-all shadow-xs">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={youthAge}
              onChange={(e) => {
                const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                setYouthAge(onlyNums);
                localStorage.setItem('las_youth_age', onlyNums);
              }}
              className="w-28 sm:w-32 h-14 sm:h-16 text-center text-3xl sm:text-4xl font-black text-on-surface bg-transparent focus:outline-hidden tracking-tight"
              autoComplete="off"
            />
            <span className="text-2xl sm:text-3xl font-black text-on-surface select-none shrink-0">
              살
            </span>
          </div>
        </div>
      )
    },
    {
      id: 'y-heightweight',
      title: '',
      subtitle: '',
      icon: null,
      component: (
        <div className="flex flex-col gap-3.5 sm:gap-4 w-full" role="group" aria-label="키와 몸무게 입력">
          {/* 1. 키 입력 카드 */}
          <div className="w-full bg-[#f8fafc] border-2 border-[#e2e8f0] focus-within:border-primary focus-within:bg-white rounded-3xl p-3.5 sm:p-4 min-h-[130px] sm:min-h-[142px] flex items-center justify-between transition-all shadow-xs">
            {/* 왼쪽: 항목명 '키' + 줄자/측정 테이프 아이콘 */}
            <div className="flex flex-col items-start gap-1.5 pl-1 sm:pl-2 shrink-0">
              <label htmlFor="youth-height-input" className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                키
              </label>
              {/* 노란색 측정 테이프 / 줄자 SVG 아이콘 (64~76px) */}
              <div className="flex items-center justify-center">
                <svg
                  viewBox="0 0 80 80"
                  className="w-16 h-16 sm:w-20 sm:h-20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  {/* 줄자 케이스 본체 (화사한 노란색) */}
                  <rect x="8" y="14" width="46" height="46" rx="13" fill="#FACC15" stroke="#CA8A04" strokeWidth="2.5" />
                  {/* 테이프 인출구 (회색 가이드) */}
                  <path d="M46 36H72V52H46" fill="#FEF08A" stroke="#CA8A04" strokeWidth="2.5" strokeLinejoin="round" />
                  {/* 테이프 눈금선 */}
                  <line x1="52" y1="36" x2="52" y2="43" stroke="#854D0E" strokeWidth="2" strokeLinecap="round" />
                  <line x1="58" y1="36" x2="58" y2="46" stroke="#854D0E" strokeWidth="2" strokeLinecap="round" />
                  <line x1="64" y1="36" x2="64" y2="43" stroke="#854D0E" strokeWidth="2" strokeLinecap="round" />
                  {/* 테이프 금속 고리 팁 */}
                  <path d="M72 34V54H76V34H72Z" fill="#64748B" stroke="#334155" strokeWidth="1.5" />
                  {/* 줄자 내부 원형 그립 디테일 */}
                  <circle cx="28" cy="37" r="14" fill="#EAB308" stroke="#CA8A04" strokeWidth="2" />
                  <circle cx="28" cy="37" r="6" fill="#FEF9C3" />
                  {/* 줄자 락 버튼 */}
                  <rect x="23" y="10" width="10" height="5" rx="2" fill="#334155" />
                </svg>
              </div>
            </div>

            {/* 오른쪽: 입력란 + cm 단위 */}
            <div className="flex items-center justify-end gap-2 pr-1 sm:pr-2">
              <input
                id="youth-height-input"
                type="text"
                inputMode="decimal"
                aria-label="키 입력"
                value={youthHeight}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, '');
                  setYouthHeight(val);
                  localStorage.setItem('las_youth_height', val);
                }}
                className="w-24 sm:w-28 h-12 sm:h-14 bg-white border-2 border-slate-300 focus:border-primary rounded-2xl text-xl sm:text-2xl font-black text-center text-slate-800 focus:outline-hidden tracking-tight shadow-inner"
              />
              <span className="text-xl sm:text-2xl font-black text-slate-700 whitespace-nowrap shrink-0 select-none">
                cm
              </span>
            </div>
          </div>

          {/* 2. 몸무게 입력 카드 */}
          <div className="w-full bg-[#f8fafc] border-2 border-[#e2e8f0] focus-within:border-primary focus-within:bg-white rounded-3xl p-3.5 sm:p-4 min-h-[130px] sm:min-h-[142px] flex items-center justify-between transition-all shadow-xs">
            {/* 왼쪽: 항목명 '몸무게' + 체중계 아이콘 */}
            <div className="flex flex-col items-start gap-1.5 pl-1 sm:pl-2 shrink-0">
              <label htmlFor="youth-weight-input" className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                몸무게
              </label>
              {/* 회색 바닥 체중계 SVG 아이콘 (64~76px) */}
              <div className="flex items-center justify-center">
                <svg
                  viewBox="0 0 80 80"
                  className="w-16 h-16 sm:w-20 sm:h-20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  {/* 체중계 본체 (회색 플랫폼) */}
                  <rect x="10" y="16" width="60" height="52" rx="14" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2.5" />
                  <rect x="15" y="21" width="50" height="42" rx="10" fill="#CBD5E1" />
                  {/* 체중계 다이얼 / 디스플레이 창 */}
                  <path d="M26 16C26 23.732 32.268 30 40 30C47.732 30 54 23.732 54 16H26Z" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
                  {/* 다이얼 눈금 */}
                  <line x1="33" y1="21" x2="35" y2="23" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="40" y1="18" x2="40" y2="21" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
                  <line x1="47" y1="21" x2="45" y2="23" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
                  {/* 중앙 빨간색 바늘 인디케이터 */}
                  <circle cx="40" cy="27" r="2.5" fill="#334155" />
                  <line x1="40" y1="27" x2="40" y2="20" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
                  {/* 발판 미끄럼 방지 라인 디테일 */}
                  <line x1="22" y1="46" x2="34" y2="46" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="22" y1="52" x2="34" y2="52" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="46" y1="46" x2="58" y2="46" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="46" y1="52" x2="58" y2="52" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* 오른쪽: 입력란 + kg 단위 */}
            <div className="flex items-center justify-end gap-2 pr-1 sm:pr-2">
              <input
                id="youth-weight-input"
                type="text"
                inputMode="decimal"
                aria-label="몸무게 입력"
                value={youthWeight}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, '');
                  setYouthWeight(val);
                  localStorage.setItem('las_youth_weight', val);
                }}
                className="w-24 sm:w-28 h-12 sm:h-14 bg-white border-2 border-slate-300 focus:border-primary rounded-2xl text-xl sm:text-2xl font-black text-center text-slate-800 focus:outline-hidden tracking-tight shadow-inner"
              />
              <span className="text-xl sm:text-2xl font-black text-slate-700 whitespace-nowrap shrink-0 select-none">
                kg
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'y-goals',
      title: '나의 건강목표는 무엇인가요?',
      icon: <Heart className="w-16 h-16 text-primary" />,
      component: (
        <div className="flex flex-col gap-2.5 sm:gap-3 w-full text-left">
          {/* 1. 신체 건강 */}
          <div 
            className="w-full h-[116px] sm:h-[120px] min-h-[112px] max-h-[124px] p-3 sm:p-3.5 bg-white rounded-2xl border-2 border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors grid items-center gap-2.5 sm:gap-3"
            style={{ gridTemplateColumns: 'clamp(72px, 23vw, 90px) minmax(0, 1fr)' }}
          >
            {/* 왼쪽 큰 아이콘 (카드 왼쪽 가운데) */}
            <div className="flex items-center justify-center shrink-0 w-full h-full select-none" aria-hidden="true">
              <span className="text-[54px] sm:text-[62px] leading-none shrink-0 flex items-center justify-center">
                💪
              </span>
            </div>

            {/* 오른쪽 제목 + 입력창 */}
            <div className="min-w-0 flex flex-col justify-center gap-1 sm:gap-1.5 h-full">
              <label 
                htmlFor="physical-health-goal-input" 
                className="text-[18px] sm:text-[19px] font-bold text-slate-800 tracking-tight leading-tight block truncate cursor-pointer pl-0.5"
              >
                신체 건강
              </label>
              <input
                id="physical-health-goal-input"
                type="text"
                placeholder=""
                value={physicalHealthGoal}
                onChange={(e) => {
                  const val = e.target.value;
                  setPhysicalHealthGoal(val);
                  try {
                    localStorage.setItem('las_physical_health_goal', val);
                    const combined = [val, socialHealthGoal, emotionalHealthGoal].map(s => s.trim()).filter(Boolean);
                    localStorage.setItem('las_youth_goals', JSON.stringify(combined));
                  } catch (err) {
                    console.error(err);
                  }
                }}
                className="w-full h-[44px] sm:h-[46px] px-[12px] bg-slate-50/80 focus:bg-white border-2 border-slate-200 focus:border-primary rounded-xl text-sm sm:text-base font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-medium focus:outline-hidden transition-colors shadow-2xs"
              />
            </div>
          </div>

          {/* 2. 사회 건강 */}
          <div 
            className="w-full h-[116px] sm:h-[120px] min-h-[112px] max-h-[124px] p-3 sm:p-3.5 bg-white rounded-2xl border-2 border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors grid items-center gap-2.5 sm:gap-3"
            style={{ gridTemplateColumns: 'clamp(72px, 23vw, 90px) minmax(0, 1fr)' }}
          >
            {/* 왼쪽 큰 아이콘 (카드 왼쪽 가운데) */}
            <div className="flex items-center justify-center shrink-0 w-full h-full select-none" aria-hidden="true">
              <span className="text-[54px] sm:text-[62px] leading-none shrink-0 flex items-center justify-center">
                🤝
              </span>
            </div>

            {/* 오른쪽 제목 + 입력창 */}
            <div className="min-w-0 flex flex-col justify-center gap-1 sm:gap-1.5 h-full">
              <label 
                htmlFor="social-health-goal-input" 
                className="text-[18px] sm:text-[19px] font-bold text-slate-800 tracking-tight leading-tight block truncate cursor-pointer pl-0.5"
              >
                사회 건강
              </label>
              <input
                id="social-health-goal-input"
                type="text"
                placeholder=""
                value={socialHealthGoal}
                onChange={(e) => {
                  const val = e.target.value;
                  setSocialHealthGoal(val);
                  try {
                    localStorage.setItem('las_social_health_goal', val);
                    const combined = [physicalHealthGoal, val, emotionalHealthGoal].map(s => s.trim()).filter(Boolean);
                    localStorage.setItem('las_youth_goals', JSON.stringify(combined));
                  } catch (err) {
                    console.error(err);
                  }
                }}
                className="w-full h-[44px] sm:h-[46px] px-[12px] bg-slate-50/80 focus:bg-white border-2 border-slate-200 focus:border-primary rounded-xl text-sm sm:text-base font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-medium focus:outline-hidden transition-colors shadow-2xs"
              />
            </div>
          </div>

          {/* 3. 정서 건강 */}
          <div 
            className="w-full h-[116px] sm:h-[120px] min-h-[112px] max-h-[124px] p-3 sm:p-3.5 bg-white rounded-2xl border-2 border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors grid items-center gap-2.5 sm:gap-3"
            style={{ gridTemplateColumns: 'clamp(72px, 23vw, 90px) minmax(0, 1fr)' }}
          >
            {/* 왼쪽 큰 아이콘 (카드 왼쪽 가운데) */}
            <div className="flex items-center justify-center shrink-0 w-full h-full select-none" aria-hidden="true">
              <span className="text-[54px] sm:text-[62px] leading-none shrink-0 flex items-center justify-center">
                💖
              </span>
            </div>

            {/* 오른쪽 제목 + 입력창 */}
            <div className="min-w-0 flex flex-col justify-center gap-1 sm:gap-1.5 h-full">
              <label 
                htmlFor="emotional-health-goal-input" 
                className="text-[18px] sm:text-[19px] font-bold text-slate-800 tracking-tight leading-tight block truncate cursor-pointer pl-0.5"
              >
                정서 건강
              </label>
              <input
                id="emotional-health-goal-input"
                type="text"
                placeholder=""
                value={emotionalHealthGoal}
                onChange={(e) => {
                  const val = e.target.value;
                  setEmotionalHealthGoal(val);
                  try {
                    localStorage.setItem('las_emotional_health_goal', val);
                    const combined = [physicalHealthGoal, socialHealthGoal, val].map(s => s.trim()).filter(Boolean);
                    localStorage.setItem('las_youth_goals', JSON.stringify(combined));
                  } catch (err) {
                    console.error(err);
                  }
                }}
                className="w-full h-[44px] sm:h-[46px] px-[12px] bg-slate-50/80 focus:bg-white border-2 border-slate-200 focus:border-primary rounded-xl text-sm sm:text-base font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-medium focus:outline-hidden transition-colors shadow-2xs"
              />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'y-illnesses',
      title: (
        <span className="inline-flex items-center justify-center gap-2 sm:gap-2.5 break-keep">
          <span 
            className="text-[40px] sm:text-[46px] leading-none select-none shrink-0" 
            aria-hidden="true"
          >
            😟
          </span>
          <span className="break-keep">
            무엇이 걱정되나요?
          </span>
        </span>
      ),
      subtitle: '',
      icon: null,
      component: (
        <div className="w-full space-y-3">
          <div 
            className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full max-h-[430px] sm:max-h-[460px] overflow-y-auto pr-0.5 no-scrollbar py-1"
            role="group"
            aria-label="건강상 걱정되는 항목 선택"
          >
            {HEALTH_CONCERN_OPTIONS.map((opt) => {
              const isSelected = youthHealthNotes.some(item => item.label === opt.label);
              const IconComponent = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="button"
                  aria-pressed={isSelected}
                  onClick={() => handleToggleConcern(opt)}
                  className={`group relative w-full h-[136px] sm:h-[144px] rounded-2xl p-2.5 sm:p-3.5 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer text-center select-none active:scale-[0.98] ${
                    opt.isNone ? 'col-span-2' : 'col-span-1'
                  } ${
                    isSelected
                      ? 'bg-blue-50/90 border-[2.5px] border-blue-600 shadow-sm ring-2 ring-blue-500/20 text-blue-950'
                      : 'bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-800 shadow-xs'
                  }`}
                >
                  {/* 체크 표시 인디케이터 (색상 외 테두리 및 체크 마크로 구분) */}
                  <div
                    className={`absolute top-2.5 right-2.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs scale-100'
                        : 'border-slate-300 bg-slate-100 text-transparent scale-90'
                    }`}
                    aria-hidden="true"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                  </div>

                  {/* 아이콘: 약 56~64px */}
                  <div className="flex items-center justify-center mb-1.5 sm:mb-2 shrink-0">
                    <IconComponent
                      className={`w-14 h-14 sm:w-16 sm:h-16 ${opt.iconColor} transition-transform group-hover:scale-105`}
                    />
                  </div>

                  {/* 글자: text-sm, 가운데 정렬, 자연스러운 줄바꿈 */}
                  <span
                    className={`text-sm font-extrabold tracking-tight break-keep text-center leading-tight px-1 ${
                      isSelected ? 'text-blue-950 font-black' : 'text-slate-800'
                    }`}
                  >
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 미선택 시 유효성 검사 안내 문구 */}
          {concernValidationWarning && (
            <div 
              role="alert"
              aria-live="polite"
              className="p-3 bg-rose-50 border-2 border-rose-400 text-rose-700 text-sm font-extrabold rounded-2xl text-center shadow-xs animate-shake"
            >
              {concernValidationWarning}
            </div>
          )}
        </div>
      )
    }
  ];

  // Navigation logic
  const isNextDisabled = () => {
    const qId = questions[currentQIdx].id;
    if (qId === 'y-gender' && !youthGender) return true;
    if (qId === 'y-heightweight') {
      const h = parseFloat(youthHeight);
      const w = parseFloat(youthWeight);
      if (!youthHeight.trim() || !youthWeight.trim() || isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
        return true;
      }
    }
    return false;
  };

  const handleNext = () => {
    const currentQId = questions[currentQIdx].id;
    if (currentQId === 'y-illnesses') {
      if (youthHealthNotes.length === 0) {
        setConcernValidationWarning('걱정되는 항목을 한 개 이상 선택해주세요.');
        return;
      }
    }

    if (isNextDisabled()) {
      return;
    }

    setConcernValidationWarning('');
    if (currentQIdx < questions.length - 1) {
      setCurrentQIdx(currentQIdx + 1);
    } else {
      setStep('completed');
    }
  };

  const handleBack = () => {
    setConcernValidationWarning('');
    if (currentQIdx > 0) {
      setCurrentQIdx(currentQIdx - 1);
    }
  };

  const handleCompleteAll = () => {
    try {
      localStorage.setItem('las_physical_health_goal', physicalHealthGoal.trim());
      localStorage.setItem('las_social_health_goal', socialHealthGoal.trim());
      localStorage.setItem('las_emotional_health_goal', emotionalHealthGoal.trim());
      const finalGoals = [
        physicalHealthGoal.trim(),
        socialHealthGoal.trim(),
        emotionalHealthGoal.trim()
      ].filter(Boolean);
      localStorage.setItem('las_youth_goals', JSON.stringify(finalGoals));

      localStorage.setItem('las_youth_age', youthAge);
      localStorage.setItem('las_youth_height', youthHeight.trim());
      localStorage.setItem('las_youth_weight', youthWeight.trim());
      localStorage.setItem('las_youth_birth_year', youthBirthYear);
      localStorage.setItem('las_youth_birth_month', youthBirthMonth);
      localStorage.setItem('las_youth_birth_day', youthBirthDay);
      localStorage.setItem('las_youth_health_notes', JSON.stringify(youthHealthNotes || []));

      if (youthBirthYear && youthBirthMonth && youthBirthDay) {
        const formattedMonth = youthBirthMonth.padStart(2, '0');
        const formattedDay = youthBirthDay.padStart(2, '0');
        const fullBirthdate = `${youthBirthYear}-${formattedMonth}-${formattedDay}`;
        localStorage.setItem('las_youth_birthdate', fullBirthdate);
      } else {
        localStorage.removeItem('las_youth_birthdate');
      }

      // Clean up any old parent keys from localStorage
      localStorage.removeItem('las_parent_goals');
      localStorage.removeItem('las_parent_health_concerns');
      localStorage.removeItem('las_parent_health_concerns_etc');
      localStorage.removeItem('las_child_needs_help_in');
      localStorage.removeItem('las_parent_child_phone');
      localStorage.removeItem('las_parent_phone');
      localStorage.removeItem('las_parent_relationship');
      localStorage.removeItem('las_parent_birthdate');
      localStorage.removeItem('las_parent_age_group');
      localStorage.removeItem('las_parent_birth_year');
      localStorage.removeItem('las_parent_birth_month');
      localStorage.removeItem('las_parent_birth_day');
      localStorage.removeItem('las_youth_phone');
      localStorage.removeItem('las_youth_parent_phone');
    } catch (e) {
      console.error('Error saving onboarding data:', e);
    }

    const finalNickname = youthNickname.trim() || '민수';
    localStorage.setItem('las_youth_nickname', finalNickname);
    localStorage.setItem('las_nickname', finalNickname);
    localStorage.setItem('las_user_role', 'challenger');

    const profileToSave: UserProfile = {
      name: finalNickname,
      role: 'challenger',
      avatarType,
      avatarValue,
    };
    saveUserProfile(profileToSave);

    onComplete('challenger', finalNickname);
  };

  if (step === 'splash') {
    return <SplashScreen onStart={() => setStep('questions')} />;
  }

  return (
    <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-between bg-[#f0f4ff] px-2 sm:px-4 py-3 sm:py-5 rounded-3xl animate-fadeIn relative pb-10">
      
      {/* Decorative Pastel Blue circles */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

      {/* QUESTIONS FLOW */}
      {step === 'questions' && (
        <div className="flex-1 flex flex-col justify-between z-10 overflow-y-auto min-h-0 py-1">
          {/* Top Progress and Header */}
          <div className="space-y-3 shrink-0">
            <div className="flex items-center justify-between px-2 pt-1">
              <span className="text-xs font-black text-primary">회원정보 입력 (건강 도전자)</span>
              <span className="text-xs font-bold text-on-surface-variant">{currentQIdx + 1} / {questions.length}</span>
            </div>
            
            {/* Smooth Progress Bar */}
            <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden shadow-inner">
              <div 
                className="bg-primary h-full transition-all duration-300 rounded-full"
                style={{ width: `${((currentQIdx + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Back button */}
            <div className="h-10 flex items-center">
              {currentQIdx > 0 ? (
                <button 
                  onClick={handleBack}
                  className="w-10 h-10 rounded-full bg-white text-on-surface-variant flex items-center justify-center shadow-xs border border-surface-container-high hover:bg-surface-container cursor-pointer transition-transform active:scale-90"
                  aria-label="이전 질문"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              ) : (
                <div className="w-10 h-10" />
              )}
            </div>
          </div>

          {/* Central Question Card */}
          <div className={`bg-white rounded-3xl px-3.5 sm:px-6 py-4 sm:py-6 border border-surface-container card-shadow text-center my-auto animate-fadeIn w-full ${
            questions[currentQIdx].id === 'y-gender' || questions[currentQIdx].id === 'y-heightweight' 
              ? 'space-y-0' 
              : questions[currentQIdx].id === 'y-illnesses'
              ? 'space-y-2.5 sm:space-y-3'
              : 'space-y-4'
          }`}>
            {questions[currentQIdx].icon && (
              <div className="flex justify-center">
                {questions[currentQIdx].icon}
              </div>
            )}
            {(questions[currentQIdx].title || questions[currentQIdx].subtitle) ? (
              <div className="space-y-1">
                {questions[currentQIdx].title && (
                  <h3 className="text-xl font-black text-on-surface whitespace-pre-line leading-tight break-keep">
                    {questions[currentQIdx].title}
                  </h3>
                )}
                {questions[currentQIdx].subtitle && (
                  <p className="text-xs font-bold text-on-surface-variant whitespace-pre-line">
                    {questions[currentQIdx].subtitle}
                  </p>
                )}
              </div>
            ) : null}

            {/* Question Interactive Content */}
            <div className={questions[currentQIdx].id === 'y-gender' || questions[currentQIdx].id === 'y-heightweight' || questions[currentQIdx].id === 'y-illnesses' ? 'pt-0' : 'pt-2'}>
              {questions[currentQIdx].component}
            </div>
          </div>

          {/* Bottom Action Navigation */}
          <div className="flex gap-3 pt-4 sm:pt-6 shrink-0 mt-auto">
            <button 
              onClick={handleBack}
              disabled={currentQIdx === 0}
              className={`w-24 sm:w-28 h-12 sm:h-14 font-extrabold rounded-2xl flex items-center justify-center transition-all ${
                currentQIdx > 0
                  ? 'bg-white hover:bg-surface-container text-on-surface-variant border border-surface-container-high active:scale-95 cursor-pointer shadow-xs'
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed border-transparent'
              }`}
            >
              이전
            </button>
            <button 
              onClick={handleNext}
              disabled={isNextDisabled()}
              className={`flex-1 h-12 sm:h-14 font-extrabold rounded-2xl flex items-center justify-center gap-1.5 shadow-md transition-all ${
                isNextDisabled()
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-primary hover:bg-primary-container text-white active:scale-95 cursor-pointer'
              }`}
            >
              {currentQIdx === questions.length - 1 ? '완료' : '다음'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* COMPLETED SCREEN */}
      {step === 'completed' && (
        <div className="flex-1 flex flex-col justify-between py-10 text-center z-10 max-w-md mx-auto w-full">
          <div className="my-auto space-y-8 px-6">
            {/* 상단: 초록색 완료 체크 아이콘 */}
            <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-xl animate-bounce">
              <Check className="w-12 h-12 stroke-[3]" />
            </div>

            {/* 중간: 회원가입/정보 설정 완료! */}
            <div className="space-y-6">
              <h2 className="text-3xl font-black text-primary leading-tight">
                회원가입/정보 설정 완료!
              </h2>
              
              {/* 박수/축하 시각 요소 */}
              <div className="flex flex-col items-center justify-center pt-2">
                <div className="w-28 h-28 bg-amber-100/70 border-4 border-amber-200 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  <span className="text-6xl select-none" role="img" aria-label="박수 축하">
                    👏
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 pt-8">
            <button 
              onClick={handleCompleteAll}
              className="w-full h-14 bg-primary hover:bg-primary-container text-white font-extrabold text-lg rounded-2xl flex items-center justify-center gap-1.5 shadow-lg interactive-card cursor-pointer active:scale-95 transition-transform"
            >
              라스 패스포트 시작하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
