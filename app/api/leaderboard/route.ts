import { NextRequest, NextResponse } from 'next/server';
import store from '@/lib/store';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ambassadors = await store.getAllAmbassadors();
    const leaderboard = ambassadors.map((u, idx) => ({
      rank: idx + 1,
      id: u.id,
      name: u.name,
      email: u.email,
      points: u.points,
      badge: u.badge,
      github_score: u.github_score,
      github_username: u.github_username,
      avatar: u.avatar,
    }));

    return NextResponse.json({ leaderboard });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
