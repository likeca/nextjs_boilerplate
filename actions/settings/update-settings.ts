'use server';

import { db } from '@/lib/db';
import { requirePermission } from '@/lib/auth-helpers';
import { revalidatePath } from 'next/cache';

export async function updateSettings(settings: Record<string, string> | { [key: string]: string }) {
  await requirePermission("setting", "update");

  try {
    if (!settings || typeof settings !== 'object') {
      return { error: 'Invalid settings data' };
    }

    // Update or create each setting
    const operations = Object.entries(settings).map(([key, value]) => {
      return db.setting.upsert({
        where: { key },
        update: { value: value || '' },
        create: { key, value: value || '' },
      });
    });

    await db.$transaction(operations);

    revalidatePath('/settings');
    
    return { success: true, message: 'Settings updated successfully' };
  } catch (error) {
    console.error('Error updating settings:', error);
    return { error: 'Failed to update settings' };
  }
}

export async function updateSetting(key: string, value: string) {
  await requirePermission("settings", "update");

  try {
    if (!key) {
      return { error: 'Setting key is required' };
    }

    await db.setting.upsert({
      where: { key },
      update: { value: value || '' },
      create: { key, value: value || '' },
    });

    revalidatePath('/settings');
    
    return { success: true, message: 'Setting updated successfully' };
  } catch (error) {
    console.error(`Error updating setting ${key}:`, error);
    return { error: 'Failed to update setting' };
  }
}
