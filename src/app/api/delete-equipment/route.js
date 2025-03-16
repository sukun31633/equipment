import { NextResponse } from "next/server";
import pool from "../../../../lib/mysql";

export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ success: false, message: "❌ ไม่พบ ID อุปกรณ์" }, { status: 400 });
        }

        const [result] = await pool.query("DELETE FROM equipment WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return NextResponse.json({ success: false, message: "❌ ไม่พบอุปกรณ์ที่ต้องการลบ" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "✅ ลบข้อมูลอุปกรณ์สำเร็จ" });
    } catch (error) {
        console.error("❌ เกิดข้อผิดพลาด:", error);
        return NextResponse.json({ success: false, message: "❌ ไม่สามารถลบข้อมูลได้" }, { status: 500 });
    }
}
