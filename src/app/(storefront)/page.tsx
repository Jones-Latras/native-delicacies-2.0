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
        className="relative overflow-hidden bg-brown-900 bg-cover bg-center bg-no-repeat px-4 text-white sm:px-6 lg:px-8"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(255, 248, 239, 0.22) 0%, rgba(255, 248, 239, 0.08) 16%, rgba(255, 248, 239, 0) 34%), linear-gradient(135deg, rgba(41, 23, 12, 0.78), rgba(56, 35, 20, 0.62)), url('${HERO_BACKGROUND_IMAGE_URL}')`,
        }}
      >
        <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col items-center justify-center px-2 pb-24 pt-28 text-center sm:px-4 sm:pb-28 sm:pt-32 lg:px-0 lg:pb-32 lg:pt-36">
          {/* Business Status */}
          {operatingHours && (
            <div className="mb-8">
              <BusinessStatus operatingHours={operatingHours} timezone={timezone} />
            </div>
          )}

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
            Authentic Filipino Heritage
          </p>
          <h1 className="mt-4 max-w-4xl text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            J&J NATIVE{" "}
            <span className="bg-gradient-to-r from-amber-300 to-amber-100 bg-clip-text text-transparent">
              DELICACIES
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-brown-100 sm:text-xl">
            Handcrafted kakanin made with love and tradition. Taste the heritage of the Philippines.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
            <Link href="/bilao-builder">
              <Button
                size="lg"
                className="rounded-2xl bg-white px-8 font-semibold text-brown-700 shadow-lg hover:bg-amber-50"
              >
                Build Your Bilao
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/menu">
              <Button
                size="lg"
                variant="outline"
                className="rounded-2xl border-white/50 px-8 text-white hover:bg-white/10"
              >
                Browse Menu
              </Button>
            </Link>
          </div>

          <Link
            href="#homepage-categories"
            className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center text-center transition-opacity duration-200 hover:opacity-100"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-white/75 sm:text-sm">
              Scroll down to see more
            </span>
            <span className="mt-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white shadow-lg backdrop-blur-sm">
              <ArrowDown className="h-5 w-5 animate-bounce" />
            </span>
          </Link>
        </div>
      </section>

      {/* ── Categories Section ── */}
      <section id="homepage-categories" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-stone-900 sm:text-3xl">
                Shop by Category
              </h2>
              <p className="mt-1 text-stone-500">
                Explore our curated collection of native treats
              </p>
            </div>
            <Link
              href="/menu"
              className="hidden items-center gap-1 text-sm font-semibold text-brown-600 hover:text-brown-800 sm:flex"
            >
              View all <ArrowRight className="h-4 w-4" />
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

      {/* ── Featured Products ── */}
      <section className="bg-stone-100/60 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-stone-900 sm:text-3xl">
                Popular Delicacies
              </h2>
              <p className="mt-1 text-stone-500">
                Our most loved traditional treats, freshly prepared for you
              </p>
            </div>
            <Link
              href="/menu?sort=popular"
              className="hidden items-center gap-1 text-sm font-semibold text-brown-600 hover:text-brown-800 sm:flex"
            >
              See all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8">
            <FeaturedGrid items={featured} />
          </div>
        </div>
      </section>

      {/* ── All Products Section ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-stone-900 sm:text-3xl">
                All Products
              </h2>
              <p className="mt-1 text-stone-500">
                Browse every available delicacy from our shop
              </p>
            </div>
            <Link
              href="/menu"
              className="hidden items-center gap-1 text-sm font-semibold text-brown-600 hover:text-brown-800 sm:flex"
            >
              View full menu <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8">
            <MenuGrid items={allAvailableItems} />
          </div>
        </div>
      </section>

      {/* ── Heritage / Brand Story ── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brown-50 to-amber-50 p-8 sm:p-12 lg:flex lg:gap-12 lg:p-16">
          <div className="flex-1">
            <p className="text-sm font-semibold uppercase tracking-wider text-brown-500">
              Our Heritage
            </p>
            <h2 className="mt-3 text-2xl font-bold text-stone-900 sm:text-3xl">
              A Taste of Filipino Tradition
            </h2>
            <p className="mt-4 leading-relaxed text-stone-600">
              Every delicacy we create carries generations of Filipino culinary wisdom. From the
              sticky-sweet bibingka of Luzon to the rich flavors of Visayan treats, we preserve
              and share the authentic tastes that make our culture so rich.
            </p>
            <p className="mt-3 leading-relaxed text-stone-600">
              We source the finest local ingredients — fresh coconut, native rice varieties,
              muscovado sugar — and prepare each item with the same care and attention to detail
              that our lolas practiced for generations.
            </p>
            <Link href="/about">
              <Button
                variant="outline"
                className="mt-6 rounded-xl border-brown-600 text-brown-600 hover:bg-brown-50"
              >
                Read Our Story
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center lg:mt-0">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-white shadow-sm">
                <span className="text-4xl">🍚</span>
              </div>
              <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-white shadow-sm">
                <span className="text-4xl">🥥</span>
              </div>
              <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-white shadow-sm">
                <span className="text-4xl">🌾</span>
              </div>
              <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-white shadow-sm">
                <span className="text-4xl">🍃</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
