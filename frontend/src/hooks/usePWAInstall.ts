import { useState, useEffect, useCallback } from 'react';

const DISMISSED_KEY = 'pwa-install-dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISSED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Detect if already running as installed PWA
  const checkInstalled = useCallback(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsInstalled(standalone);
  }, []);

  useEffect(() => {
    checkInstalled();

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const installedHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, [checkInstalled]);

  // Detect iOS Safari
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isInStandaloneMode = isInstalled;

  // canInstall: true when native prompt is available
  const canInstall = !!deferredPrompt && !isDismissed && !isInstalled;

  // showIOSInstructions: iOS Safari users who haven't installed yet
  const showIOSInstructions = isIOS && !isInStandaloneMode && !isDismissed;

  // showBanner: show when either native prompt or iOS instructions are relevant
  const showBanner = (canInstall || showIOSInstructions) && !isInstalled;

  const promptToInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'dismissed') {
      // Don't permanently dismiss just because they cancelled the prompt
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(DISMISSED_KEY, 'true');
    } catch {
      // ignore
    }
    setIsDismissed(true);
  }, []);

  const resetDismiss = useCallback(() => {
    try {
      localStorage.removeItem(DISMISSED_KEY);
    } catch {
      // ignore
    }
    setIsDismissed(false);
  }, []);

  return {
    canInstall,
    showBanner,
    showIOSInstructions,
    isInstalled,
    isDismissed,
    promptToInstall,
    dismiss,
    resetDismiss,
    // Legacy alias
    promptInstall: promptToInstall,
  };
}
