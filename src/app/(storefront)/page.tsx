import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui";
import { CategoryCard, BusinessStatus, MenuGrid } from "@/components/storefront";
import { FeaturedGrid } from "@/components/storefront/featured-grid";
import type { MenuItem, MenuCategory, OperatingHours } from "@/types";

export const dynamic = "force-dynamic";

const HERO_BACKGROUND_IMAGE_URL = "/hero-background.jpg";

async function getFeaturedItems(): Promise<MenuItem[]> {
  try {
    const items = await prisma.menuItem.findMany({
      where: { isAvailable: true, isFeatured: true },
      include: { category: true, options: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    });
    return items.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description,
      category: item.category as MenuCategory,
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
      options: item.options.map((o) => ({
        id: o.id,
        optionGroup: o.optionGroup,
        name: o.name,
        priceModifier: Number(o.priceModifier),
        isRequired: o.isRequired,
        displayOrder: o.displayOrder,
      })),
    }));
  } catch (error) {
    console.error("Failed to load featured items", error);
    return [];
  }
}

async function getCategories() {
  try {
    return await prisma.category.findMany({
      where: { isVisible: true },
      orderBy: { displayOrder: "asc" },
      include: {
        _count: { select: { menuItems: { where: { isAvailable: true } } } },
      },
    });
  } catch (error) {
    console.error("Failed to load categories", error);
    return [];
  }
}

async function getAllAvailableItems(): Promise<MenuItem[]> {
  try {
    const items = await prisma.menuItem.findMany({
      where: { isAvailable: true },
      include: { category: true, options: true },
      orderBy: [{ soldToday: "desc" }, { createdAt: "desc" }],
    });

    return items.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description,
      category: item.category as MenuCategory,
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
      options: item.options.map((o) => ({
        id: o.id,
        optionGroup: o.optionGroup,
        name: o.name,
        priceModifier: Number(o.priceModifier),
        isRequired: o.isRequired,
        displayOrder: o.displayOrder,
      })),
    }));
  } catch (error) {
    console.error("Failed to load all available items", error);
    return [];
  }
}

async function getBusinessSettings() {
  try {
    return await prisma.businessSettings.findUnique({ where: { id: "default" } });
  } catch (error) {
    console.error("Failed to load business settings", error);
    return null;
  }
}

export default async function HomePage() {
  const [featured, allAvailableItems, categories, settings] = await Promise.all([
    getFeaturedItems(),
    getAllAvailableItems(),
    getCategories(),
    getBusinessSettings(),
  ]);

  const operatingHours = settings?.operatingHours as unknown as OperatingHours | undefined;
  const timezone = settings?.timezone ?? "Asia/Manila";

  return (
    <>
      {/* ── Hero Section ── */}
      <section
        className="relative overflow-hidden bg-kape bg-cover bg-center bg-no-repeat px-4 text-asukal sm:px-6 lg:px-8"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(255, 247, 229, 0.14) 0%, rgba(255, 247, 229, 0.02) 20%, rgba(255, 247, 229, 0) 38%), linear-gradient(135deg, rgba(59, 31, 14, 0.86), rgba(91, 48, 16, 0.72), rgba(42, 26, 15, 0.82)), url('${HERO_BACKGROUND_IMAGE_URL}')`,
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(194,133,42,0.24),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(74,124,89,0.18),transparent_30%)]" />
        <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col items-center justify-center px-2 pb-24 pt-28 text-center sm:px-4 sm:pb-28 sm:pt-32 lg:px-0 lg:pb-32 lg:pt-36">
          {operatingHours && (
            <div className="mb-8">
              <BusinessStatus operatingHours={operatingHours} timezone={timezone} />
            </div>
          )}

          <p className="text-[0.78rem] font-medium uppercase tracking-[0.34em] text-pulot">
            Authentic Filipino Heritage
          </p>
          <h1 className="mt-5 max-w-5xl font-[family-name:var(--font-display)] text-5xl tracking-[-0.04em] text-asukal sm:text-6xl lg:text-[5.5rem]">
            Handcrafted{" "}
            <span className="bg-gradient-to-r from-pulot via-amber-100 to-asukal bg-clip-text text-transparent">
              Filipino Delicacies
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-asukal/78 sm:text-xl">
            Bibingka warmth, puto bumbong comfort, and heirloom recipes brought together in a storefront that feels like a festive Filipino pasalubong table.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
            <Link href="/bilao-builder">
              <Button
                size="lg"
                className="px-8"
              >
                Build Your Bilao
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Button>
            </Link>
            <Link href="/menu">
              <Button
                size="lg"
                variant="outline"
                className="border-asukal/35 px-8 text-asukal hover:bg-asukal/8 hover:text-asukal"
              >
                Browse Menu
              </Button>
            </Link>
          </div>

          <Link
            href="#homepage-categories"
            className="mt-10 flex flex-col items-center text-center transition-opacity duration-200 hover:opacity-100 sm:absolute sm:bottom-7 sm:left-1/2 sm:mt-0 sm:-translate-x-1/2"
          >
            <span className="text-[0.68rem] font-medium uppercase tracking-[0.34em] text-asukal/72 sm:text-[0.74rem]">
              Scroll down to see more
            </span>
            <span className="mt-3 flex h-11 w-11 items-center justify-center rounded-full border border-asukal/25 bg-asukal/10 text-asukal shadow-[0_14px_28px_rgba(59,31,14,0.16)] backdrop-blur-sm">
              <ArrowDown className="h-5 w-5 animate-bounce" strokeWidth={1.5} />
            </span>
          </Link>
        </div>
      </section>

      <section id="homepage-categories" className="section-divider px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-3xl text-kape sm:text-4xl">
                Shop by Category
              </h2>
              <p className="mt-2 text-latik/70">
                Explore our curated collection of native treats
              </p>
            </div>
            <Link
              href="/menu"
              className="hidden items-center gap-1 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-latik hover:text-pulot sm:flex"
            >
              View all <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                name={cat.name}
                slug={cat.slug}
                description={cat.description ?? undefined}
                imageUrl={cat.imageUrl}
                itemCount={cat._count.menuItems}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section-divider bg-gatas/72 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-3xl text-kape sm:text-4xl">
                Popular Delicacies
              </h2>
              <p className="mt-2 text-latik/70">
                Our most loved traditional treats, freshly prepared for you
              </p>
            </div>
            <Link
              href="/menu?sort=popular"
              className="hidden items-center gap-1 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-latik hover:text-pulot sm:flex"
            >
              See all <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </div>

          <div className="mt-8">
            <FeaturedGrid items={featured} />
          </div>
        </div>
      </section>

      <section className="section-divider px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-3xl text-kape sm:text-4xl">
                All Products
              </h2>
              <p className="mt-2 text-latik/70">
                Browse every available delicacy from our shop
              </p>
            </div>
            <Link
              href="/menu"
              className="hidden items-center gap-1 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-latik hover:text-pulot sm:flex"
            >
              View full menu <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </div>

          <div className="mt-8">
            <MenuGrid items={allAvailableItems} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-latik/12 bg-[linear-gradient(135deg,rgba(194,133,42,0.14),rgba(253,246,227,0.98),rgba(74,124,89,0.10))] p-8 shadow-[0_24px_42px_rgba(59,31,14,0.12)] sm:p-12 lg:flex lg:gap-12 lg:p-16">
          <div className="flex-1">
            <p className="text-[0.72rem] font-medium uppercase tracking-[0.32em] text-latik/62">
              Our Heritage
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl text-kape sm:text-4xl">
              A Taste of Filipino Tradition
            </h2>
            <p className="mt-4 leading-8 text-latik/75">
              Every delicacy we create carries generations of Filipino culinary wisdom. From the
              sticky-sweet bibingka of Luzon to the rich flavors of Visayan treats, we preserve
              and share the authentic tastes that make our culture so rich.
            </p>
            <p className="mt-3 leading-8 text-latik/75">
              We source the finest local ingredients — fresh coconut, native rice varieties,
              muscovado sugar — and prepare each item with the same care and attention to detail
              that our lolas practiced for generations.
            </p>
            <Link href="/about">
              <Button variant="outline" className="mt-6 border-latik/30 text-latik hover:bg-gatas/90">
                Read Our Story
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center lg:mt-0">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex h-28 w-28 items-center justify-center rounded-[1.4rem] border border-latik/12 bg-asukal/82 shadow-[0_14px_24px_rgba(59,31,14,0.08)]">
                <span className="text-4xl">🍚</span>
              </div>
              <div className="flex h-28 w-28 items-center justify-center rounded-[1.4rem] border border-latik/12 bg-asukal/82 shadow-[0_14px_24px_rgba(59,31,14,0.08)]">
                <span className="text-4xl">🥥</span>
              </div>
              <div className="flex h-28 w-28 items-center justify-center rounded-[1.4rem] border border-latik/12 bg-asukal/82 shadow-[0_14px_24px_rgba(59,31,14,0.08)]">
                <span className="text-4xl">🌾</span>
              </div>
              <div className="flex h-28 w-28 items-center justify-center rounded-[1.4rem] border border-latik/12 bg-asukal/82 shadow-[0_14px_24px_rgba(59,31,14,0.08)]">
                <span className="text-4xl">🍃</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
