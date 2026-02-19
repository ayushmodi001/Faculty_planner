import CalendarInterface from '@/app/admin/calendar/CalendarInterface';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { SwissHeading } from '@/components/ui/SwissUI';

export default function HODCalendarPage() {
    return (
        <DashboardLayout role="HOD">
            <div className="mb-8">
                <SwissHeading>Academic Calendar</SwissHeading>
                <p className="text-muted-foreground">View holidays and upcoming academic events.</p>
            </div>
            <CalendarInterface readOnly={true} />
        </DashboardLayout>
    );
}
