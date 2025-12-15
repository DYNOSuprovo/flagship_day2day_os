"use client";

// Sound effect types
export type SoundType = "click" | "success" | "error" | "levelUp" | "achievement" | "complete";

// Simple sound effect utility using Web Audio API
class SoundEffects {
    private audioContext: AudioContext | null = null;
    private enabled: boolean = true;

    constructor() {
        if (typeof window !== "undefined") {
            // Load settings
            const saved = localStorage.getItem("appSettings");
            if (saved) {
                const settings = JSON.parse(saved);
                this.enabled = settings.soundEnabled ?? true;
            }
        }
    }

    private getContext(): AudioContext {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return this.audioContext;
    }

    public setEnabled(enabled: boolean) {
        this.enabled = enabled;
    }

    public play(type: SoundType) {
        if (!this.enabled || typeof window === "undefined") return;

        const ctx = this.getContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Configure sound based on type
        switch (type) {
            case "click":
                oscillator.frequency.setValueAtTime(800, ctx.currentTime);
                oscillator.type = "sine";
                gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.1);
                break;

            case "success":
                oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
                oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
                oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
                oscillator.type = "sine";
                gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.3);
                break;

            case "error":
                oscillator.frequency.setValueAtTime(200, ctx.currentTime);
                oscillator.type = "sawtooth";
                gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.2);
                break;

            case "levelUp":
                oscillator.frequency.setValueAtTime(440, ctx.currentTime); // A4
                oscillator.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
                oscillator.type = "sine";
                gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.4);
                break;

            case "achievement":
                // Play a triumphant arpeggio
                this.playArpeggio([523.25, 659.25, 783.99, 1046.5], 0.1);
                break;

            case "complete":
                oscillator.frequency.setValueAtTime(600, ctx.currentTime);
                oscillator.type = "sine";
                gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.15);
                break;
        }
    }

    private playArpeggio(frequencies: number[], duration: number) {
        const ctx = this.getContext();

        frequencies.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.frequency.setValueAtTime(freq, ctx.currentTime + i * duration);
            osc.type = "sine";
            gain.gain.setValueAtTime(0.15, ctx.currentTime + i * duration);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * duration + duration);

            osc.start(ctx.currentTime + i * duration);
            osc.stop(ctx.currentTime + i * duration + duration);
        });
    }
}

// Singleton instance
export const soundEffects = typeof window !== "undefined" ? new SoundEffects() : null;

// Helper hook
export function useSounds() {
    const play = (type: SoundType) => {
        soundEffects?.play(type);
    };

    return { play };
}
