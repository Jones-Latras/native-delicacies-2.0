"use client";

import { useState } from "react";
import Image from "next/image";
import {
  X,
  ShoppingCart,
  MapPin,
  Clock,
  Leaf,
  AlertTriangle,
  Minus,
  Plus,
  Info,
} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatCurrency, cn } from "@/lib/utils";
import { Badge } from "@/components/ui";
import type { MenuItem, MenuItemOption, CartItemCustomization } from "@/types";

interface ItemDetailModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ItemDetailModal({ item, isOpen, onClose }: ItemDetailModalProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, MenuItemOption>>({});
  const [specialInstructions, setSpecialInstructions] = useState("");

  if (!isOpen || !item) return null;

  const stockLeft = item.dailyLimit == null ? null : Math.max(item.dailyLimit - (item.soldToday ?? 0), 0);
  const isOutOfStock = !item.isAvailable || stockLeft === 0;

  // Group options by optionGroup
  const optionGroups = item.options.reduce<Record<string, MenuItemOption[]>>((acc, opt) => {
    const group = opt.optionGroup;
    if (!acc[group]) acc[group] = [];
    acc[group].push(opt);
    return acc;
  }, {});

  function selectOption(group: string, option: MenuItemOption) {
    setSelectedOptions((prev) => ({ ...prev, [group]: option }));
  }

  function handleAddToCart() {
    if (isOutOfStock) return;
    const sizeOption = selectedOptions["Size"];
    const addOns = Object.entries(selectedOptions)
      .filter(([group]) => group !== "Size")
      .map(([, opt]) => ({ name: opt.name, price: opt.priceModifier }));

    const customizations: CartItemCustomization = {};
    if (sizeOption) {
      customizations.size = sizeOption.name;
      customizations.sizePrice = sizeOption.priceModifier;
    }
    if (addOns.length > 0) {
      customizations.addOns = addOns;
    }

    addItem({
      menuItemId: item!.id,
      name: item!.name,
      price: item!.price,
      quantity,
      maxQuantity: stockLeft ?? undefined,
      imageUrl: item!.imageUrl,
      customizations,
      specialInstructions: specialInstructions || undefined,
    });

    // Reset & close
    setQuantity(1);
    setSelectedOptions({});
    setSpecialInstructions("");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-kape/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="animate-rise relative max-h-[95vh] w-full overflow-y-auto rounded-t-[1.75rem] border border-latik/18 bg-asukal/98 shadow-[0_24px_46px_rgba(59,31,14,0.20)] sm:max-w-2xl sm:rounded-[1.5rem]"
        role="dialog"
        aria-modal="true"
        aria-label={item.name}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full border border-asukal/30 bg-asukal/90 p-2 text-latik shadow-[0_12px_24px_rgba(59,31,14,0.12)] backdrop-blur-sm transition-all duration-300 ease-in-out hover:bg-asukal hover:text-pulot"
          aria-label="Close"
        >
          <X className="h-5 w-5" strokeWidth={1.5} />
        </button>

        <div className="relative h-56 bg-[linear-gradient(135deg,rgba(194,133,42,0.32),rgba(253,246,227,0.96),rgba(74,124,89,0.16))] sm:h-72">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 672px"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-6xl">🍘</span>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-3xl text-kape">{item.name}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-[0.68rem] uppercase tracking-[0.18em] text-latik/55">
                <span>{item.category.name}</span>
                {item.originRegion && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
                    {item.originRegion}
                  </span>
                )}
                {item.preparationMinutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
                    {item.preparationMinutes} min
                  </span>
                )}
              </div>
            </div>
            <span className="font-[family-name:var(--font-display)] text-3xl text-pulot">
              {formatCurrency(item.price)}
            </span>
          </div>

          <div className="mt-2 text-[0.68rem] uppercase tracking-[0.18em] text-latik/58">
            {stockLeft === null ? "In stock" : `${stockLeft} remaining today`}
          </div>

          <p className="mt-4 text-sm leading-7 text-latik/74">{item.description}</p>

          {item.dietaryTags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {item.dietaryTags.map((tag) => (
                <Badge key={tag} variant="success" className="gap-1">
                  <Leaf className="h-3 w-3" strokeWidth={1.5} />
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {item.heritageStory && (
            <div className="mt-5 rounded-[1.2rem] border border-pulot/18 bg-pulot/10 p-4">
              <h3 className="flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-pulot">
                <Info className="h-4 w-4" strokeWidth={1.5} />
                Heritage Story
              </h3>
              <p className="mt-3 text-sm leading-7 text-latik/78">
                {item.heritageStory}
              </p>
            </div>
          )}

          {(item.allergenInfo || item.storageInstructions) && (
            <div className="mt-5 space-y-2">
              {item.allergenInfo && (
                <p className="flex items-start gap-2 text-xs text-latik/70">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-pulot" strokeWidth={1.5} />
                  <span><strong>Allergens:</strong> {item.allergenInfo}</span>
                </p>
              )}
              {item.storageInstructions && (
                <p className="text-xs text-latik/70">
                  <strong>Storage:</strong> {item.storageInstructions}
                  {item.shelfLifeDays && ` · Best within ${item.shelfLifeDays} days`}
                </p>
              )}
            </div>
          )}

          {Object.keys(optionGroups).length > 0 && (
            <div className="mt-6 space-y-5">
              {Object.entries(optionGroups).map(([group, options]) => {
                const isRequired = options.some((o) => o.isRequired);
                return (
                  <div key={group}>
                    <h3 className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-kape">
                      {group}
                      {isRequired && <span className="ml-1 text-red-800/75">*</span>}
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {options
                        .sort((a, b) => a.displayOrder - b.displayOrder)
                        .map((option) => {
                          const isSelected = selectedOptions[group]?.id === option.id;
                          return (
                            <button
                              key={option.id}
                              onClick={() => selectOption(group, option)}
                              className={cn(
                                "rounded-full border px-4 py-2 text-[0.68rem] font-medium uppercase tracking-[0.16em] transition-all duration-300 ease-in-out",
                                isSelected
                                  ? "border-pulot bg-pulot/12 text-pulot"
                                  : "border-latik/18 bg-gatas/75 text-latik/75 hover:border-latik/28 hover:bg-gatas"
                              )}
                            >
                              {option.name}
                              {option.priceModifier > 0 && (
                                <span className="ml-1 text-[0.62rem] text-latik/45">
                                  +{formatCurrency(option.priceModifier)}
                                </span>
                              )}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6">
            <label htmlFor="special-instructions" className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-kape">
              Special Instructions
            </label>
            <textarea
              id="special-instructions"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Any special requests? (optional)"
              rows={2}
              maxLength={200}
              className="mt-2 w-full rounded-[1.15rem] border border-latik/18 bg-asukal/88 px-4 py-3 text-sm text-kape placeholder:text-latik/45 focus:border-pandan focus:outline-none focus:ring-2 focus:ring-pandan/20"
            />
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-full border border-latik/18 bg-gatas/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-10 w-10 items-center justify-center text-latik/65 transition-colors duration-300 hover:text-kape"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <span className="w-10 text-center font-semibold text-kape">{quantity}</span>
              <button
                onClick={() =>
                  setQuantity((q) => {
                    const cap = stockLeft ?? 99;
                    return Math.min(cap, q + 1);
                  })
                }
                className="flex h-10 w-10 items-center justify-center text-latik/65 transition-colors duration-300 hover:text-kape"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-btn)] border border-pulot bg-pulot py-3 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-asukal shadow-[0_16px_28px_rgba(59,31,14,0.14)] transition-all duration-300 ease-in-out hover:-translate-y-px hover:brightness-110 hover:shadow-[0_20px_34px_rgba(59,31,14,0.18)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingCart className="h-5 w-5" strokeWidth={1.5} />
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
