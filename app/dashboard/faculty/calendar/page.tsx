import CalendarInterface from '@/app/admin/calendar/CalendarInterface';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function FacultyCalendarPage() {
    return (
        <DashboardLayout role="Faculty">
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Academic Calendar</h1>
                    <p className="text-slate-500 text-sm">View holidays and upcoming academic events.</p>
                </div>
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden p-2">
                    <CalendarInterface readOnly={true} />
                </div>
            </div>
        </DashboardLayout>
    );
}
