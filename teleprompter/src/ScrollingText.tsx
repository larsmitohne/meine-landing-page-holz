import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  useWindowDimensions,
  View,
} from 'react-native';

export type ScrollingTextHandle = {
  play: () => void;
  pause: () => void;
  toggle: () => void;
  rewind: (px: number) => void;
  reset: () => void;
};

type Props = {
  text: string;
  fontSize: number;
  color: string;
  opacity: number;
  speed: number;
  widthPct: number;
  top: number;
  windowHeightPct: number;
  onPlayingChange?: (playing: boolean) => void;
};

// Dünne dunkle Kontur: vier um 1 px versetzte dunkle Kopien + weicher Schatten
const OUTLINE_OFFSETS = [
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
] as const;

export const ScrollingText = forwardRef<ScrollingTextHandle, Props>(function ScrollingText(
  { text, fontSize, color, opacity, speed, widthPct, top, windowHeightPct, onPlayingChange },
  ref,
) {
  const { width, height } = useWindowDimensions();
  const y = useRef(new Animated.Value(0)).current;
  const pos = useRef(0);
  const contentH = useRef(0);
  const playing = useRef(false);
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const [, forceRender] = useState(0);

  useEffect(() => {
    const id = y.addListener(({ value }) => {
      pos.current = value;
    });
    return () => y.removeListener(id);
  }, [y]);

  const setPlaying = useCallback(
    (p: boolean) => {
      if (playing.current === p) return;
      playing.current = p;
      onPlayingChange?.(p);
    },
    [onPlayingChange],
  );

  const endPos = () => Math.max(0, contentH.current - fontSize * 1.5);

  const start = useCallback(() => {
    const remaining = endPos() - pos.current;
    if (remaining <= 1) {
      setPlaying(false);
      return;
    }
    setPlaying(true);
    Animated.timing(y, {
      toValue: endPos(),
      duration: (remaining / speedRef.current) * 1000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setPlaying(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [y, setPlaying, fontSize]);

  const halt = useCallback(
    (then?: () => void) => {
      y.stopAnimation((v) => {
        pos.current = v;
        then?.();
      });
    },
    [y],
  );

  const toggle = useCallback(() => {
    if (playing.current) {
      setPlaying(false);
      halt();
    } else {
      start();
    }
  }, [halt, setPlaying, start]);

  useImperativeHandle(
    ref,
    () => ({
      play: () => {
        if (!playing.current) start();
      },
      pause: () => {
        setPlaying(false);
        halt();
      },
      toggle,
      rewind: (px) => {
        const wasPlaying = playing.current;
        halt(() => {
          const next = Math.max(0, pos.current - px);
          y.setValue(next);
          pos.current = next;
          if (wasPlaying) start();
        });
      },
      reset: () => {
        setPlaying(false);
        halt(() => {
          y.setValue(0);
          pos.current = 0;
        });
      },
    }),
    [halt, setPlaying, start, toggle, y],
  );

  // Tempo geändert während des Scrollens → mit neuer Geschwindigkeit weiterlaufen
  useEffect(() => {
    if (playing.current) halt(start);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed]);

  const onContentLayout = (e: LayoutChangeEvent) => {
    contentH.current = e.nativeEvent.layout.height;
    forceRender((n) => n + 1);
  };

  const textStyle: TextStyle = {
    fontSize,
    lineHeight: fontSize * 1.35,
    fontWeight: '600',
    textAlign: 'center',
  };
  const boxW = (width * widthPct) / 100;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.window, { top, height: (height * windowHeightPct) / 100, width: boxW, left: (width - boxW) / 2 }]}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={toggle}>
        {/* Gruppen-Alpha, damit sich überlappende Kontur-Kopien nicht durchscheinen */}
        <View style={{ opacity, flex: 1 }} needsOffscreenAlphaCompositing>
          <Animated.View
            style={{ transform: [{ translateY: Animated.multiply(y, -1) }] }}
            onLayout={onContentLayout}
          >
            {OUTLINE_OFFSETS.map(([dx, dy], i) => (
              <Text
                key={i}
                style={[
                  styles.copy,
                  textStyle,
                  { color: '#000', left: dx, top: dy, textShadowColor: '#000', textShadowRadius: 2 },
                ]}
              >
                {text}
              </Text>
            ))}
            <Text
              style={[
                textStyle,
                { color, textShadowColor: 'rgba(0,0,0,0.9)', textShadowRadius: 3, textShadowOffset: { width: 0, height: 0 } },
              ]}
            >
              {text}
            </Text>
          </Animated.View>
        </View>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  window: { position: 'absolute', overflow: 'hidden' },
  copy: { position: 'absolute', width: '100%' },
});
