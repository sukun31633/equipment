import { NextResponse } from "next/server"; 
import pool from "../../../../lib/mysql";

export async function GET(req) { 
    try {
        // ดึงข้อมูลรายการยืมที่รออนุมัติ และเชื่อมกับตาราง equipment
        const [result] = await pool.query(`
            SELECT 
                b.borrowID, b.borrowerName, b.userID, b.dueDate, b.status, 
                b.usageReason, b.document, b.courseCode,  -- ✅ เพิ่ม courseCode
                e.name AS equipmentName, e.equipment_code, e.location, e.description, e.image 
            FROM borrowing b
            JOIN equipment e ON b.equipmentID = e.id
            WHERE b.status = 'Pending'
        `);

        if (result.length === 0) {
            return NextResponse.json({
                success: false,
                message: "ไม่มีข้อมูลการยืมที่รออนุมัติ"
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: result,
        });

    } catch (error) {
        console.error("❌ เกิดข้อผิดพลาด:", error);
        return NextResponse.json(
            { success: false, message: "❌ ไม่สามารถดึงข้อมูลการยืมได้" },
            { status: 500 }
        );
    }
}
