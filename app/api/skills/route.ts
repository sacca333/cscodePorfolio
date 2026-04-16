import { NextResponse } from 'next/server'
import { prisma }       from '@/lib/prisma'
export async function GET() {
  const data = await prisma.skillGroup.findMany({
    orderBy: { order: 'asc' },
    include: {
      items: {
        orderBy: { order: 'asc' },
        include: { technology: { select: { name: true, icon: true } } },
      },
    },
  })
  return NextResponse.json({ data })
}
