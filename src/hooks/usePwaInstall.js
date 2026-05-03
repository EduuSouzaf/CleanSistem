import { useState, useEffect } from 'react';

const DISMISSED_KEY = 'pwa_install_dismissed_until';

function isIosDevice() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  return window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches;
}

export function usePwaInstall() {
  const [prompt, setPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const dismissedUntil = localStorage.getItem(DISMISSED_KEY);
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) return;

    if (isInStandaloneMode()) return;

    if (isIosDevice()) {
      setIsIos(true);
      setCanInstall(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstall(false);
      setPrompt(null);
    }
  };

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now() + 7 * 24 * 60 * 60 * 1000));
    setCanInstall(false);
    setPrompt(null);
  };

  return { canInstall, install, dismiss, isIos };
}
