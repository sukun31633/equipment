// src/app/api/view-equipment/route.js

import { NextResponse } from "next/server";
import pool from "../../../../lib/mysql";

export async function GET(req) {
    try {
        // รับ query parameter จาก URL
        const { searchParams } = new URL(req.url);
        const name = searchParams.get("name");

        let query = "SELECT * FROM equipment";
        let values = [];

        // ถ้ามีการส่งชื่ออุปกรณ์เข้ามา ให้ค้นหาเฉพาะอุปกรณ์นั้น
        if (name) {
            query += " WHERE name = ?";
            values.push(name);
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
