import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sanitizeUser } from '@/lib/sanitize';
import { attachEquippedToItems } from '@/lib/equipped-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const [userWithEquipped] = await attachEquippedToItems([sanitizeUser(user)], '');

    return NextResponse.json({ success: true, user: userWithEquipped });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
