"use client";
import Image from "next/image";
import { useEffect, useId, useState } from "react";

type A11yState = {
  contrast: "default" | "high";
  fontScale: 1 | 1.25 | 1.5 | 2;
  motion: "normal" | "reduce";
  links: "default" | "underline";
  dyslexia: boolean;
  colorblind: "none" | "rg" | "by" | "mono";
};

const STORAGE_KEY = "a11y-settings";

function loadState(): A11yState {
  if (typeof window === "undefined")
    return {
      contrast: "default",
      fontScale: 1,
      motion: "normal",
      links: "default",
      dyslexia: false,
      colorblind: "none",
    };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return {
    contrast: "default",
    fontScale: 1,
    motion: prefersReduce ? "reduce" : "normal",
    links: "default",
    dyslexia: false,
    colorblind: "none",
  };
}

function applyState(s: A11yState) {
  const html = document.documentElement;
  html.setAttribute("data-a11y-contrast", s.contrast);
  html.setAttribute("data-a11y-fontscale", String(s.fontScale));
  html.setAttribute("data-a11y-motion", s.motion);
  html.setAttribute("data-a11y-links", s.links);
  html.setAttribute("data-a11y-dyslexia", s.dyslexia ? "on" : "off");
  html.setAttribute("data-a11y-colorblind", s.colorblind);

  if (typeof document !== "undefined") {
    const zoomValue = `${s.fontScale * 100}%`;
    document.body.style.zoom = s.fontScale === 1 ? "" : zoomValue;
  }
}

export default function AccessibilityToolbar() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<A11yState>(loadState());
  const panelId = useId();

  useEffect(() => {
    applyState(state);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 a11y-toolbar">
      <button
        type="button"
        className="rounded-md bg-[#19c219] hover:bg-[#16ad16] text-white px-3 py-2 shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0e7f0e] flex items-center gap-2"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        <Image src="/accessibility-icon.png" alt="Aksesibilitas" width={30} height={30} priority />
        <span>
          <b>Aksesibilitas</b>
        </span>
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Pengaturan aksesibilitas"
          className="mt-2 w-80 rounded-md bg-white shadow-lg border p-3 text-sm"
        >
          <div className="mb-3">
            <label className="font-semibold">Kontras</label>
            <div className="mt-1 flex gap-2">
              <button
                className={`px-2 py-1 border rounded ${state.contrast === "default" ? "bg-gray-100" : ""}`}
                onClick={() => setState((s) => ({ ...s, contrast: "default" }))}
              >
                Default
              </button>
              <button
                className={`px-2 py-1 border rounded ${state.contrast === "high" ? "bg-gray-100" : ""}`}
                onClick={() => setState((s) => ({ ...s, contrast: "high" }))}
              >
                Tinggi
              </button>
            </div>
          </div>

          <div className="mb-3">
            <label className="font-semibold">Zoom</label>
            <div className="mt-1 flex gap-2">
              <button
                className={`px-2 py-1 border rounded ${state.fontScale === 1 ? "bg-gray-100" : ""}`}
                onClick={() => setState((s) => ({ ...s, fontScale: 1 }))}
              >
                100%
              </button>
              <button
                className={`px-2 py-1 border rounded ${state.fontScale === 1.25 ? "bg-gray-100" : ""}`}
                onClick={() => setState((s) => ({ ...s, fontScale: 1.25 }))}
              >
                125%
              </button>
              <button
                className={`px-2 py-1 border rounded ${state.fontScale === 1.5 ? "bg-gray-100" : ""}`}
                onClick={() => setState((s) => ({ ...s, fontScale: 1.5 }))}
              >
                150%
              </button>
              <button
                className={`px-2 py-1 border rounded ${state.fontScale === 2 ? "bg-gray-100" : ""}`}
                onClick={() => setState((s) => ({ ...s, fontScale: 2 }))}
              >
                200%
              </button>
            </div>
          </div>

          <div className="mb-3">
            <label className="font-semibold">Gerak</label>
            <div className="mt-1 flex gap-2">
              <button
                className={`px-2 py-1 border rounded ${state.motion === "normal" ? "bg-gray-100" : ""}`}
                onClick={() => setState((s) => ({ ...s, motion: "normal" }))}
              >
                Normal
              </button>
              <button
                className={`px-2 py-1 border rounded ${state.motion === "reduce" ? "bg-gray-100" : ""}`}
                onClick={() => setState((s) => ({ ...s, motion: "reduce" }))}
              >
                Kurangi
              </button>
            </div>
          </div>

          <div className="mb-3">
            <label className="font-semibold">Tautan</label>
            <div className="mt-1 flex gap-2">
              <button
                className={`px-2 py-1 border rounded ${state.links === "default" ? "bg-gray-100" : ""}`}
                onClick={() => setState((s) => ({ ...s, links: "default" }))}
              >
                Default
              </button>
              <button
                className={`px-2 py-1 border rounded ${state.links === "underline" ? "bg-gray-100" : ""}`}
                onClick={() => setState((s) => ({ ...s, links: "underline" }))}
              >
                Garis bawah
              </button>
            </div>
          </div>

          <div className="mb-2">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={state.dyslexia}
                onChange={(e) => setState((s) => ({ ...s, dyslexia: e.target.checked }))}
              />
              Font ramah disleksia
            </label>
          </div>

          <div className="mb-3">
            <label className="font-semibold">Mode Buta Warna</label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <button
                className={`px-2 py-1 border rounded ${state.colorblind === "none" ? "bg-gray-100" : ""}`}
                onClick={() => setState((s) => ({ ...s, colorblind: "none" }))}
              >
                Tidak ada
              </button>
              <button
                className={`px-2 py-1 border rounded ${state.colorblind === "rg" ? "bg-gray-100" : ""}`}
                onClick={() => setState((s) => ({ ...s, colorblind: "rg" }))}
              >
                Merah-Hijau (Parsial)
              </button>
              <button
                className={`px-2 py-1 border rounded ${state.colorblind === "by" ? "bg-gray-100" : ""}`}
                onClick={() => setState((s) => ({ ...s, colorblind: "by" }))}
              >
                Biru-Kuning (Parsial)
              </button>
              <button
                className={`px-2 py-1 border rounded ${state.colorblind === "mono" ? "bg-gray-100" : ""}`}
                onClick={() => setState((s) => ({ ...s, colorblind: "mono" }))}
              >
                Total (Monokromasi)
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-600 mt-2">Shortcut: Alt+Shift+A untuk membuka/menutup.</p>
        </div>
      )}
    </div>
  );
}
