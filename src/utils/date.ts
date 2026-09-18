import { HealthGoalFootprint, HealthGoalAnswer } from '../types';

/**
 * Returns YYYY-MM-DD in user's local timezone (safe from toISOString UTC drift)
 */
export const getLocalDateKey = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const getHealthGoalFootprintKey = (dateKey: string): string => {
  return `las_health_goal_footprint_${dateKey}`;
};

/**
 * Read raw record from localStorage
 */
export const getRawHealthGoalFootprint = (dateKey: string): HealthGoalFootprint | null => {
  try {
    const raw = localStorage.getItem(getHealthGoalFootprintKey(dateKey));
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        physical: (parsed.physical === 'yes' || parsed.physical === 'no') ? parsed.physical : null,
        social: (parsed.social === 'yes' || parsed.social === 'no') ? parsed.social : null,
        emotional: (parsed.emotional === 'yes' || parsed.emotional === 'no') ? parsed.emotional : null,
        isDemo: Boolean(parsed.isDemo),
      };
    }
  } catch (e) {
    console.error('Failed to parse health goal footprint for', dateKey, e);
  }
  return null;
};

/**
 * Clean up any accidentally stored demo data for today
 */
export const cleanTodayDemoData = (todayKey = getLocalDateKey()): void => {
  try {
    const existing = getRawHealthGoalFootprint(todayKey);
    if (existing && existing.isDemo) {
      localStorage.removeItem(getHealthGoalFootprintKey(todayKey));
    }
  } catch (e) {
    console.error('Failed to clean demo data for today', e);
  }
};

/**
 * Ensure dynamic demo records exist for past days in this month (1st of month to yesterday).
 * 
 * Rules:
 * 1. Today's date: Strictly user inputs only (isDemo: false). Never inject demo data into today.
 * 2. Future dates: Never have demo data.
 * 3. All past days in current month (day 1 to yesterday) must have a record:
 *    - Real user records (isDemo: false) are NEVER overwritten.
 *    - Balanced distribution of success days (5~7 days) and failed days (2~4 days).
 *    - Any remaining past days that have no record will receive an unperformed demo record (all 'no', isDemo: true)
 *      so that NO grey/unrecorded past days exist!
 */
export const ensureDemoFootprintRecords = (refDate = new Date()): void => {
  try {
    const todayKey = getLocalDateKey(refDate);

    // Rule 1: Clean up any demo data for today
    cleanTodayDemoData(todayKey);

    const year = refDate.getFullYear();
    const month = refDate.getMonth();
    const todayDayOfMonth = refDate.getDate();
    const dayOfWeek = refDate.getDay(); // 0 (Sun) to 6 (Sat)

    // Calculate this week's past dates (from Sunday of this week up to yesterday)
    const weekStart = new Date(year, month, todayDayOfMonth - dayOfWeek);
    const weekPastDateKeys: string[] = [];

    for (let d = new Date(weekStart); d < refDate; d.setDate(d.getDate() + 1)) {
      const dKey = getLocalDateKey(d);
      if (dKey < todayKey && d.getMonth() === month) {
        weekPastDateKeys.push(dKey);
      }
    }

    const assignedKeys = new Set<string>();

    // Step A: Assign this week's past dates (up to 3 days)
    if (weekPastDateKeys.length > 0) {
      const chosenWeekKeys = [...weekPastDateKeys].reverse(); // from yesterday backwards
      
      // Week demo pattern:
      // index 0: success (e.g. physical: yes, emotional: yes)
      // index 1: 실천하지 않은 날 (all 'no')
      // index 2: success (physical: yes, social: yes)
      // others: all 'no'
      const weekSpecs: HealthGoalFootprint[] = [
        { physical: 'yes', social: 'no', emotional: 'yes', isDemo: true },
        { physical: 'no', social: 'no', emotional: 'no', isDemo: true },
        { physical: 'yes', social: 'yes', emotional: 'no', isDemo: true },
      ];

      chosenWeekKeys.forEach((key, idx) => {
        assignedKeys.add(key);
        const existing = getRawHealthGoalFootprint(key);
        const spec = weekSpecs[idx] || { physical: 'no', social: 'no', emotional: 'no', isDemo: true };
        if (!existing) {
          saveHealthGoalFootprint(key, spec);
        } else if (existing.isDemo) {
          saveHealthGoalFootprint(key, spec);
        }
      });
    }

    // Step B: Collect all month's past dates (from 1st to yesterday) not yet in assignedKeys
    const monthPastDateKeys: string[] = [];
    for (let day = 1; day < todayDayOfMonth; day++) {
      const d = new Date(year, month, day);
      const dKey = getLocalDateKey(d);
      if (dKey < todayKey && !assignedKeys.has(dKey)) {
        monthPastDateKeys.push(dKey);
      }
    }

    // Assign varied pattern across month past dates
    // Target: 2~3 more failed days, 3~5 success days, and any remainder as failed days
    if (monthPastDateKeys.length > 0) {
      // Pattern cycle designed to create ~5-7 total successes and ~3-5 total fails across a month
      const cycleSpecs: HealthGoalFootprint[] = [
        { physical: 'no', social: 'no', emotional: 'no', isDemo: true },  // 실패
        { physical: 'yes', social: 'no', emotional: 'no', isDemo: true }, // 성공 (신체)
        { physical: 'no', social: 'no', emotional: 'no', isDemo: true },  // 실패
        { physical: 'no', social: 'yes', emotional: 'no', isDemo: true }, // 성공 (사회)
        { physical: 'yes', social: 'yes', emotional: 'yes', isDemo: true }, // 성공 (전체)
        { physical: 'no', social: 'no', emotional: 'no', isDemo: true },  // 실패
        { physical: 'no', social: 'no', emotional: 'yes', isDemo: true }, // 성공 (정서)
        { physical: 'yes', social: 'no', emotional: 'yes', isDemo: true }, // 성공 (신체+정서)
      ];

      monthPastDateKeys.forEach((key, idx) => {
        assignedKeys.add(key);
        const existing = getRawHealthGoalFootprint(key);
        const spec = cycleSpecs[idx % cycleSpecs.length];
        if (!existing) {
          saveHealthGoalFootprint(key, spec);
        } else if (existing.isDemo) {
          saveHealthGoalFootprint(key, spec);
        }
      });
    }

    // Step C: Fallback check - Ensure EVERY past day of this month has at least an all 'no' demo record
    for (let day = 1; day < todayDayOfMonth; day++) {
      const d = new Date(year, month, day);
      const dKey = getLocalDateKey(d);
      if (dKey < todayKey) {
        const existing = getRawHealthGoalFootprint(dKey);
        if (!existing) {
          saveHealthGoalFootprint(dKey, {
            physical: 'no',
            social: 'no',
            emotional: 'no',
            isDemo: true,
          });
        }
      }
    }
  } catch (e) {
    console.error('Error generating demo footprint records', e);
  }
};

/**
 * Get footprint for a dateKey (with fallback to default)
 */
export const getHealthGoalFootprint = (dateKey: string): HealthGoalFootprint => {
  const record = getRawHealthGoalFootprint(dateKey);
  if (record) {
    return record;
  }
  return {
    physical: null,
    social: null,
    emotional: null,
  };
};

/**
 * Save user's actual footprint or demo footprint
 */
export const saveHealthGoalFootprint = (dateKey: string, footprint: HealthGoalFootprint): void => {
  try {
    const payload: HealthGoalFootprint = {
      physical: footprint.physical,
      social: footprint.social,
      emotional: footprint.emotional,
      isDemo: footprint.isDemo ?? false,
    };
    localStorage.setItem(getHealthGoalFootprintKey(dateKey), JSON.stringify(payload));
  } catch (e) {
    console.error('Failed to save health goal footprint for', dateKey, e);
  }
};

export interface WeekDayFootprint {
  date: Date;
  dateKey: string;
  dayName: string;
  isFuture: boolean;
  isToday: boolean;
  answers: HealthGoalFootprint;
}

export const getWeekFootprintRecords = (refDate = new Date(), todayAnswers?: HealthGoalFootprint): WeekDayFootprint[] => {
  // Ensure demo records exist before reading
  ensureDemoFootprintRecords(refDate);

  const todayKey = getLocalDateKey(refDate);
  const dayOfWeek = refDate.getDay(); // 0 (Sun) to 6 (Sat)
  const sunday = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate() - dayOfWeek);

  const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];
  const weekRecords: WeekDayFootprint[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + i);
    const dateKey = getLocalDateKey(d);
    const isFuture = dateKey > todayKey;
    const isToday = dateKey === todayKey;
    
    // For past days, if no record, default to all 'no'
    let answers: HealthGoalFootprint;
    if (isFuture) {
      answers = { physical: null, social: null, emotional: null };
    } else if (isToday) {
      answers = todayAnswers ? { ...todayAnswers, isDemo: false } : getHealthGoalFootprint(dateKey);
    } else {
      const stored = getHealthGoalFootprint(dateKey);
      if (stored.physical === null && stored.social === null && stored.emotional === null) {
        answers = { physical: 'no', social: 'no', emotional: 'no', isDemo: true };
      } else {
        answers = stored;
      }
    }

    weekRecords.push({
      date: d,
      dateKey,
      dayName: DAY_NAMES[i],
      isFuture,
      isToday,
      answers,
    });
  }

  return weekRecords;
};

export interface MonthDayFootprint {
  dayNum: number;
  dateKey: string;
  isFuture: boolean;
  isToday: boolean;
  answers: HealthGoalFootprint;
  yesCount: number;
  hasRecord: boolean;
  allNo: boolean;
  statusSymbol: '😊' | '😟' | null;
}

export interface MonthFootprintData {
  year: number;
  month: number;
  firstDayOfWeek: number;
  daysInMonth: number;
  days: MonthDayFootprint[];
  physicalCount: number;
  socialCount: number;
  emotionalCount: number;
}

export const getMonthFootprintData = (refDate = new Date(), todayAnswers?: HealthGoalFootprint): MonthFootprintData => {
  // Ensure demo records exist before reading
  ensureDemoFootprintRecords(refDate);

  const year = refDate.getFullYear();
  const monthIdx = refDate.getMonth();
  const todayKey = getLocalDateKey(refDate);

  const firstDayOfWeek = new Date(year, monthIdx, 1).getDay();
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

  const days: MonthDayFootprint[] = [];
  let physicalCount = 0;
  let socialCount = 0;
  let emotionalCount = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, monthIdx, day);
    const dateKey = getLocalDateKey(d);
    const isFuture = dateKey > todayKey;
    const isToday = dateKey === todayKey;

    if (isFuture) {
      days.push({
        dayNum: day,
        dateKey,
        isFuture: true,
        isToday: false,
        answers: { physical: null, social: null, emotional: null },
        yesCount: 0,
        hasRecord: false,
        allNo: false,
        statusSymbol: null,
      });
    } else if (isToday) {
      // TODAY: Strictly use todayAnswers (user inputs) or stored footprint
      const answers = todayAnswers ? { ...todayAnswers, isDemo: false } : getHealthGoalFootprint(dateKey);

      let count = 0;
      if (answers.physical === 'yes') {
        count++;
        physicalCount++;
      }
      if (answers.social === 'yes') {
        count++;
        socialCount++;
      }
      if (answers.emotional === 'yes') {
        count++;
        emotionalCount++;
      }

      const allThreeAnswered = 
        answers.physical !== null && 
        answers.social !== null && 
        answers.emotional !== null;

      const allNo = answers.physical === 'no' && answers.social === 'no' && answers.emotional === 'no';

      let statusSymbol: '😊' | '😟' | null = null;
      if (count >= 1) {
        statusSymbol = '😊';
      } else if (allThreeAnswered && allNo) {
        statusSymbol = '😟';
      } else {
        statusSymbol = null; // Uncompleted input today: neutral state
      }

      days.push({
        dayNum: day,
        dateKey,
        isFuture: false,
        isToday: true,
        answers,
        yesCount: count,
        hasRecord: statusSymbol !== null,
        allNo,
        statusSymbol,
      });
    } else {
      // PAST DATES (1st of month to yesterday):
      // Must ALWAYS have a state: if at least one 'yes' -> 😊, otherwise -> 😟
      const rawAnswers = getHealthGoalFootprint(dateKey);
      let answers = rawAnswers;

      // If no recorded answers or no yes, treat as unperformed ('no')
      if (answers.physical === null && answers.social === null && answers.emotional === null) {
        answers = { physical: 'no', social: 'no', emotional: 'no', isDemo: true };
      }

      let count = 0;
      if (answers.physical === 'yes') {
        count++;
        physicalCount++;
      }
      if (answers.social === 'yes') {
        count++;
        socialCount++;
      }
      if (answers.emotional === 'yes') {
        count++;
        emotionalCount++;
      }

      const statusSymbol: '😊' | '😟' = count >= 1 ? '😊' : '😟';
      const allNo = count === 0;

      // If answers had nulls and count is 0, normalize missing to 'no' for popup display
      const normalizedAnswers: HealthGoalFootprint = {
        physical: answers.physical === 'yes' ? 'yes' : 'no',
        social: answers.social === 'yes' ? 'yes' : 'no',
        emotional: answers.emotional === 'yes' ? 'yes' : 'no',
        isDemo: answers.isDemo,
      };

      days.push({
        dayNum: day,
        dateKey,
        isFuture: false,
        isToday: false,
        answers: normalizedAnswers,
        yesCount: count,
        hasRecord: true, // Always has record for past days!
        allNo,
        statusSymbol,
      });
    }
  }

  return {
    year,
    month: monthIdx + 1,
    firstDayOfWeek,
    daysInMonth,
    days,
    physicalCount,
    socialCount,
    emotionalCount,
  };
};
