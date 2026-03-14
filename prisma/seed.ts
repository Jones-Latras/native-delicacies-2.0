import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const connectionString = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ── Admin user ──
  const adminPassword = await hash("Admin123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@delicacies.ph" },
    update: {},
    create: {
      email: "admin@delicacies.ph",
      passwordHash: adminPassword,
      name: "Shop Owner",
      phone: "+639171234567",
      role: "ADMIN",
      emailVerified: true,
    },
  });
  console.log("  ✓ Admin user created");

  // ── Categories ──
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "kakanin" },
      update: {},
      create: {
        name: "Kakanin",
        slug: "kakanin",
        description: "Traditional Filipino rice cakes made from glutinous rice, coconut, and native ingredients.",
        displayOrder: 1,
        isVisible: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: "pastries" },
      update: {},
      create: {
        name: "Pastries & Baked Goods",
        slug: "pastries",
        description: "Heritage Filipino pastries influenced by Spanish and local baking traditions.",
        displayOrder: 2,
        isVisible: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: "biscuits-cookies" },
      update: {},
      create: {
        name: "Biscuits & Cookies",
        slug: "biscuits-cookies",
        description: "Crispy, buttery Filipino biscuits and cookies perfect with coffee or tsokolate.",
        displayOrder: 3,
        isVisible: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: "sweets-preserves" },
      update: {},
      create: {
        name: "Sweets & Preserves",
        slug: "sweets-preserves",
        description: "Candied fruits, jams, and traditional Filipino sweet treats.",
        displayOrder: 4,
        isVisible: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: "pasalubong-bundles" },
      update: {},
      create: {
        name: "Pasalubong Bundles",
        slug: "pasalubong-bundles",
        description: "Curated gift sets of native delicacies — perfect for sharing and gifting.",
        displayOrder: 5,
        isVisible: true,
      },
    }),
  ]);

  const [kakanin, pastries, biscuits, sweets, bundles] = categories;
  console.log("  ✓ Categories created");

  // ── Menu Items ──
  const menuItems = [
    // Kakanin
    {
      name: "Bibingka",
      slug: "bibingka",
      description: "Soft and fluffy rice cake baked in clay pots lined with banana leaves, topped with salted egg and cheese.",
      categoryId: kakanin.id,
      price: 85,
      isAvailable: true,
      isFeatured: true,
      originRegion: "Luzon",
      shelfLifeDays: 2,
      storageInstructions: "Store at room temperature. Best consumed within 24 hours. Reheat on a pan for best results.",
      heritageStory: "Bibingka has been a staple of Filipino Christmas tradition for centuries. Typically sold outside churches during Simbang Gabi (dawn masses), this rice cake represents the warmth of Filipino holiday celebrations.",
      dietaryTags: ["vegetarian"],
      preparationMinutes: 45,
      ingredients: "Glutinous rice flour, coconut milk, sugar, eggs, salted duck egg, queso de bola",
      allergenInfo: "Contains eggs, dairy",
    },
    {
      name: "Puto Bumbong",
      slug: "puto-bumbong",
      description: "Purple-hued steamed rice cake made from pirurutong (purple glutinous rice), served with butter, muscovado sugar, and grated coconut.",
      categoryId: kakanin.id,
      price: 75,
      isAvailable: true,
      isFeatured: true,
      originRegion: "Luzon",
      shelfLifeDays: 1,
      storageInstructions: "Best consumed fresh. If storing, wrap in banana leaves and refrigerate.",
      heritageStory: "Puto Bumbong gets its name from the bamboo tubes (bumbong) used to steam the rice batter. Like Bibingka, it is a beloved Christmas delicacy sold at dawn outside churches during the -ber months.",
      dietaryTags: ["vegetarian"],
      preparationMinutes: 30,
      ingredients: "Pirurutong (purple glutinous rice), butter, muscovado sugar, freshly grated coconut",
      allergenInfo: "Contains dairy",
    },
    {
      name: "Kutsinta",
      slug: "kutsinta",
      description: "Chewy, jelly-like steamed rice cake with a deep amber color, topped with freshly grated coconut.",
      categoryId: kakanin.id,
      price: 60,
      isAvailable: true,
      isFeatured: false,
      originRegion: "Luzon",
      shelfLifeDays: 2,
      storageInstructions: "Store at room temperature, covered. Consume within 2 days.",
      heritageStory: "Kutsinta is believed to have Chinese origins, brought to the Philippines through centuries of trade. Its distinctive chewy texture and lye-water flavor make it a unique treat in Filipino kakanin.",
      dietaryTags: ["vegan", "gluten-free"],
      preparationMinutes: 40,
      ingredients: "Rice flour, brown sugar, lye water, freshly grated coconut",
    },
    {
      name: "Sapin-Sapin",
      slug: "sapin-sapin",
      description: "A colorful, layered glutinous rice dessert with ube, langka (jackfruit), and coconut flavors.",
      categoryId: kakanin.id,
      price: 95,
      isAvailable: true,
      isFeatured: true,
      originRegion: "Luzon",
      shelfLifeDays: 2,
      storageInstructions: "Keep covered at room temperature. Refrigerate for longer storage.",
      heritageStory: "Sapin-Sapin, meaning 'layers' in Filipino, reflects the rich diversity of Philippine culture. Each vibrant layer represents a different flavor — ube (purple yam), langka (jackfruit), and coconut — coming together in harmony.",
      dietaryTags: ["vegetarian", "gluten-free"],
      preparationMinutes: 90,
      ingredients: "Glutinous rice flour, coconut milk, sugar, ube halaya, langka, latik",
      allergenInfo: "Contains coconut",
    },
    {
      name: "Suman sa Lihiya",
      slug: "suman-sa-lihiya",
      description: "Glutinous rice wrapped in banana leaves, cooked with lye water for a distinct flavor. Served with muscovado sugar or ripe mango.",
      categoryId: kakanin.id,
      price: 50,
      isAvailable: true,
      originRegion: "Visayas",
      shelfLifeDays: 3,
      storageInstructions: "Keep wrapped in banana leaves at room temperature for up to 3 days.",
      heritageStory: "Suman is one of the oldest rice cakes in the Philippines, with roots tracing back to pre-colonial times. Each region has its own variation, reflecting local ingredients and traditions.",
      dietaryTags: ["vegan", "gluten-free"],
      preparationMinutes: 60,
      ingredients: "Glutinous rice, lye water, banana leaves",
    },

    // Pastries
    {
      name: "Ensaymada",
      slug: "ensaymada",
      description: "Soft, buttery brioche-style bread topped with buttercream, sugar, and grated cheese.",
      categoryId: pastries.id,
      price: 120,
      isAvailable: true,
      isFeatured: true,
      originRegion: "Luzon",
      shelfLifeDays: 3,
      storageInstructions: "Store at room temperature in an airtight container. Can be refrigerated for up to 5 days.",
      heritageStory: "The Ensaymada traces its origins to the Spanish ensaimada of Mallorca. Filipino bakers elevated it with local cheese and butter, turning it into a holiday staple found in every Filipino Christmas spread.",
      dietaryTags: [],
      preparationMinutes: 120,
      ingredients: "Flour, butter, eggs, sugar, cheese, milk",
      allergenInfo: "Contains gluten, eggs, dairy",
    },
    {
      name: "Hopia Ube",
      slug: "hopia-ube",
      description: "Flaky pastry filled with sweet purple yam (ube) paste — a favorite merienda treat with Chinese-Filipino roots.",
      categoryId: pastries.id,
      price: 45,
      isAvailable: true,
      originRegion: "Luzon",
      shelfLifeDays: 5,
      storageInstructions: "Store in a cool, dry place. Seal in airtight container.",
      heritageStory: "Hopia was brought to the Philippines by Fujianese Chinese immigrants. The Filipino twist of filling it with ube (purple yam) is a testament to the creative fusion of Chinese and Filipino culinary traditions.",
      dietaryTags: ["vegetarian"],
      preparationMinutes: 90,
      ingredients: "Flour, lard, ube halaya, sugar",
      allergenInfo: "Contains gluten",
    },
    {
      name: "Empanada",
      slug: "empanada",
      description: "Crispy golden turnover filled with savory ground pork, potatoes, carrots, and raisins.",
      categoryId: pastries.id,
      price: 65,
      isAvailable: true,
      originRegion: "Luzon",
      shelfLifeDays: 2,
      storageInstructions: "Best consumed fresh. Refrigerate and reheat in oven for crispiness.",
      heritageStory: "A beloved snack inherited from Spanish colonial cuisine, Filipino empanadas evolved with local fillings like longganisa, egg, and papaya — particularly the famous Vigan empanada of Ilocos.",
      dietaryTags: [],
      preparationMinutes: 60,
      ingredients: "Flour, ground pork, potatoes, carrots, raisins, onions, garlic",
      allergenInfo: "Contains gluten",
    },

    // Biscuits & Cookies
    {
      name: "Broas (Ladyfingers)",
      slug: "broas",
      description: "Light, spongy Filipino ladyfingers dusted with powdered sugar — a classic merienda treat.",
      categoryId: biscuits.id,
      price: 90,
      isAvailable: true,
      originRegion: "Luzon",
      shelfLifeDays: 7,
      storageInstructions: "Store in airtight container at room temperature.",
      heritageStory: "Broas are the Filipino version of European ladyfingers, introduced during the Spanish era. They became a beloved merienda staple, perfect paired with hot tsokolate or coffee.",
      dietaryTags: ["vegetarian"],
      preparationMinutes: 45,
      ingredients: "Eggs, sugar, flour, powdered sugar",
      allergenInfo: "Contains eggs, gluten",
    },
    {
      name: "Otap",
      slug: "otap",
      description: "Thin, oval-shaped, flaky puff pastry cookies from Cebu — crunchy and lightly sweet.",
      categoryId: biscuits.id,
      price: 110,
      isAvailable: true,
      isFeatured: true,
      originRegion: "Visayas",
      shelfLifeDays: 14,
      storageInstructions: "Keep in airtight container to maintain crispness.",
      heritageStory: "Otap is Cebu's most iconic pasalubong (souvenir treat). These delicate puff pastry cookies have been handcrafted by Cebuano bakers for generations, with recipes passed down within families.",
      dietaryTags: ["vegetarian"],
      preparationMinutes: 120,
      ingredients: "Flour, sugar, shortening, salt",
      allergenInfo: "Contains gluten",
    },

    // Sweets & Preserves
    {
      name: "Yema",
      slug: "yema",
      description: "Creamy candy balls made from condensed milk and egg yolks, wrapped in colorful cellophane.",
      categoryId: sweets.id,
      price: 70,
      isAvailable: true,
      originRegion: "Luzon",
      shelfLifeDays: 7,
      storageInstructions: "Store in a cool, dry place.",
      heritageStory: "Yema (from Spanish 'yolk') was born out of resourcefulness — Filipino bakers used leftover egg yolks from church construction (egg whites were mixed into mortar) to create this beloved candy.",
      dietaryTags: ["vegetarian", "gluten-free"],
      preparationMinutes: 20,
      ingredients: "Condensed milk, egg yolks, butter, vanilla",
      allergenInfo: "Contains eggs, dairy",
    },
    {
      name: "Pastillas de Leche",
      slug: "pastillas-de-leche",
      description: "Soft, milky candies rolled in sugar, made from carabao's milk — a heritage sweet from Bulacan.",
      categoryId: sweets.id,
      price: 80,
      isAvailable: true,
      originRegion: "Luzon",
      shelfLifeDays: 10,
      storageInstructions: "Keep in a cool, dry place. Refrigerate for longer shelf life.",
      heritageStory: "Pastillas trace back to Bulacan province, where carabao milk was abundant. The art of wrapping each piece in delicate papel de hapon (Japanese paper) with intricate cuts has become a folk art form.",
      dietaryTags: ["vegetarian", "gluten-free"],
      preparationMinutes: 30,
      ingredients: "Fresh carabao milk, sugar, powdered milk",
      allergenInfo: "Contains dairy",
    },
    {
      name: "Ube Halaya",
      slug: "ube-halaya",
      description: "Rich, creamy purple yam jam — a versatile Filipino staple used as spread, filling, or eaten on its own.",
      categoryId: sweets.id,
      price: 150,
      isAvailable: true,
      isFeatured: true,
      originRegion: "Luzon",
      shelfLifeDays: 7,
      storageInstructions: "Refrigerate after opening. Consume within 7 days.",
      heritageStory: "Ube (purple yam) is one of the Philippines' most iconic ingredients, now celebrated worldwide. Ube Halaya is the foundational preparation — slowly cooked with coconut milk and butter until thick and vibrant.",
      dietaryTags: ["vegetarian", "gluten-free"],
      preparationMinutes: 120,
      ingredients: "Purple yam, coconut milk, condensed milk, butter, vanilla",
      allergenInfo: "Contains dairy",
    },

    // Pasalubong Bundles
    {
      name: "Heritage Sampler Box",
      slug: "heritage-sampler-box",
      description: "A curated collection of 6 classic Filipino delicacies — perfect introduction to native treats. Includes Bibingka, Kutsinta, Otap, Yema, Pastillas, and Suman.",
      categoryId: bundles.id,
      price: 450,
      isAvailable: true,
      isFeatured: true,
      originRegion: "Luzon",
      shelfLifeDays: 3,
      storageInstructions: "Consume perishable items within 2 days. Packaged items last longer — check individual labels.",
      heritageStory: "This sampler represents the heart of Filipino merienda culture — a tradition of afternoon snacking that brings families together over sweet treats and warm drinks.",
      dietaryTags: [],
      preparationMinutes: 30,
      ingredients: "Assorted (see individual items)",
    },
    {
      name: "Sweet Tooth Gift Set",
      slug: "sweet-tooth-gift-set",
      description: "For those with a sweet tooth — Ube Halaya, Yema, Pastillas de Leche, and Sapin-Sapin beautifully packaged in a keepsake box.",
      categoryId: bundles.id,
      price: 380,
      isAvailable: true,
      originRegion: "Luzon",
      shelfLifeDays: 5,
      storageInstructions: "Refrigerate perishable items. Room temperature for candies.",
      heritageStory: "Filipino gifting culture revolves around pasalubong — bringing home treats to share with loved ones. This set captures the sweetest side of that tradition.",
      dietaryTags: ["vegetarian", "gluten-free"],
      preparationMinutes: 15,
      ingredients: "Assorted (see individual items)",
      allergenInfo: "Contains dairy, eggs",
    },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { slug: item.slug },
      update: {},
      create: item,
    });
  }
  console.log(`  ✓ ${menuItems.length} menu items created`);

  // ── Menu Item Options (sizes & add-ons for select items) ──
  const bibingka = await prisma.menuItem.findUnique({ where: { slug: "bibingka" } });
  const ensaymada = await prisma.menuItem.findUnique({ where: { slug: "ensaymada" } });
  const heritageBox = await prisma.menuItem.findUnique({ where: { slug: "heritage-sampler-box" } });

  if (bibingka) {
    await prisma.menuItemOption.createMany({
      data: [
        { menuItemId: bibingka.id, optionGroup: "Size", name: "Regular", priceModifier: 0, displayOrder: 1 },
        { menuItemId: bibingka.id, optionGroup: "Size", name: "Large", priceModifier: 35, displayOrder: 2 },
        { menuItemId: bibingka.id, optionGroup: "Toppings", name: "Extra Salted Egg", priceModifier: 20, displayOrder: 1 },
        { menuItemId: bibingka.id, optionGroup: "Toppings", name: "Extra Cheese", priceModifier: 15, displayOrder: 2 },
      ],
      skipDuplicates: true,
    });
  }

  if (ensaymada) {
    await prisma.menuItemOption.createMany({
      data: [
        { menuItemId: ensaymada.id, optionGroup: "Size", name: "Regular", priceModifier: 0, displayOrder: 1 },
        { menuItemId: ensaymada.id, optionGroup: "Size", name: "Premium (Queso de Bola)", priceModifier: 80, displayOrder: 2 },
      ],
      skipDuplicates: true,
    });
  }

  if (heritageBox) {
    await prisma.menuItemOption.createMany({
      data: [
        { menuItemId: heritageBox.id, optionGroup: "Box Size", name: "6 Pieces (Standard)", priceModifier: 0, displayOrder: 1 },
        { menuItemId: heritageBox.id, optionGroup: "Box Size", name: "12 Pieces (Large)", priceModifier: 380, displayOrder: 2 },
        { menuItemId: heritageBox.id, optionGroup: "Add-On", name: "Gift Wrapping", priceModifier: 50, displayOrder: 1 },
        { menuItemId: heritageBox.id, optionGroup: "Add-On", name: "Personalized Card", priceModifier: 30, displayOrder: 2 },
      ],
      skipDuplicates: true,
    });
  }
  console.log("  ✓ Menu item options created");

  // ── Business Settings ──
  await prisma.businessSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      businessName: "Filipino Native Delicacies",
      phone: "+639171234567",
      email: "hello@delicacies.ph",
      address: {
        street: "123 Heritage Street",
        city: "Quezon City",
        state: "Metro Manila",
        postalCode: "1100",
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
        { name: "Quezon City", maxDistance: 10, fee: 50 },
        { name: "Metro Manila", maxDistance: 25, fee: 100 },
        { name: "Greater Manila Area", maxDistance: 50, fee: 200 },
      ],
      deliveryFee: 50,
      minimumOrder: 200,
      freeDeliveryThreshold: 1500,
      isAcceptingOrders: true,
      taxRate: 12,
      timezone: "Asia/Manila",
      aboutText:
        "We are passionate about preserving and sharing the rich culinary heritage of the Philippines through our native delicacies. Every product is handcrafted using traditional recipes passed down through generations, using only the finest local ingredients.",
    },
  });
  console.log("  ✓ Business settings created");

  // ── Sample Promo Code ──
  await prisma.promoCode.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minOrderAmount: 500,
      maxDiscount: 200,
      isActive: true,
      usageLimit: 100,
    },
  });

  await prisma.promoCode.upsert({
    where: { code: "PASALUBONG50" },
    update: {},
    create: {
      code: "PASALUBONG50",
      discountType: "FIXED",
      discountValue: 50,
      minOrderAmount: 300,
      isActive: true,
    },
  });
  console.log("  ✓ Promo codes created");

  console.log("\n✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
