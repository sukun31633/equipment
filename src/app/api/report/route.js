// src/app/api/report/route.js

import { NextResponse } from "next/server";
import pool from "../../../../lib/mysql";
import dayjs from "dayjs";

export async function GET(req) {
  try {
    const url  = new URL(req.url);
    const span = parseInt(url.searchParams.get("span") || "6", 10);
    const unit = url.searchParams.get("unit") || "month";
    const type = url.searchParams.get("type") || "monthlyUsage";

    // เพิ่ม array ของสถานะที่ต้องการกรอง
    const STATUSES = ["Borrowed", "Overdue", "Returned"];

    // ฟังก์ชันสร้างเงื่อนไข SQL สำหรับกรอง status
    const statusPlaceholder = STATUSES.map(() => "?").join(",");
    const statusParams = [...STATUSES];

    // UNION ALL subquery จะกลายเป็น:
    // SELECT equipmentID, startDate AS dt FROM borrowing WHERE status IN (...) AND startDate >= ?
    // UNION ALL
    // SELECT equipmentID, startDate AS dt FROM reservation WHERE status IN (...) AND startDate >= ?

    if (type === "topEquipmentAll") {
      const SPANS = [
        { label: "1 วัน",   value: 1, unit: "day" },
        { label: "1 สัปดาห์", value: 1, unit: "week" },
        { label: "1 เดือน",   value: 1, unit: "month" },
        { label: "3 เดือน",   value: 3, unit: "month" },
        { label: "6 เดือน",   value: 6, unit: "month" },
        { label: "12 เดือน",  value: 12, unit: "month" },
      ];

      const result = {};
      for (const opt of SPANS) {
        const since = dayjs()
          .subtract(opt.value, opt.unit)
          .format("YYYY-MM-DD");

        const sql = `
          SELECT
            e.id             AS equipmentID,
            e.name           AS equipmentName,
            e.equipment_code AS equipmentCode,
            COUNT(*)         AS usageCount
          FROM (
            SELECT equipmentID, startDate AS dt
            FROM borrowing
            WHERE status IN (${statusPlaceholder})
              AND startDate >= ?
            UNION ALL
            SELECT equipmentID, startDate AS dt
            FROM reservation
            WHERE status IN (${statusPlaceholder})
              AND startDate >= ?
          ) AS t
          JOIN equipment e
            ON t.equipmentID = e.id
          GROUP BY e.id, e.name, e.equipment_code
          ORDER BY usageCount DESC
        `;

        // parameters: [ ...STATUSES, since, ...STATUSES, since ]
        const params = [...statusParams, since, ...statusParams, since];
        const [rows] = await pool.query(sql, params);

        result[opt.label] = rows.map(r => ({
          equipmentID:   r.equipmentID,
          equipmentName: r.equipmentName,
          equipmentCode: r.equipmentCode,
          usageCount:    r.usageCount,
        }));
      }

      return NextResponse.json({ success: true, data: result });
    }

    if (type === "topEquipment") {
      const since = dayjs().subtract(span, unit).format("YYYY-MM-DD");

      const sql = `
        SELECT
          e.id             AS equipmentID,
          e.name           AS equipmentName,
          e.equipment_code AS equipmentCode,
          COUNT(*)         AS usageCount
        FROM (
          SELECT equipmentID, startDate AS dt
          FROM borrowing
          WHERE status IN (${statusPlaceholder})
            AND startDate >= ?
          UNION ALL
          SELECT equipmentID, startDate AS dt
          FROM reservation
          WHERE status IN (${statusPlaceholder})
            AND startDate >= ?
        ) AS t
        JOIN equipment e
          ON t.equipmentID = e.id
        GROUP BY e.id, e.name, e.equipment_code
        ORDER BY usageCount DESC
        LIMIT 10
      `;

      const params = [...statusParams, since, ...statusParams, since];
      const [rows] = await pool.query(sql, params);

      const data = rows.map(r => ({
        equipmentID:   r.equipmentID,
        equipmentName: r.equipmentName,
        equipmentCode: r.equipmentCode,
        usageCount:    r.usageCount,
      }));
      return NextResponse.json({ success: true, data });
    }

    if (type === "monthlyUsage") {
      const since = dayjs().subtract(span, unit).format("YYYY-MM-DD");

      const sql = `
        SELECT
          DATE_FORMAT(dt, "%Y-%m") AS month,
          COUNT(*)                AS totalUsage
        FROM (
          SELECT startDate AS dt
          FROM borrowing
          WHERE status IN (${statusPlaceholder})
            AND startDate >= ?
          UNION ALL
          SELECT startDate AS dt
          FROM reservation
          WHERE status IN (${statusPlaceholder})
            AND startDate >= ?
        ) AS t
        GROUP BY month
        ORDER BY month ASC
      `;

      const params = [...statusParams, since, ...statusParams, since];
      const [rows] = await pool.query(sql, params);

      const data = rows.map(r => ({
        month:      r.month,
        totalUsage: r.totalUsage,
      }));
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json(
      { success: false, message: "Invalid report type" },
      { status: 400 }
    );
  } catch (err) {
    console.error("Report API error:", err);
    return NextResponse.json(
      { success: false, message: "❌ ไม่สามารถดึงข้อมูลรายงานได้" },
      { status: 500 }
    );
  }
}
