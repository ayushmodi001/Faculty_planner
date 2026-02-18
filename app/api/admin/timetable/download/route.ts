import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import FacultyGroup from '@/models/FacultyGroup';
import * as XLSX from 'xlsx';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const groups = await FacultyGroup.find({}).lean();

        if (!groups || groups.length === 0) {
            return NextResponse.json({ error: "No timetable data found" }, { status: 404 });
        }

        const workbook = XLSX.utils.book_new();

        groups.forEach((group: any) => {
            const sheetName = group.name.substring(0, 31); // Excel limit
            const timetable = group.timetable;

            if (!timetable || Object.keys(timetable).length === 0) return;

            // Prepare Data Grid
            // Header Row (Row 8 approx, let's put it at index 0 for simplicity if user just wants data, 
            // but to match format, we can add some padding)
            const wsData: any[][] = [];

            // Metadata Rows
            wsData.push(["PARUL UNIVERSITY"]);
            wsData.push(["FACULTY OF ENGINEERING & TECHNOLOGY"]);
            wsData.push([`CLASS: ${group.name}`]);
            wsData.push([]); // Empty row

            // Header
            const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
            wsData.push(["TIME", ...days]);

            // Timeslots
            // We need to find all unique time slots across all days to build the rows
            const timeSlotsSet = new Set<string>();
            Object.values(timetable).forEach((daySlots: any) => {
                if (Array.isArray(daySlots)) {
                    daySlots.forEach(s => {
                        timeSlotsSet.add(`${s.startTime}-${s.endTime}`);
                    });
                }
            });

            // Sort times
            const sortedTimes = Array.from(timeSlotsSet).sort();

            // Build Rows
            sortedTimes.forEach(timeRange => {
                const row: string[] = [timeRange];
                const [start, end] = timeRange.split('-');

                days.forEach(day => {
                    // Find slot for this day and time
                    const daySlots = timetable[day] || [];
                    const slot = daySlots.find((s: any) => s.startTime === start && s.endTime === end);

                    if (slot) {
                        // Reconstruct Format: Class:Subject:Faculty:Room
                        // e.g. 7CSE1:HPC:VT:N-204
                        // Use group.name as Class prefix
                        // If type is Break/Lunch/SelfStudy, just use Type
                        if (slot.type === 'Break' || slot.type === 'Lunch') {
                            row.push("LUNCH BREAK");
                        } else if (slot.type === 'Self Study') {
                            row.push("LIBRARY / SELF STUDY");
                        } else {
                            const parts = [
                                group.name,
                                slot.subject || 'SUB',
                                slot.facultyCode || 'FAC',
                                slot.room || ''
                            ];
                            // Filter empty parts if room is missing? No, keep structure
                            row.push(parts.join(':'));
                        }
                    } else {
                        row.push("");
                    }
                });
                wsData.push(row);
            });

            const worksheet = XLSX.utils.aoa_to_sheet(wsData);

            // simple col widths
            worksheet['!cols'] = [{ wch: 15 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 25 }];

            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        });

        const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        return new NextResponse(buf, {
            status: 200,
            headers: {
                'Content-Disposition': 'attachment; filename="Master_Timetable.xlsx"',
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
        });

    } catch (error: any) {
        console.error("Download Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
