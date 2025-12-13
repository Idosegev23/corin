import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456';
const SESSION_COOKIE_NAME = 'corrin_admin_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Simple session token generation
function generateSessionToken(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// In-memory session storage (in production, use Redis or database)
const sessions = new Map<string, { expires: number }>();

export async function POST(request: NextRequest) {
  try {
    const { password, action } = await request.json();

    // Logout action
    if (action === 'logout') {
      const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
      if (sessionToken) {
        sessions.delete(sessionToken);
      }
      
      const response = NextResponse.json({ success: true });
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }

    // Login action
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'סיסמה שגויה' },
        { status: 401 }
      );
    }

    const sessionToken = generateSessionToken();
    const expires = Date.now() + SESSION_DURATION;
    sessions.set(sessionToken, { expires });

    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION / 1000,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'שגיאה בהתחברות' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return NextResponse.json({ authenticated: false });
    }

    const session = sessions.get(sessionToken);
    if (!session || session.expires < Date.now()) {
      sessions.delete(sessionToken);
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({ authenticated: true });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ authenticated: false });
  }
}
