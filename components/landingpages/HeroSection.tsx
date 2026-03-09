"use client";
import { API_BASE } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Hero() {
  const [activeCount, setActiveCount] = useState<number>(0);
  const [graduateCount, setGraduateCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const normalizeStatus = (s?: string) => (s ?? "").trim().toLowerCase();

  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/statistik-mahasiswa`);
        const json = await res.json();
        const data: any[] = Array.isArray(json?.data) ? json.data : [];
        const aktif = data.filter((d) => normalizeStatus(d.status) === "aktif").length;
        const lulus = data.filter((d) => normalizeStatus(d.status) === "lulus").length;
        setActiveCount(aktif);
        setGraduateCount(lulus);
      } catch (e: any) {
        setError(e?.message || "Gagal memuat statistik");
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  return (
    <section className="relative w-full min-h-[90vh] flex flex-col md:flex-row items-center justify-between bg-gradient-to-br from-[#43c458] via-[#049f04] to-[#2d8a3a] px-6 md:px-12 pt-24 md:pt-28 pb-12 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-green-400/10 to-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-gradient-to-r from-lime-400/8 to-green-400/8 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 flex justify-center w-full md:w-1/2 mt-6 md:mt-0 order-1 md:order-2">
        <Image src="/heroCharA.png" alt="Character" width={420} height={420} className="object-contain drop-shadow-xl hover:scale-[1.03] transition-transform duration-500" />
      </div>

      <div className="relative z-20 flex flex-col max-w-lg text-white mt-6 md:mt-0 order-2 md:order-1">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 font-bebas-neue bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent drop-shadow-lg">Unit Layanan Disabilitas</h1>
        <p className="text-lg md:text-xl mb-8 text-green-50/90 leading-relaxed">Mari bersama membangun lingkungan belajar yang ramah, setara, dan inklusif di UKDW</p>
        <div className="flex gap-4 mb-8">
          <div className="flex-1 rounded-2xl border border-white/40 bg-white/10 p-6 backdrop-blur-md text-center">
            <span className="text-4xl font-bold text-lime-200 block">{loading ? "…" : activeCount}</span>
            <p className="text-sm text-green-100">Active Students</p>
          </div>
          <div className="flex-1 rounded-2xl border border-white/40 bg-white/10 p-6 backdrop-blur-md text-center">
            <span className="text-4xl font-bold text-lime-200 block">{loading ? "…" : graduateCount}</span>
            <p className="text-sm text-green-100">Graduates</p>
          </div>
        </div>
        <Link href="/statistik-mahasiswa" className="group relative rounded-2xl bg-gradient-to-r from-white to-green-50 px-8 py-4 text-base font-bold text-[#008000] shadow-lg hover:scale-105 transition-all w-max">
          View Statistics
        </Link>
      </div>
    </section>
  );
}
