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
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;

    if (!name || name.trim().length === 0) {
      return { error: 'Name is required' };
    }

    if (!email || email.trim().length === 0) {
      return { error: 'Email is required' };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { error: 'Invalid email format' };
    }

    // Check if email is already taken by another user
    const existingUser = await db.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existingUser && existingUser.id !== session.user.id) {
      return { error: 'This email is already in use' };
    }

    // Phone is optional, so it can be empty
    const phoneValue = phone && phone.trim().length > 0 ? phone.trim() : null;

    // Check if email changed to reset verification
    const emailChanged = email.trim().toLowerCase() !== session.user.email.toLowerCase();

    await db.user.update({
      where: { id: session.user.id },
      data: { 
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phoneValue,
        ...(emailChanged && { emailVerified: false })
      },
    });

    revalidatePath('/profile');
    
    if (emailChanged) {
      return { success: true, message: 'Profile updated successfully. Please verify your new email.' };
    }
    
    return { success: true, message: 'Profile updated successfully' };
  } catch (error: unknown) {
    console.error('Failed to update profile:', error);
    return { error: 'Failed to update profile: ' + String(error) };
  }
}
