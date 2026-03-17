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
        "group relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg"
      )}
    >
      <div className="relative h-36 overflow-hidden bg-gradient-to-br from-brown-50 to-amber-100">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-semibold text-white drop-shadow-sm">{name}</h3>
          <p className="text-xs text-white/80">{itemCount} items</p>
        </div>
      </div>
      {description && (
        <div className="p-3">
          <p className="text-xs text-stone-500 line-clamp-2">{description}</p>
        </div>
      )}
    </Link>
  );
}
