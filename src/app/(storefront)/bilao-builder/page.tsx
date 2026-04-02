import { prisma } from "@/lib/prisma";
import { BilaoBuilderClient } from "./bilao-builder-client";
import type { MenuItem } from "@/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bilao Builder",
  description: "Build your own custom bilao platter with your favorite Filipino kakanin and delicacies.",
};

async function getBilaoBuilderItems(): Promise<MenuItem[]> {
  let items;

  try {
    items = await prisma.menuItem.findMany({
      where: {
        isAvailable: true,
        category: { isVisible: true },
      },
      include: {
        category: true,
        options: { orderBy: { displayOrder: "asc" } },
      },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Failed to load bilao items", error);
    return [];
  }

  return items
    .filter((item) => item.dailyLimit == null || item.soldToday < item.dailyLimit)
    .map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description,
      category: {
        id: item.category.id,
        name: item.category.name,
        slug: item.category.slug,
        displayOrder: item.category.displayOrder,
        isVisible: item.category.isVisible,
        imageUrl: item.category.imageUrl ?? undefined,
      },
      price: Number(item.price),
      imageUrl: item.imageUrl ?? undefined,
      isAvailable: item.isAvailable,
      isFeatured: item.isFeatured,
      originRegion: item.originRegion as MenuItem["originRegion"],
      shelfLifeDays: item.shelfLifeDays ?? undefined,
      storageInstructions: item.storageInstructions ?? undefined,
      heritageStory: item.heritageStory ?? undefined,
      dietaryTags: item.dietaryTags,
      preparationMinutes: item.preparationMinutes ?? undefined,
      ingredients: item.ingredients ?? undefined,
      allergenInfo: item.allergenInfo ?? undefined,
      dailyLimit: item.dailyLimit,
      soldToday: item.soldToday,
      stockLeft: item.dailyLimit == null ? null : Math.max(item.dailyLimit - item.soldToday, 0),
      options: item.options.map((opt) => ({
        id: opt.id,
        optionGroup: opt.optionGroup,
        name: opt.name,
        priceModifier: Number(opt.priceModifier),
        isRequired: opt.isRequired,
        displayOrder: opt.displayOrder,
      })),
    }))
    .sort(
      (a, b) =>
        a.category.displayOrder - b.category.displayOrder ||
        a.category.name.localeCompare(b.category.name) ||
        a.name.localeCompare(b.name),
    );
}

export default async function BilaoBuilderPage() {
  const builderItems = await getBilaoBuilderItems();

  return <BilaoBuilderClient items={builderItems} />;
}
