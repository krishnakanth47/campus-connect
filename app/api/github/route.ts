import { NextRequest, NextResponse } from 'next/server';
import { analyzeGitHubProfile } from '@/lib/github';
import { getUserFromRequest } from '@/lib/auth';
import store from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { username } = await req.json();

    if (!username || username.trim().length === 0) {
      return NextResponse.json({ error: 'GitHub username is required' }, { status: 400 });
    }

    const cleanUsername = username.trim().replace(/^@/, '');

    const analysis = await analyzeGitHubProfile(cleanUsername);

    // Update user's GitHub info in the store
    await store.updateUserGitHub(user.userId, cleanUsername, analysis.score);

    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error('GitHub analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze GitHub profile' },
      { status: error.message?.includes('not found') ? 404 : 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username query parameter required' }, { status: 400 });
    }

    const analysis = await analyzeGitHubProfile(username);
    return NextResponse.json({ analysis });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to analyze GitHub profile' },
      { status: 500 }
    );
  }
}
