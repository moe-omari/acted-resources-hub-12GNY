import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (username === 'asaad' && password === '1234') {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Incorrect username or password' }, { status: 401 });
  } catch (error) {
    console.error('Error during login check:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
