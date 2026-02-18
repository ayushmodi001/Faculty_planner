import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import FacultyGroup from '@/models/FacultyGroup';
import * as XLSX from 'xlsx';

// Helper to parse time string "0930-1025" or "09:30-10:25" -> { startTime: "09:30", endTime: "10:25" }
function parseTimeRange(rangeStr: string) {
    if (!rangeStr) return null;
    let normalized = rangeStr.replace(/\s/g, '');

    // Handle specific format from Excel if needed (e.g. 930-1025)
    // Assuming standard HH:MM-HH:MM or HHMM-HHMM
    if (!normalized.includes('-')) return null;

    const [start, end] = normalized.split('-');

    // Normalize time to HH:MM format
    const formatTime = (t: string) => {
        if (t.includes(':')) return t;
        if (t.length === 3) return `0${t[0]}:${t.slice(1)}`; // 930 -> 09:30
        if (t.length === 4) return `${t.slice(0, 2)}:${t.slice(2)}`; // 1025 -> 10:25
        return t;
    };

    return {
        startTime: formatTime(start),
        endTime: formatTime(end)
    };
}

// Parses "7CSE1:Subject:Faculty:Room" string
function parseSlotString(cellValue: string) {
    if (!cellValue || typeof cellValue !== 'string') return null;

    const upper = cellValue.toUpperCase();
    if (upper.includes('LUNCH') || upper.includes('BREAK')) return { type: 'Break' };
    if (upper.includes('LIBRARY') || upper.includes('SELF STUDY')) return { type: 'Self Study' };
    if (upper.includes('PROJECT')) return { type: 'Project' };
    if (upper.includes('FREE')) return null;

    // Expected: Class:Subject:Faculty:Room
    // e.g. 7CSE1:HPC:AB:N-204
    const parts = cellValue.split(':');

    // Some cells might just be Subject:Faculty or just Subject
    // We try to extract as much as possible
    let subject = cellValue;
    let facultyCode = '';
    let room = '';

    if (parts.length >= 2) {
        // Heuristic: If 4 parts, it's Class:Sub:Fac:Room
        if (parts.length === 4) {
            subject = parts[1];
            facultyCode = parts[2];
            room = parts[3];
        } else if (parts.length === 3) {
            // maybe Sub:Fac:Room? or Class:Sub:Fac?
            // User provided "7CSE1:STQA:BP:A-214" (4 parts)
            // If 3 parts, let's assume Subject:Faculty:Room for now or fallback
            subject = parts[0];
            facultyCode = parts[1];
            room = parts[2];
        }
    }

    return {
        type: 'Lecture',
        subject: subject.trim(),
        facultyCode: facultyCode.trim(),
        room: room.trim()
    };
}


export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const workbook = XLSX.read(buffer, { type: 'buffer' });

        const results = [];
        const errors = [];

        // Iterate over sheets (Classes/Sections)
        for (const sheetName of workbook.SheetNames) {
            if (sheetName.toUpperCase() === 'SUMMARY') continue; // Skip summary

            try {
                const sheet = workbook.Sheets[sheetName];
                const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                // Find header row (contains "MONDAY")
                let headerRowIdx = -1;
                for (let i = 0; i < Math.min(rows.length, 20); i++) {
                    if (rows[i] && rows[i].some(cell => cell && typeof cell === 'string' && cell.toUpperCase().includes('MONDAY'))) {
                        headerRowIdx = i;
                        break;
                    }
                }

                if (headerRowIdx === -1) {
                    console.warn(`Skipping sheet ${sheetName}: No header row found.`);
                    continue;
                }

                const headers = rows[headerRowIdx].map(h => h ? h.toString().toUpperCase().trim() : '');
                const dayMap: Record<string, number> = {};
                ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].forEach(day => {
                    const idx = headers.indexOf(day);
                    if (idx !== -1) dayMap[day] = idx;
                });

                const weeklySchedule: Record<string, any[]> = {};

                // Initialize days
                Object.keys(dayMap).forEach(d => weeklySchedule[d] = []);

                // Parse rows
                for (let i = headerRowIdx + 1; i < rows.length; i++) {
                    const row = rows[i];
                    if (!row || row.length === 0) continue;

                    // Time in first column?
                    // Sometimes time is merged or empty if blocked?
                    // Let's look for time pattern in first few cols
                    let timeRange = null;
                    for (let k = 0; k < 2; k++) {
                        if (row[k] && typeof row[k] === 'string') {
                            timeRange = parseTimeRange(row[k]);
                            if (timeRange) break;
                        }
                    }

                    if (!timeRange) continue;

                    // For each day column
                    for (const [day, colIdx] of Object.entries(dayMap)) {
                        const cellContent = row[colIdx];
                        if (!cellContent) continue;

                        const slotData = parseSlotString(cellContent.toString());
                        if (slotData) {
                            weeklySchedule[day].push({
                                startTime: timeRange.startTime,
                                endTime: timeRange.endTime,
                                ...slotData
                            });
                        }
                    }
                }

                // Update or Create FacultyGroup
                // We use sheetName as the Group Name (e.g. "7CSE1")
                // Upsert logic
                const group = await FacultyGroup.findOneAndUpdate(
                    { name: sheetName },
                    {
                        $set: { timetable: weeklySchedule },
                        $addToSet: { subjects: { $each: [] } } // Could extract subjects too
                    },
                    { upsert: true, new: true }
                );

                results.push(group.name);

            } catch (err) {
                console.error(`Error processing sheet ${sheetName}:`, err);
                errors.push(sheetName);
            }
        }

        return NextResponse.json({
            success: true,
            updated: results.length,
            groups: results,
            errors: errors
        });

    } catch (error: any) {
        console.error("Upload Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
