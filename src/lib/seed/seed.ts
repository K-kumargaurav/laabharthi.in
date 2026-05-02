// src/lib/seed/seed.ts
// One-time seed script to populate the database with initial scheme data.
// Run with: npx tsx src/lib/seed/seed.ts

import { PrismaClient } from "@prisma/client";
import { SchemeLevel } from "@prisma/client";
import schemesData from "./schemes.json";

const prisma = new PrismaClient({
  log: ["error"],
});

interface SchemeJson {
  slug: string;
  sourceUrl: string;
  name: string;
  nameHindi?: string;
  description: string;
  ministry: string;
  level: string;
  eligibilityCriteria: Record<string, unknown>;
  benefits: string[];
  applicationProcess: string[];
  requiredDocuments: string[];
  tags: string[];
  applicationUrl?: string;
  applicationMode: string[];
  isActive: boolean;
}

async function seed() {
  console.log("🌱 Starting seed...");

  let created = 0;
  let updated = 0;
  let failed = 0;

  for (const scheme of schemesData as SchemeJson[]) {
    try {
      const result = await prisma.scheme.upsert({
        where: { slug: scheme.slug },
        update: {
          name: scheme.name,
          nameHindi: scheme.nameHindi,
          description: scheme.description,
          ministry: scheme.ministry,
          level: scheme.level as SchemeLevel,
          eligibilityCriteria: scheme.eligibilityCriteria,
          benefits: scheme.benefits,
          applicationProcess: scheme.applicationProcess,
          requiredDocuments: scheme.requiredDocuments,
          tags: scheme.tags,
          applicationUrl: scheme.applicationUrl,
          applicationMode: scheme.applicationMode,
          sourceUrl: scheme.sourceUrl,
          isActive: scheme.isActive,
          lastFetchedAt: new Date(),
        },
        create: {
          slug: scheme.slug,
          sourceUrl: scheme.sourceUrl,
          name: scheme.name,
          nameHindi: scheme.nameHindi,
          description: scheme.description,
          ministry: scheme.ministry,
          level: scheme.level as SchemeLevel,
          eligibilityCriteria: scheme.eligibilityCriteria,
          benefits: scheme.benefits,
          applicationProcess: scheme.applicationProcess,
          requiredDocuments: scheme.requiredDocuments,
          tags: scheme.tags,
          applicationUrl: scheme.applicationUrl,
          applicationMode: scheme.applicationMode,
          isActive: scheme.isActive,
          lastFetchedAt: new Date(),
        },
      });

      // Upsert returns the record — check if it was just created
      const isNew = result.createdAt.getTime() === result.updatedAt.getTime();
      if (isNew) {
        created++;
        console.log(`✓ Created: ${scheme.name}`);
      } else {
        updated++;
        console.log(`↻ Updated: ${scheme.name}`);
      }
    } catch (err) {
      failed++;
      console.error(`✗ Failed: ${scheme.name}`, err);
    }
  }

  console.log(`\n✅ Seed complete`);
  console.log(`   Created: ${created}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Failed:  ${failed}`);
  console.log(`   Total:   ${schemesData.length}`);
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });