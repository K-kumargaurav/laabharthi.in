// src/app/api/schemes/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const scheme = await prisma.scheme.findUnique({
    where: { slug: params.slug },
  });

  if (!scheme) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(scheme);
}