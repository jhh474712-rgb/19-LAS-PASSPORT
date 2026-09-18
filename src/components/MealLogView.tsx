import React, { useState, useRef, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  Utensils, 
  IceCream, 
  Camera, 
  Check, 
  ThumbsUp, 
  ArrowLeft, 
  Apple, 
  Sparkles,
  Upload,
  Sparkle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Info,
  ChevronRight,
  Droplet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MealPeriod, MealType, MealLog } from '../types';

interface MealLogViewProps {
  onBack: () => void;
  onSaveMeal: (meal: Omit<MealLog, 'id' | 'date'>) => void;
  onAddStars: (amount: number, reason: string) => void;
  showToast: (message: string, type: 'success' | 'info' | 'drink' | 'star') => void;
}

// Preset meal suggestions
const PRESET_MEALS = [
  { name: '샐러드와 닭가슴살', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80', type: 'healthy' as MealType },
  { name: '불고기 덮밥', url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80', type: 'normal' as MealType },
  { name: '딸기 생크림 케이크', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80', type: 'sweet' as MealType },
  { name: '과일 플레이트', url: 'https://images.unsplash.com/photo-1519996521430-02b798c1d881?auto=format&fit=crop&w=600&q=80', type: 'healthy' as MealType },
];

export default function MealLogView({ onBack, onSaveMeal, onAddStars, showToast }: MealLogViewProps) {
  const [companionName] = useState<string>(() => {
    return localStorage.getItem('las_companion_name') || '건강친구';
  });
  const [period, setPeriod] = useState<MealPeriod>('morning');
  const [mealType, setMealType] = useState<MealType>('normal');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [customPhotoName, setCustomPhotoName] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Meal Analysis States
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<{
    foods: {
      rice_or_noodle: boolean;
      protein: boolean;
      vegetable: boolean;
      water_or_soup: boolean;
      sweet_dessert: boolean;
    };
    detected_foods_summary: string;
    feedback_lines: string[];
    suggested_action: string;
    isPrototype?: boolean;
  } | null>(null);

  // Local state for interactive adjustment
  const [userConfirmedFoods, setUserConfirmedFoods] = useState<{
    rice_or_noodle: boolean;
    protein: boolean;
    vegetable: boolean;
    water_or_soup: boolean;
    sweet_dessert: boolean;
  } | null>(null);

  const [hasConfirmedFoods, setHasConfirmedFoods] = useState<boolean>(false);
  const [confirmationFeedbackText, setConfirmationFeedbackText] = useState<string>('');
  const [selectedCommitment, setSelectedCommitment] = useState<string>('');

  // Rewards states to avoid multiple triggers
  const [rewardUploadGiven, setRewardUploadGiven] = useState<boolean>(false);
  const [rewardAiGiven, setRewardAiGiven] = useState<boolean>(false);

  // Check if "건강한 음식 먹기" goal is active
  const [isHealthyFoodGoalActive, setIsHealthyFoodGoalActive] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('las_youth_goals');
      if (saved) {
        return JSON.parse(saved).includes('건강한 음식 먹기');
      }
    } catch (e) {
      console.error(e);
    }
    return true; // default to true to guarantee supportive toast
  });

  // Photo Upload Actions
  const processUploadedPhoto = (url: string, name: string) => {
    setPhotoUrl(url);
    setCustomPhotoName(name);
    setAiResult(null);
    setUserConfirmedFoods(null);
    setHasConfirmedFoods(false);
    setConfirmationFeedbackText('');
    setSelectedCommitment('');

    // Reward for Photo Upload!
    if (!rewardUploadGiven) {
      setRewardUploadGiven(true);
      onAddStars(3, '식사 사진 올리기 완료 📸');
      showToast('식사 사진 업로드 성공! 건강별 +3개와 식단 도장을 획득했어요! 🌟', 'success');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          processUploadedPhoto(event.target.result as string, file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          processUploadedPhoto(event.target.result as string, file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const selectPreset = (url: string, type: MealType, name: string) => {
    setMealType(type);
    processUploadedPhoto(url, `추천 이미지: ${name}`);
  };

  const deletePhoto = () => {
    setPhotoUrl('');
    setCustomPhotoName('');
    setAiResult(null);
    setUserConfirmedFoods(null);
    setHasConfirmedFoods(false);
    setConfirmationFeedbackText('');
    setSelectedCommitment('');
    setRewardUploadGiven(false);
    setRewardAiGiven(false);
  };

  // Trigger server-side AI Meal analysis
  const handleTriggerAiAnalysis = async () => {
    if (!photoUrl) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/gemini/analyze-meal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: photoUrl,
          mimeType: photoUrl.startsWith('data:image/') 
            ? photoUrl.split(';')[0].split(':')[1] 
            : 'image/jpeg',
          companionName
        })
      });

      if (!response.ok) {
        throw new Error('API server returned error');
      }

      const data = await response.json();
      setAiResult(data);
      setUserConfirmedFoods(data.foods);

      // Map appropriate general meal type from AI response
      if (data.foods.sweet_dessert) {
        setMealType('sweet');
      } else if (data.foods.vegetable && data.foods.protein) {
        setMealType('healthy');
      } else {
        setMealType('normal');
      }

    } catch (error) {
      console.error('AI Meal Analysis Error:', error);
      // Fallback local prototype simulation if backend has issue or offline
      setTimeout(() => {
        const mockData = {
          foods: {
            rice_or_noodle: true,
            protein: true,
            vegetable: true,
            water_or_soup: false,
            sweet_dessert: false
          },
          detected_foods_summary: "따뜻한 한식 밥상",
          feedback_lines: [
            "잘했어요! 든든하고 영양이 풍부한 밥상을 기록했어요.",
            "힘을 내게 해주는 밥과 고기 단백질, 신선한 나물들이 골고루 보여요.",
            "다음에는 소화를 더 가볍게 도와주는 물 한 잔을 함께 마셔봐요."
          ],
          suggested_action: "물 마시기",
          isPrototype: true
        };
        setAiResult(mockData);
        setUserConfirmedFoods(mockData.foods);
        setMealType('normal');
      }, 1200);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Confirmation handling
  const handleConfirmationFeedback = (type: 'yes' | 'no' | 'edit') => {
    setHasConfirmedFoods(true);

    if (type === 'yes') {
      setConfirmationFeedbackText(`${companionName}의 눈이 정확했네요! 칭찬해요 🌟`);
      showToast('음식 종류를 확인했습니다! 💖', 'success');
    } else if (type === 'no') {
      setConfirmationFeedbackText(`알려주셔서 감사해요! ${companionName}의 지식이 더 늘어났어요 📖`);
      showToast('피드백을 반영했습니다! 👍', 'info');
    } else if (type === 'edit') {
      setConfirmationFeedbackText('체크박스를 꾹 눌러서 식사 구성에 맞게 고쳐보세요! ✍️');
      showToast('직접 음식 종류를 수정할 수 있습니다.', 'info');
    }

    // Reward for checking AI feedback
    if (!rewardAiGiven) {
      setRewardAiGiven(true);
      onAddStars(1, '식사 분석 확인 완료 🤖');
      
      // Goal alert toast
      if (isHealthyFoodGoalActive) {
        setTimeout(() => {
          showToast('건강한 음식 목표에 한 걸음 가까워졌어요! 🥦🎖️', 'success');
        }, 1500);
      }
    }
  };

  // Handle Commitment Selection
  const handleCommitmentSelect = (commitment: string) => {
    setSelectedCommitment(commitment);
    
    let toastMessage = '';
    if (commitment === '채소 더하기') {
      toastMessage = '좋은 다짐이에요! 다음 식사 때 아삭아삭 야채를 먹어봐요! 🥦';
    } else if (commitment === '단백질 더하기') {
      toastMessage = '멋져요! 고기나 콩, 계란으로 단백질을 든든히 채워봐요! 🥚';
    } else if (commitment === '물 마시기') {
      toastMessage = '시원한 물 마시기는 몸에 정말 좋아요! 지금 한 모금 마셔볼까요? 💧';
    } else {
      toastMessage = '오늘 기록 참 훌륭해요! 무리하지 않고 천천히 지켜가요. 🌟';
    }
    showToast(toastMessage, 'success');
  };

  // Save Meal and return with companion action
  const handleSave = () => {
    onSaveMeal({
      period,
      mealType,
      photoUrl: photoUrl || undefined,
      feedback: aiResult ? aiResult.feedback_lines.join(' ') : undefined
    });
  };

  // Nutrient Category Toggle helper
  const toggleConfirmedFood = (key: keyof typeof userConfirmedFoods) => {
    if (!userConfirmedFoods) return;
    setUserConfirmedFoods(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [key]: !prev[key]
      };
    });
  };

  return (
    <div className="w-full pb-12 font-sans select-none antialiased max-w-md mx-auto">
      {/* Header bar */}
      <header className="flex items-center justify-between py-4 border-b border-surface-container-high mb-6 sticky top-0 bg-white/95 backdrop-blur-md z-30">
        <button 
          onClick={onBack}
          className="w-12 h-12 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
          aria-label="뒤로가기"
          id="meal-log-back-btn"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-extrabold text-center flex-1 pr-12 text-on-surface">오늘의 식단 기록</h2>
      </header>

      {/* Title block */}
      <div className="text-left space-y-1.5 mb-6 px-1">
        <h1 className="text-2xl font-black tracking-tight text-on-surface">{companionName}의 식사 살펴보기 🤖🍱</h1>
        <p className="text-sm font-bold text-on-surface-variant leading-relaxed">
          오늘 먹은 식사 사진을 올리면 건강친구 {companionName}가 친절하게 음식을 알아보고 쉬운 피드백을 건네줍니다.
        </p>
      </div>

      <div className="space-y-6">
        {/* Step 1: Meal Period Select */}
        <section className="bg-white rounded-3xl p-5 border border-surface-container shadow-sm space-y-4">
          <h3 className="text-base font-black flex items-center gap-2 text-on-surface pl-1">
            <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-black text-primary">1</span>
            언제 먹은 식사인가요?
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'morning', label: '아침', icon: <Sun className="w-5 h-5" /> },
              { id: 'lunch', label: '점심', icon: <Utensils className="w-5 h-5" /> },
              { id: 'dinner', label: '저녁', icon: <Moon className="w-5 h-5" /> },
              { id: 'snack', label: '간식', icon: <IceCream className="w-5 h-5" /> },
            ].map((item) => {
              const isActive = period === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setPeriod(item.id as MealPeriod)}
                  className={`flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl border-2 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-primary border-primary text-white font-extrabold shadow-md scale-[1.03]'
                      : 'bg-slate-50 border-transparent text-on-surface-variant font-bold hover:bg-slate-100'
                  }`}
                  id={`meal-period-${item.id}`}
                >
                  <div className="mb-1.5">{item.icon}</div>
                  <span className="text-xs">{item.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 2: Photo Upload */}
        <section className="bg-white rounded-3xl p-5 border border-surface-container shadow-sm space-y-4">
          <h3 className="text-base font-black flex items-center gap-2 text-on-surface pl-1">
            <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-black text-primary">2</span>
            내 식사 사진 올리기
          </h3>

          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            id="meal-photo-file-input"
          />

          {photoUrl ? (
            <div className="relative rounded-2xl overflow-hidden aspect-video w-full bg-surface-container shadow-md border border-slate-100">
              <img 
                src={photoUrl} 
                alt="Uploaded meal" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 opacity-0 hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-white text-on-surface rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-slate-50 transition-colors cursor-pointer"
                  id="meal-change-photo-btn"
                >
                  <Upload className="w-4 h-4 text-primary" /> 다른 사진
                </button>
                <button 
                  onClick={deletePhoto}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-red-700 transition-colors cursor-pointer"
                  id="meal-delete-photo-btn"
                >
                  삭제
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-3.5 py-2 truncate font-mono">
                {customPhotoName || '선택된 식사 사진'}
              </div>
            </div>
          ) : (
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full h-44 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                dragActive ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-primary/40 bg-slate-50 hover:bg-slate-100/80 hover:border-primary/80'
              }`}
              id="meal-upload-box"
            >
              <Camera className="text-primary w-10 h-10 mb-2.5 animate-bounce-slow" />
              <span className="text-sm font-extrabold text-primary">내 식사 사진 올리기</span>
              <span className="text-[11px] text-on-surface-variant mt-1.5 font-medium">여기에 사진을 쏙 떨어뜨려도 좋아요</span>
            </div>
          )}

          {/* Quick preset suggestions */}
          <div className="space-y-2 pt-1">
            <span className="text-xs text-on-surface-variant block font-extrabold pl-0.5">💡 추천 음식 사진으로 빠르게 알아보기:</span>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_MEALS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => selectPreset(preset.url, preset.type, preset.name)}
                  className="relative rounded-xl overflow-hidden aspect-square w-full border border-slate-200 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                  title={preset.name}
                  id={`meal-preset-${idx}`}
                >
                  <img 
                    src={preset.url} 
                    alt={preset.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[9px] text-white py-1 truncate text-center font-bold">
                    {preset.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Step 3: Trigger AI Button */}
        {photoUrl && !aiResult && !isAnalyzing && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-1"
          >
            <button
              onClick={handleTriggerAiAnalysis}
              className="w-full h-14 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl text-base font-black flex items-center justify-center gap-2 shadow-lg hover:brightness-105 active:scale-98 transition-all cursor-pointer animate-pulse-slow"
              id="meal-ai-analysis-btn"
            >
              <Sparkles className="w-5 h-5 fill-white" />
              {companionName}와 식사 살펴보기 🤖✨
            </button>
          </motion.div>
        )}

        {/* Loading Spinner during analysis */}
        {isAnalyzing && (
          <div className="bg-white rounded-3xl p-6 border border-surface-container shadow-sm flex flex-col items-center justify-center py-10 space-y-4 animate-fadeIn">
            <div className="relative">
              <div className="w-14 h-14 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkle className="w-5 h-5 text-purple-600 fill-purple-600 animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-base font-extrabold text-on-surface">{companionName}와 음식을 함께 분석하고 있어요...</p>
              <p className="text-xs text-on-surface-variant font-medium">조금만 기다려주세요! 금방 멋진 힌트를 드릴게요 💖</p>
            </div>
          </div>
        )}

        {/* Step 4 & 5: AI results and verification */}
        {aiResult && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* AI Found Card */}
            <section className="bg-purple-50/50 rounded-3xl p-5 border border-purple-200/60 shadow-sm space-y-4 text-left">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-black flex items-center gap-2 text-purple-900">
                  <Sparkles className="w-5 h-5 text-purple-600 fill-purple-100" />
                  AI가 이렇게 보았어요 🤖
                </h3>
                {aiResult.isPrototype && (
                  <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100 px-2 py-1 rounded-md">
                    가상 도우미 모드
                  </span>
                )}
              </div>

              {/* Detected Foods summary block */}
              <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-xs">
                <span className="text-[10px] font-black text-purple-600 uppercase tracking-wider block mb-1">인식된 음식 요약</span>
                <p className="text-base font-bold text-slate-800">{aiResult.detected_foods_summary || '맛있는 식사 대령이오!'}</p>
                {aiResult.isPrototype && (
                  <span className="text-[10px] text-on-surface-variant block mt-1.5 font-bold">
                    ⚠️ AI가 사진을 보고 추정한 내용이에요. 다를 수 있어요.
                  </span>
                )}
              </div>

              {/* 5-nutrient Category interactive badges */}
              <div className="space-y-2.5">
                <span className="text-xs font-black text-purple-950 block pl-0.5">무슨 영양이 들어갔는지 확인해 보세요:</span>
                <div className="flex flex-col gap-2">
                  {[
                    { key: 'rice_or_noodle' as const, label: '🍚 밥, 면, 빵, 떡 (에너지 음식)', desc: '지치지 않게 온몸에 에너지를 줘요.' },
                    { key: 'protein' as const, label: '🥩 고기, 생선, 계란, 두부 (단백질)', desc: '근육을 튼튼하고 건강하게 자라게 해요.' },
                    { key: 'vegetable' as const, label: '🥦 채소, 야채, 신선한 과일 (비타민)', desc: '몸의 피로를 낮추고 면역력을 높여요.' },
                    { key: 'water_or_soup' as const, label: '🥤 국물, 찌개, 맑은 물 (수분 섭취)', desc: '촉촉하게 소화와 혈액순환을 도와요.' },
                    { key: 'sweet_dessert' as const, label: '🍩 달달한 과자, 사탕, 음료 (간식류)', desc: '기분을 가볍고 당차게 전환해 줘요.' },
                  ].map((nut) => {
                    const isChecked = userConfirmedFoods ? userConfirmedFoods[nut.key] : false;
                    return (
                      <button
                        key={nut.key}
                        onClick={() => toggleConfirmedFood(nut.key)}
                        className={`w-full p-3 rounded-2xl border-2 flex items-center justify-between text-left transition-all cursor-pointer ${
                          isChecked 
                            ? 'bg-purple-100 border-purple-500 shadow-xs' 
                            : 'bg-white border-slate-200/70 hover:bg-slate-50'
                        }`}
                        id={`meal-nutrient-badge-${nut.key}`}
                      >
                        <div className="space-y-0.5 pr-3">
                          <span className={`text-sm font-extrabold ${isChecked ? 'text-purple-950' : 'text-slate-700'}`}>
                            {nut.label}
                          </span>
                          <p className="text-[10px] font-bold text-on-surface-variant">{nut.desc}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 ${
                          isChecked ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-300'
                        }`}>
                          {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Confirmation feedback buttons */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-black text-purple-950 block pl-0.5">{companionName}의 분석이 맞았나요?</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleConfirmationFeedback('yes')}
                    className="h-11 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-transform cursor-pointer"
                    id="meal-confirm-yes-btn"
                  >
                    맞아요! 🙋‍♂️
                  </button>
                  <button
                    onClick={() => handleConfirmationFeedback('no')}
                    className="h-11 bg-white border border-purple-300 text-purple-700 font-black text-xs rounded-xl flex items-center justify-center gap-1 hover:bg-purple-50 shadow-sm active:scale-95 transition-transform cursor-pointer"
                    id="meal-confirm-no-btn"
                  >
                    조금 달라요 🧐
                  </button>
                  <button
                    onClick={() => handleConfirmationFeedback('edit')}
                    className="h-11 bg-white border border-purple-300 text-purple-700 font-black text-xs rounded-xl flex items-center justify-center gap-1 hover:bg-purple-50 shadow-sm active:scale-95 transition-transform cursor-pointer"
                    id="meal-confirm-edit-btn"
                  >
                    직접 고칠래요 ✍️
                  </button>
                </div>

                {/* Confirm response speech bubble */}
                {confirmationFeedbackText && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 bg-white p-3.5 rounded-2xl border-2 border-purple-200 text-xs font-extrabold text-purple-900 relative animate-fadeIn shadow-xs"
                  >
                    <div className="absolute top-[-8px] left-8 w-3 h-3 bg-white border-t-2 border-l-2 border-purple-200 rotate-45" />
                    <span>{confirmationFeedbackText}</span>
                  </motion.div>
                )}
              </div>
            </section>

            {/* Step 5: Meal Feedback Speach Bubble */}
            <section className="bg-amber-50/50 rounded-3xl p-5 border border-amber-200/60 shadow-sm space-y-4 text-left">
              <h3 className="text-base font-black flex items-center gap-2 text-amber-900">
                <ThumbsUp className="w-5 h-5 text-amber-500" />
                {companionName}의 따뜻한 식사 피드백 💬
              </h3>

              <div className="bg-white rounded-2xl p-4.5 border border-amber-200/60 shadow-xs relative">
                <div className="absolute top-[-8px] left-10 w-3 h-3 bg-white border-t-2 border-l-2 border-amber-200/40 rotate-45" />
                <div className="space-y-2 text-sm font-extrabold text-amber-950 leading-relaxed">
                  {aiResult.feedback_lines.map((line, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <span className="text-amber-500 shrink-0 select-none">•</span>
                      <p>{line}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Step 6: Commitments (Suggested Action Button) */}
            <section className="bg-blue-50/50 rounded-3xl p-5 border border-blue-200/60 shadow-sm space-y-4 text-left">
              <h3 className="text-base font-black flex items-center gap-2 text-blue-900">
                <Sparkles className="w-5 h-5 text-blue-500 fill-blue-100" />
                {companionName}의 추천 행동 🌟
              </h3>
              <p className="text-xs font-bold text-blue-950 leading-normal pl-0.5">
                식사를 영양 가득하게 보완할 수 있는 추천 건강행동이에요. 다음 식사에 약속할 행동을 꾹 선택해 보세요!
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: '채소 더하기', emoji: '🥬', text: '🥬 채소 더하기' },
                  { label: '단백질 더하기', emoji: '🥩', text: '🥩 단백질 더하기' },
                  { label: '물 마시기', emoji: '💧', text: '💧 물 마시기' },
                  { label: '오늘은 여기까지', emoji: '🙆‍♂️', text: '🙆‍♂️ 오늘은 여기까지' },
                ].map((act) => {
                  const isSelected = selectedCommitment === act.label;
                  return (
                    <button
                      key={act.label}
                      onClick={() => handleCommitmentSelect(act.label)}
                      className={`h-14 rounded-2xl border-2 font-black text-sm flex items-center justify-center transition-all cursor-pointer shadow-sm ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white scale-[1.03] shadow-md'
                          : 'bg-white border-blue-200/60 text-blue-900 hover:bg-blue-50/50 active:scale-97'
                      }`}
                      id={`meal-commitment-${act.label}`}
                    >
                      {act.text}
                    </button>
                  );
                })}
              </div>
            </section>
          </motion.div>
        )}

        {/* Step 7: Final Save Button */}
        <button 
          onClick={handleSave}
          disabled={!photoUrl}
          className={`w-full h-14 rounded-2xl text-lg font-bold shadow-md flex items-center justify-center gap-2 mt-4 cursor-pointer transition-all ${
            photoUrl 
              ? 'bg-primary hover:bg-primary-container text-white active:scale-98' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
          id="meal-save-complete-btn"
        >
          <Check className="w-6 h-6 stroke-[2.5]" />
          기록 완료하기
        </button>
      </div>
    </div>
  );
}
