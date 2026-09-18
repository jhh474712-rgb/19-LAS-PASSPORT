import React, { useState } from 'react';
import { Check, Sparkles, Heart, Edit2, RotateCcw } from 'lucide-react';

interface CompanionSelectorProps {
  nickname: string;
  onSelect: (companionId: string, companionName: string) => void;
}

const COMPANIONS = [
  {
    id: 'dog',
    name: '라미',
    type: '강아지 친구 🐶',
    emoji: '🐶',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-300',
    accentColor: 'text-amber-600',
    baseDesc: '긍정적인 에너지가 넘치고 언제나 꼬리를 흔들며 {nickname}님을 반겨주는 강아지 친구예요.',
  },
  {
    id: 'rabbit',
    name: '토찌',
    type: '토끼 친구 🐰',
    emoji: '🐰',
    bgColor: 'bg-pink-100',
    borderColor: 'border-pink-300',
    accentColor: 'text-pink-600',
    baseDesc: '깡충깡충 부지런히 움직이고 물 마시는 것을 정말 좋아하는 똑똑한 토끼 친구예요.',
  },
  {
    id: 'bear',
    name: '곰이',
    type: '곰 친구 🐻',
    emoji: '🐻',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-300',
    accentColor: 'text-orange-700',
    baseDesc: '느긋하지만 묵묵히 걸으며 매일 스트레칭을 정성껏 따라 하는 든든한 곰 친구예요.',
  },
  {
    id: 'sprout',
    name: '리프',
    type: '새싹 친구 🌱',
    emoji: '🌱',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-300',
    accentColor: 'text-emerald-600',
    baseDesc: '건강한 야채와 깨끗한 물을 먹으면 쑥쑥 자라나는 푸르른 새싹 요정 친구예요.',
  }
];

// Helper to determine Korean particles (은/는, 이/가, 과/와) based on final consonant (받침)
function hasBatchim(word: string): boolean {
  if (!word) return false;
  const lastChar = word.charCodeAt(word.length - 1);
  if (lastChar < 0xac00 || lastChar > 0xd7a3) return false;
  return (lastChar - 0xac00) % 28 !== 0;
}

export default function CompanionSelector({ nickname, onSelect }: CompanionSelectorProps) {
  const [selectedId, setSelectedId] = useState<string>('dog');
  const [customName, setCustomName] = useState<string>('');
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>('');

  const selectedCompanion = COMPANIONS.find(c => c.id === selectedId) || COMPANIONS[0];

  // Active companion name (prefer custom name if exists, otherwise default)
  const activeName = customName.trim() || selectedCompanion.name;

  // Sync companion change to default name if customName is empty
  const handleSelectCompanion = (id: string) => {
    setSelectedId(id);
    // If we are currently renaming, reset the input to the new companion's default name to help user
    const found = COMPANIONS.find(c => c.id === id);
    if (found && !customName) {
      setNameInput('');
    }
  };

  const handleStart = () => {
    onSelect(selectedCompanion.id, activeName);
  };

  const handleOpenRename = () => {
    setNameInput(customName || selectedCompanion.name);
    setIsRenaming(true);
  };

  const handleSaveRename = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCustomName(nameInput.trim());
    setIsRenaming(false);
  };

  const handleResetName = () => {
    setCustomName('');
    setNameInput('');
    setIsRenaming(false);
  };

  // Particles
  const withParticle = hasBatchim(activeName) ? '과' : '와';
  const endsWithParticle = hasBatchim(activeName) ? '은' : '는';

  // Dynamic description
  const descriptionText = selectedCompanion.baseDesc
    .replace('{nickname}', nickname)
    .replace('민수', nickname);

  return (
    <div className="flex-1 flex flex-col justify-between py-4 text-center h-full max-w-md mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex p-2.5 bg-primary/10 text-primary rounded-full animate-bounce">
          <Sparkles className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-extrabold text-on-surface tracking-tight">
          나와 함께 건강해질<br />
          친구를 골라주세요! ⭐
        </h2>
        <p className="text-xs font-bold text-on-surface-variant">
          {nickname}님의 매일매일 건강한 하루를 칭찬하고<br />
          함께 성장해 나갈 소중한 건강친구예요.
        </p>
      </div>

      {/* Grid of Companions */}
      <div className="grid grid-cols-2 gap-3 my-6">
        {COMPANIONS.map((companion) => {
          const isSelected = selectedId === companion.id;
          return (
            <button
              key={companion.id}
              type="button"
              onClick={() => handleSelectCompanion(companion.id)}
              className={`p-3 rounded-2xl border-3 flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                isSelected
                  ? 'border-primary bg-primary/5 scale-[1.03] shadow-md'
                  : 'border-outline-variant bg-white hover:bg-surface-container'
              }`}
            >
              <div className={`w-14 h-14 rounded-full ${companion.bgColor} flex items-center justify-center text-3xl mb-2 shadow-inner`}>
                {companion.emoji}
              </div>
              <span className="text-sm font-extrabold text-on-surface">{companion.name}</span>
              <span className="text-[11px] font-bold text-on-surface-variant mt-0.5">{companion.type}</span>

              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center">
                  <Check className="w-3 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Companion Intro Card */}
      <div className="bg-surface-container/50 rounded-2xl p-4 border border-surface-container text-left space-y-1.5 min-h-[90px] mb-5">
        <div className="flex items-center gap-1.5">
          <Heart className={`w-3.5 h-3.5 fill-current ${selectedCompanion.accentColor}`} />
          <span className="text-[11px] font-extrabold text-on-surface-variant">친구 소개</span>
        </div>
        <p className="text-sm font-bold text-on-surface">
          {selectedCompanion.emoji} {activeName} ({selectedCompanion.type})
        </p>
        <p className="text-xs font-semibold text-on-surface-variant leading-relaxed">
          {activeName}{endsWithParticle} {descriptionText}
        </p>
      </div>

      {/* Conditional Rename Panel */}
      {isRenaming ? (
        <form onSubmit={handleSaveRename} className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-4 mb-5 text-left space-y-3 animate-fadeIn">
          <div>
            <h4 className="text-sm font-black text-primary">건강친구 이름을 바꿔볼까요?</h4>
            <p className="text-xs font-bold text-on-surface-variant mt-0.5">바꾸지 않아도 괜찮아요.</p>
          </div>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value.substring(0, 10))}
            placeholder="예: 토찌, 라미, 하루, 별이"
            className="w-full bg-white border-2 border-outline-variant focus:border-primary rounded-xl px-3 py-2.5 text-sm font-bold text-on-surface outline-hidden"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleResetName}
              className="flex-1 h-10 bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-transform"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>기본 이름으로 할래요</span>
            </button>
            <button
              type="submit"
              className="flex-1 h-10 bg-primary hover:bg-primary/90 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-transform"
            >
              <Check className="w-3.5 h-3.5" />
              <span>이 이름으로 할래요</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3 mb-5">
          <div className="text-xs font-extrabold text-primary flex items-center justify-center gap-1">
            <span>✨ {activeName}{withParticle} 함께 시작할까요?</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleOpenRename}
              className="flex-1 h-12 bg-white hover:bg-surface-container border border-outline-variant text-on-surface font-extrabold text-sm rounded-2xl flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
            >
              <Edit2 className="w-4 h-4 text-primary" />
              <span>이름 바꾸기</span>
            </button>
            <button
              type="button"
              onClick={handleStart}
              className="flex-2 h-12 bg-primary hover:bg-primary-container text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-1.5 active:scale-95 transition-transform shadow-md"
            >
              <span>이 친구와 시작하기</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
