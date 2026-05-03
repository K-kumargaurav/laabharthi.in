// src/app/api/applications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Schema = z.object({
  schemeSlug: z.string(),
  formData: z.record(z.string(), z.unknown()),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof Schema>;
  try {
    body = Schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const scheme = await prisma.scheme.findUnique({
    where: { slug: body.schemeSlug },
  });

  if (!scheme) {
    return NextResponse.json({ error: "Scheme not found" }, { status: 404 });
  }

  const application = await prisma.application.upsert({
    where: {
      userId_schemeId: {
        userId: session.user.id,
        schemeId: scheme.id,
      },
    },
    update: {
      formData: body.formData as object,
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
    create: {
      userId: session.user.id,
      schemeId: scheme.id,
      formData: body.formData as object,
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true, applicationId: application.id });
}