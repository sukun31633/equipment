"use client";

import { Home, Box, Clock, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function NavigationBar() {
  const router = useRouter();

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white shadow-lg border-t border-gray-300 flex justify-around py-3 backdrop-blur-md bg-opacity-90">
      {[
        { icon: Home, label: "หน้าหลัก", path: "/home" },
        { icon: Box, label: "อุปกรณ์ที่ยืม", path: "/borrowed-equipment" },
        { icon: Clock, label: "ประวัติ", path: "/history" },
        { icon: User, label: "โปรไฟล์", path: "/profile" },
      ].map(({ icon: Icon, label, path }, index) => (
        <motion.button
          key={index}
          whileHover={{ scale: 1.15, y: -3, color: "#2563EB" }}
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center text-gray-500 hover:text-blue-600 transition-colors"
          onClick={() => router.push(path)}
        >
          <motion.div
            whileHover={{ rotate: 10 }}
            className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md"
          >
            <Icon size={28} className="mb-1" />
          </motion.div>
          <span className="text-xs font-medium mt-1">{label}</span>
        </motion.button>
      ))}
    </div>
  );
}
