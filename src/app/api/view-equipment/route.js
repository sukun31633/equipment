import { NextResponse } from "next/server";
import pool from "../../../../lib/mysql";

export async function GET(req) {
    try {
        // รับ query parameter จาก URL
        const { searchParams } = new URL(req.url);
        const equipmentID = searchParams.get("id"); // ✅ ใช้ ID แทน name

        let query = "SELECT * FROM equipment ORDER BY id DESC";
        let values = [];

        // ✅ ใช้ ID แทนการค้นหาด้วยชื่อ
        if (equipmentID) {
            query += " WHERE id = ?";
            values.push(equipmentID);
        }

        // ดึงข้อมูลอุปกรณ์จากฐานข้อมูล
        const [rows] = await pool.query(query, values);

        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
        return NextResponse.json(
            { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
            { status: 500 }
        );
    }
}
