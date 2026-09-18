export type StandardCategory = '신체적 건강' | '사회적 건강' | '정서적 건강';

/**
 * Maps legacy/historical category strings into the 3 standard categories:
 * - 물 마시기, 걷기, 식사 기록, 운동하기, 수면 기록, physical, 신체활동 -> 신체적 건강
 * - 기분 기록, 정신적 건강, 정서적 건강, mental, mood -> 정서적 건강
 * - 사회적 건강, social -> 사회적 건강
 */
export const normalizeCategory = (cat?: string): StandardCategory => {
  if (!cat) return '신체적 건강';
  const trimmed = cat.trim();

  // 1) 기분 기록, 정신적 건강, 정서적 건강 -> 정서적 건강
  if (
    trimmed === '기분 기록' ||
    trimmed === '기분' ||
    trimmed === 'mood' ||
    trimmed === '정신적 건강' ||
    trimmed === '정서적 건강' ||
    trimmed === 'mental'
  ) {
    return '정서적 건강';
  }

  // 2) 사회적 건강 -> 사회적 건강
  if (trimmed === '사회적 건강' || trimmed === 'social') {
    return '사회적 건강';
  }

  // 3) 물 마시기, 걷기, 식사 기록, 운동하기, 수면 기록 -> 신체적 건강
  return '신체적 건강';
};

export interface CategoryInfo {
  label: StandardCategory;
  emoji: string;
  bg: string;
  text: string;
  border: string;
}

export const CATEGORY_CONFIG: Record<StandardCategory, CategoryInfo> = {
  '신체적 건강': {
    label: '신체적 건강',
    emoji: '💪',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  '사회적 건강': {
    label: '사회적 건강',
    emoji: '👥',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  '정서적 건강': {
    label: '정서적 건강',
    emoji: '💗',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
  },
};

export const getCategoryConfig = (cat?: string): CategoryInfo => {
  const norm = normalizeCategory(cat);
  return CATEGORY_CONFIG[norm];
};
