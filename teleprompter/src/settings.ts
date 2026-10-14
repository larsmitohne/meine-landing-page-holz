import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Settings = {
  text: string;
  fontSize: number; // sp
  color: string;
  opacity: number; // 0.2 – 1
  speed: number; // px pro Sekunde
  widthPct: number; // Textbreite in % der Bildschirmbreite
  top: number; // Abstand vom oberen Rand in dp
  windowHeightPct: number; // Höhe des Textfensters in % der Bildschirmhöhe
  mirrorPreview: boolean;
};

export const DEFAULT_TEXT =
  'Hallo und herzlich willkommen!\n\n' +
  'Das hier ist dein Beispieltext. Tippe unten auf „Text“, um ihn zu ersetzen oder deinen eigenen Text einzufügen.\n\n' +
  'Schau beim Sprechen möglichst nah an die Kameralinse, dann wirkt es im fertigen Video, als würdest du direkt in die Kamera sprechen.\n\n' +
  'Mit dem Tempo-Regler passt du die Scroll-Geschwindigkeit an deine Sprechgeschwindigkeit an.';

export const DEFAULT_SETTINGS: Settings = {
  text: DEFAULT_TEXT,
  fontSize: 30,
  color: '#FFFFFF',
  opacity: 0.8,
  speed: 40,
  widthPct: 85,
  top: 40,
  windowHeightPct: 40,
  mirrorPreview: true,
};

const KEY = 'teleprompter.settings.v1';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => {
      AsyncStorage.setItem(KEY, JSON.stringify(settings)).catch(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [settings, loaded]);

  const update = useCallback(
    <K extends keyof Settings>(key: K, value: Settings[K]) =>
      setSettings((s) => ({ ...s, [key]: value })),
    [],
  );

  return { settings, update, loaded };
}
