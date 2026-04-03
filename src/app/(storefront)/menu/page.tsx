import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Skeleton } from "@/components/ui";
import { SearchFilterBar } from "@/components/storefront";
import { MenuGrid } from "@/components/storefront/menu-grid";
import type { MenuCategory, MenuItem } from "@/types";

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
  const [categories, { items, total }] = await Promise.all([getCategories(), getItems(params)]);

  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const pageSize = 20;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#FFFDF8_0%,#FAF6F0_100%)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#C9A87C]/60" />
      <div className="pointer-events-none absolute left-[8%] top-16 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(245,230,200,0.55),transparent_72%)]" />
      <div className="pointer-events-none absolute bottom-8 right-[10%] h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(201,168,124,0.15),transparent_72%)]" />

      <div className="relative mx-auto max-w-7xl">
        <nav className="mb-8 flex flex-wrap items-center gap-1.5 font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.12em] text-[#7A6A55]">
          <Link
            href="/"
            className="transition-colors duration-200 ease-in-out hover:text-[#A0522D]"
          >
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span className="font-medium text-[#3E2012]">Menu</span>
          {params.category && (
            <>
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span className="font-medium text-[#3E2012]">
                {categories.find((c) => c.slug === params.category)?.name ?? params.category}
              </span>
            </>
          )}
        </nav>

        <div className="text-center">
          <p className="font-[family-name:var(--font-label)] text-xs font-medium uppercase tracking-[0.1em] text-[#A0522D]">
            Lahat ng Produkto
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-[2.25rem] leading-tight text-[#3E2012] sm:text-[3rem]">
            Our Menu
          </h1>
          <div className="mx-auto mt-4 h-[2px] w-[60px] rounded-full bg-[#A0522D]" />
          <p className="mx-auto mt-5 max-w-[560px] font-[family-name:var(--font-label)] text-base italic leading-7 text-[#7A6A55]">
            Browse every available delicacy from our humble kubo kitchen, prepared for gifting,
            merienda, and family tables.
          </p>
          <p className="mt-4 font-[family-name:var(--font-label)] text-sm text-[#7A6A55]">
            {total} {total === 1 ? "delicacy" : "delicacies"} to explore
          </p>
        </div>

        <div className="mt-10">
          <Suspense fallback={<Skeleton className="h-28 w-full rounded-[12px] bg-[#F5EFE6]" />}>
            <SearchFilterBar categories={categories} />
          </Suspense>
        </div>

        <div className="mt-8">
          <MenuGrid items={items} />
        </div>

        {totalPages > 1 && (
          <nav
            className="mt-10 flex flex-wrap items-center justify-center gap-2"
            aria-label="Pagination"
          >
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
                    {showEllipsis && (
                      <span className="px-1 font-[family-name:var(--font-label)] text-[#7A6A55]">
                        ...
                      </span>
                    )}
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
    </section>
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
      className={`inline-flex min-w-10 items-center justify-center rounded-full px-4 py-2 font-[family-name:var(--font-label)] text-[13px] transition-all duration-200 ease-in-out ${
        isActive
          ? "bg-[#A0522D] text-white"
          : "border border-[#C9A87C] bg-[#FAF6F0] text-[#5C3D1E] hover:border-[#A0522D] hover:text-[#A0522D]"
      }`}
    >
      {children}
    </Link>
  );
}
