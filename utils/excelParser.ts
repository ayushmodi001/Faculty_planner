import * as XLSX from 'xlsx';
import { IFacultyGroup, ISlot } from '@/models/FacultyGroup';

// Helper to parse time string "09:30-10:25" -> { startTime: "09:30", endTime: "10:25" }
function parseTimeRange(rangeStr: string): { startTime: string, endTime: string } | null {
    if (!rangeStr) return null;
    const parts = rangeStr.split('-');
    if (parts.length !== 2) return null;
    return {
        startTime: parts[0].trim(),
        endTime: parts[1].trim()
    };
}

// Parses the "7CSE1:HPC:AB:N-204" string
// Returns { subject, facultyCode, room }
function parseSlotString(cellValue: string, className: string) {
    if (!cellValue || typeof cellValue !== 'string') return null;

    // Handle common non-lecture slots
    const upper = cellValue.toUpperCase();
    if (upper.includes('LUNCH') || upper.includes('BREAK')) return { type: 'Break' };
    if (upper.includes('LIBRARY') || upper.includes('SELF STUDY')) return { type: 'Self Study' };
    if (upper.includes('PROJECT')) return { type: 'Project' };

    // Expected format: Class:Subject:Faculty:Room
    // e.g. 7CSE1:HPC:AB:N-204
    // Sometimes it might not have class prefix if it's implicit? But likely explicit based on file.

    const parts = cellValue.split(':');
    if (parts.length >= 3) {
        // parts[0] is Class (7CSE1) - we can verify or ignore
        const subject = parts[1];
        const facultyCode = parts[2];
        const room = parts[3] || '';

        return {
            type: 'Lecture',
            subject,
            facultyCode,
            room
        };
    }

    // Fallback?
    return { type: 'Lecture', subject: cellValue, room: '' };
}

export function parseMasterTimetable(buffer: Buffer) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const result_timetables: Record<string, any> = {}; // grouped by Class Name (Sheet Name)

    workbook.SheetNames.forEach(sheetName => {
        // Skip Summary or non-class sheets if any
        if (sheetName.toUpperCase() === 'SUMMARY') return;

        const sheet = workbook.Sheets[sheetName];
        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Find the header row (contains "MONDAY")
        let headerRowIdx = -1;
        for (let i = 0; i < Math.min(rows.length, 20); i++) {
            if (rows[i] && rows[i].some(cell => cell && typeof cell === 'string' && cell.toUpperCase().includes('MONDAY'))) {
                headerRowIdx = i;
                break;
            }
        }

        if (headerRowIdx === -1) return; // Skip if no header found

        const headers = rows[headerRowIdx].map(h => h ? h.toString().toUpperCase().trim() : '');
        const dayIndices: Record<string, number> = {};

        ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].forEach(day => {
            const idx = headers.indexOf(day);
            if (idx !== -1) dayIndices[day] = idx;
        });

        const weeklySchedule: Record<string, ISlot[]> = {};

        // Iterate over time rows
        for (let i = headerRowIdx + 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0) continue;

            // Time is usually in column 0 or 1. Let's assume Col 0 based on analysis.
            const timeCell = row[0];
            const timeRange = parseTimeRange(timeCell);

            if (!timeRange) continue; // Skip if no valid time

            // Check each day
            for (const [day, colIdx] of Object.entries(dayIndices)) {
                const cellContent = row[colIdx];
                if (!cellContent) continue;

                const slotInfo = parseSlotString(cellContent, sheetName);
                if (slotInfo) {
                    if (!weeklySchedule[day]) weeklySchedule[day] = [];

                    weeklySchedule[day].push({
                        startTime: timeRange.startTime,
                        endTime: timeRange.endTime,
                        room: slotInfo.room,
                        //@ts-ignore
                        subject: slotInfo.subject,
                        //@ts-ignore
                        facultyCode: slotInfo.facultyCode,
                        //@ts-ignore
                        type: slotInfo.type
                    });
                }
            }
        }

        result_timetables[sheetName] = weeklySchedule;
    });

    return result_timetables;
}
