// Badge system definitions and utilities

export type BadgeTier = 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Badge {
  tier: BadgeTier;
  name: string;
  description: string;
  pointsRequired: number;
  icon: string;
  color: string;
  gradient: string;
}

export const BADGES: Record<BadgeTier, Badge> = {
  none: {
    tier: 'none',
    name: 'Newcomer',
    description: 'Just getting started on the journey',
    pointsRequired: 0,
    icon: '🌱',
    color: '#64748b',
    gradient: 'from-slate-500 to-slate-700',
  },
  bronze: {
    tier: 'bronze',
    name: 'Bronze Ambassador',
    description: 'Earned 100+ points through consistent contributions',
    pointsRequired: 100,
    icon: '🥉',
    color: '#cd7f32',
    gradient: 'from-amber-600 to-amber-800',
  },
  silver: {
    tier: 'silver',
    name: 'Silver Ambassador',
    description: 'Proven dedication with 300+ points accumulated',
    pointsRequired: 300,
    icon: '🥈',
    color: '#9ca3af',
    gradient: 'from-gray-400 to-gray-600',
  },
  gold: {
    tier: 'gold',
    name: 'Gold Ambassador',
    description: 'Elite performer with 600+ points — a campus leader',
    pointsRequired: 600,
    icon: '🥇',
    color: '#f59e0b',
    gradient: 'from-yellow-400 to-amber-600',
  },
  platinum: {
    tier: 'platinum',
    name: 'Platinum Ambassador',
    description: 'Legendary status — 1000+ points and unmatched impact',
    pointsRequired: 1000,
    icon: '💎',
    color: '#818cf8',
    gradient: 'from-violet-400 to-purple-600',
  },
};

export function getBadgeForPoints(points: number): BadgeTier {
  if (points >= 1000) return 'platinum';
  if (points >= 600) return 'gold';
  if (points >= 300) return 'silver';
  if (points >= 100) return 'bronze';
  return 'none';
}

export function getNextBadge(currentPoints: number): { badge: Badge; pointsNeeded: number } | null {
  const tiers: BadgeTier[] = ['bronze', 'silver', 'gold', 'platinum'];
  for (const tier of tiers) {
    const badge = BADGES[tier];
    if (currentPoints < badge.pointsRequired) {
      return { badge, pointsNeeded: badge.pointsRequired - currentPoints };
    }
  }
  return null;
}

export function getProgressToNextBadge(currentPoints: number): number {
  const next = getNextBadge(currentPoints);
  if (!next) return 100;
  
  const tiers: BadgeTier[] = ['none', 'bronze', 'silver', 'gold', 'platinum'];
  const currentBadgeTier = getBadgeForPoints(currentPoints);
  const currentBadgeIndex = tiers.indexOf(currentBadgeTier);
  const currentBadgePoints = BADGES[currentBadgeTier].pointsRequired;
  
  const pointsInRange = next.badge.pointsRequired - currentBadgePoints;
  const pointsEarned = currentPoints - currentBadgePoints;
  
  return Math.round((pointsEarned / pointsInRange) * 100);
}
