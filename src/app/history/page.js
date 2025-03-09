"use client";

import Image from 'next/image';
import NavigationBar from '../components/NavigationBar';

export default function BorrowingHistoryPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex flex-col items-center p-6 pb-24 w-full">
            {/* Header */}
            <div className="w-full max-w-4xl p-4 bg-white shadow-lg flex items-center justify-between rounded-lg">
                <h2 className="text-2xl font-bold text-blue-700">📜 ประวัติการยืม</h2>
            </div>

            {/* Content */}
            <div className="w-full max-w-4xl mt-6 space-y-6">
                <div className="bg-white p-6 shadow-xl rounded-xl flex items-center hover:shadow-2xl transition">
                    <div className="w-24 h-24 bg-gray-200 rounded-lg mr-6 flex-shrink-0 flex items-center justify-center">
                        <Image 
                            src="/iotras.jpg" 
                            alt="ภาพอุปกรณ์" 
                            width={100} 
                            height={100} 
                            className="object-cover rounded-lg"
                        />
                    </div>
                    <div>
                        <p className="font-bold text-lg">📌 หมายเลขการยืม: BR123456</p>
                        <p className="text-gray-800">🔹 ชื่ออุปกรณ์: Raspberry Pi 4</p>
                        <p className="text-gray-800">🏷️ ยี่ห้อ: Raspberry</p>
                        <p className="text-gray-800">📅 วันเวลารับคืน: 25 กุมภาพันธ์ 2025</p>
                    </div>
                </div>
            </div>

           <NavigationBar />
        </div>
    );
}
