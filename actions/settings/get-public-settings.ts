'use server';

import { db } from '@/lib/db';

const PUBLIC_SETTING_KEYS = [
  // Contact Info
  'companyName',
  'email',
  'phone',
  'address',
  'city',
  'state',
  'zipCode',
  'country',
  'businessHours',
  // Additional
  'googleMapsUrl',
  'whatsappNumber',
  'footerText',
  // Social Media
  'facebook',
  'twitter',
  'instagram',
  'linkedin',
  'youtube',
  'tiktok',
];

export type PublicSettings = {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  businessHours: string;
  googleMapsUrl: string;
  whatsappNumber: string;
  footerText: string;
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  tiktok: string;
};

export async function getPublicSettings(): Promise<{ success: true; data: PublicSettings } | { error: string }> {
  try {
    const settings = await db.setting.findMany({
      where: { key: { in: PUBLIC_SETTING_KEYS } },
    });

    const defaults: PublicSettings = {
      companyName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      businessHours: '',
      googleMapsUrl: '',
      whatsappNumber: '',
      footerText: '',
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
      youtube: '',
      tiktok: '',
    };

    const data = settings.reduce((acc, setting) => {
      if (setting.key in acc) {
        (acc as Record<string, string>)[setting.key] = setting.value || '';
      }
      return acc;
    }, { ...defaults });

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching public settings:', error);
    return { error: 'Failed to fetch settings' };
  }
}
