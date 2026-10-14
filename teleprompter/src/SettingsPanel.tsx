import React from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import type { Settings } from './settings';

const COLORS = ['#FFFFFF', '#FFE45C', '#9BFF8A', '#6FE7FF', '#FFB36B'];

type Props = {
  settings: Settings;
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  onEditText: () => void;
  onClose: () => void;
};

function Row({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowHead}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{format(value)}</Text>
      </View>
      <Slider
        value={value}
        minimumValue={min}
        maximumValue={max}
        step={step}
        onValueChange={onChange}
        minimumTrackTintColor="#4da3ff"
        maximumTrackTintColor="#666"
        thumbTintColor="#fff"
      />
    </View>
  );
}

export function SettingsPanel({ settings: s, update, onEditText, onClose }: Props) {
  return (
    <View style={styles.sheet}>
      <View style={styles.header}>
        <Text style={styles.title}>Einstellungen</Text>
        <Pressable onPress={onClose} hitSlop={12}>
          <Text style={styles.done}>Fertig</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
        <Pressable style={styles.textBtn} onPress={onEditText}>
          <Text style={styles.textBtnLabel}>Text bearbeiten / einfügen</Text>
        </Pressable>

        <Row label="Schriftgröße" value={s.fontSize} min={16} max={64} step={1} onChange={(v) => update('fontSize', v)} format={(v) => `${v}`} />
        <Row label="Transparenz (Text)" value={s.opacity} min={0.2} max={1} step={0.05} onChange={(v) => update('opacity', v)} format={(v) => `${Math.round(v * 100)} %`} />
        <Row label="Scroll-Tempo" value={s.speed} min={10} max={160} step={5} onChange={(v) => update('speed', v)} format={(v) => `${v} px/s`} />
        <Row label="Textbreite" value={s.widthPct} min={40} max={100} step={1} onChange={(v) => update('widthPct', v)} format={(v) => `${v} %`} />
        <Row label="Abstand oben (Position)" value={s.top} min={0} max={400} step={2} onChange={(v) => update('top', v)} format={(v) => `${v} dp`} />
        <Row label="Höhe des Textfensters" value={s.windowHeightPct} min={15} max={80} step={1} onChange={(v) => update('windowHeightPct', v)} format={(v) => `${v} %`} />

        <Text style={[styles.label, { marginTop: 8 }]}>Textfarbe</Text>
        <View style={styles.swatches}>
          {COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => update('color', c)}
              style={[styles.swatch, { backgroundColor: c }, s.color === c && styles.swatchActive]}
            />
          ))}
        </View>

        <View style={[styles.rowHead, { marginTop: 14 }]}>
          <Text style={styles.label}>Spiegelansicht (nur Vorschau)</Text>
          <Switch value={s.mirrorPreview} onValueChange={(v) => update('mirrorPreview', v)} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '48%',
    backgroundColor: 'rgba(20,20,24,0.92)',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  done: { color: '#4da3ff', fontSize: 16, fontWeight: '600' },
  textBtn: { backgroundColor: '#2b2f3a', borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 6 },
  textBtnLabel: { color: '#fff', fontSize: 15, fontWeight: '600' },
  row: { marginTop: 6 },
  rowHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: '#ddd', fontSize: 14 },
  value: { color: '#9aa', fontSize: 14 },
  swatches: { flexDirection: 'row', gap: 12, marginTop: 8 },
  swatch: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: 'transparent' },
  swatchActive: { borderColor: '#4da3ff' },
});
