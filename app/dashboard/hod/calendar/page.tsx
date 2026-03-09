import CalendarInterface from '@/app/admin/calendar/CalendarInterface';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function HODCalendarPage() {
    return (
        <DashboardLayout role="HOD">
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Academic Calendar</h1>                    <p className="text-slate-500 text-sm">Manage institute holidays and scheduled academic events.</p>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden p-2">
                    <CalendarInterface readOnly={false} />
                </div>
            </div>
        </DashboardLayout>
    );
}
