import { CalendarDay } from "../types";

// Static list of major Indian holidays for 2026
// In a real production app, this might come from an API or a more complex admin interface
export const INDIAN_HOLIDAYS_2026: { date: string; reason: string }[] = [
    { date: "2026-01-26", reason: "Republic Day" },
    { date: "2026-03-05", reason: "Holi" },
    { date: "2026-03-30", reason: "Eid-ul-Fitr" },
    { date: "2026-04-14", reason: "Ambedkar Jayanti" },
    { date: "2026-08-15", reason: "Independence Day" },
    { date: "2026-10-02", reason: "Gandhi Jayanti" },
    { date: "2026-10-20", reason: "Dussehra" },
    { date: "2026-11-08", reason: "Diwali" },
    { date: "2026-12-25", reason: "Christmas" },
];

export const getHoliday = (date: Date): string | null => {
    const dateString = date.toISOString().split("T")[0];
    const holiday = INDIAN_HOLIDAYS_2026.find((h) => h.date === dateString);
    return holiday ? holiday.reason : null;
};
