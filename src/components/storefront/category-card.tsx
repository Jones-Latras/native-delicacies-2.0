import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { SURFACE_CARD_BASE_CLASS } from "@/components/ui";

interface CategoryCardProps {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string | null;
  itemCount: number;
}

const CATEGORY_ICONS: Record<string, string> = {
  kakanin: "🍘",
  pastries: "🥐",
  "biscuits-cookies": "🍪",
  "sweets-preserves": "🍬",
  "pasalubong-bundles": "🎁",
};

export function CategoryCard({ name, slug, description, imageUrl, itemCount }: CategoryCardProps) {
  return (
    <Link
      href={`/menu?category=${slug}`}
      className={cn(
        SURFACE_CARD_BASE_CLASS,
        "group relative overflow-hidden rounded-[var(--radius-card)] border-2 border-latik/20 bg-asukal/78 shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-pulot/22 hover:bg-asukal/88 hover:shadow-[0_18px_30px_rgba(59,31,14,0.14)]"
      )}
    >
      <div className="relative h-40 overflow-hidden bg-[linear-gradient(135deg,rgba(194,133,42,0.34),rgba(253,246,227,0.92),rgba(74,124,89,0.18))]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-5xl transition-transform duration-300 group-hover:scale-110">
              {CATEGORY_ICONS[slug] ?? "🍽️"}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-kape/72 via-kape/18 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-[family-name:var(--font-display)] text-xl text-asukal drop-shadow-sm">{name}</h3>
          <p className="mt-1 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-asukal/78">
            {itemCount} items
          </p>
        </div>
      </div>
      {description && (
        <div className="p-4">
          <p className="line-clamp-2 text-sm leading-6 text-latik/72">{description}</p>
        </div>
      )}
    </Link>
  );
}
