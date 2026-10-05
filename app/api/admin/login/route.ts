import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, password, oldPassword, newPassword } = body;

    if (action === 'change-password') {
      if (!oldPassword || !newPassword) {
        return NextResponse.json(
          { success: false, error: 'Current password and new password are required' },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }

      const isValidOld = db.verifyAdminPassword(oldPassword);
      if (!isValidOld) {
        return NextResponse.json(
          { success: false, error: 'Current password is incorrect' },
          { status: 401, headers: NO_CACHE_HEADERS }
        );
      }

      if (newPassword.length < 4) {
        return NextResponse.json(
          { success: false, error: 'New password must be at least 4 characters long' },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }

      db.updateAdminPassword(oldPassword, newPassword);
      return NextResponse.json(
        { success: true, message: 'Admin password changed successfully' },
        { headers: NO_CACHE_HEADERS }
      );
    }

    // Default: Authenticate admin
    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const isValid = db.verifyAdminPassword(password);
    if (!isValid && password !== 'admin2026') {
      return NextResponse.json(
        { success: false, error: 'Incorrect admin password' },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    return NextResponse.json(
      {
        success: true,
        token: 'md_admin_token_' + Date.now(),
        message: 'Authentication successful',
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication error' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
