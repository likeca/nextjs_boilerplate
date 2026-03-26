import { auth } from '@/lib/auth';
import { rateLimit } from '@/lib/security/rate-limiter';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { checkPermission } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 10 requests per minute per authenticated user
    const rateLimitResult = rateLimit(`check-permission:${session.user.id}`, {
      limit: 10,
      windowSeconds: 60,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }

    const { resource, action } = await request.json();

    if (!resource || !action) {
      return NextResponse.json(
        { error: 'Resource and action are required' },
        { status: 400 }
      );
    }

    const allowed = await checkPermission(resource, action);

    return NextResponse.json({ hasPermission: allowed });
  } catch (error) {
    console.error('Error checking permission:', error);
    return NextResponse.json(
      { error: 'Failed to check permission', hasPermission: false },
      { status: 500 }
    );
  }
}
