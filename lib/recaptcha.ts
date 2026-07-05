export const GOOGLE_RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY;
console.log('GOOGLE_RECAPTCHA_SITE_KEY:', GOOGLE_RECAPTCHA_SITE_KEY);

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

let scriptPromise: Promise<void> | null = null;

export function loadRecaptcha(): Promise<void> {
  if (!GOOGLE_RECAPTCHA_SITE_KEY || typeof window === 'undefined') return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    if (window.grecaptcha) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${GOOGLE_RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error('Failed to load reCAPTCHA'));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export async function getRecaptchaToken(action: string): Promise<string | null> {
  if (!GOOGLE_RECAPTCHA_SITE_KEY || typeof window === 'undefined') return null;

  await loadRecaptcha();
  const grecaptcha = window.grecaptcha;
  if (!grecaptcha) return null;

  return new Promise<string>((resolve, reject) => {
    grecaptcha.ready(() => {
      grecaptcha.execute(GOOGLE_RECAPTCHA_SITE_KEY!, { action }).then(resolve).catch(reject);
    });
  });
}
