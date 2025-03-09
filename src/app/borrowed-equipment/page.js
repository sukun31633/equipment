"use client";

import Image from 'next/image';
import NavigationBar from '../components/NavigationBar';

export default function BorrowedEquipmentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex flex-col items-center p-6 pb-24 w-full">
      {/* Header */}
      <div className="w-full max-w-4xl p-4 bg-white shadow-lg flex items-center justify-between rounded-lg">
        <h2 className="text-2xl font-bold text-blue-700">📦 อุปกรณ์ที่ยืม</h2>
      </div>

      {/* Content */}
      <div className="w-full max-w-4xl mt-6 space-y-6">
        {/* อุปกรณ์ที่ต้องคืน */}
        <div className="bg-white p-6 shadow-xl rounded-xl flex items-center hover:shadow-2xl transition">
          <div className="w-24 h-24 bg-gray-200 rounded-lg mr-6 flex-shrink-0">
            <Image
              src="/iotras.jpg"
              alt="ภาพอุปกรณ์"
              width={96}
              height={96}
              className="object-cover rounded-lg"
            />
          </div>
          <div>
            <p className="font-bold text-lg">หมายเลขการยืม: 12345</p>
            <p className="text-gray-800">🔹 ชื่ออุปกรณ์: Raspberry Pi</p>
            <p className="text-gray-800">🏷️ ยี่ห้อ: Raspberry</p>
            <p className="text-gray-800">📅 วันเวลารับคืน: 20 กุมภาพันธ์ 2568</p>
            <p className="text-red-500 font-semibold">⚠️ เลยกำหนดคืน</p>
          </div>
        </div>

        {/* อุปกรณ์ที่รออนุมัติการจอง */}
        <div className="bg-white p-6 shadow-xl rounded-xl flex items-center hover:shadow-2xl transition">
          <div className="w-24 h-24 bg-gray-200 rounded-lg mr-6 flex-shrink-0">
            <Image
              src="/iotESP.jpg"
              alt="ภาพอุปกรณ์"
              width={96}
              height={96}
              className="object-cover rounded-lg"
            />
          </div>
          <div>
            <p className="font-bold text-lg">หมายเลขการยืม: 67890</p>
            <p className="text-gray-800">🔹 ชื่ออุปกรณ์: ESP32</p>
            <p className="text-gray-800">🏷️ ยี่ห้อ: Espressif</p>
            <p className="text-gray-800">📅 วันเวลารับคืน: 22 กุมภาพันธ์ 2568</p>
            <p className="text-yellow-500 font-semibold">⏳ รออนุมัติการจอง</p>
            <button className="mt-4 bg-red-400 text-white py-2 px-5 rounded-lg shadow-md hover:bg-red-600 transition">
              ❌ ยกเลิกการจอง
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <NavigationBar />
    </div>
  );
}
