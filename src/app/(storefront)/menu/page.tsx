import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Skeleton } from "@/components/ui";
import { SearchFilterBar } from "@/components/storefront";
import { MenuGrid } from "@/components/storefront/menu-grid";
import type { MenuItem, MenuCategory } from "@/types";

export const dynamic = "force-dynamic";

interface MenuPageProps {
  searchParams: Promise<{
    category?: string;
    region?: string;
    dietary?: string;
    search?: string;
    sort?: string;
    page?: string;
  }>;
}

async function getCategories() {
  try {
    return await prisma.category.findMany({
      where: { isVisible: true },
      orderBy: { displayOrder: "asc" },
      select: { slug: true, name: true },
    });
  } catch (error) {
    console.error("Failed to load menu categories", error);
    return [];
  }
}

async function getItems(params: {
  category?: string;
  region?: string;
  dietary?: string;
  search?: string;
  sort?: string;
  page?: string;
}): Promise<{ items: MenuItem[]; total: number }> {
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const pageSize = 20;

  const where: Record<string, unknown> = { isAvailable: true };

  if (params.category) {
    where.category = { slug: params.category };
  }
  if (params.region) {
    where.originRegion = params.region;
  }
  if (params.dietary) {
    where.dietaryTags = { hasSome: [params.dietary] };
  }
  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
    ];
  }

  let orderBy: Record<string, string> = { createdAt: "desc" };
  switch (params.sort) {
    case "price-asc":
      orderBy = { price: "asc" };
      break;
    case "price-desc":
      orderBy = { price: "desc" };
      break;
    case "name":
      orderBy = { name: "asc" };
      break;
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
    case "popular":
    default:
      orderBy = { soldToday: "desc" };
      break;
  }

  let items;
  let total;

  try {
    [items, total] = await Promise.all([
      prisma.menuItem.findMany({
        where,
        include: { category: true, options: true },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.menuItem.count({ where }),
    ]);
  } catch (error) {
    console.error("Failed to load menu items", error);
    return { items: [], total: 0 };
  }

  const mapped: MenuItem[] = items.map((item) => ({
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

  return { items: mapped, total };
}

export default async function MenuPage({ searchParams }: MenuPageProps) {
  const params = await searchParams;
  const [categories, { items, total }] = await Promise.all([
    getCategories(),
    getItems(params),
  ]);

  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const pageSize = 20;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-stone-500">
        <Link href="/" className="hover:text-brown-600">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-stone-900">Menu</span>
        {params.category && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-stone-900">
              {categories.find((c) => c.slug === params.category)?.name ?? params.category}
            </span>
          </>
        )}
      </nav>

      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900">Our Menu</h1>
        <p className="mt-1 text-stone-500">
          {total} {total === 1 ? "delicacy" : "delicacies"} to explore
        </p>
      </div>

      {/* Search & Filters */}
      <div className="mb-8">
        <Suspense fallback={<Skeleton className="h-12 w-full rounded-xl" />}>
          <SearchFilterBar categories={categories} />
        </Suspense>
      </div>

      {/* Items Grid */}
      <MenuGrid items={items} />

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
          {page > 1 && (
            <PaginationLink params={params} page={page - 1}>
              Previous
            </PaginationLink>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
            .map((p, idx, arr) => {
              const prev = arr[idx - 1];
              const showEllipsis = prev !== undefined && p - prev > 1;
              return (
                <span key={p} className="flex items-center gap-2">
                  {showEllipsis && <span className="px-1 text-stone-400">…</span>}
                  <PaginationLink params={params} page={p} isActive={p === page}>
                    {p}
                  </PaginationLink>
                </span>
              );
            })}
          {page < totalPages && (
            <PaginationLink params={params} page={page + 1}>
              Next
            </PaginationLink>
          )}
        </nav>
      )}
    </div>
  );
}

function PaginationLink({
  params,
  page,
  isActive,
  children,
}: {
  params: Record<string, string | undefined>;
  page: number;
  isActive?: boolean;
  children: React.ReactNode;
}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) sp.set(k, v);
  });
  sp.set("page", String(page));

  return (
    <Link
      href={`/menu?${sp.toString()}`}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-brown-600 text-white"
          : "text-stone-600 hover:bg-stone-100"
      }`}
    >
      {children}
    </Link>
  );
}
