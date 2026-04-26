import { NextRequest, NextResponse } from 'next/server';
import store from '@/lib/store';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, github_username } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existing = await store.getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const user = await store.createUser({
      name,
      email,
      password: hashedPassword,
      role: role || 'ambassador',
      github_username: github_username || null,
      github_score: null,
      avatar: name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const { password: _, ...safeUser } = user;

    const response = NextResponse.json({
      success: true,
      token,
      user: safeUser,
    }, { status: 201 });

    response.cookies.set('campus_connect_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
