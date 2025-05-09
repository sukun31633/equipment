"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function EquipmentDetailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const equipmentID = searchParams.get("id");  // ✅ ดึง ID จาก URL

    const [equipment, setEquipment] = useState(null);
    const [loading, setLoading] = useState(true);  // เพิ่มตัวแปร loading
    const [error, setError] = useState(null);  // เพิ่มตัวแปร error

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                const res = await fetch(`/api/view-equipment?id=${encodeURIComponent(equipmentID)}`);
                const data = await res.json();
                
                // ตรวจสอบว่า API response สำเร็จ
                if (data.success && data.data.length > 0) {
                    setEquipment(data.data[0]);
                    setLoading(false);  // เปลี่ยน loading เป็น false เมื่อข้อมูลถูกดึงมาเรียบร้อย
                } else {
                    setError("❌ ไม่พบข้อมูลอุปกรณ์");  // หากไม่พบข้อมูลให้แสดง error
                    setLoading(false);
                }
            } catch (error) {
                setError("❌ เกิดข้อผิดพลาดในการเชื่อมต่อ API");
                setLoading(false);
            }
        };

        if (equipmentID) {
            fetchEquipment();
        }
    }, [equipmentID]);

    const handleBack = () => {
        router.back();
    };

    const goToBorrowEquipment = () => {
        router.push(`/home/borrow-equipment?id=${equipment.id}`);  // ✅ ส่ง id แทน name
    };

    const goToReserveEquipment = () => {
        router.push(`/home/reserve-equipment?id=${equipment.id}`);  // ✅ ส่ง id แทน name
    };

    if (loading) {
        return <p className="text-center mt-10 text-lg text-gray-700">⏳ กำลังโหลดข้อมูล...</p>;
    }

    if (error) {
        return <p className="text-center mt-10 text-lg text-red-600">{error}</p>;  // แสดง error ถ้ามี
    }

    return (
        <div className="p-8 pt-16 min-h-screen bg-gradient-to-br from-blue-500 to-blue-300 flex flex-col items-center w-full relative">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBack}
                className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center text-white bg-gray-900 px-4 py-2 rounded-lg shadow-md hover:bg-gray-800 transition"
            >
                <ArrowLeft className="mr-2" size={18} /> ย้อนกลับ
            </motion.button>

            <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-bold text-white mb-8 text-center w-full"
            >📌 รายละเอียดอุปกรณ์
            </motion.h1>

            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white p-8 shadow-xl rounded-lg w-full max-w-6xl flex flex-col md:flex-row items-center md:items-start gap-8"
            >
                <div className="flex-1 flex justify-center">
                    <Image
                        src={equipment.image ? equipment.image : "/uploads/default.png"}
                        alt={equipment.name}
                        width={600}
                        height={600}
                        className="object-contain w-full max-h-[500px] bg-gray-100 rounded-md shadow"
                    />
                </div>
                
                <div className="flex-1 text-gray-800 text-lg space-y-3 w-full">
                    <p><strong>📌 ชื่ออุปกรณ์:</strong> {equipment.name}</p>
                    <p><strong>🏷️ ยี่ห้อ:</strong> {equipment.brand}</p>
                    <p><strong>📂 หมวดหมู่:</strong> {equipment.category}</p>
                    <p><strong>📜 รายละเอียด:</strong> {equipment.description}</p>
                    <p><strong>📦 รหัสอุปกรณ์:</strong> {equipment.equipment_code} </p>
                    
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 px-6 rounded-lg w-full text-lg font-semibold shadow-md hover:from-blue-600 hover:to-indigo-600 transition"
                        onClick={goToBorrowEquipment}
                    >
                        🔄 ยืมอุปกรณ์ตอนนี้ (หน้าเคาน์เตอร์เจ้าหน้าที่)
                    </motion.button>
                    
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-lg w-full text-lg font-semibold shadow-md hover:from-green-600 hover:to-emerald-600 transition mt-4"
                        onClick={goToReserveEquipment}
                    >
                        📅 จองอุปกรณ์
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}
