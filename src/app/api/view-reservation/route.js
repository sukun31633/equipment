import { NextResponse } from "next/server";
import pool from "../../../../lib/mysql";

export async function GET(req) { 
    try {
        // ✅ ดึงข้อมูลรายการจองที่รออนุมัติ และเชื่อมกับตาราง equipment
        const [result] = await pool.query(`
            SELECT 
                r.reservationID, r.reserverName, r.userID, r.startDate, r.endDate, r.status, 
                r.usageReason, r.document, r.courseCode, -- ✅ เพิ่ม courseCode
                e.name AS equipmentName, e.equipment_code, e.location, e.description, 
                e.image  -- ✅ ปรับ path รูปภาพ
            FROM reservation r
            JOIN equipment e ON r.equipmentID = e.id
            WHERE r.status = 'Pending'
            ORDER BY r.reservationID DESC
        `);

        if (result.length === 0) {
            return NextResponse.json({
                success: false,
                message: "❌ ไม่พบข้อมูลการจองที่รออนุมัติ"
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: result,
        });

    } catch (error) {
        console.error("❌ เกิดข้อผิดพลาด:", error);
        return NextResponse.json(
            { success: false, message: "❌ ไม่สามารถดึงข้อมูลการจองได้" },
            { status: 500 }
        );
    }
}
