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
            // Build Rows - Multi-line approach for better readability without text wrapping
            sortedTimes.forEach(timeRange => {
                const rowSubject: string[] = [timeRange]; // Line 1: Time + Subjects
                const rowFaculty: string[] = [""];       // Line 2: Empty Time + Faculty names
                const rowRoom: string[] = [""];          // Line 3: Empty Time + Room numbers

                const [start, end] = timeRange.split('-');

                days.forEach(day => {
                    // Convert DAY (MONDAY) to Title Case (Monday) for lookup
                    const lookupDay = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();

                    // Find slot for this day and time
                    const daySlots = timetable[lookupDay] || timetable[day] || [];
                    const slot = daySlots.find((s: any) => s.startTime === start && s.endTime === end);

                    if (slot) {
                        if (slot.type === 'Break' || slot.type === 'Lunch') {
                            rowSubject.push("LUNCH BREAK");
                            rowFaculty.push("");
                            rowRoom.push("");
                        } else if (slot.type === 'Self Study') {
                            rowSubject.push("LIBRARY / SELF STUDY");
                            rowFaculty.push("");
                            rowRoom.push("");
                        } else {
                            // Split data across 3 rows
                            rowSubject.push(slot.subject || '-');
                            rowFaculty.push(slot.faculty || '-');
                            rowRoom.push(slot.room || '-');
                        }
                    } else {
                        rowSubject.push("");
                        rowFaculty.push("");
                        rowRoom.push("");
                    }
                });

                // Add the 3 rows for restart slot
                wsData.push(rowSubject);
                wsData.push(rowFaculty);
                wsData.push(rowRoom);
                // Optional: Add an empty separator row strictly for visual spacing, but 3 rows per slot is standard enough.
            });
            const worksheet = XLSX.utils.aoa_to_sheet(wsData);

            // simpler col widths - slightly wider for subject names
            worksheet['!cols'] = [{ wch: 15 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }];

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
