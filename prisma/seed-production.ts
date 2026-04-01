import { config as loadEnv } from "dotenv";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import { getDefaultAboutPageContent, serializeAboutPageContent } from "../src/lib/about-content";

loadEnv({ path: ".env.local" });
loadEnv();

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "latrasjones@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "TWILIGHTplayZ123";
const ADMIN_NAME = process.env.ADMIN_NAME || "Jones Latras";
const ADMIN_PHONE = process.env.ADMIN_PHONE || "09857653360";

async function main() {
  console.log("Production seeding...\n");

  if (ADMIN_PASSWORD === "CHANGE_ME_BEFORE_PRODUCTION") {
    console.warn("WARNING: Using default admin password. Set ADMIN_PASSWORD env var for production.\n");
  }

  const passwordHash = await hash(ADMIN_PASSWORD, 12);
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { passwordHash, name: ADMIN_NAME, phone: ADMIN_PHONE, role: "ADMIN" },
    create: {
      email: ADMIN_EMAIL,
      passwordHash,
      name: ADMIN_NAME,
      phone: ADMIN_PHONE,
      role: "ADMIN",
      emailVerified: true,
    },
  });
  console.log(`  - Admin user: ${ADMIN_EMAIL}`);

  await prisma.businessSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      businessName: "J&J Native Delicacies",
      phone: ADMIN_PHONE,
      email: ADMIN_EMAIL,
      address: {
        street: "Your Street Address",
        city: "Your City",
        state: "Your Province",
        postalCode: "0000",
      },
      operatingHours: {
        monday: { isClosed: false, slots: [{ open: "08:00", close: "20:00" }] },
        tuesday: { isClosed: false, slots: [{ open: "08:00", close: "20:00" }] },
        wednesday: { isClosed: false, slots: [{ open: "08:00", close: "20:00" }] },
        thursday: { isClosed: false, slots: [{ open: "08:00", close: "20:00" }] },
        friday: { isClosed: false, slots: [{ open: "08:00", close: "21:00" }] },
        saturday: { isClosed: false, slots: [{ open: "09:00", close: "21:00" }] },
        sunday: { isClosed: false, slots: [{ open: "09:00", close: "18:00" }] },
      },
      deliveryZones: [
        { name: "Local Area", maxDistance: 10, fee: 50 },
        { name: "Wider Area", maxDistance: 25, fee: 100 },
      ],
      deliveryFee: 50,
      minimumOrder: 200,
      freeDeliveryThreshold: 1500,
      isAcceptingOrders: false,
      taxRate: 12,
      timezone: "Asia/Manila",
    },
  });
  console.log("  - Business settings created");

  const categories = [
    { name: "Kakanin", slug: "kakanin", description: "Traditional Filipino rice cakes", displayOrder: 1 },
    { name: "Pastries & Baked Goods", slug: "pastries", description: "Heritage Filipino pastries", displayOrder: 2 },
    { name: "Biscuits & Cookies", slug: "biscuits-cookies", description: "Filipino biscuits and cookies", displayOrder: 3 },
    { name: "Sweets & Preserves", slug: "sweets-preserves", description: "Traditional Filipino sweet treats", displayOrder: 4 },
    { name: "Pasalubong Bundles", slug: "pasalubong-bundles", description: "Curated gift sets of J&J Native Delicacies", displayOrder: 5 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { ...cat, isVisible: true },
    });
  }
  console.log(`  - ${categories.length} default categories`);

  const defaultAboutPage = getDefaultAboutPageContent();
  const existingAboutPage = await prisma.contentPage.findUnique({
    where: { slug: "about" },
    select: { slug: true },
  });

  if (!existingAboutPage) {
    await prisma.contentPage.create({
      data: {
        slug: "about",
        title: defaultAboutPage.title,
        content: serializeAboutPageContent(defaultAboutPage),
      },
    });
    console.log("  - About page content created");
  } else {
    console.log("  - About page content already exists");
  }

  console.log("\nProduction seed complete.");
  console.log("\nNext steps:");
  console.log("  1. Log in to admin dashboard and update business settings");
  console.log("  2. Add your real menu items with photos via admin panel");
  console.log("  3. Enable order acceptance when ready to go live");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
