"use client";
import { FileSpreadsheet } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const SPAN_OPTIONS = [
  { label: "1 วัน", value: 1, unit: "day" },
  { label: "1 สัปดาห์", value: 1, unit: "week" },
  { label: "1 เดือน", value: 1, unit: "month" },
  { label: "3 เดือน", value: 3, unit: "month" },
  { label: "6 เดือน", value: 6, unit: "month" },
  { label: "12 เดือน", value: 12, unit: "month" },
];

export default function TopEquipmentReportPage() {
  const router = useRouter();
  const [{ value: span, unit }, setSpanUnit] = useState({ value: 6, unit: "month" });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/report?span=${span}&unit=${unit}&type=topEquipment`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message || "ไม่สามารถดึงข้อมูลรายงานได้");
        setData(
          json.data.map((item) => ({
            ...item,
            equipmentLabel: `${item.equipmentName} (${item.equipmentCode})`,
          }))
        );
      } catch (err) {
        console.error(err);
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูลรายงาน");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [span, unit]);

  // Export current span
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((item) => ({
        "รหัสอุปกรณ์": item.equipmentCode,
        "ชื่ออุปกรณ์": item.equipmentName,
        "จำนวนครั้งใช้งาน": item.usageCount,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Top_${span}_${unit}`);
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout]), `TopEquipment_${span}_${unit}.xlsx`);
  };

  // Export all spans
  const handleExportAll = async () => {
    try {
      const res = await fetch(`/api/report?type=topEquipmentAll`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      const workbook = XLSX.utils.book_new();

      // json.data is an object: { "1 วัน": [...], "1 สัปดาห์": [...], ... }
      for (const [label, items] of Object.entries(json.data)) {
        const wsData = items.map((item) => ({
          "รหัสอุปกรณ์": item.equipmentCode,
          "ชื่ออุปกรณ์": item.equipmentName,
          "จำนวนครั้งใช้งาน": item.usageCount,
        }));
        const ws = XLSX.utils.json_to_sheet(wsData);
        XLSX.utils.book_append_sheet(workbook, ws, label);
      }

      const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([wbout]), `TopEquipment_AllSpans.xlsx`);
    } catch (err) {
      console.error(err);
      alert("❌ ไม่สามารถ Export ทุกช่วงเวลาได้");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-5xl bg-white rounded-2xl shadow-xl p-8"
      >
        {/* Back + Title + Export Buttons */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={20} className="mr-2" /> ย้อนกลับ
          </button>
          <h1 className="text-3xl font-semibold text-gray-800">
            📊 สถิติอุปกรณ์ใช้บ่อยสุดย้อนหลัง {span}{" "}
            {unit === "day" ? "วัน" : unit === "week" ? "สัปดาห์" : "เดือน"}
          </h1>
          <div className="space-x-2">
          <div className="flex flex-col items-end space-y-2">
            <button
              onClick={handleExportAll}
              className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow transition"
            >
              <FileSpreadsheet size={18} className="mr-2" />
              ส่งออก Excel ทั้งหมด
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow transition"
            >
              <FileSpreadsheet size={18} className="mr-2" />
              ส่งออก Excel เลือกช่วง
            </button>
          </div>
          </div>
        </div>

        {/* Span Selector */}
        <div className="flex flex-wrap gap-2 mb-8">
          {SPAN_OPTIONS.map((opt) => {
            const active = span === opt.value && unit === opt.unit;
            return (
              <button
                key={`${opt.unit}-${opt.value}`}
                onClick={() => setSpanUnit({ value: opt.value, unit: opt.unit })}
                className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                  active
                    ? "bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Chart */}
        {loading ? (
          <div className="text-center py-16 text-gray-500">⏳ กำลังโหลด...</div>
        ) : error ? (
          <div className="text-center py-16 text-red-500">{error}</div>
        ) : (
          <ResponsiveContainer width="100%" height={500}>
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 20, right: 40, left: 100, bottom: 5 }}
            >
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

              <XAxis
                type="number"
                tick={{ fill: "#4b5563", fontSize: 14 }}
                axisLine={{ stroke: "#cbd5e1" }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="equipmentLabel"
                width={220}
                tick={{ fill: "#4b5563", fontSize: 14, lineHeight: "20px" }}
              />

              <Tooltip
                formatter={(value) => [`${value} ครั้ง`, "ใช้งาน"]}
                contentStyle={{
                  borderRadius: "0.5rem",
                  border: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  fontSize: "14px",
                }}
              />
              <Legend wrapperStyle={{ paddingBottom: 8, fontSize: 14 }} />

              <Bar dataKey="usageCount" fill="url(#barGrad)" name="ครั้งใช้งาน" barSize={24}>
                <LabelList dataKey="usageCount" position="right" fill="#374151" fontSize={14} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>
    </div>
  );
}
