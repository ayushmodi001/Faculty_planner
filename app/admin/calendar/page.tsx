import CalendarInterface from './CalendarInterface';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { SwissHeading } from '@/components/ui/SwissUI';

export default function CalendarPage() {
    return (
        <DashboardLayout role="Principal">
            <div className="mb-8">
                <SwissHeading>Academic Calendar Management</SwissHeading>
                <p className="text-muted-foreground">Manage holidays, exams, and important academic dates.</p>
            </div>
            <CalendarInterface readOnly={false} />
        </DashboardLayout>
    );
}
