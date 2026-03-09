"use client";
import { Feature, Geometry } from 'geojson';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { GeoJSON, MapContainer, TileLayer } from 'react-leaflet';

interface Student {
  id: number;
  nama: string;
  provinsi: string;
  lat: number;
  lng: number;
  fakultas: string;
  ragamDisabilitas: string;
  angkatan: string;
  jalurMasuk: string;
  status: string;
  jenjang: string;
  jenisKelamin: string;
  jenisAsalSekolah: string;
  ipk: number;
}

interface GeoJSONFeatureProperties {
  // The upstream data may use different keys; make all optional
  NAMA_PROV?: string;
  Propinsi?: string;
  PROPINSI?: string;
  Provinsi?: string;
  PROVINSI?: string;
  provinsi?: string;
  NAME_1?: string;
  name?: string;
}

interface GeoJSONData {
  type: "FeatureCollection";
  features: Feature<Geometry, GeoJSONFeatureProperties>[];
}

interface MapChartProps {
  data: Student[];
}

function normalizeProvince(name: string): string {
  const n = (name || '').trim().toLowerCase();
  const map: Record<string, string> = {
    // Aceh variations
    'nanggroe aceh darussalam': 'aceh',
    'di. aceh': 'aceh',
    // NTB & NTT - GeoJSON uses "NUSATENGGARA" (no space)
    'ntb': 'nusa tenggara barat',
    'nusa tenggara barat': 'nusa tenggara barat',
    'nusatenggara barat': 'nusa tenggara barat', // GeoJSON format (no space) → database format (with space)
    'ntt': 'nusa tenggara timur',
    'nusa tenggara timur': 'nusa tenggara timur',
    'nusatenggara timur': 'nusa tenggara timur', // GeoJSON format (no space)
    // DIY - GeoJSON: "DAERAH ISTIMEWA YOGYAKARTA" vs Database: "DI Yogyakarta"
    'di yogyakarta': 'di yogyakarta',
    'd.i yogyakarta': 'di yogyakarta',
    'daerah istimewa yogyakarta': 'di yogyakarta', // GeoJSON format → database format
    'diy': 'di yogyakarta',
    // Jakarta
    'dki jakarta': 'dki jakarta',
    'jakarta': 'dki jakarta',
    // Banten - GeoJSON: "PROBANTEN"
    'probanten': 'probanten',
    'banten': 'probanten',
    // Bangka Belitung
    'bangka belitung': 'bangka belitung',
    'kep. bangka belitung': 'bangka belitung',
    'kepulauan bangka belitung': 'bangka belitung',
    // Riau
    'kepulauan riau': 'riau',
    'riau': 'riau',
    // Kalimantan
    'kalimantan utara': 'kalimantan utara',
    'kalimatan utara': 'kalimantan utara',
    'kalimantan barat': 'kalimantan barat',
    'kalimantan tengah': 'kalimantan tengah',
    'kalimantan selatan': 'kalimantan selatan',
    'kalimantan timur': 'kalimantan timur',
    // Papua - GeoJSON uses old "IRIAN JAYA" names, map to modern Papua provinces
    'irian jaya timur': 'papua barat',
    'irian jaya tengah': 'papua tengah',
    'irian jaya barat': 'papua barat',
    // Papua - Modern names
    'papua barat': 'papua barat',
    'papua barat daya': 'papua barat daya',
    'papua selatan': 'papua selatan',
    'papua tengah': 'papua tengah',
    'papua pegunungan': 'papua pegunungan',
  };
  return map[n] ?? n;
}

function getProvinceName(feature: Feature<Geometry, GeoJSONFeatureProperties>): string {
  const p = feature.properties || {};
  const rawName = p.NAMA_PROV || p.Propinsi || p.PROPINSI || p.Provinsi || p.PROVINSI || p.provinsi || p.NAME_1 || p.name || '';
  return typeof rawName === 'string' ? rawName : '';
}
  
const MapChart: React.FC<MapChartProps> = ({ data }) => {
  const [geoJsonData, setGeoJsonData] = useState<GeoJSONData | null>(null);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/superpikar/indonesia-geojson/master/indonesia-province-simple.json')
      .then(response => response.json())
      .then((data: GeoJSONData) => setGeoJsonData(data));
  }, []);

  const style = {
    fillColor: '#008000',
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7,
  };

  const getColor = (count: number): string => {
    if (count === 0) return '#008000';
    return '#ffd400';
  };

  const getFeatureStyle = (count: number) => ({
    fillColor: getColor(count),
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: count === 0 ? 0.4 : 0.7,
  });

  const getCountsForFeature = (feature: Feature<Geometry, GeoJSONFeatureProperties>) => {
    const provinceName = getProvinceName(feature);
    const provNorm = normalizeProvince(provinceName);
    const kaltimCount = data.filter(student => normalizeProvince(student.provinsi) === 'kalimantan timur').length;
    const kaltaraCount = data.filter(student => normalizeProvince(student.provinsi) === 'kalimantan utara').length;
    const matchingStudents = data.filter(student => normalizeProvince(student.provinsi) === provNorm);
    const isKaltimArea = provNorm === 'kalimantan timur';
    const studentCount = isKaltimArea ? (kaltimCount + kaltaraCount) : matchingStudents.length;
    const content = isKaltimArea
      ? `<b>${provinceName || 'Tidak diketahui'}</b><br/>Kalimantan Timur: ${kaltimCount}<br/>Kalimantan Utara: ${kaltaraCount}`
      : `<b>${provinceName || 'Tidak diketahui'}</b><br/>Jumlah Mahasiswa Disabilitas: ${studentCount}`;
    return {
      provinceName,
      studentCount,
      content,
    };
  };

  const featureStyle = (feature?: Feature<Geometry, GeoJSONFeatureProperties>) => {
    if (!feature) return getFeatureStyle(0);
    const { studentCount } = getCountsForFeature(feature);
    return getFeatureStyle(studentCount);
  };

  const onEachFeature = (feature: Feature<Geometry, GeoJSONFeatureProperties>, layer: L.Layer) => {
    const { provinceName } = getCountsForFeature(feature);

    layer.on({
      mouseover: (e: L.LeafletMouseEvent) => {
        const { studentCount, content } = getCountsForFeature(feature);
        const target = e.target as L.Path;
        target.setStyle({
          weight: 2.5,
          color: 'black',
          dashArray: '',
          fillOpacity: studentCount === 0 ? 0.5 : 0.8
        });
        // Bind and open popup at cursor position to ensure visibility
        layer.bindPopup(content);
        (layer as any).openPopup(e.latlng);
      },
      mouseout: (e: L.LeafletMouseEvent) => {
        const target = e.target as L.Path;
        target.setStyle(featureStyle(feature));
        layer.closePopup();
      },
      click: (e: L.LeafletMouseEvent) => {
        const { content } = getCountsForFeature(feature);
        // Fallback: open popup on click as well
        layer.bindPopup(content);
        (layer as any).openPopup(e.latlng);
      }
    });

    const label = provinceName || '';
    if (label) {
      layer.bindTooltip(label, { permanent: true, direction: 'center', className: 'province-label' });
    }
  };

  return (
    <>
      <style>{`
        .province-label {
          background: transparent;
          border: none;
          box-shadow: none;
          font-weight: normal; /* Set font back to normal weight */
          color: black;
          font-size: 12px; /* Set font size back to 12px */
          text-align: center;
          pointer-events: none;
          z-index: 1000; /* Ensure labels are on top */
          text-shadow: 1px 1px 2px rgba(255,255,255,0.7); /* Keep text shadow for contrast */
        }
      `}</style>
      <MapContainer center={[-2.548926, 118.0148634]} zoom={5} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {geoJsonData && (
          <GeoJSON
            data={geoJsonData}
            style={featureStyle}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
    </>
  );
};

export default MapChart;

