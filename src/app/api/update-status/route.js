import { NextResponse } from "next/server";
import pool from "../../../../lib/mysql";

export async function POST(req) {
  try {
    const { id, type, action, status } = await req.json();

    // ตรวจสอบค่าที่ส่งมาถูกต้อง
    if (!id || !type || !["approve", "reject", "confirm", "cancel", "return"].includes(action)) {
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
      newStatus = type === "borrow" ? "Borrowed" : "Approved";
    } else if (action === "confirm") {
      newStatus = "Borrowed";
    } else if (action === "reject" || action === "cancel") {
      newStatus = "Rejected";
    } else if (action === "return") {
      newStatus = "Returned";

      // อัปเดตสถานะในตาราง borrowing หรือ reservation เป็น "Returned"
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

      // ดึง equipmentID จากตาราง borrowing หรือ reservation
      let equipmentID;
      if (type === "borrow") {
        const [rows] = await pool.query(
          "SELECT equipmentID FROM borrowing WHERE borrowID = ?",
          [id]
        );
        if (rows.length > 0) {
          equipmentID = rows[0].equipmentID;
        }
      } else {
        const [rows] = await pool.query(
          "SELECT equipmentID FROM reservation WHERE reservationID = ?",
          [id]
        );
        if (rows.length > 0) {
          equipmentID = rows[0].equipmentID;
        }
      }

      // อัปเดตสถานะในตาราง equipment ตามที่เลือก
      if (equipmentID) {
        let updatedStatus = "";
        if (status === "สมบูรณ์") {
          updatedStatus = "Available";
        } else if (status === "ซ่อม") {
          updatedStatus = "Repair";
        } else if (status === "พัง") {
          updatedStatus = "Damaged";
        }

        // อัปเดตสถานะของอุปกรณ์
        await pool.query(
          "UPDATE equipment SET status = ? WHERE id = ?",
          [updatedStatus, equipmentID]
        );
      }
    }

    // อัปเดตสถานะตาม action อื่นๆ
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

    // หาก action คือ reject ต้องอัปเดตสถานะของอุปกรณ์เป็น "Available"
    if (action === "reject") {
      const [rows] = await pool.query(
        `SELECT equipmentID FROM ${table} WHERE ${column} = ?`,
        [id]
      );
      if (rows.length > 0) {
        const equipmentID = rows[0].equipmentID;
        await pool.query(
          "UPDATE equipment SET status = 'Available' WHERE id = ?",
          [equipmentID]
        );
      }
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
