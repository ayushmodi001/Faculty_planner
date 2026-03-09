import CalendarInterface from './CalendarInterface';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function CalendarPage() {
    return (
        <DashboardLayout role="Admin">
            <div className="mb-8 space-y-1">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Academic Calendar</h1>
                <p className="text-slate-500 text-sm">Manage holidays, exams, and important academic dates.</p>
            </div>
            <CalendarInterface readOnly={false} />
        </DashboardLayout>
    );
}
