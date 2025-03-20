import { NextResponse } from "next/server";
import pool from "../../../../lib/mysql";

export async function GET(req) {
    try {
        // รับ query parameter จาก URL
        const url = new URL(req.url);  // ใช้ new URL() เพื่อดึง query params
        const equipmentID = url.searchParams.get("id"); // ✅ ใช้ ID แทน name

        let query = "SELECT * FROM equipment";
        let values = [];

        // ✅ ใช้ ID แทนการค้นหาด้วยชื่อ
        if (equipmentID) {
            query += " WHERE id = ?";  // ถ้ามี id ให้กรองข้อมูลโดยใช้ id
            values.push(equipmentID);
        }
        
        // จัดการเรียงลำดับข้อมูล
        query += " ORDER BY id DESC"; // ทำให้ข้อมูลถูกเรียงตาม id จากมากไปน้อย

        // ดึงข้อมูลอุปกรณ์จากฐานข้อมูล
        const [rows] = await pool.query(query, values);

        if (rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: "❌ ไม่พบข้อมูลอุปกรณ์"
            }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: rows });

    } catch (error) {
        console.error("❌ เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
        return NextResponse.json(
            { success: false, message: "❌ เกิดข้อผิดพลาดในการดึงข้อมูล" },
            { status: 500 }
        );
    }
}
