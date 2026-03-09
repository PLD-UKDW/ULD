"use client";

import { ArrowRight, Calendar, ChevronLeft, Clock, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

// Tipe data berita
type Berita = {
  id: number;
  title: string;
  desc: string;
  image: string;
  images: string[];
  date: string;
  author: string;
  category: string;
  content: string;
};

// Helper untuk format tanggal Indonesia
function formatIDDate(input?: string | Date | null) {
  if (!input) return "";
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

// Bangun daftar URL gambar dari content_images
function buildImages(content_images?: string) {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  if (!content_images) return [] as string[];
  return content_images
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((file) => `${API_BASE}/uploads/berita/${file}`);
}

// Ambil teks bersih untuk ringkasan kartu (hilangkan tag HTML)
function extractPlainText(html?: string) {
  if (!html) return "";
  if (typeof window !== "undefined") {
    const div = document.createElement("div");
    div.innerHTML = html;
    const text = div.textContent || div.innerText || "";
    return text.replace(/\s+/g, " ").trim();
  }
  const withoutDanger = html.replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ");
  const stripped = withoutDanger.replace(/<[^>]+>/g, " ");
  return stripped.replace(/\s+/g, " ").trim();
}

// Konversi respons API ke tipe Berita
function mapApiToBerita(item: unknown): Berita {
  const i = item as { id: number; title?: string; content?: string; content_images?: string; category?: { name?: string }; tanggal?: string; createdAt?: string };
  const categoryName = i?.category?.name ?? "Umum";
  const tanggal = i?.tanggal ?? i?.createdAt;
  const images = buildImages(i?.content_images);
  const imageUrl = images[0] || "/berita/1.jpeg";
  const content: string = i?.content ?? "";
  const plain = extractPlainText(content);
  const desc = plain.slice(0, 160) + (plain.length > 160 ? "…" : "");
  return {
    id: Number(i?.id),
    title: String(i?.title ?? ""),
    desc,
    image: imageUrl,
    images,
    date: formatIDDate(tanggal),
    author: "Admin",
    category: categoryName,
    content,
  } as Berita;
}

// Component untuk detail berita
function BeritaDetail({ berita, onBack, otherBerita }: { berita: Berita; onBack: () => void; otherBerita: Berita[] }) {
  return (
    <div className="min-h-screen">
      {/* Tombol Kembali di bagian atas (offset dari navbar) */}
      <div className=" sticky top-28 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-[#3E7B27] hover:text-[#356a21] font-medium transition-colors whitespace-nowrap bg-transparent p-0 border-0"
          >
            <ChevronLeft className="w-3 h-3" />
            Kembali ke Daftar Berita
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-12">
        {/* Artikel Utama - Full Width tanpa border samping */}
        <article className="bg-white overflow-hidden mb-12">
          {/* Judul paling atas */}
          <h1 className="text-3xl md:text-4xl font-bold text-[#3e4095] mb-6 mt-2">
            {berita.title}
          </h1>
          {/* Gambar / Galeri */}
          {berita.images.length > 1 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {berita.images.map((img, idx) => {
                const isThree = berita.images.length === 3;
                const thirdLayout = isThree && idx === 2;
                const baseWrap = "overflow-hidden rounded-lg bg-gray-50";
                const wrapClass = thirdLayout
                  ? `${baseWrap} sm:row-start-1 sm:row-span-2 sm:col-start-2`
                  : isThree
                    ? `${baseWrap} ${idx === 0 ? "sm:row-start-1 sm:col-start-1" : "sm:row-start-2 sm:col-start-1"}`
                    : baseWrap;
                const imgClass = thirdLayout
                  ? "w-full h-full min-h-[320px] object-cover"
                  : "w-full h-64 md:h-72 object-cover";
                return (
                  <div key={img + idx} className={wrapClass}>
                    <Image
                      src={img}
                      alt={`${berita.title} - ${idx + 1}`}
                      width={1200}
                      height={800}
                      className={imgClass}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <Image
              src={berita.image}
              alt={berita.title}
              width={1200}
              height={640}
              className="w-full h-96 object-cover mb-6 rounded-lg"
            />
          )}
          {/* Sebaris: Kategori, Tanggal, Lokasi */}
          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600">
            <span className="bg-[#02a502] text-white px-3 py-1 rounded-full text-xs font-medium">
              {berita.category}
            </span>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {berita.date}
            </div>
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {berita.author}
            </div>
          </div>
          {/* Konten berita */}
          <div
            className="prose prose-lg max-w-none prose-img:rounded-lg prose-img:max-w-full prose-img:h-auto prose-img:mx-auto"
            dangerouslySetInnerHTML={{ __html: normalizeContent(berita.content || "") }}
          />
        </article>

        {/* Berita Lainnya */}
        {otherBerita.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl md:text-3xl font-bold text-[#3e4095] mb-8">
              Berita Lainnya
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {otherBerita.map((item) => (
                <article
                  key={item.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setTimeout(() => onBack(), 100);
                    setTimeout(() => {
                      const el = document.querySelector(`[data-berita-id="${item.id}"]`) as HTMLElement;
                      el?.click();
                    }, 200);
                  }}
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={800}
                    height={480}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-[#02a502] text-white px-2 py-1 rounded-full text-xs font-medium">
                        {item.category}
                      </span>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs">{item.date}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-[#3e4095] mb-3 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                      {item.desc}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default function BeritaUmumPage() {
  const [items, setItems] = useState<Berita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBerita, setSelectedBerita] = useState<Berita | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const res = await fetch(`${API_BASE}/api/berita-public`);
        if (!res.ok) {
          throw new Error(`Gagal memuat berita (${res.status})`);
        }
        const json = await res.json();
        const data = Array.isArray(json?.data) ? json.data : [];
        const mapped: Berita[] = data.map(mapApiToBerita);
        if (active) setItems(mapped);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Terjadi kesalahan memuat berita";
        if (active) setError(message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  // Show detail view if a berita is selected
  if (selectedBerita) {
    const otherBerita = items.filter(item => item.id !== selectedBerita.id).slice(0, 8);
    return <BeritaDetail berita={selectedBerita} onBack={() => setSelectedBerita(null)} otherBerita={otherBerita} />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-gray-50 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#3E7B27] hover:text-[#356a21] font-medium transition-colors mb-6"
          >
            <ChevronLeft className="w-5 h-5" />
            Kembali ke Beranda
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-[#0e284d] mb-4">
            Berita & Kegiatan
          </h1>
          <p className="text-base md:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Ikuti perkembangan terbaru kegiatan, prestasi, dan program inklusi di kampus kami
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse h-96 bg-gray-200 rounded-2xl" />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-600 font-medium text-lg mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#02a502] text-white px-6 py-2 rounded-lg hover:bg-[#008000] transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && items.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-xl mb-4">Belum ada berita yang dipublikasikan</p>
            <p className="text-gray-400">Silakan tunggu update terbaru dari kami</p>
          </div>
        )}

        {/* News Grid */}
        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {items.map((berita) => (
              <article
                key={berita.id}
                data-berita-id={berita.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => setSelectedBerita(berita)}
              >
                <Image
                  src={berita.image}
                  alt={berita.title}
                  width={800}
                  height={480}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-[#02a502] text-white px-2 py-1 rounded-full text-xs font-medium">
                      {berita.category}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs">{berita.date}</span>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-[#3e4095] mb-3 line-clamp-2">
                    {berita.title}
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                    {berita.desc}
                  </p>
                  <button className="w-full bg-[#02a502] text-white py-2 px-4 rounded-lg hover:bg-[#008000] transition-colors flex items-center justify-center gap-2">
                    Baca Selengkapnya
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Decode HTML entities and drop script/style tags to avoid showing raw tags
function normalizeContent(html: string) {
  if (!html) return "";
  const decoded = html
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
  return decoded.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "");
}