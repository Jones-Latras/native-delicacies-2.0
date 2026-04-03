import Link from "next/link";

import { ArrowDown, ArrowRight, Heart, Leaf, Wheat } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui";
import { BusinessStatus, CategoryCard } from "@/components/storefront";
import { FeaturedGrid } from "@/components/storefront/featured-grid";
import { HomeAllProductsSection } from "@/components/storefront/home-all-products-section";
import type { MenuItem, MenuCategory, OperatingHours } from "@/types";

export const dynamic = "force-dynamic";

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
      {/* ── Bahay Kubo Hero Section ── */}
      <section className="relative overflow-hidden pb-6 pt-2">
        {/* Ambient warm glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[85%] bg-[radial-gradient(ellipse_at_top,rgba(184,114,30,0.12),transparent_60%)]" />

        {/* Woven Bamboo Pattern Overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 8px,
                rgba(107,61,26,0.3) 8px,
                rgba(107,61,26,0.3) 10px
              ),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 8px,
                rgba(107,61,26,0.2) 8px,
                rgba(107,61,26,0.2) 10px
              )
            `,
          }}
        />

        {/* Decorative corner bamboo elements */}
        <div className="pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(138,154,91,0.2),transparent_70%)]" />
        <div className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(184,114,30,0.15),transparent_70%)]" />

        {/* Tropical leaf accent */}
        <div className="pointer-events-none absolute right-[8%] top-[12%] h-20 w-20 rounded-full border border-pandan/20 bg-pandan/8" />
        <div className="pointer-events-none absolute left-[6%] bottom-[20%] h-16 w-16 rounded-full border border-bambo/15 bg-bambo/10" />

        {/* Hero Content */}
        <div className="relative mx-auto flex min-h-[92svh] max-w-7xl flex-col items-center justify-center px-6 pb-24 pt-16 text-center sm:px-8 sm:pb-28 sm:pt-20 lg:min-h-[90svh] lg:px-12 lg:pb-32 lg:pt-24">
          {/* Business Status */}
          {operatingHours && (
            <div className="mb-10">
              <BusinessStatus operatingHours={operatingHours} timezone={timezone} />
            </div>
          )}

          {/* Main Headline */}
          <h1 className="max-w-4xl font-[family-name:var(--font-display)] text-5xl tracking-[-0.03em] text-kape sm:text-6xl lg:text-7xl">
            From Our{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-pulot">Kubo</span>
              <span className="absolute -bottom-1 left-0 right-0 h-3 bg-nipa/40 -skew-x-3" />
            </span>{" "}
            to Your{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-pandan">Home</span>
              <span className="absolute -bottom-1 left-0 right-0 h-3 bg-bambo/30 skew-x-3" />
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-latik/80 sm:text-xl">
            Traditional Filipino delicacies handcrafted with recipes passed down through
            generations. Made with love, wrapped in banana leaves, served with warmth.
          </p>

          {/* Feature Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-latik/15 bg-asukal/80 px-4 py-2 text-sm text-latik/90 shadow-sm">
              <Leaf className="h-4 w-4 text-pandan" strokeWidth={1.5} />
              <span>All Natural</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-latik/15 bg-asukal/80 px-4 py-2 text-sm text-latik/90 shadow-sm">
              <Wheat className="h-4 w-4 text-pulot" strokeWidth={1.5} />
              <span>Traditional Recipes</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-latik/15 bg-asukal/80 px-4 py-2 text-sm text-latik/90 shadow-sm">
              <Heart className="h-4 w-4 text-terra" strokeWidth={1.5} />
              <span>Made with Love</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link href="/bilao-builder">
              <Button
                size="lg"
                className="bg-pulot px-8 text-asukal shadow-[0_8px_24px_rgba(184,114,30,0.3)] hover:bg-latik"
              >
                Build Your Bilao
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Button>
            </Link>
            <Link href="/menu">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-latik/25 bg-asukal/60 px-8 text-latik shadow-sm hover:border-latik/40 hover:bg-nipa/40 hover:text-kape"
              >
                Browse Our Kakanin
              </Button>
            </Link>
          </div>

          {/* Scroll Indicator */}
          <Link
            href="#homepage-categories"
            className="mt-14 flex flex-col items-center text-center transition-all duration-300 hover:translate-y-1 sm:absolute sm:bottom-8 sm:left-1/2 sm:mt-0 sm:-translate-x-1/2"
          >
            <span className="text-[0.68rem] font-medium uppercase tracking-[0.3em] text-latik/55">
              Explore Our Offerings
            </span>
            <span className="mt-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-latik/20 bg-asukal text-pulot shadow-[0_8px_20px_rgba(44,26,14,0.1)]">
              <ArrowDown className="h-5 w-5 animate-bounce" strokeWidth={1.5} />
            </span>
          </Link>
        </div>
      </section>

      {/* ── Categories Section with Woven Border ── */}
      <section
        id="homepage-categories"
        className="relative overflow-hidden bg-[linear-gradient(180deg,#FFFDF8_0%,#FAF6F0_100%)] px-4 py-24 sm:px-6 lg:px-8"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#C9A87C]/60" />
        <div className="pointer-events-none absolute left-[12%] top-20 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(245,230,200,0.7),transparent_70%)]" />
        <div className="pointer-events-none absolute bottom-10 right-[8%] h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(201,168,124,0.18),transparent_72%)]" />

        <div className="mx-auto max-w-7xl">
          <div className="relative text-center">
            <div className="mx-auto max-w-2xl">
              <p className="font-[family-name:var(--font-label)] text-xs font-medium uppercase tracking-[0.1em] text-[#A0522D]">
                Mga Kategorya
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-[2.25rem] leading-tight text-[#3E2012]">
                Shop by Category
              </h2>
              <div className="mx-auto mt-4 h-[2px] w-[60px] rounded-full bg-[#A0522D]" />
              <p className="mx-auto mt-5 max-w-[500px] font-[family-name:var(--font-label)] text-base italic leading-7 text-[#7A6A55]">
                Discover beloved Filipino delicacies grouped by tradition, texture, and the kind of
                hand-prepared comfort they bring to every table.
              </p>
            </div>
            <Link
              href="/menu"
              className="mt-5 inline-flex font-[family-name:var(--font-label)] text-[13px] text-[#A0522D] underline decoration-[#A0522D]/45 underline-offset-4 transition-all duration-200 ease-in-out hover:text-[#7D3D1A] sm:absolute sm:right-0 sm:top-1 sm:mt-0"
            >
              View all
            </Link>
          </div>

          <div className="-mx-4 mt-10 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:overflow-visible lg:px-0 lg:pb-0">
            <div className="flex min-w-max gap-4 lg:grid lg:min-w-0 lg:grid-cols-5">
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
        </div>
      </section>

      {/* ── Featured Delicacies Section ── */}
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#FAF6F0_0%,#F5EFE6_100%)] px-4 py-24 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#C9A87C]/60" />
        <div className="pointer-events-none absolute -left-16 top-12 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(245,230,200,0.7),transparent_70%)]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(160,82,45,0.12),transparent_72%)]" />

        <div className="mx-auto max-w-7xl">
          <div className="relative text-center">
            <div className="mx-auto max-w-2xl">
              <p className="font-[family-name:var(--font-label)] text-xs font-medium uppercase tracking-[0.1em] text-[#A0522D]">
                Paboritong Kakanin
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-[2.25rem] leading-tight text-[#3E2012]">
                Popular Delicacies
              </h2>
              <div className="mx-auto mt-4 h-[2px] w-[60px] rounded-full bg-[#A0522D]" />
              <p className="mx-auto mt-5 max-w-[500px] font-[family-name:var(--font-label)] text-base italic leading-7 text-[#7A6A55]">
                Our crowd favorites, lovingly prepared the old-fashioned way and brought together
                for gatherings, merienda, and gifting.
              </p>
            </div>
            <Link
              href="/menu?sort=popular"
              className="mt-5 inline-flex font-[family-name:var(--font-label)] text-[13px] text-[#A0522D] underline decoration-[#A0522D]/45 underline-offset-4 transition-all duration-200 ease-in-out hover:text-[#7D3D1A] sm:absolute sm:right-0 sm:top-1 sm:mt-0"
            >
              See all
            </Link>
          </div>

          <div className="mt-10">
            <FeaturedGrid items={featured} />
          </div>
        </div>
      </section>

      {/* ── All Products Section ── */}
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#FFFDF8_0%,#FAF6F0_100%)] px-4 py-24 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#C9A87C]/60" />
        <div className="pointer-events-none absolute left-[6%] top-10 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(245,230,200,0.6),transparent_72%)]" />
        <div className="pointer-events-none absolute bottom-6 right-[10%] h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(201,168,124,0.15),transparent_72%)]" />

        <div className="mx-auto max-w-7xl">
          <div className="relative text-center">
            <div className="mx-auto max-w-2xl">
              <p className="font-[family-name:var(--font-label)] text-xs font-medium uppercase tracking-[0.1em] text-[#A0522D]">
                Lahat ng Produkto
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-[2.25rem] leading-tight text-[#3E2012]">
                All Products
              </h2>
              <div className="mx-auto mt-4 h-[2px] w-[60px] rounded-full bg-[#A0522D]" />
              <p className="mx-auto mt-5 max-w-[500px] font-[family-name:var(--font-label)] text-base italic leading-7 text-[#7A6A55]">
                Browse every available delicacy from our humble kubo kitchen
              </p>
            </div>
            <Link
              href="/menu"
              className="mt-5 inline-flex font-[family-name:var(--font-label)] text-[13px] text-[#A0522D] underline decoration-[#A0522D]/45 underline-offset-4 transition-all duration-200 ease-in-out hover:text-[#7D3D1A] sm:absolute sm:right-0 sm:top-1 sm:mt-0"
            >
              View full menu
            </Link>
          </div>

          <div className="mt-10">
            <HomeAllProductsSection
              items={allAvailableItems}
              categories={categories.map((category) => ({
                slug: category.slug,
                name: category.name,
              }))}
            />
          </div>
        </div>
      </section>

      {/* ── Heritage Story Section - Bahay Kubo Inspired ── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border-2 border-latik/15 bg-asukal shadow-[0_30px_60px_rgba(44,26,14,0.12)]">
          {/* Nipa roof pattern at top */}
          <div className="absolute inset-x-0 top-0 h-6 bg-[linear-gradient(180deg,rgba(196,154,86,0.3),transparent),repeating-linear-gradient(90deg,rgba(212,201,168,0.5),rgba(212,201,168,0.5)_4px,transparent_4px,transparent_8px)]" />

          {/* Bamboo frame effect */}
          <div className="absolute bottom-0 left-0 top-0 w-3 bg-[linear-gradient(90deg,rgba(107,61,26,0.15),transparent)]" />
          <div className="absolute bottom-0 right-0 top-0 w-3 bg-[linear-gradient(270deg,rgba(107,61,26,0.15),transparent)]" />

          {/* Garden accent */}
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(138,154,91,0.2),transparent_70%)]" />

          <div className="relative p-8 sm:p-12 lg:flex lg:items-center lg:gap-16 lg:p-16">
            <div className="flex-1">
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl text-kape sm:text-4xl">
                A Taste of Filipino Tradition
              </h2>
              <p className="mt-6 leading-relaxed text-latik/80">
                Like the humble bahay kubo that shelters families across the Philippine countryside,
                our delicacies are built on foundations of tradition, simplicity, and love. Every
                recipe carries generations of Filipino culinary wisdom.
              </p>
              <p className="mt-4 leading-relaxed text-latik/80">
                From the sticky-sweet bibingka of Luzon to the rich flavors of Visayan treats, we
                source the finest local ingredients — fresh coconut, native rice varieties,
                muscovado sugar — and prepare each item with the same care our lolas practiced.
              </p>
              <Link href="/about">
                <Button
                  variant="outline"
                  className="mt-8 border-2 border-latik/25 bg-transparent text-latik shadow-sm hover:border-pulot/40 hover:bg-nipa/30 hover:text-pulot"
                >
                  Read Our Story
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </Button>
              </Link>
            </div>

            {/* Heritage Icons Grid */}
            <div className="mt-10 flex items-center justify-center lg:mt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="group flex h-28 w-28 flex-col items-center justify-center rounded-2xl border-2 border-latik/12 bg-nipa/30 shadow-sm transition-all hover:border-pulot/25 hover:bg-nipa/50 sm:h-32 sm:w-32">
                  <span className="text-3xl sm:text-4xl">🌾</span>
                  <span className="mt-2 text-[0.65rem] font-medium uppercase tracking-wider text-latik/70">
                    Native Rice
                  </span>
                </div>
                <div className="group flex h-28 w-28 flex-col items-center justify-center rounded-2xl border-2 border-latik/12 bg-nipa/30 shadow-sm transition-all hover:border-pandan/25 hover:bg-pandan/10 sm:h-32 sm:w-32">
                  <span className="text-3xl sm:text-4xl">🥥</span>
                  <span className="mt-2 text-[0.65rem] font-medium uppercase tracking-wider text-latik/70">
                    Fresh Coconut
                  </span>
                </div>
                <div className="group flex h-28 w-28 flex-col items-center justify-center rounded-2xl border-2 border-latik/12 bg-nipa/30 shadow-sm transition-all hover:border-terra/25 hover:bg-terra/10 sm:h-32 sm:w-32">
                  <span className="text-3xl sm:text-4xl">🍬</span>
                  <span className="mt-2 text-[0.65rem] font-medium uppercase tracking-wider text-latik/70">
                    Muscovado
                  </span>
                </div>
                <div className="group flex h-28 w-28 flex-col items-center justify-center rounded-2xl border-2 border-latik/12 bg-nipa/30 shadow-sm transition-all hover:border-bambo/25 hover:bg-bambo/10 sm:h-32 sm:w-32">
                  <span className="text-3xl sm:text-4xl">🍃</span>
                  <span className="mt-2 text-[0.65rem] font-medium uppercase tracking-wider text-latik/70">
                    Banana Leaf
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
