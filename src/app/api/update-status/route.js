import { NextResponse } from "next/server";
import pool from "../../../../lib/mysql";

export async function POST(req) {
  try {
    const { id, type, action } = await req.json();

    // อนุญาตให้ action เป็น "approve", "reject", "confirm", หรือ "cancel"
    if (!id || !type || !["approve", "reject", "confirm", "cancel"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "❌ ข้อมูลไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // กำหนดตารางและคอลัมน์หลักตามประเภท
    let table = type === "borrow" ? "borrowing" : "reservation";
    let column = type === "borrow" ? "borrowID" : "reservationID";

    let newStatus;
    if (action === "approve") {
      // สำหรับการยืม ถ้าอนุมัติ ให้เปลี่ยนเป็น "Borrowed"
      // สำหรับการจอง ถ้าอนุมัติ (แต่ไม่ได้รับอุปกรณ์แล้ว) ให้เปลี่ยนเป็น "Approved"
      newStatus = type === "borrow" ? "Borrowed" : "Approved";
    } else if (action === "confirm") {
      // สำหรับการจอง เมื่อผู้จองรับอุปกรณ์แล้ว
      newStatus = "Borrowed";
    } else if (action === "reject" || action === "cancel") {
      newStatus = "Rejected";
    }

    const [result] = await pool.query(
      `UPDATE ${table} SET status = ? WHERE ${column} = ?`,
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "❌ ไม่พบรายการที่ต้องการอัปเดต" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `✅ สถานะเปลี่ยนเป็น ${newStatus}`,
    });
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาด:", error);
    return NextResponse.json(
      { success: false, message: "❌ ไม่สามารถอัปเดตสถานะได้" },
      { status: 500 }
    );
  }
}
