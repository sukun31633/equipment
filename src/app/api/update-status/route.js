import { NextResponse } from "next/server";
import pool from "../../../../lib/mysql";

export async function POST(req) {
    try {
        const { id, type, action } = await req.json();

        // ตรวจสอบความถูกต้องของข้อมูล
        if (!id || !type || !["approve", "reject"].includes(action)) {
            return NextResponse.json({ success: false, message: "❌ ข้อมูลไม่ถูกต้อง" }, { status: 400 });
        }

        let table = type === "borrow" ? "borrowing" : "reservation";  // ตารางที่ใช้
        let column = type === "borrow" ? "borrowID" : "reservationID";  // Primary Key
        let newStatus = action === "approve" ? "Approved" : "Rejected";  // สถานะใหม่

        // อัปเดตสถานะในฐานข้อมูล
        const [result] = await pool.query(
            `UPDATE ${table} SET status = ? WHERE ${column} = ?`,
            [newStatus, id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ success: false, message: "❌ ไม่พบรายการที่ต้องการอัปเดต" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: `✅ สถานะเปลี่ยนเป็น ${newStatus}` });

    } catch (error) {
        console.error("❌ เกิดข้อผิดพลาด:", error);
        return NextResponse.json({ success: false, message: "❌ ไม่สามารถอัปเดตสถานะได้" }, { status: 500 });
    }
}