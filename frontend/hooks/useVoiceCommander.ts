"use client";

import { useState, useEffect, useCallback } from 'react';

interface VoiceCommand {
    command: string;
    action: () => void;
}

export function useVoiceCommander(commands: VoiceCommand[]) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [recognition, setRecognition] = useState<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
            // @ts-ignore
            const recognitionInstance = new window.webkitSpeechRecognition();
            recognitionInstance.continuous = false;
            recognitionInstance.interimResults = false;
            recognitionInstance.lang = 'en-US';

            recognitionInstance.onstart = () => setIsListening(true);
            recognitionInstance.onend = () => setIsListening(false);

            recognitionInstance.onresult = (event: any) => {
                const current = event.resultIndex;
                const transcriptText = event.results[current][0].transcript.toLowerCase();
                setTranscript(transcriptText);
                console.log('Voice Command:', transcriptText);

                // Simple command matching
                commands.forEach(cmd => {
                    if (transcriptText.includes(cmd.command.toLowerCase())) {
                        console.log('Executing command:', cmd.command);
                        cmd.action();
                    }
                });
            };

            setRecognition(recognitionInstance);
        } else {
            console.warn('Web Speech API not supported in this browser.');
        }
    }, [commands]);

    const startListening = useCallback(() => {
        if (recognition) {
            try {
                recognition.start();
            } catch (e) {
                console.error("Speech recognition already started", e);
            }
        }
    }, [recognition]);

    const stopListening = useCallback(() => {
        if (recognition) {
            recognition.stop();
        }
    }, [recognition]);

    return { isListening, transcript, startListening, stopListening };
}
