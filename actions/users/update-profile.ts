'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/auth-helpers';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  const session = await getSession();
  
  if (!session?.user) {
    return { error: 'Not authenticated' };
  }

  try {
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;

    if (!name || name.trim().length === 0) {
      return { error: 'Name is required' };
    }

    // Phone is optional, so it can be empty
    const phoneValue = phone && phone.trim().length > 0 ? phone.trim() : null;

    // Email changes are handled via /api/user/email-change for security
    await db.user.update({
      where: { id: session.user.id },
      data: { 
        name: name.trim(),
        phone: phoneValue,
      },
    });

    revalidatePath('/profile');
    
    return { success: true, message: 'Profile updated successfully' };
  } catch (error: unknown) {
    console.error('Failed to update profile:', error);
    return { error: 'Failed to update profile: ' + String(error) };
  }
}
