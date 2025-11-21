/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type VoiceOption = {
  name: string;
  lang: string;
  voice: SpeechSynthesisVoice;
};

export default function Page() {
  const [text, setText] = useState<string>('Halo! Ini adalah aplikasi Text-to-Speech.');
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [rate, setRate] = useState<number>(1);
  const [pitch, setPitch] = useState<number>(1);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speech = useMemo(() => (typeof window !== 'undefined' ? window.speechSynthesis : null), []);

  useEffect(() => {
    if (!speech) return;

    const handleVoicesChanged = () => {
      const v = speech.getVoices();
      const mapped: VoiceOption[] = v.map((voice) => ({
        name: voice.name,
        lang: voice.lang,
        voice,
      }));
      setVoices(mapped);
      if (!selectedVoice && mapped.length > 0) {
        const idVoice =
          mapped.find((x) => x.lang.toLowerCase().startsWith('id'))?.name ??
          mapped.find((x) => x.lang.toLowerCase().startsWith('en'))?.name ??
          mapped[0].name;
        setSelectedVoice(idVoice);
      }
    };

    handleVoicesChanged();
    speech.addEventListener('voiceschanged', handleVoicesChanged);
    return () => speech.removeEventListener('voiceschanged', handleVoicesChanged);
  }, [speech]);

  const speak = () => {
    if (!speech) return;
    if (isSpeaking) stop();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    const chosen = voices.find((v) => v.name === selectedVoice)?.voice;
    if (chosen) utterance.voice = chosen;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    utteranceRef.current = utterance;
    speech.speak(utterance);
  };

  const pause = () => {
    if (!speech) return;
    if (speech.speaking && !speech.paused) {
      speech.pause();
    }
  };

  const resume = () => {
    if (!speech) return;
    if (speech.paused) {
      speech.resume();
    }
  };

  const stop = () => {
    if (!speech) return;
    speech.cancel();
    setIsSpeaking(false);
    utteranceRef.current = null;
  };

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Aplikasi Text-to-Speech</h1>
      <div className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium">Teks</span>
          <textarea
            className="w-full min-h-[140px] rounded-md border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-blue-500"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ketik sesuatu untuk dibacakan..."
          />
        </label>

        <div className="grid sm:grid-cols-3 gap-4">
          <label className="grid gap-1">
            <span className="text-sm font-medium">Suara</span>
            <select
              className="rounded-md border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
            >
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Kecepatan: {rate.toFixed(2)}</span>
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.01}
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Pitch: {pitch.toFixed(2)}</span>
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.01}
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
            />
          </label>
        </div>

        <div className="flex gap-2">
          <button
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
            onClick={speak}
            disabled={!text.trim()}
          >
            Putar
          </button>
          <button
            className="rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300"
            onClick={pause}
          >
            Jeda
          </button>
          <button
            className="rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300"
            onClick={resume}
          >
            Lanjutkan
          </button>
          <button
            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            onClick={stop}
          >
            Berhenti
          </button>
        </div>

        <p className="text-xs text-gray-600">
          Catatan: Suara yang tersedia bergantung pada browser dan sistem Anda.
        </p>
      </div>
    </main>
  );
}
