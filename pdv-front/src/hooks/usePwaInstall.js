import { useState, useEffect } from 'react';

const DISMISSED_KEY = 'pwa_install_dismissed_until';

export function usePwaInstall() {
  const [prompt, setPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const dismissedUntil = localStorage.getItem(DISMISSED_KEY);
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) return;

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
    // Não mostrar novamente por 7 dias
    localStorage.setItem(DISMISSED_KEY, String(Date.now() + 7 * 24 * 60 * 60 * 1000));
    setCanInstall(false);
    setPrompt(null);
  };

  return { canInstall, install, dismiss };
}
