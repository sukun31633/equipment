"use client";

import { Home, Box, User, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function AdminNavigationBar() {
  const router = useRouter();
  
  const navItems = [
    { icon: FileText, label: "ข้อมูลการยืม/คืน", path: "/admin/view-borrow" },
    { icon: Home, label: "เพิ่มข้อมูลอุปกรณ์", path: "/admin/add-equipment" },
    { icon: Box, label: "ข้อมูลอุปกรณ์", path: "/admin/view-equipment" },
    { icon: User, label: "ข้อมูลผู้ใช้งาน", path: "/admin/add-user/student" },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white shadow-md border-t border-gray-200 flex justify-around py-3 backdrop-blur-md bg-opacity-95 rounded-t-lg">
      {navItems.map(({ icon: Icon, label, path }, index) => (
        <motion.button
          key={index}
          whileHover={{ scale: 1.1, y: -3, color: "#2563EB" }}
          whileTap={{ scale: 0.9 }}
          onClick={() => router.push(path)}
          className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <motion.div
            whileHover={{ rotate: 10 }}
            className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 shadow-sm transition-all"
          >
            <Icon size={28} />
          </motion.div>
          <span className="text-xs font-medium mt-1">{label}</span>
        </motion.button>
      ))}
    </div>
  );
}
