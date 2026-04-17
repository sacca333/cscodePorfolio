// ==========================================================
//  app/api/technologies/route.ts
// ==========================================================

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const technologies = await prisma.technology.findMany({
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  })
  return NextResponse.json({ data: technologies })
}

