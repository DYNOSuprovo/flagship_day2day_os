"use client";

import { useCallback, useRef, useEffect } from 'react';

export function useMatrixSound() {
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // @ts-ignore
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContextRef.current = new AudioContext();
        }
    }, []);

    const playTone = useCallback((frequency: number, type: OscillatorType, duration: number, volume: number = 0.1) => {
        if (!audioContextRef.current) return;

        const ctx = audioContextRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);
        
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
    }, []);

    const playHover = useCallback(() => {
        // High pitch chirp
        playTone(2000, 'sine', 0.05, 0.05);
    }, [playTone]);

    const playClick = useCallback(() => {
        // Low mechanical thud
        playTone(150, 'square', 0.1, 0.1);
    }, [playTone]);

    const playActivate = useCallback(() => {
        // Power up sound
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.3);
        
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    }, []);

    return { playHover, playClick, playActivate };
}
