"use client";

import { FileSpreadsheet, ArrowLeft, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from "recharts";

const SPAN_OPTIONS = [
  { label: "1 วัน", value: 1, unit: "day", key: "1 วัน" },
  { label: "1 สัปดาห์", value: 1, unit: "week", key: "1 สัปดาห์" },
  { label: "1 เดือน", value: 1, unit: "month", key: "1 เดือน" },
  { label: "3 เดือน", value: 3, unit: "month", key: "3 เดือน" },
  { label: "6 เดือน", value: 6, unit: "month", key: "6 เดือน" },
  { label: "12 เดือน", value: 12, unit: "month", key: "12 เดือน" },
];

export default function AllEquipmentUsagePage() {
  const router = useRouter();
  const [spanKey, setSpanKey] = useState("6 เดือน");
  const [dataBySpan, setDataBySpan] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const res = await fetch("/api/report?type=topEquipmentAll");
        const json = await res.json();
        if (json.success) setDataBySpan(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  // ← Loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 size={48} className="animate-spin text-gray-600" />
      </div>
    );
  }

  // แปลงข้อมูล+กรอง
  const allRows = dataBySpan[spanKey] || [];
  const rows = allRows.filter(
    (it) =>
      it.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      it.equipmentCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // เตรียมกราฟ top5
  const chartData = [...rows]
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 5)
    .map((it) => ({
      label: `${it.equipmentName} (${it.equipmentCode})`,
      usageCount: it.usageCount,
    }));

  // Export Excel
  const exportCurrent = () => {
    const ws = XLSX.utils.json_to_sheet(
      rows.map((it) => ({
        "รหัสอุปกรณ์": it.equipmentCode,
        "ชื่ออุปกรณ์": it.equipmentName,
        "ครั้งใช้งาน": it.usageCount,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, spanKey);
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout]), `Usage_${spanKey}.xlsx`);
  };
  const exportAll = () => {
    const wb = XLSX.utils.book_new();
    Object.entries(dataBySpan).forEach(([label, list]) => {
      const ws = XLSX.utils.json_to_sheet(
        list.map((it) => ({
          "รหัสอุปกรณ์": it.equipmentCode,
          "ชื่ออุปกรณ์": it.equipmentName,
          "ครั้งใช้งาน": it.usageCount,
        }))
      );
      XLSX.utils.book_append_sheet(wb, ws, label);
    });
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout]), `Usage_AllSpans.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={20} className="mr-2" /> ย้อนกลับ
          </button>
          <h1 className="text-2xl font-semibold text-gray-800">
            สถิติอุปกรณ์ (ย้อนหลัง {spanKey})
          </h1>
          <div className="flex flex-col items-end space-y-2">
            <button
              onClick={exportAll}
              className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow"
            >
              <FileSpreadsheet className="mr-2" /> ส่งออกข้อมูลทั้งหมด Excel
            </button>
            <button
              onClick={exportCurrent}
              className="flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow"
            >
              <FileSpreadsheet className="mr-2" /> ส่งออกช่วงนี้ Excel
            </button>
          </div>
        </div>

        {/* Filters + Search */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap gap-2">
            {SPAN_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSpanKey(opt.key)}
                className={`px-4 py-1 rounded-full text-sm font-medium transition ${
                  spanKey === opt.key
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="🔍 รหัสหรือชื่ออุปกรณ์"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* Mini Chart */}
        <div className="w-full h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis type="number" hide />
              <YAxis
                dataKey="label"
                type="category"
                width={160}
                tick={{
                  fontSize: 12,
                  width: 140,
                  wordBreak: "break-all",
                  whiteSpace: "normal"
                }}
              />
              <Tooltip formatter={(v) => [`${v} ครั้ง`, "ใช้งาน"]} />
              <Bar dataKey="usageCount" fill="#3b82f6" barSize={16}>
                <LabelList
                  dataKey="usageCount"
                  position="right"
                  fill="#374151"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  รหัสอุปกรณ์
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  ชื่ออุปกรณ์
                </th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                  ครั้งใช้งาน
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.length > 0 ? (
                rows.map((it) => (
                  <tr key={it.equipmentID} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-800">
                      {it.equipmentCode}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800">
                      {it.equipmentName}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 text-right">
                      {it.usageCount}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                    ไม่พบข้อมูล
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
