import { NextResponse } from 'next/server'
import { prisma }       from '@/lib/prisma'
export async function GET() {
  const data = await prisma.experience.findMany({
    orderBy: [{ current: 'desc' }, { order: 'asc' }],
  })
  return NextResponse.json({ data })
}
