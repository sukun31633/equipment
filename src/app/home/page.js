"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useSession } from "next-auth/react";
import NavigationBar from "../components/NavigationBar";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

// Spinner แบบวงกลมไล่เฉดสี
function SpinnerCircle({ size = 48 }) {
  return (
    <div
      className="border-4 border-transparent border-t-blue-500 border-b-purple-500 rounded-full animate-spin"
      style={{ width: size, height: size }}
    />
  );
}

export default function HomePage() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [equipmentList, setEquipmentList] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setIsFetching(true);
        const res = await fetch("/api/view-equipment");
        const data = await res.json();
        if (data.success) {
          const availableEquipments = data.data.filter(
            (e) => e.status === "Available"
          );
          setEquipmentList(availableEquipments);
        } else {
          console.error("เกิดข้อผิดพลาดในการดึงข้อมูลอุปกรณ์");
        }
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการเชื่อมต่อ API", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchEquipment();
  }, []);

  const handleSearch = () => {
    console.log("ค้นหาชื่ออุปกรณ์:", searchTerm);
  };

  const goToEquipmentDetail = (equipmentID) => {
    router.push(
      `/home/equipment-detail?id=${encodeURIComponent(equipmentID)}`
    );
  };

  const filterEquipment = (e) =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase());

  const categorizedEquipment = {
    IOT: equipmentList.filter(
      (i) => i.category.trim() === "IOT" && filterEquipment(i)
    ),
    network: equipmentList.filter(
      (i) => i.category.trim() === "network" && filterEquipment(i)
    ),
    others: equipmentList.filter(
      (i) => i.category.trim() === "อุปกรณ์อื่นๆ" && filterEquipment(i)
    ),
  };

  // ถ้ากำลังโหลดข้อมูล ให้โชว์ spinner เต็มจอ
  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-500 to-indigo-600">
        <SpinnerCircle size={64} />
      </div>
    );
  }

  // แปลง role เป็นข้อความภาษาไทย
  const roleLabel = () => {
    const role = session?.user?.role;
    if (role === "student") return "นักศึกษา";
    if (role === "teacher") return "อาจารย์";
    return "ผู้ใช้งาน";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex flex-col items-center p-6 pb-24 w-full">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl p-6 bg-white shadow-lg flex flex-col items-center rounded-lg"
      >
        <h2 className="text-2xl font-bold text-blue-700 mb-1">
          ชื่อผู้ใช้งาน: {session?.user?.name || "ผู้เยี่ยมชม"}
        </h2>
        {/* แสดงหน้าสำหรับ role */}
        <p className="text-lg text-gray-600 mb-4">
          หน้าสำหรับ: {roleLabel()}
        </p>
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
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-r-lg hover:from-blue-600 hover:to-indigo-600 shadow-md flex items-center"
          >
            <Search size={24} />
          </motion.button>
        </div>
      </motion.div>

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
                  className="bg-white p-6 shadow-2xl rounded-xl cursor-pointer hover:shadow-3xl transition flex flex-col items-center"
                  onClick={() => goToEquipmentDetail(equipment.id)}
                >
                  <div className="w-full h-60 overflow-hidden rounded-lg shadow-md flex items-center justify-center">
                    <motion.img
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      src={equipment.image || "/uploads/default.png"}
                      alt={equipment.name}
                      className="w-full h-full object-contain rounded-md"
                      onError={(e) => (e.target.src = "/uploads/default.png")}
                    />
                  </div>
                  <p className="text-lg text-center mt-3 font-semibold text-gray-800 tracking-wide capitalize min-h-[50px] flex items-center justify-center">
                    {equipment.name || "ไม่มีชื่ออุปกรณ์"}
                    <br />
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
