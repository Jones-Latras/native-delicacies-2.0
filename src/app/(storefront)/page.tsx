import Link from "next/link";
import { ArrowRight, Star, Gift, Truck, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui";
import { CategoryCard, BusinessStatus } from "@/components/storefront";
import { FeaturedGrid } from "@/components/storefront/featured-grid";
import type { MenuItem, MenuCategory, OperatingHours } from "@/types";

export const revalidate = 60; // ISR: revalidate every 60 seconds

async function getFeaturedItems(): Promise<MenuItem[]> {
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
    options: item.options.map((o) => ({
      id: o.id,
      optionGroup: o.optionGroup,
      name: o.name,
      priceModifier: Number(o.priceModifier),
      isRequired: o.isRequired,
      displayOrder: o.displayOrder,
    })),
  }));
}

async function getCategories() {
  return prisma.category.findMany({
    where: { isVisible: true },
    orderBy: { displayOrder: "asc" },
    include: {
      _count: { select: { menuItems: { where: { isAvailable: true } } } },
    },
  });
}

async function getBusinessSettings() {
  return prisma.businessSettings.findUnique({ where: { id: "default" } });
}

export default async function HomePage() {
  const [featured, categories, settings] = await Promise.all([
    getFeaturedItems(),
    getCategories(),
    getBusinessSettings(),
  ]);

  const operatingHours = settings?.operatingHours as unknown as OperatingHours | undefined;
  const timezone = settings?.timezone ?? "Asia/Manila";

  return (
    <>
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brown-800 via-brown-600 to-brown-900 px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-28">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center text-center">
          {/* Business Status */}
          {operatingHours && (
            <div className="mb-8">
              <BusinessStatus operatingHours={operatingHours} timezone={timezone} />
            </div>
          )}

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
            Authentic Filipino Heritage
          </p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Build Your Own{" "}
            <span className="bg-gradient-to-r from-amber-300 to-amber-100 bg-clip-text text-transparent">
              Bilao
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-brown-100">
            Handcrafted kakanin and regional specialties made with love, tradition, and the finest
            local ingredients. Taste the heritage of the Philippines.
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

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-brown-200">
            <span className="flex items-center gap-1.5">
              <Truck className="h-4 w-4" /> Free Delivery Over ₱500
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" /> Freshness Guaranteed
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4" /> 4.9★ Rated
            </span>
          </div>
        </div>
      </section>

      {/* ── Categories Section ── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
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

      {/* ── Pasalubong / Gift CTA ── */}
      <section className="mx-auto max-w-7xl px-4 py-8 pb-16 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-brown-700 to-brown-800 p-8 text-white sm:p-12">
          <div className="flex flex-col items-center text-center lg:flex-row lg:text-left">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-amber-200">
                <Gift className="h-4 w-4" />
                Perfect for Gifting
              </div>
              <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
                Pasalubong & Gift Bundles
              </h2>
              <p className="mt-3 max-w-xl text-brown-200">
                Send the gift of tradition. Our curated gift bundles are perfect for sharing with
                loved ones near and far.
              </p>
            </div>
            <div className="mt-6 lg:ml-8 lg:mt-0">
              <Link href="/menu?category=pasalubong-bundles">
                <Button
                  size="lg"
                  className="rounded-2xl bg-white px-8 font-semibold text-brown-700 shadow-lg hover:bg-amber-50"
                >
                  View Gift Bundles
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
