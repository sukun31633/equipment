import { NextResponse } from "next/server";
import pool from "../../../../lib/mysql";

export async function GET(req) {
    try {
        // รับ query parameter จาก URL
        const { searchParams } = new URL(req.url);
        const userType = searchParams.get("type"); // "admin", "teacher", "student"

        let query = "SELECT userID, Name, phoneNumber, email, status, password FROM user";
        let values = [];

        // 🔹 กรองตามประเภทผู้ใช้
        if (userType) {
            query += " WHERE status = ?";
            values.push(userType);
        }

        // ดึงข้อมูลจากฐานข้อมูล
        const [rows] = await pool.query(query, values);

        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        console.error("❌ เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:", error);
        return NextResponse.json(
            { success: false, message: "❌ ไม่สามารถดึงข้อมูลได้" },
            { status: 500 }
        );
    }
}
