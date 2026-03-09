"use client";

import { API_BASE } from "@/lib/api";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function AttemptReview() {
  const params = useParams();
  const attemptId = params.id as string;

  const [token, setToken] = useState<string | null>(null);
  const [attempt, setAttempt] = useState<any>(null);
  const [manualScore, setManualScore] = useState("");
  const [statusOverride, setStatusOverride] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  const fetchDetail = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/attempts/${attemptId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        console.error("fetchDetail error:", res.status);
        return;
      }
      const data = await res.json();
      setAttempt(data);
      setStatusOverride(data.passStatus ?? "");
    } catch (err) {
      console.error("fetchDetail:", err);
    } finally {
      setLoading(false);
    }
  }, [token, attemptId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  async function submitManualScore() {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/attempts/${attemptId}/score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ manualScore: Number(manualScore) }),
      });
      if (!res.ok) {
        alert("Gagal menyimpan manual score");
        return;
      }
      alert("Manual score berhasil disimpan!");
      fetchDetail();
    } catch (err) {
      console.error("submitManualScore:", err);
      alert("Gagal menyimpan manual score");
    }
  }

  async function updatePassStatus() {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/attempts/${attemptId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: statusOverride }),
      });
      if (!res.ok) {
        alert("Gagal mengubah status");
        return;
      }
      alert("Status berhasil diperbarui!");
      fetchDetail();
    } catch (err) {
      console.error("updatePassStatus:", err);
      alert("Gagal mengubah status");
    }
  }

  if (loading) return <p className="p-6">Loading...</p>;
  if (!attempt) return <p className="p-6 text-red-600">Attempt tidak ditemukan.</p>;

  const answers = attempt.answers || {};

  return (
    <div className="p-8 space-y-6 text-black">
      <h1 className="text-2xl font-bold mb-4">Review Attempt #{attempt.id}</h1>
      <div className="p-4 border rounded-lg bg-white shadow">
        <p><b>Nama Peserta:</b> {attempt.user?.name}</p>
        <p><b>Test:</b> {attempt.test?.title}</p>
        <p><b>Tipe:</b> {attempt.test?.type}</p>
        <p><b>Auto Score:</b> {attempt.autoScore}</p>
        <p><b>Manual Score:</b> {attempt.manualScore ?? "-"}</p>
        <p><b>Final Score:</b> {attempt.finalScore ?? "-"}</p>
        <p><b>Status:</b> {attempt.passStatus ?? "Pending"}</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Jawaban Peserta</h2>
        {attempt.test?.questions?.map((q: any) => (
          <div key={q.id} className="p-4 border rounded-lg bg-gray-50">
            <p className="font-medium mb-2">• {q.text}</p>
            <p className="text-sm text-gray-700"><b>Jawaban:</b> {answers[q.id] ?? "-"}</p>
          </div>
        ))}
      </div>

      {attempt.test?.type === "COLLEGE_READINESS" && (
        <div className="p-4 border rounded-lg bg-white shadow space-y-3">
          <h2 className="font-semibold">Input Manual Score</h2>
          <input type="number" value={manualScore} onChange={(e) => setManualScore(e.target.value)} className="border p-2 rounded w-40" placeholder="Nilai manual" />
          <button onClick={submitManualScore} className="px-4 py-2 bg-blue-600 text-white rounded">Simpan Manual Score</button>
        </div>
      )}

      <div className="p-4 border rounded-lg bg-white shadow space-y-3">
        <h2 className="font-semibold">Override Status</h2>
        <select value={statusOverride} onChange={(e) => setStatusOverride(e.target.value)} className="border p-2 rounded w-40">
          <option value="">-- pilih status --</option>
          <option value="PASS">PASS</option>
          <option value="FAIL">FAIL</option>
        </select>
        <button onClick={updatePassStatus} className="px-4 py-2 bg-green-600 text-white rounded">Update Status</button>
      </div>
    </div>
  );
}
