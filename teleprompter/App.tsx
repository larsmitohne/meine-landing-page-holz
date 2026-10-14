import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { useKeepAwake } from 'expo-keep-awake';
import { ScrollingText, ScrollingTextHandle } from './src/ScrollingText';
import { SettingsPanel } from './src/SettingsPanel';
import { TextEditor } from './src/TextEditor';
import { useSettings } from './src/settings';

export default function App() {
  useKeepAwake();
  const { settings, update, loaded } = useSettings();

  const [camPerm, requestCam] = useCameraPermissions();
  const [micPerm, requestMic] = useMicrophonePermissions();
  const [libPerm, requestLib] = MediaLibrary.usePermissions({ writeOnly: true, granularPermissions: ['video'] });

  const cameraRef = useRef<CameraView>(null);
  const promptRef = useRef<ScrollingTextHandle>(null);
  const [ready, setReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(t);
  }, [notice]);

  const startRecording = useCallback(async () => {
    if (!cameraRef.current) return;
    try {
      setRecording(true);
      promptRef.current?.play();
      // Das Promise wird erst nach stopRecording() aufgelöst.
      const result = await cameraRef.current.recordAsync();
      setRecording(false);
      promptRef.current?.pause();
      if (result?.uri) {
        await MediaLibrary.Asset.create(result.uri);
        setNotice('Video in der Galerie gespeichert ✓');
      }
    } catch (e) {
      setRecording(false);
      promptRef.current?.pause();
      Alert.alert('Aufnahme fehlgeschlagen', String(e instanceof Error ? e.message : e));
    }
  }, []);

  const stopRecording = useCallback(() => cameraRef.current?.stopRecording(), []);

  if (!loaded || !camPerm || !micPerm || !libPerm) {
    return <View style={styles.center}><ActivityIndicator color="#fff" /></View>;
  }

  if (!camPerm.granted || !micPerm.granted || !libPerm.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permText}>
          Für Aufnahme mit Ton und das Speichern in der Galerie braucht die App Zugriff auf Kamera,
          Mikrofon und Medien.
        </Text>
        <Pressable
          style={styles.permBtn}
          onPress={async () => {
            await requestCam();
            await requestMic();
            await requestLib();
          }}
        >
          <Text style={styles.permBtnText}>Berechtigungen erteilen</Text>
        </Pressable>
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      {/* Spiegelung nur in der Vorschau: Die Frontkamera-Vorschau ist nativ gespiegelt (Selfie-Optik),
          die Aufnahme nicht. "mirror" bleibt false, damit das gespeicherte Video normal ist. */}
      <View style={[StyleSheet.absoluteFill, !settings.mirrorPreview && { transform: [{ scaleX: -1 }] }]}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="front"
          mode="video"
          videoQuality="1080p"
          mirror={false}
          onCameraReady={() => setReady(true)}
        />
      </View>

      {/* Der Text ist eine normale RN-View über der Kamera – nicht Teil des Videostreams. */}
      <ScrollingText
        ref={promptRef}
        text={settings.text}
        fontSize={settings.fontSize}
        color={settings.color}
        opacity={settings.opacity}
        speed={settings.speed}
        widthPct={settings.widthPct}
        top={settings.top}
        windowHeightPct={settings.windowHeightPct}
        onPlayingChange={setScrolling}
      />

      {notice && (
        <View style={styles.notice} pointerEvents="none">
          <Text style={styles.noticeText}>{notice}</Text>
        </View>
      )}

      {!showSettings && (
        <View style={styles.controls}>
          <RoundBtn label="⏪" onPress={() => promptRef.current?.rewind(settings.speed * 5)} onLongPress={() => promptRef.current?.reset()} />
          <RoundBtn label={scrolling ? '⏸' : '▶'} onPress={() => promptRef.current?.toggle()} />
          <Pressable
            disabled={!ready}
            onPress={recording ? stopRecording : startRecording}
            style={[styles.recOuter, !ready && { opacity: 0.4 }]}
          >
            <View style={recording ? styles.recStop : styles.recDot} />
          </Pressable>
          <RoundBtn label="Aa" onPress={() => setShowSettings(true)} />
        </View>
      )}

      {showSettings && (
        <SettingsPanel
          settings={settings}
          update={update}
          onEditText={() => setEditing(true)}
          onClose={() => setShowSettings(false)}
        />
      )}

      <TextEditor
        visible={editing}
        text={settings.text}
        onChange={(t) => {
          update('text', t);
          promptRef.current?.reset();
        }}
        onClose={() => setEditing(false)}
      />
    </View>
  );
}

function RoundBtn({ label, onPress, onLongPress }: { label: string; onPress: () => void; onLongPress?: () => void }) {
  return (
    <Pressable style={styles.round} onPress={onPress} onLongPress={onLongPress}>
      <Text style={styles.roundText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center', padding: 28 },
  permText: { color: '#fff', fontSize: 16, textAlign: 'center', marginBottom: 20, lineHeight: 23 },
  permBtn: { backgroundColor: '#2f6fd0', paddingHorizontal: 22, paddingVertical: 13, borderRadius: 12 },
  permBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  controls: {
    position: 'absolute',
    bottom: 36,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  round: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  roundText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  recOuter: { width: 78, height: 78, borderRadius: 39, borderWidth: 4, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  recDot: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#ff3b30' },
  recStop: { width: 32, height: 32, borderRadius: 6, backgroundColor: '#ff3b30' },
  notice: { position: 'absolute', bottom: 140, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  noticeText: { color: '#fff', fontSize: 15 },
});
