import { CalendarDay } from "../types";

// Static list of major Indian holidays for 2026
// In a real production app, this might come from an API or a more complex admin interface
export const INDIAN_HOLIDAYS_2026: { date: string; reason: string }[] = [
    { date: "2026-01-14", reason: "Makar Sankranti / Pongal" },
    { date: "2026-01-26", reason: "Republic Day" },
    { date: "2026-02-12", reason: "Vasant Panchami" },
    { date: "2026-02-18", reason: "Maha Shivaratri" },
    { date: "2026-03-05", reason: "Holi" },
    { date: "2026-03-30", reason: "Eid-ul-Fitr (Ramzan Eid)" },
    { date: "2026-04-03", reason: "Good Friday" },
    { date: "2026-04-14", reason: "Ambedkar Jayanti" },
    { date: "2026-04-20", reason: "Ram Navami" },
    { date: "2026-04-24", reason: "Mahavir Jayanti" },
    { date: "2026-05-18", reason: "Buddha Purnima" },
    { date: "2026-06-27", reason: "Bakrid (Eid-al-Adha)" },
    { date: "2026-07-28", reason: "Muharram" },
    { date: "2026-08-15", reason: "Independence Day" },
    { date: "2026-08-28", reason: "Raksha Bandhan" },
    { date: "2026-09-04", reason: "Janmashtami" },
    { date: "2026-09-17", reason: "Ganesh Chaturthi" },
    { date: "2026-10-02", reason: "Gandhi Jayanti" },
    { date: "2026-10-20", reason: "Dussehra (Vijayadashami)" },
    { date: "2026-11-08", reason: "Diwali" },
    { date: "2026-11-09", reason: "Govardhan Puja" },
    { date: "2026-11-10", reason: "Bhai Dooj" },
    { date: "2026-11-24", reason: "Guru Nanak Jayanti" },
    { date: "2026-12-25", reason: "Christmas" },
];

export const getHoliday = (date: Date): string | null => {
    const dateString = date.toISOString().split("T")[0];
    const holiday = INDIAN_HOLIDAYS_2026.find((h) => h.date === dateString);
    return holiday ? holiday.reason : null;
};
