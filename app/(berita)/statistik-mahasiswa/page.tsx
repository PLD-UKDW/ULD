"use client";
import { API_BASE } from '@/lib/api';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
// import Map from './map';

// disabilityData and statusData will be computed dynamically from backend data

// Faculty options will be computed from backend data

// Static list of provinces to mirror FE-adm options
const PROVINSI_OPTIONS = [
  'Aceh',
  'Sumatera Utara',
  'Sumatera Barat',
  'Riau',
  'Jambi',
  'Sumatera Selatan',
  'Bangka Belitung',
  'Bengkulu',
  'Lampung',
  'DKI Jakarta',
  'Jawa Barat',
  'Jawa Tengah',
  'DI Yogyakarta',
  'Jawa Timur',
  'Banten',
  'Bali',
  'Nusa Tenggara Barat',
  'Nusa Tenggara Timur',
  'Kalimantan Barat',
  'Kalimantan Tengah',
  'Kalimantan Selatan',
  'Kalimantan Timur',
  'Kalimantan Utara',
  'Sulawesi Utara',
  'Sulawesi Tengah',
  'Sulawesi Selatan',
  'Sulawesi Tenggara',
  'Gorontalo',
  'Sulawesi Barat',
  'Maluku',
  'Maluku Utara',
  'Papua Barat',
  'Papua Barat Daya',
  'Papua Selatan',
  'Papua Tengah',
  'Papua Pegunungan',
];

const ipkData = [
  { value: 'all', label: 'Semua IPK' },
  { value: '4', label: '\u2265 3.5' },
  { value: '3', label: '3.0 - 3.49' },
  { value: '2', label: '2.5 - 2.99' },
  { value: '1', label: '< 2.5' },
];

const COLORS_DISABILITY = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];
const COLORS_STATUS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#a4de6c'];

type StudentRecord = {
  id?: number;
  provinsi?: string;
  angkatan?: number;
  jalur_masuk?: string;
  status?: string;
  jenjang?: string;
  gender?: string;
  asal_sekolah?: string;
  ipk?: number | string;
  fakultas?: string;
  prodi?: string;
  jenisDisabilitas?: string;
  kategoriDisabilitas?: string[];
};

export default function StatistikMahasiswaPage() {
  const MapChart = useMemo(() => dynamic(() => import('@/components/MapChart'), { ssr: false }), []);
  const [rawData, setRawData] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState('all');
  const [selectedDisability, setSelectedDisability] = useState('all');
  const [selectedIpk, setSelectedIpk] = useState('all');
  const [selectedProvinsi, setSelectedProvinsi] = useState('all');
  const [selectedAngkatan, setSelectedAngkatan] = useState('all');
  const [selectedJalurMasuk, setSelectedJalurMasuk] = useState('all');
  const [selectedJenjang, setSelectedJenjang] = useState('all');
  const [selectedJenisKelamin, setSelectedJenisKelamin] = useState('all');
  const [selectedJenisAsalSekolah, setSelectedJenisAsalSekolah] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const normalizeStatus = useCallback((s?: string) => (s ?? '').trim().toLowerCase(), []);
  const prettyStatus = useCallback((s?: string) => {
    const t = normalizeStatus(s);
    switch (t) {
      case 'aktif': return 'Aktif';
      case 'lulus': return 'Lulus';
      case 'cuti': return 'Cuti';
      case 'undur diri': return 'Undur Diri';
      case 'do': return 'DO';
      default: return (s ?? '').trim();
    }
  }, [normalizeStatus]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/statistik-mahasiswa`);
        const json = await res.json();
        const data = Array.isArray(json?.data) ? (json.data as unknown[]) : [];
        setRawData(data as StudentRecord[]);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Gagal memuat data';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Build dynamic filter options from raw data
  const facultyOptions = useMemo(() => {
    const set = new Set<string>();
    rawData.forEach((d) => { if (d.fakultas) set.add(d.fakultas); });
    return [{ value: 'all', label: 'Semua Fakultas' }, ...Array.from(set).sort().map(v => ({ value: v, label: v }))];
  }, [rawData]);

  const provinsiOptions = useMemo(() => {
    return [
      { value: 'all', label: 'Semua Provinsi' },
      ...PROVINSI_OPTIONS.map(p => ({ value: p, label: p }))
    ];
  }, []);

  const angkatanOptions = useMemo(() => {
    const set = new Set<string>();
    rawData.forEach((d) => { if (d.angkatan !== undefined && d.angkatan !== null) set.add(String(d.angkatan)); });
    const sorted = Array.from(set).sort();
    return [{ value: 'all', label: 'Semua Angkatan' }, ...sorted.map(v => ({ value: v, label: v }))];
  }, [rawData]);

  const jalurMasukOptions = useMemo(() => {
    const set = new Set<string>();
    rawData.forEach((d) => { if (d.jalur_masuk) set.add(d.jalur_masuk); });
    return [{ value: 'all', label: 'Semua Jalur Masuk' }, ...Array.from(set).sort().map(v => ({ value: v, label: v }))];
  }, [rawData]);

  const jenjangOptions = useMemo(() => {
    const set = new Set<string>();
    rawData.forEach((d) => { if (d.jenjang) set.add(d.jenjang); });
    return [{ value: 'all', label: 'Semua Jenjang' }, ...Array.from(set).sort().map(v => ({ value: v, label: v }))];
  }, [rawData]);

  const jenisKelaminOptions = useMemo(() => {
    const set = new Set<string>();
    rawData.forEach((d) => { if (d.gender) set.add(d.gender); });
    const nice = (g: string) => g === 'L' ? 'Laki-laki' : g === 'P' ? 'Perempuan' : g;
    return [{ value: 'all', label: 'Semua Jenis Kelamin' }, ...Array.from(set).sort().map(v => ({ value: v, label: nice(v) }))];
  }, [rawData]);

  const jenisAsalSekolahOptions = useMemo(() => {
    const set = new Set<string>();
    rawData.forEach((d) => { if (d.asal_sekolah) set.add(d.asal_sekolah); });
    return [{ value: 'all', label: 'Semua Jenis Asal Sekolah' }, ...Array.from(set).sort().map(v => ({ value: v, label: v }))];
  }, [rawData]);

  const disabilityOptions = useMemo(() => {
    const set = new Set<string>();
    rawData.forEach((d) => { if (d.jenisDisabilitas) set.add(d.jenisDisabilitas); });
    return Array.from(set).sort();
  }, [rawData]);

  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    rawData.forEach((d) => { if (d.status) set.add(normalizeStatus(d.status)); });
    const values = Array.from(set).sort();
    return values.map(v => ({ value: v, label: prettyStatus(v) }));
  }, [rawData, prettyStatus]);

  // IPK parsing and category helpers (handles number or string with comma)
  const parseIpk = (ipk: number | string | undefined): number | null => {
    if (ipk === undefined || ipk === null) return null;
    if (typeof ipk === 'number') return Number.isNaN(ipk) ? null : ipk;
    const s = ipk.trim().replace(',', '.');
    const v = parseFloat(s);
    return Number.isNaN(v) ? null : v;
  };
  const computeIpkCategoryCode = (ipk: number | string | undefined): '4' | '3' | '2' | '1' | null => {
    const v = parseIpk(ipk);
    if (v === null) return null;
    return v >= 3.5 ? '4' : v >= 3.0 ? '3' : v >= 2.5 ? '2' : '1';
  };
  const computeIpkBucket = (ipk: number | string | undefined): string | null => {
    const v = parseIpk(ipk);
    if (v === null) return null;
    return v >= 3.5 ? '\u2265 3.5' : v >= 3.0 ? '3.0 - 3.49' : v >= 2.5 ? '2.5 - 2.99' : '< 2.5';
  };

  const filteredData: StudentRecord[] = rawData.filter((student: StudentRecord) => {
    const ipkCode = computeIpkCategoryCode(student.ipk);
    return (selectedFaculty === 'all' || student.fakultas === selectedFaculty) &&
            (selectedDisability === 'all' || student.jenisDisabilitas === selectedDisability) &&
            (selectedIpk === 'all' || (ipkCode !== null && ipkCode === selectedIpk)) &&
            (selectedProvinsi === 'all' || (student.provinsi ?? '') === selectedProvinsi) &&
            (selectedAngkatan === 'all' || String(student.angkatan) === selectedAngkatan) &&
            (selectedJalurMasuk === 'all' || student.jalur_masuk === selectedJalurMasuk) &&
            (selectedJenjang === 'all' || student.jenjang === selectedJenjang) &&
            (selectedJenisKelamin === 'all' || student.gender === selectedJenisKelamin) &&
            (selectedJenisAsalSekolah === 'all' || student.asal_sekolah === selectedJenisAsalSekolah) &&
            (selectedStatus === 'all' || normalizeStatus(student.status) === selectedStatus);
  });

  const totalDisabledStudents = filteredData.length;

  // Data for Line Chart (Jumlah Mahasiswa Disabilitas per Angkatan)
  const studentsPerAngkatan = filteredData.reduce((acc: { [key: string]: number }, student: StudentRecord) => {
    const angkatan = String(student.angkatan);
    acc[angkatan] = (acc[angkatan] || 0) + 1;
    return acc;
  }, {});
  const angkatanChartData = Object.keys(studentsPerAngkatan).sort().map(angkatan => ({
    angkatan,
    jumlah: studentsPerAngkatan[angkatan],
  }));

  // Data for Jenis Asal Sekolah Pie Chart
  const studentsPerAsalSekolah = filteredData.reduce((acc: { [key: string]: number }, student: StudentRecord) => {
    const asal = student.asal_sekolah ?? 'Tidak Diketahui';
    acc[asal] = (acc[asal] || 0) + 1;
    return acc;
  }, {});
  const asalSekolahChartData = Object.keys(studentsPerAsalSekolah).map(asalSekolah => ({
    name: asalSekolah,
    value: studentsPerAsalSekolah[asalSekolah],
  }));

  // Data for Bar Chart (Jumlah Mahasiswa Disabilitas per Fakultas)
  const studentsPerFakultas = filteredData.reduce((acc: { [key: string]: number }, student: StudentRecord) => {
    const f = student.fakultas ?? 'Tidak Diketahui';
    acc[f] = (acc[f] || 0) + 1;
    return acc;
  }, {});
  const fakultasChartData = Object.keys(studentsPerFakultas).sort().map(fakultas => ({
    fakultas,
    jumlah: studentsPerFakultas[fakultas],
  }));

  // Data for Jenis Kelamin Pie Chart
  const studentsPerJenisKelamin = filteredData.reduce((acc: { [key: string]: number }, student: StudentRecord) => {
    const g = student.gender ?? 'Tidak Diketahui';
    acc[g] = (acc[g] || 0) + 1;
    return acc;
  }, {});
  const jenisKelaminChartData = Object.keys(studentsPerJenisKelamin).map(gender => ({
    name: gender === 'L' ? 'Laki-laki' : gender === 'P' ? 'Perempuan' : gender,
    value: studentsPerJenisKelamin[gender],
  }));

  // Data for Jenjang Studi Pie Chart
  const studentsPerJenjang = filteredData.reduce((acc: { [key: string]: number }, student: StudentRecord) => {
    const jj = student.jenjang ?? 'Tidak Diketahui';
    acc[jj] = (acc[jj] || 0) + 1;
    return acc;
  }, {});
  const jenjangChartData = Object.keys(studentsPerJenjang).map(jenjang => ({
    name: jenjang,
    value: studentsPerJenjang[jenjang],
  }));
    // Data for IPK Distribution Pie Chart
    const studentsPerIpkCategory = filteredData.reduce((acc: { [key: string]: number }, student: StudentRecord) => {
      const bucket = computeIpkBucket(student.ipk);
      if (!bucket) return acc;
      acc[bucket] = (acc[bucket] || 0) + 1;
      return acc;
    }, {});
    const ipkDistributionChartData = Object.keys(studentsPerIpkCategory).map(category => ({
      name: category,
      value: studentsPerIpkCategory[category],
    }));
    // Build chart datasets for disability and status
    const studentsPerDisability = filteredData.reduce((acc: { [key: string]: number }, student: StudentRecord) => {
      const d = student.jenisDisabilitas || 'Tidak Tersedia';
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {});
    const disabilityChartData = Object.keys(studentsPerDisability).map(name => ({ name, value: studentsPerDisability[name] }));

    const studentsPerStatus = filteredData.reduce((acc: { [key: string]: number }, student: StudentRecord) => {
      const s = normalizeStatus(student.status);
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});
    const statusChartData = Object.keys(studentsPerStatus).map(code => ({ name: prettyStatus(code), value: studentsPerStatus[code] }));

    // Map data for MapChart (provide required fields with placeholders where needed)
    const mapData = filteredData.map((m: any) => ({
      id: m.id || 0,
      nama: '',
      provinsi: m.provinsi || '',
      lat: 0,
      lng: 0,
      fakultas: m.fakultas || '',
      ragamDisabilitas: m.jenisDisabilitas || '',
      angkatan: String(m.angkatan ?? ''),
      jalurMasuk: m.jalur_masuk || '',
      status: m.status || '',
      jenjang: m.jenjang || '',
      jenisKelamin: m.gender || '',
      jenisAsalSekolah: m.asal_sekolah || '',
      ipk: m.ipk || 0,
    }));

    return (
      <section className="relative min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-40 h-40 bg-green-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-lime-400/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 -translate-x-1/2 -translate-y-1/2 bg-green-300/5 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <header className="text-center mb-8 mt-20">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#3e4095]">
              Statistik <span className="text-[#02a502]">Mahasiswa</span>
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Data terkini mengenai mahasiswa disabilitas di lingkungan universitas.
            </p>
          </header>
          {loading && (
            <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 text-blue-700 p-3 text-sm">Memuat data statistik…</div>
          )}
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 text-red-700 p-3 text-sm">{error}</div>
          )}
          {/* Filters Section */}
          <div className="mb-12 bg-white shadow-md rounded-xl p-4 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label htmlFor="faculty-filter" className="block text-sm font-medium text-gray-700 mb-1">Fakultas</label>
                      <select
                          id="faculty-filter"
                          value={selectedFaculty}
                          onChange={(e) => setSelectedFaculty(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                            {facultyOptions.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                      </select>
                  </div>
                  <div>
                    <label htmlFor="disability-filter" className="block text-sm font-medium text-gray-700 mb-1">Ragam Disabilitas</label>
                      <select
                          id="disability-filter"
                          value={selectedDisability}
                          onChange={(e) => setSelectedDisability(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                            <option value="all">Semua Disabilitas</option>
                            {disabilityOptions.map(name => (
                              <option key={name} value={name}>{name}</option>
                            ))}
                      </select>
                  </div>
                  <div>
                    <label htmlFor="ipk-filter" className="block text-sm font-medium text-gray-700 mb-1">IPK</label>
                      <select
                          id="ipk-filter"
                          value={selectedIpk}
                          onChange={(e) => setSelectedIpk(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                            {ipkData.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                      </select>
                  </div>
                  <div>
                    <label htmlFor="provinsi-filter" className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
                      <select
                          id="provinsi-filter"
                          value={selectedProvinsi}
                          onChange={(e) => setSelectedProvinsi(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                            {provinsiOptions.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                      </select>
                  </div>
                  <div>
                    <label htmlFor="angkatan-filter" className="block text-sm font-medium text-gray-700 mb-1">Angkatan</label>
                      <select
                          id="angkatan-filter"
                          value={selectedAngkatan}
                          onChange={(e) => setSelectedAngkatan(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                            {angkatanOptions.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                      </select>
                  </div>
                  <div>
                    <label htmlFor="jalurMasuk-filter" className="block text-sm font-medium text-gray-700 mb-1">Jalur Masuk</label>
                      <select
                          id="jalurMasuk-filter"
                          value={selectedJalurMasuk}
                          onChange={(e) => setSelectedJalurMasuk(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                            {jalurMasukOptions.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                      </select>
                  </div>
                  <div>
                    <label htmlFor="jenjang-filter" className="block text-sm font-medium text-gray-700 mb-1">Jenjang</label>
                      <select
                          id="jenjang-filter"
                          value={selectedJenjang}
                          onChange={(e) => setSelectedJenjang(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                            {jenjangOptions.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                      </select>
                  </div>
                  <div>
                    <label htmlFor="jenisKelamin-filter" className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                      <select
                          id="jenisKelamin-filter"
                          value={selectedJenisKelamin}
                          onChange={(e) => setSelectedJenisKelamin(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                            {jenisKelaminOptions.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>))}
                      </select>
                  </div>
                  <div>
                    <label htmlFor="jenisAsalSekolah-filter" className="block text-sm font-medium text-gray-700 mb-1">Jenis Asal Sekolah</label>
                      <select
                          id="jenisAsalSekolah-filter"
                          value={selectedJenisAsalSekolah}
                          onChange={(e) => setSelectedJenisAsalSekolah(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                            {jenisAsalSekolahOptions.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                      </select>
                  </div>
                  <div>
                      <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                          id="status-filter"
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                            <option value="all">Semua Status</option>
                            {statusOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                      </select>
                  </div>
              </div>
          </div>
          {/* Total Active Students Card */}
          <div className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white shadow-lg rounded-xl p-6 text-center border border-gray-200">
                <h2 className="text-xl font-bold text-gray-700 mb-2">
                Total Mahasiswa Disabilitas
                </h2>
                <p className="text-5xl font-extrabold text-[#3e4095]">
                {totalDisabledStudents}
                </p>
              </div>
              <div className="bg-white shadow-lg rounded-xl p-6 text-center border border-gray-200">
                <h2 className="text-xl font-bold text-gray-700 mb-2">
                Total Ragam Disabilitas
                </h2>
                <p className="text-5xl font-extrabold text-[#02a502]">
                {disabilityChartData.length}
                </p>
              </div>
              <div className="bg-white shadow-lg rounded-xl p-6 text-center border border-gray-200">
                <h2 className="text-xl font-bold text-gray-700 mb-2">
                Total Alumni Disabilitas
                </h2>
                <p className="text-5xl font-extrabold text-[#ffc658]">
                {statusChartData.find(s => s.name === 'Lulus')?.value || 0}
                </p>
              </div>
            </div>
          </div>
          {/* <Map /> */}
          {/* Map Section */}
          <div className="mb-12 bg-white shadow-lg rounded-xl p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                  Peta Sebaran Mahasiswa
              </h2>
              <div className="h-96 w-full">
                  <MapChart data={mapData} />
              </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Line Chart: Jumlah Mahasiswa Disabilitas per Angkatan */}
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                Jumlah Mahasiswa Disabilitas per Angkatan
              </h2>
              <div className="h-80 w-full">
                <ResponsiveContainer>
                  <LineChart
                    data={angkatanChartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="angkatan" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="jumlah" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Bar Chart: Jumlah Mahasiswa Disabilitas per Fakultas */}
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                Jumlah Mahasiswa Disabilitas per Fakultas
              </h2>
              <div className="h-80 w-full">
                <ResponsiveContainer>
                  <BarChart
                    data={fakultasChartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fakultas" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="jumlah" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Ragam Disabilitas Section */}
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                Ragam Disabilitas
              </h2>
              <div className="h-80 w-full">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={disabilityChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                    >
                      {disabilityChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_DISABILITY[index % COLORS_DISABILITY.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Status Mahasiswa Section */}
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                Status Mahasiswa
              </h2>
              <div className="h-80 w-full">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_STATUS[index % COLORS_STATUS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Jenis Kelamin Pie Chart */}
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                Jenis Kelamin
              </h2>
              <div className="h-80 w-full">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={jenisKelaminChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                    >
                      {jenisKelaminChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#8884d8', '#82ca9d'][index % 2]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Jenjang Studi Pie Chart */}
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                Jenjang Studi
              </h2>
              <div className="h-80 w-full">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={jenjangChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                    >
                      {jenjangChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#ffc658', '#ff7f50', '#a4de6c'][index % 3]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Jenis Asal Sekolah Pie Chart */}
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                Jenis Asal Sekolah
              </h2>
              <div className="h-80 w-full">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={asalSekolahChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                    >
                      {asalSekolahChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28'][index % 3]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* IPK Distribution Pie Chart */}
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                Distribusi IPK
              </h2>
              <div className="h-80 w-full">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={ipkDistributionChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                    >
                      {ipkDistributionChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

// "use client";
// import Image from "next/image";

// export default function UnderDevelopment() {
//   return (
//     <section className="relative min-h-screen flex items-center justify-center px-6">
//       {/* Background Accent */}
//       <div className="absolute inset-0 pointer-events-none">
//         <div className="absolute top-20 left-10 w-40 h-40 bg-green-400/10 rounded-full blur-3xl"></div>
//         <div className="absolute bottom-20 right-20 w-60 h-60 bg-lime-400/10 rounded-full blur-3xl"></div>
//         <div className="absolute top-1/2 left-1/2 w-80 h-80 -translate-x-1/2 -translate-y-1/2 bg-green-300/5 rounded-full blur-3xl"></div>
//       </div>

//       {/* Content */}
//       <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
//         <div className="mb-8">
//           <Image 
//             src="/maintenance.jpg" 
//             alt="Logo ULD" 
//             width={400} 
//             height={400} 
//             className="mx-auto" 
//           />
//         </div>
//         <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#3e4095]">
//           This <span className="text-[#02a502]">Page</span> is Under Development
//         </h1>
//       </div>
//     </section>
//   );
// }