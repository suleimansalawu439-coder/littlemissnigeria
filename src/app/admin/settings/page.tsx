import { prisma } from '@/lib/prisma';
import EventSettingsForm from '@/components/admin/EventSettingsForm';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const event = await prisma.event.findFirst({
    where: { isActive: true },
  });

  const contestantCount = event 
    ? await prisma.contestant.count({ where: { eventId: event.id } })
    : 0;

  const serialized = event
    ? {
        id: event.id,
        title: event.title,
        description: event.description || '',
        startDate: event.startDate.toISOString().slice(0, 16),
        endDate: event.endDate.toISOString().slice(0, 16),
        isActive: event.isActive,
        contestantCount: contestantCount,
      }
    : null;

  return <EventSettingsForm initialEvent={serialized} />;
}
