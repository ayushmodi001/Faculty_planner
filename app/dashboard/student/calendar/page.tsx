import CalendarInterface from '@/app/admin/calendar/CalendarInterface';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { SwissHeading } from '@/components/ui/SwissUI';

export default function StudentCalendarPage() {
    return (
        <DashboardLayout role="Student">
            <div className="mb-8">
                <SwissHeading>Academic Calendar</SwissHeading>
                <p className="text-muted-foreground">Key dates for the semester.</p>
            </div>
            <CalendarInterface readOnly={true} />
        </DashboardLayout>
    );
}
