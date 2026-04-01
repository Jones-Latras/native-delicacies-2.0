import Link from "next/link";

import { ArrowDown, ArrowRight, Leaf, Home, Wheat, Heart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui";
import { CategoryCard, BusinessStatus, MenuGrid } from "@/components/storefront";
import { FeaturedGrid } from "@/components/storefront/featured-grid";
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
      <section className="relative overflow-hidden px-4 pb-6 pt-4 sm:px-6 lg:px-8">
        {/* Ambient warm glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[85%] bg-[radial-gradient(ellipse_at_top,rgba(184,114,30,0.12),transparent_60%)]" />
        
        {/* Main Hero Card - Bahay Kubo inspired */}
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border-2 border-latik/20 bg-asukal shadow-[0_40px_80px_rgba(44,26,14,0.18),inset_0_1px_0_rgba(255,255,255,0.5)]">
          
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
          
          {/* Nipa Thatch Top Border Effect */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-3 bg-[linear-gradient(90deg,rgba(196,154,86,0.4),rgba(212,201,168,0.5),rgba(196,154,86,0.4))]" />
          
          {/* Decorative corner bamboo elements */}
          <div className="pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(138,154,91,0.2),transparent_70%)]" />
          <div className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(184,114,30,0.15),transparent_70%)]" />
          
          {/* Tropical leaf accent */}
          <div className="pointer-events-none absolute right-[8%] top-[12%] h-20 w-20 rounded-full border border-pandan/20 bg-pandan/8" />
          <div className="pointer-events-none absolute left-[6%] bottom-[20%] h-16 w-16 rounded-full border border-bambo/15 bg-bambo/10" />
          
          {/* Hero Content */}
          <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col items-center justify-center px-6 pb-28 pt-32 text-center sm:px-8 sm:pb-32 sm:pt-36 lg:px-12 lg:pb-36 lg:pt-40">
            
            {/* Business Status */}
            {operatingHours && (
              <div className="mb-10">
                <BusinessStatus operatingHours={operatingHours} timezone={timezone} />
              </div>
            )}

            {/* Heritage Badge */}
            <div className="mb-6 flex items-center gap-2 rounded-full border border-nipa bg-nipa/30 px-4 py-2 shadow-sm">
              <Home className="h-4 w-4 text-latik" strokeWidth={1.5} />
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-latik">
                Bahay Kubo Heritage
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="max-w-4xl font-[family-name:var(--font-display)] text-5xl tracking-[-0.03em] text-kape sm:text-6xl lg:text-7xl">
              From Our{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-pulot">Kubo</span>
                <span className="absolute -bottom-1 left-0 right-0 h-3 bg-nipa/40 -skew-x-3" />
              </span>
              {" "}to Your{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-pandan">Home</span>
                <span className="absolute -bottom-1 left-0 right-0 h-3 bg-bambo/30 skew-x-3" />
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-latik/80 sm:text-xl">
              Traditional Filipino delicacies handcrafted with recipes passed down through generations. 
              Made with love, wrapped in banana leaves, served with warmth.
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
        </div>
      </section>

      {/* ── Categories Section with Woven Border ── */}
      <section id="homepage-categories" className="relative px-4 py-24 sm:px-6 lg:px-8">
        {/* Decorative bamboo divider */}
        <div className="absolute left-0 right-0 top-0 flex h-4 items-center justify-center gap-1 overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="h-3 w-6 rounded-sm bg-nipa/50" />
          ))}
        </div>
        
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-pulot">
                Mga Kategorya
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-kape sm:text-4xl">
                Shop by Category
              </h2>
              <p className="mt-3 max-w-lg text-latik/70">
                Explore our curated collection of native treats, each category representing a piece of Filipino culinary heritage
              </p>
            </div>
            <Link
              href="/menu"
              className="hidden items-center gap-2 rounded-full border border-latik/20 bg-asukal/60 px-5 py-2.5 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-latik shadow-sm transition-all hover:border-pulot/30 hover:bg-nipa/30 hover:text-pulot sm:flex"
            >
              View all <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
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

      {/* ── Featured Delicacies Section ── */}
      <section className="relative bg-nipa/25 px-4 py-24 sm:px-6 lg:px-8">
        {/* Bamboo pattern side borders */}
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 w-4 bg-[repeating-linear-gradient(180deg,rgba(107,61,26,0.08),rgba(107,61,26,0.08)_20px,transparent_20px,transparent_24px)]" />
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 w-4 bg-[repeating-linear-gradient(180deg,rgba(107,61,26,0.08),rgba(107,61,26,0.08)_20px,transparent_20px,transparent_24px)]" />
        
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-pandan">
                Paboritong Kakanin
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-kape sm:text-4xl">
                Popular Delicacies
              </h2>
              <p className="mt-3 max-w-lg text-latik/70">
                Our most loved traditional treats, freshly prepared using time-honored methods
              </p>
            </div>
            <Link
              href="/menu?sort=popular"
              className="hidden items-center gap-2 rounded-full border border-pandan/25 bg-asukal/60 px-5 py-2.5 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-latik shadow-sm transition-all hover:border-pandan/40 hover:bg-pandan/10 hover:text-pandan sm:flex"
            >
              See all <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </div>

          <div className="mt-10">
            <FeaturedGrid items={featured} />
          </div>
        </div>
      </section>

      {/* ── All Products Section ── */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        {/* Woven pattern top border */}
        <div className="absolute left-0 right-0 top-0 h-2 bg-[repeating-linear-gradient(90deg,rgba(138,154,91,0.3),rgba(138,154,91,0.3)_12px,transparent_12px,transparent_16px)]" />
        
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-latik/60">
                Lahat ng Produkto
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-kape sm:text-4xl">
                All Products
              </h2>
              <p className="mt-3 max-w-lg text-latik/70">
                Browse every available delicacy from our humble kubo kitchen
              </p>
            </div>
            <Link
              href="/menu"
              className="hidden items-center gap-2 rounded-full border border-latik/20 bg-asukal/60 px-5 py-2.5 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-latik shadow-sm transition-all hover:border-latik/35 hover:bg-nipa/30 hover:text-pulot sm:flex"
            >
              View full menu <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </div>

          <div className="mt-10">
            <MenuGrid items={allAvailableItems} />
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
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-pulot" strokeWidth={1.5} />
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-pulot">
                  Ang Aming Kwento
                </p>
              </div>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl text-kape sm:text-4xl">
                A Taste of Filipino Tradition
              </h2>
              <p className="mt-6 leading-relaxed text-latik/80">
                Like the humble bahay kubo that shelters families across the Philippine countryside, 
                our delicacies are built on foundations of tradition, simplicity, and love. Every 
                recipe carries generations of Filipino culinary wisdom.
              </p>
              <p className="mt-4 leading-relaxed text-latik/80">
                From the sticky-sweet bibingka of Luzon to the rich flavors of Visayan treats, 
                we source the finest local ingredients — fresh coconut, native rice varieties, 
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
                  <span className="mt-2 text-[0.65rem] font-medium uppercase tracking-wider text-latik/70">Native Rice</span>
                </div>
                <div className="group flex h-28 w-28 flex-col items-center justify-center rounded-2xl border-2 border-latik/12 bg-nipa/30 shadow-sm transition-all hover:border-pandan/25 hover:bg-pandan/10 sm:h-32 sm:w-32">
                  <span className="text-3xl sm:text-4xl">🥥</span>
                  <span className="mt-2 text-[0.65rem] font-medium uppercase tracking-wider text-latik/70">Fresh Coconut</span>
                </div>
                <div className="group flex h-28 w-28 flex-col items-center justify-center rounded-2xl border-2 border-latik/12 bg-nipa/30 shadow-sm transition-all hover:border-terra/25 hover:bg-terra/10 sm:h-32 sm:w-32">
                  <span className="text-3xl sm:text-4xl">🍬</span>
                  <span className="mt-2 text-[0.65rem] font-medium uppercase tracking-wider text-latik/70">Muscovado</span>
                </div>
                <div className="group flex h-28 w-28 flex-col items-center justify-center rounded-2xl border-2 border-latik/12 bg-nipa/30 shadow-sm transition-all hover:border-bambo/25 hover:bg-bambo/10 sm:h-32 sm:w-32">
                  <span className="text-3xl sm:text-4xl">🍃</span>
                  <span className="mt-2 text-[0.65rem] font-medium uppercase tracking-wider text-latik/70">Banana Leaf</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
