'use server';

import { db } from '@/lib/db';
import { requirePermission } from '@/lib/auth-helpers';

export async function getSettings() {
  await requirePermission("setting", "read");

  try {
    const settings = await db.setting.findMany({
      orderBy: { key: 'asc' },
    });

    // Transform array to key-value object for easier consumption
    const settingsObject = settings.reduce((acc: Record<string, string>, setting) => {
      acc[setting.key] = setting.value || '';
      return acc;
    }, {} as Record<string, string>);

    return { success: true, data: settingsObject };
  } catch (error) {
    console.error('Error fetching settings:', error);
    return { error: 'Failed to fetch settings' };
  }
}

export async function getSetting(key: string) {
  await requirePermission("setting", "read");

  try {
    if (!key) {
      return { error: 'Setting key is required' };
    }

    const setting = await db.setting.findUnique({
      where: { key },
    });

    if (!setting) {
      return { success: true, data: null };
    }

    return { success: true, data: setting.value };
  } catch (error) {
    console.error(`Error fetching setting ${key}:`, error);
    return { error: 'Failed to fetch setting' };
  }
}
