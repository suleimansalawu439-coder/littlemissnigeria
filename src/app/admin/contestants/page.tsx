import { prisma } from '@/lib/prisma';
import ContestantManager from '@/components/admin/ContestantManager';

export const dynamic = 'force-dynamic';

export default async function AdminContestantsPage() {
  const contestants = await prisma.contestant.findMany({
    orderBy: { totalVotes: 'desc' },
    include: {
      event: { select: { title: true } },
    },
  });

  const serialized = contestants.map((c: any) => ({
    id: c.id,
    name: c.name,
    bio: c.bio,
    imageUrl: c.imageUrl,
    totalVotes: c.totalVotes,
    eventTitle: c.event.title,
  }));

  return <ContestantManager initialContestants={serialized} />;
}
