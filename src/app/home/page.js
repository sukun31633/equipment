"use client"; // ✅ ต้องใส่ไว้ที่บรรทัดแรก

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useSession } from "next-auth/react"; // ✅ ใช้ useSession() ได้ถูกต้อง
import NavigationBar from "../components/NavigationBar";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function HomePage() {
  const { data: session } = useSession(); // ✅ ดึงข้อมูลผู้ใช้จาก Session
  const [searchTerm, setSearchTerm] = useState("");
  const [equipmentList, setEquipmentList] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const res = await fetch("/api/view-equipment");
        const data = await res.json();
        if (data.success) {
          // ฟิลเตอร์แค่สถานะที่ "Available" เท่านั้น
          const availableEquipments = data.data.filter(equipment => equipment.status === "Available");
          setEquipmentList(availableEquipments);
        } else {
          console.error("เกิดข้อผิดพลาดในการดึงข้อมูลอุปกรณ์");
        }
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการเชื่อมต่อ API", error);
      }
    };

    fetchEquipment();
  }, []);

  const handleSearch = () => {
    console.log("ค้นหาชื่ออุปกรณ์:", searchTerm);
  };

  // ✅ เปลี่ยนจากใช้ name -> id
  const goToEquipmentDetail = (equipmentID) => {
    router.push(`/home/equipment-detail?id=${encodeURIComponent(equipmentID)}`);
  };

  const filterEquipment = (equipment) =>
    equipment.name.toLowerCase().includes(searchTerm.toLowerCase());

  const categorizedEquipment = {
    IOT: equipmentList.filter((item) => item.category.trim() === "IOT" && filterEquipment(item)),
    network: equipmentList.filter((item) => item.category.trim() === "network" && filterEquipment(item)),
    others: equipmentList.filter((item) => item.category.trim() === "อุปกรณ์อื่นๆ" && filterEquipment(item)),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex flex-col items-center p-6 pb-24 w-full"> 

      {/* ✅ แสดงชื่อผู้ใช้ */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl p-6 bg-white shadow-lg flex flex-col items-center rounded-lg"
      >
        <h2 className="text-2xl font-bold text-blue-700 mb-2">
          ชื่อผู้ใช้งาน: {session?.user?.name || "ผู้เยี่ยมชม"} {/* ✅ ใช้ session */}
        </h2>
        <div className="flex w-full max-w-2xl items-center bg-gray-100 p-3 rounded-lg shadow-md">
          <input
            type="text"
            placeholder="🔍 ค้นหาอุปกรณ์..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border-none p-3 rounded-l-lg bg-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-700"
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSearch}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-r-lg hover:from-blue-600 hover:to-indigo-600 shadow-md"
          >
            <Search size={24} />
          </motion.button>
        </div>
      </motion.div>

      {/* ✅ รายการอุปกรณ์ */}
      <div className="w-full max-w-6xl mt-8">
        {Object.entries(categorizedEquipment).map(([category, items]) => (
          <div key={category} className="mb-10">
            <h3 className="text-2xl font-extrabold text-white mb-4 bg-opacity-80 bg-gray-900 p-3 rounded-md text-center uppercase tracking-widest">
              {category}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {items.map((equipment) => (
                <motion.div
                  key={equipment.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white p-6 shadow-2xl rounded-xl cursor-pointer hover:shadow-3xl transition flex flex-col items-center w-full max-w-[450px]"
                  onClick={() => goToEquipmentDetail(equipment.id)}  // ✅ เปลี่ยนจาก name เป็น id
                >
                  <div className="w-full h-60 overflow-hidden rounded-lg shadow-md flex items-center justify-center">
                    <motion.img
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      src={equipment.image ? equipment.image : "/uploads/default.png"}
                      alt={equipment.name}
                      className="w-full h-full object-contain rounded-md"
                      onError={(e) => (e.target.src = "/uploads/default.png")}
                    />
                  </div>
                  <p className="text-lg text-center mt-3 font-semibold text-gray-800 tracking-wide capitalize min-h-[50px] flex items-center justify-center">
                    {equipment.name || "ไม่มีชื่ออุปกรณ์"}
                    <br/>
                    รหัสอุปกรณ์: {equipment.equipment_code || "ไม่มีรหัสสินค้า"}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <NavigationBar />
    </div>
  );
}
