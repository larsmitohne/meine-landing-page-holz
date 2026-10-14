import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';

type Props = {
  visible: boolean;
  text: string;
  onChange: (t: string) => void;
  onClose: () => void;
};

export function TextEditor({ visible, text, onChange, onClose }: Props) {
  const paste = async () => {
    const clip = await Clipboard.getStringAsync();
    if (clip) onChange(clip);
  };
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.bar}>
          <Pressable onPress={paste} style={styles.btn}>
            <Text style={styles.btnText}>Einfügen</Text>
          </Pressable>
          <Pressable onPress={() => onChange('')} style={styles.btn}>
            <Text style={styles.btnText}>Leeren</Text>
          </Pressable>
          <View style={{ flex: 1 }} />
          <Pressable onPress={onClose} style={[styles.btn, styles.primary]}>
            <Text style={styles.btnText}>Fertig</Text>
          </Pressable>
        </View>
        <TextInput
          style={styles.input}
          multiline
          value={text}
          onChangeText={onChange}
          placeholder="Text hier eintippen oder einfügen …"
          placeholderTextColor="#777"
          textAlignVertical="top"
          autoFocus
        />
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#111', paddingTop: 48 },
  bar: { flexDirection: 'row', gap: 10, paddingHorizontal: 14, paddingBottom: 10 },
  btn: { backgroundColor: '#2b2f3a', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  primary: { backgroundColor: '#2f6fd0' },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  input: { flex: 1, color: '#fff', fontSize: 18, padding: 16, lineHeight: 26 },
});
