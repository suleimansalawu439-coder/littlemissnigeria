import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  const contestants = await prisma.contestant.findMany();
  const sum = contestants.reduce((acc, c) => acc + c.totalVotes, 0);
  console.log('Total Votes in DB (Contestants Table):', sum);

  const payments = await prisma.payment.findMany({ where: { status: 'SUCCESS' } });
  const paymentSum = payments.reduce((acc, p) => acc + p.votesAdded, 0);
  console.log('Total Votes in DB (Payments Table):', paymentSum);
}

main().finally(() => prisma.$disconnect());
