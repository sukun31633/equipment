"use client";

import { useState } from 'react';
import AdminNavigationBar from "@/app/components/AdminNavigationBar";
import { useRouter } from 'next/navigation';

export default function AddEquipmentPage() {
    const [equipmentName, setEquipmentName] = useState("");
    const [equipmentCode, setEquipmentCode] = useState(""); // ✅ เพิ่มรหัสอุปกรณ์
    const [brand, setBrand] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [storageLocation, setStorageLocation] = useState("");
    const [image, setImage] = useState(null);
    const router = useRouter(); // ใช้ router เพื่อการนำทาง

    const handleSave = async () => {
        if (!equipmentName || !equipmentCode || !category) {
            alert("⚠️ กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
            return;
        }

        const formData = new FormData();
        formData.append("name", equipmentName);
        formData.append("equipment_code", equipmentCode); // ✅ เพิ่มรหัสอุปกรณ์
        formData.append("brand", brand);
        formData.append("category", category);
        formData.append("description", description);
        formData.append("location", storageLocation);
        formData.append("image", image);

        try {
            const res = await fetch("/api/add-equipment", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (data.success) {
                alert("✅ เพิ่มข้อมูลอุปกรณ์สำเร็จ");
                setEquipmentName("");
                setEquipmentCode(""); // ✅ รีเซ็ตรหัสอุปกรณ์
                setBrand("");
                setCategory("");
                setDescription("");
                setStorageLocation("");
                setImage(null);

                // นำทางไปหน้าข้อมูลอุปกรณ์
                router.push('/admin/view-equipment'); 
            } else {
                alert(data.message || "⚠️ เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
            }
        } catch (error) {
            console.error("เกิดข้อผิดพลาด:", error);
            alert("⚠️ เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-6 pb-24 flex flex-col items-center">
            
            {/* 🔹 Header */}
            <div className="w-full max-w-4xl bg-white p-4 shadow-lg flex items-center justify-between rounded-lg mb-6">
                <h2 className="text-xl font-semibold text-gray-800">➕ เพิ่มข้อมูลอุปกรณ์</h2>
            </div>

            {/* 🔹 Form Section */}
            <div className="w-full max-w-4xl bg-white p-6 shadow-md rounded-lg">
                {[{ label: "📌 ชื่ออุปกรณ์ (ภาษาไทย)", value: equipmentName, setValue: setEquipmentName },
                  { label: "🆔 รหัสอุปกรณ์", value: equipmentCode, setValue: setEquipmentCode }, 
                  { label: "🏷️ ชื่อยี่ห้อและรุ่น", value: brand, setValue: setBrand }, 
                  { label: "📍 ที่เก็บอุปกรณ์", value: storageLocation, setValue: setStorageLocation }, 
                  { label: "📝 รายละเอียดอุปกรณ์", value: description, setValue: setDescription }].map(({ label, value, setValue }) => (
                    <div className="mb-4" key={label}>
                        <label className="block text-sm font-semibold mb-1 text-gray-700">{label}</label>
                        <input
                            type="text"
                            placeholder={label}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="w-full border p-3 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
                        />
                    </div>
                ))}

                {/* Dropdown: หมวดหมู่ */}
                <div className="mb-4">
                    <label className="block text-sm font-semibold mb-1 text-gray-700">📂 หมวดหมู่</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full border p-3 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
                    >
                        <option value="">🔽 เลือกหมวดหมู่</option>
                        <option value="IOT">IOT</option>
                        <option value="network">Network</option>
                        <option value="อุปกรณ์อื่นๆ">อุปกรณ์อื่นๆ</option>
                    </select>
                </div>

                {/* อัปโหลดรูปภาพ */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold mb-1 text-gray-700">📸 อัปโหลดรูปอุปกรณ์</label>
                    <input
                        type="file"
                        onChange={(e) => setImage(e.target.files[0])}
                        className="w-full border p-3 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
                    />
                </div>

                {/* ปุ่มบันทึก */}
                <button
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition text-lg font-semibold shadow-md"
                    onClick={handleSave}
                >
                    ✅ บันทึกข้อมูล
                </button>
            </div>

            <AdminNavigationBar />
        </div>
    );
}
