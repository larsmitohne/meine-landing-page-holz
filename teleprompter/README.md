# Teleprompter (Expo / React Native, Android)

Frontkamera-Vollbild mit halbtransparentem, scrollendem Text. Der Text ist eine normale
React-Native-View **über** der Kamera-Vorschau und wird deshalb nicht mit aufgenommen.
Videos (mit Ton) landen in der Galerie.

## Funktionen
- Aufnahme-Button (Start/Stopp), Video mit Ton, Speichern in die Galerie
- Text eintippen oder aus der Zwischenablage einfügen, wird gespeichert
- Scroll: Play/Pause (auch Tippen auf den Text), ⏪ springt 5 s zurück, langes Drücken = zum Anfang
- Einstellungen („Aa“): Schriftgröße, Textfarbe, Transparenz, Tempo, Textbreite,
  Abstand oben, Höhe des Textfensters, Spiegelansicht (nur Vorschau)
- Text mit dünner dunkler Kontur + Schatten

## Testen auf dem Handy

### Weg A – APK bauen und installieren (empfohlen, zuverlässig)
1. Kostenloses Konto auf https://expo.dev anlegen.
2. Am PC im Ordner `teleprompter`:
   ```bash
   npm install
   npx eas-cli@latest login
   npx eas-cli@latest build --platform android --profile preview
   ```
   (Beim ersten Mal „Create project?“ und „Generate keystore?“ mit Ja bestätigen.)
3. Nach ca. 10–20 Minuten gibt EAS einen Link/QR-Code aus. Diesen auf dem S25 Ultra öffnen
   und die `.apk` herunterladen.
4. Beim Öffnen erlaubt Android die Installation aus „unbekannter Quelle“:
   Einstellungen → „Installieren erlauben“ für den Browser, dann installieren.
5. App starten → Berechtigungen für Kamera, Mikrofon, Medien erteilen → testen.

### Weg B – schnell mit Expo Go (kann bei Galerie-Speichern eingeschränkt sein)
1. „Expo Go“ aus dem Play Store installieren.
2. Am PC: `npm install && npx expo start`
3. Handy und PC im selben WLAN; QR-Code mit Expo Go scannen.
Falls das Speichern in die Galerie oder die Kamera in Expo Go nicht funktioniert, nutze Weg A.

### Weg C – Entwickler-Build per USB
USB-Debugging am Handy aktivieren, dann `npx expo run:android` (braucht Android Studio / SDK).

## Was du prüfen solltest
1. Du siehst dich im Vollbild, der Text liegt halbtransparent oben und scrollt.
2. Aufnahme starten, 10 s sprechen, stoppen → Meldung „Video in der Galerie gespeichert“.
3. Video in der Galerie ansehen: **kein Text im Bild**, Ton vorhanden, Bild **nicht gespiegelt**
   (Schrift im Hintergrund lesbar).
4. Spiegelansicht ein/aus: nur die Vorschau ändert sich, nicht das gespeicherte Video.
