// "use client";
// import Image from "next/image";
// import { Mail, Award } from "lucide-react";

// const struktur = [
//   {
//     nama: "Stefani Natalia Sabatini, S.T., M.T.",
//     jabatan: "Ketua Koordinator ULD",
//     email: "LukasCrisantyo@staff.ukdw.ac.id",
//     foto: "/Dosen.jpg",
//     role: "leader",
//     description: "Memimpin dan mengkoordinasikan seluruh kegiatan ULD untuk menciptakan lingkungan kampus yang inklusif"
//   },
//   {
//     nama: "Lukas Chrisantyo A A., S.Kom., M.Eng.",
//     jabatan: "Wakil Koordinator ULD",
//     email: "sulis@contoh.ac.id",
//     foto: "/Dosen1.png",
//     role: "wakil",
//     description: "Mendukung koordinator dalam menjalankan program-program layanan disabilitas"
//   },
// ];

// export default function StrukturOrganisasiPage() {
//   return (
//     <section className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-20 px-6 md:px-16 overflow-hidden pt-30">
      
//       {/* Background decorative elements */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-20 left-10 w-40 h-40 bg-green-400/10 rounded-full blur-3xl"></div>
//         <div className="absolute bottom-20 right-20 w-60 h-60 bg-lime-400/10 rounded-full blur-3xl"></div>
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-400/5 rounded-full blur-3xl"></div>
//       </div>

//       <div className="relative z-10 py-20 px-6 md:px-16">
        
//         {/* Header Section */}
//         <div className="max-w-6xl mx-auto text-center mb-16 -mt-30">
//           <h1 className="text-4xl  text-[#3e4095] md:text-5xl lg:text-6xl font-extrabold mb-1 leading-tight tracking-tight my-5">
//             Struktur{" "}
//             <span className="text-[#02a502]">
//               Organisasi
//             </span>
//           </h1>
          
          
//           <p className="text-lg md:text-xl text-gray-700 mx-auto leading-relaxed space-y-6">
//             Tim berpengalaman yang berdedikasi untuk menciptakan lingkungan kampus yang inklusif dan mendukung mahasiswa berkebutuhan khusus
//           </p>
//         </div>

//         {/* Team Cards */}
//         <div className="max-w-7xl mx-auto">
//           <div className="grid gap-12 md:gap-16 grid-cols-1 lg:grid-cols-2 place-items-center">
//             {struktur.map((item, idx) => (
//               <div
//                 key={idx}
//                 className={`group relative w-full max-w-md ${
//                   item.role === 'leader' ? 'lg:scale-110' : ''
//                 }`}
//               >
//                 {/* Leader badge */}
//                 {item.role === 'leader' && (
//                   <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
//                   </div>
//                 )}

//                 {/* Card */}
//                 {/* <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 group-hover:bg-white/15"> */}
//                 <div className="relative bg-gradient-to-tr from-[#3e4095]/20 to-lime-500/20 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 group-hover:bg-white/15">
                  
//                   {/* Decorative corner */}
//                   <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-[#3e4095] rounded-tr-2xl"></div>
                  
//                   {/* Profile Image */}
//                   <div className="relative mb-8">
//                     <div className="w-32 h-32 mx-auto relative">
//                       {/* Glowing ring */}
//                       <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-lime-400 rounded-full blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
//                       {/* Image container */}
//                       <div className="relative w-full h-full bg-white/10 rounded-full p-1 backdrop-blur-sm">
//                         <div className="w-full h-full relative overflow-hidden rounded-full border-2 border-white/30">
//                           <Image
//                             src={item.foto}
//                             alt={`Foto ${item.nama}`}
//                             fill
//                             className="object-cover group-hover:scale-110 transition-transform duration-500"
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Content */}
//                   <div className="text-center space-y-4">
//                     <h3 className="text-2xl font-bold text-[#3e4095] group-hover:text-[#02a502] transition-colors duration-300">
//                       {item.nama}
//                     </h3>
                    
//                     <div className="space-y-3">
//                       <p className="text-lg font-semibold text-[#3e4095]">
//                         {item.jabatan}
//                       </p>
                      
//                       <p className="text-sm text-[#3e4095] leading-relaxed px-4">
//                         {item.description}
//                       </p>
//                     </div>

//                     {/* Contact Info */}
//                     {/* <div className="pt-6 border-t border-white/20">
//                       <a
//                         href={`mailto:${item.email}`}
//                         className="group/email inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#3e4095]/20 to-lime-500/20 border border-green-400/30 rounded-xl text-[#3e4095] hover:text-white hover:bg-gradient-to-r hover:from-green-500/40 hover:to-lime-500/40 transition-all duration-300 backdrop-blur-sm"
//                       >
//                         <Mail className="w-5 h-5 group-hover/email:rotate-12 transition-transform duration-300" />
//                         <span className="text-sm font-medium">Kirim Email</span>
//                       </a>
//                     </div> */}
//                   </div>

//                   {/* Hover glow effect */}
//                   <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-lime-400/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }


"use client";
import Image from "next/image";

export default function StrukturOrganisasiGambar() {
  return (
    <section className="relative w-full py-30 px-6 md:px-16 text-[#02a502] overflow-hidden">
      {/* Background Decorative */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 left-10 w-40 h-40 bg-green-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-32 w-56 h-56 bg-lime-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold">
          Struktur <span className="text-[#02a502]">Organisasi</span>
        </h1>
        <p className="text-lg text-gray-700 mt-4 max-w-2xl mx-auto">
          Berikut adalah struktur organisasi dalam bentuk bagan visual untuk memudahkan pemahaman.
        </p>
      </div>

      {/* Struktur Gambar */}
      <div className="relative max-w-5xl mx-auto bg-white/60 backdrop-blur-md shadow-xl rounded-3xl p-6 md:p-10 border border-white/30">
        <div className="w-full h-auto relative overflow-hidden rounded-2xl border-2 border-[#3e4095]/20 shadow-md">
          <Image
            src="/struktur.png" // Ganti dengan gambar struktur Anda
            alt="Struktur Organisasi"
            width={1600}
            height={900}
            className="object-contain w-full h-auto"
          />
        </div>

        {/* Caption */}
        <p className="text-center mt-6 text-sm md:text-base text-[#3e4095] italic">
          Diagram struktur organisasi Unit Layanan Disabilitas
        </p>
      </div>

      {/* Decorative bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-green-100/20 to-transparent pointer-events-none"></div>
    </section>
  );
}
