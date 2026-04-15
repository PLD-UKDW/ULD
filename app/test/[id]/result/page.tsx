"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { getSpeedLabel } from "@/components/TTSControl";
import { useTtsRate } from "@/lib/ttsRate";

export default function TestResultPage() {
  const { id } = useParams();
  const params = useSearchParams();
  const router = useRouter();
  const attemptId = params.get("attemptId");

  const [attempt, setAttempt] = useState<any>(null);
  const [test, setTest] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [hasSpoken, setHasSpoken] = useState(false);
  const [useTTS, setUseTTS] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("accessMode") !== "no-tts";
  });
  const [speechRate, setSpeechRate] = useTtsRate(1);
  const preferredVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const leftArrowPressRef = useRef<number>(0);

  useEffect(() => {
    const syncAccessMode = () => {
      const accessMode = localStorage.getItem("accessMode");
      setUseTTS(accessMode !== "no-tts");
    };

    syncAccessMode();
    window.addEventListener("storage", syncAccessMode);

    return () => {
      window.removeEventListener("storage", syncAccessMode);
    };
  }, []);

  useEffect(() => {
    if (!useTTS && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, [useTTS]);

  const getPreferredVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;

    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;

    const googleIndonesianVoice = voices.find((voice) => /google/i.test(voice.name) && /^id/i.test(voice.lang));
    if (googleIndonesianVoice) return googleIndonesianVoice;

    const indonesianVoice = voices.find((voice) => /^id/i.test(voice.lang) || /indones/i.test(voice.lang));
    if (indonesianVoice) return indonesianVoice;

    return voices[0] || null;
  }, []);

  const createUtterance = useCallback(
    (text: string, rate: number) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = 1;
      utterance.volume = 1;

      const preferredVoice = preferredVoiceRef.current ?? getPreferredVoice();
      if (preferredVoice) {
        utterance.voice = preferredVoice;
        utterance.lang = preferredVoice.lang;
      } else {
        utterance.lang = "id-ID";
      }

      return utterance;
    },
    [getPreferredVoice],
  );

  useEffect(() => {
    if (!useTTS) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const loadVoices = () => {
      preferredVoiceRef.current = getPreferredVoice();
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [getPreferredVoice, useTTS]);

  const speakQueue = (texts: string[], rate?: number) => {
    if (!useTTS) return;
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const currentRate = rate ?? speechRate;

    texts.forEach((text) => {
      const u = createUtterance(text, currentRate);
      window.speechSynthesis.speak(u);
    });
  };

  const speakQueueAndWait = (texts: string[], rate?: number): Promise<void> => {
    return new Promise((resolve) => {
      if (!useTTS) {
        resolve();
        return;
      }

      if (!("speechSynthesis" in window)) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      const currentRate = rate ?? speechRate;

      if (texts.length === 0) {
        resolve();
        return;
      }

      texts.forEach((text, index) => {
        const u = createUtterance(text, currentRate);

        if (index === texts.length - 1) {
          u.onend = () => resolve();
          u.onerror = () => resolve();
        }

        window.speechSynthesis.speak(u);
      });
    });
  };

  const fetchResult = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token || !attemptId) return;

    try {
      const res = await fetch(`http://localhost:4000/api/test/${id}/result?attemptId=${attemptId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setAttempt(data.attempt);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Fetch result error:", err);
    }
  }, [id, attemptId]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetchResult();

    fetch(`http://localhost:4000/api/test/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setTest);
  }, [id, attemptId, fetchResult]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchResult();
    }, 10000); // 10 detik

    return () => clearInterval(interval);
  }, [fetchResult]);

  useEffect(() => {
    if (!useTTS || !attempt || !test || hasSpoken) return;

    const timeout = setTimeout(() => {
      window.speechSynthesis.cancel();

      const texts: string[] = [];

      texts.push(`Hasil ${test.title}. ...`);
      texts.push(`Skor sementara Anda adalah ${attempt.autoScore}. ...`);

      if (attempt.manualScore !== null) {
        texts.push(`Skor essay adalah ${attempt.manualScore}. ...`);
      }

      if (attempt.finalScore !== null) {
        texts.push(`Skor akhir Anda adalah ${attempt.finalScore}. ...`);
      } else {
        texts.push("Skor akhir sedang menunggu penilaian. ...");
      }

      if (attempt.passStatus) {
        texts.push(attempt.passStatus === "PASS" ? "Selamat, Anda dinyatakan lulus. ..." : "Maaf, Anda dinyatakan tidak lulus. ...");
      }

      texts.push("Tekan Spasi untuk kembali ke Halaman Utama Tes. Gunakan Shift panah atas atau Shift panah bawah untuk mengatur kecepatan suara.");

      speakQueue(texts);
      setHasSpoken(true);
    }, 500);

    return () => clearTimeout(timeout);
  }, [attempt, test, hasSpoken, speechRate, useTTS]);

  const changeSpeed = useCallback(
    (delta: number) => {
      if (!useTTS) return;

      let newRate = speechRate;
      setSpeechRate((prev: number) => {
        newRate = Math.max(0.5, Math.min(2, prev + delta));
        return newRate;
      });

      window.speechSynthesis.cancel();
      const label = getSpeedLabel(newRate);
      speakQueue([`Kecepatan ${label}`], newRate);
    },
    [setSpeechRate, speakQueue, speechRate, useTTS],
  );

  const replayResult = useCallback(() => {
    if (!useTTS) return;
    if (!attempt || !test) return;

    window.speechSynthesis.cancel();
    const texts: string[] = [];

    texts.push(`Hasil ${test.title}. ...`);
    texts.push(`Skor sementara Anda adalah ${attempt.autoScore}. ...`);

    if (attempt.manualScore !== null) {
      texts.push(`Skor essay adalah ${attempt.manualScore}. ...`);
    }

    if (attempt.finalScore !== null) {
      texts.push(`Skor akhir Anda adalah ${attempt.finalScore}. ...`);
    } else {
      texts.push("Skor akhir sedang menunggu penilaian. ...");
    }

    if (attempt.passStatus) {
      texts.push(attempt.passStatus === "PASS" ? "Selamat, Anda dinyatakan lulus. ..." : "Maaf, Anda dinyatakan tidak lulus. ...");
    }

    speakQueue(texts);
  }, [attempt, test, useTTS]);

  const replayInstructions = useCallback(() => {
    if (!useTTS) return;

    window.speechSynthesis.cancel();
    const texts: string[] = [];

    texts.push("Tekan Spasi untuk kembali ke Dashboard. Tekan F untuk mengulangi pembacaan nilai. Tekan Panah Kiri dua kali untuk mengulangi instruksi ini. Gunakan Shift panah atas atau Shift panah bawah untuk mengatur kecepatan suara.");

    speakQueue(texts);
  }, [useTTS]);

  useEffect(() => {
    const handler = async (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();

          if (!useTTS) {
            router.push("/dashboard/camaba");
            break;
          }

          window.speechSynthesis.cancel();
          await speakQueueAndWait(["Kembali ke dashboard. ..."]);
          router.push("/dashboard/camaba");
          break;

        case "ArrowLeft":
          e.preventDefault();
          const now = Date.now();
          if (now - leftArrowPressRef.current < 300) {
            replayInstructions();
            leftArrowPressRef.current = 0;
          } else {
            leftArrowPressRef.current = now;
          }
          break;

        case "ArrowUp":
          if (e.shiftKey) {
            e.preventDefault();
            changeSpeed(0.1);
          }
          break;

        case "ArrowDown":
          if (e.shiftKey) {
            e.preventDefault();
            changeSpeed(-0.1);
          }
          break;

        case "KeyR":
          e.preventDefault();
          replayResult();
          break;

        case "KeyF":
          e.preventDefault();
          replayResult();
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router, changeSpeed, replayResult, replayInstructions, speakQueueAndWait, useTTS]);

  if (!attempt || !test) return <p className="min-h-[100dvh] px-4 pt-24 text-2xl sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">Memuat...</p>;

  const isPending = attempt.finalScore === null || attempt.passStatus === null;

  return (
    <div className="min-h-[100dvh] bg-gray-50 px-4 pb-8 pt-24 text-black sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 sm:text-4xl">Hasil {test.title}</h1>

        <div className="space-y-4 rounded-xl border bg-white p-5 shadow sm:p-8">
          <p className="text-base sm:text-xl">
            <b>Skor sementara:</b> {attempt.autoScore}
          </p>

          {attempt.manualScore !== null && (
            <p className="text-base sm:text-xl">
              <b>Skor Essay (Manual):</b> {attempt.manualScore}
            </p>
          )}

          <p className="text-base sm:text-xl">
            <b>Final Skor:</b> {attempt.finalScore !== null ? <span className="text-xl font-bold sm:text-2xl">{attempt.finalScore}</span> : <span className="text-orange-500 italic">Menunggu penilaian admin...</span>}
          </p>

          {attempt.passStatus && (
            <p className="text-xl sm:text-2xl">
              <b>Status:</b> <span className={`font-bold ${attempt.passStatus === "PASS" ? "text-green-600" : "text-red-600"}`}>{attempt.passStatus === "PASS" ? "✓ LULUS" : "✗ TIDAK LULUS"}</span>
            </p>
          )}

          {isPending && (
            <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-base text-yellow-800 sm:text-lg">⏳ Nilai sedang diproses oleh admin. Halaman ini akan otomatis diperbarui.</p>
            </div>
          )}

          {lastUpdated && <p className="text-xs text-gray-400 mt-2">Terakhir diperbarui: {lastUpdated.toLocaleTimeString("id-ID")}</p>}
        </div>

        <p className="mt-4 text-center text-sm font-medium text-blue-600 sm:text-lg">
          {useTTS
            ? "Tekan Spasi untuk kembali ke Dashboard. Tekan F untuk mengulangi pembacaan nilai. Tekan Panah Kiri dua kali untuk mengulangi instruksi. Gunakan Shift + Panah Atas/Bawah untuk kecepatan suara."
            : "Tekan Spasi untuk kembali ke Dashboard."}
        </p>

        <a href="/dashboard/camaba" className="mt-4 block rounded-lg bg-blue-600 py-3 text-center text-base font-semibold text-white sm:text-lg">
          Kembali ke Dashboard
        </a>

        {useTTS && (
          <div className="fixed bottom-4 right-4 z-40 flex flex-col items-center gap-3 rounded-xl border bg-white p-4 shadow-xl sm:bottom-6 sm:right-6">
            <p className="text-sm font-semibold text-black">Kecepatan Suara</p>

            <div className="flex items-center gap-3">
              <button onClick={() => changeSpeed(-0.1)} className="px-3 py-2 bg-gray-200 rounded-lg text-lg font-bold" aria-label="Kurangi kecepatan suara">
                −
              </button>

              <span className="text-lg font-semibold w-12 text-center">{speechRate.toFixed(1)}</span>

              <button onClick={() => changeSpeed(0.1)} className="px-3 py-2 bg-gray-200 rounded-lg text-lg font-bold" aria-label="Tambah kecepatan suara">
                +
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
