import Image from "next/image";
import Link from "next/link";
import { Candy, Cookie, Croissant, Gift, type LucideIcon, Wheat } from "lucide-react";

interface CategoryCardProps {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string | null;
  itemCount: number;
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  kakanin: Wheat,
  pastries: Croissant,
  "biscuits-cookies": Cookie,
  "sweets-preserves": Candy,
  "pasalubong-bundles": Gift,
};

export function CategoryCard({ name, slug, description, imageUrl, itemCount }: CategoryCardProps) {
  const Icon = CATEGORY_ICONS[slug] ?? Wheat;

  return (
    <Link
      href={`/menu?category=${slug}`}
      aria-label={description ? `${name}: ${description}` : name}
      title={description ?? name}
      className="group relative min-w-[176px] shrink-0 cursor-pointer overflow-hidden rounded-[12px] border-[1.5px] border-[#C9A87C] bg-[#FAF6F0] px-4 py-6 text-center shadow-[0_2px_10px_rgba(90,50,20,0.04)] transition-all duration-200 ease-in-out hover:-translate-y-[5px] hover:border-[#A0522D] hover:shadow-[0_8px_24px_rgba(90,50,20,0.10)] sm:min-w-[190px] lg:min-w-0"
    >
      <div className="relative mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#F5E6C8]">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt=""
            fill
            aria-hidden="true"
            className="object-cover opacity-20 transition-transform duration-200 ease-in-out group-hover:scale-110"
            sizes="56px"
          />
        )}
        <div className="relative flex h-full w-full items-center justify-center">
          <Icon className="h-7 w-7 text-[#5C3D1E]" strokeWidth={1.7} />
        </div>
      </div>

      <h3 className="mt-3 font-[family-name:var(--font-display)] text-[15px] font-semibold text-[#3E2012]">
        {name}
      </h3>
      <p className="mt-1 font-[family-name:var(--font-label)] text-[12px] text-[#7A6A55]">
        {itemCount} items
      </p>
    </Link>
  );
}
