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

  function calculateTotal(): number {
    let base = item!.price;
    const sizeOption = selectedOptions["Size"];
    if (sizeOption) base = sizeOption.priceModifier;

    const addOnTotal = Object.entries(selectedOptions)
      .filter(([group]) => group !== "Size")
      .reduce((sum, [, opt]) => sum + opt.priceModifier, 0);

    return (base + addOnTotal) * quantity;
  }

  function handleAddToCart() {
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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative max-h-[95vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-label={item.name}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-stone-500 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-stone-900"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Image */}
        <div className="relative h-56 bg-gradient-to-br from-brown-100 to-amber-100 sm:h-72">
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
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-stone-900">{item.name}</h2>
              <div className="mt-1 flex items-center gap-3 text-sm text-stone-500">
                <span>{item.category.name}</span>
                {item.originRegion && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {item.originRegion}
                  </span>
                )}
                {item.preparationMinutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {item.preparationMinutes} min
                  </span>
                )}
              </div>
            </div>
            <span className="text-2xl font-bold text-brown-600">
              {formatCurrency(item.price)}
            </span>
          </div>

          {/* Description */}
          <p className="mt-4 text-stone-600 leading-relaxed">{item.description}</p>

          {/* Dietary tags */}
          {item.dietaryTags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {item.dietaryTags.map((tag) => (
                <Badge key={tag} variant="success" className="gap-1">
                  <Leaf className="h-3 w-3" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Heritage Story */}
          {item.heritageStory && (
            <div className="mt-5 rounded-xl bg-brown-50 p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-brown-700">
                <Info className="h-4 w-4" />
                Heritage Story
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-brown-600">
                {item.heritageStory}
              </p>
            </div>
          )}

          {/* Allergen & Storage Info */}
          {(item.allergenInfo || item.storageInstructions) && (
            <div className="mt-4 space-y-2">
              {item.allergenInfo && (
                <p className="flex items-start gap-2 text-xs text-stone-500">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                  <span><strong>Allergens:</strong> {item.allergenInfo}</span>
                </p>
              )}
              {item.storageInstructions && (
                <p className="text-xs text-stone-500">
                  <strong>Storage:</strong> {item.storageInstructions}
                  {item.shelfLifeDays && ` · Best within ${item.shelfLifeDays} days`}
                </p>
              )}
            </div>
          )}

          {/* Options */}
          {Object.keys(optionGroups).length > 0 && (
            <div className="mt-6 space-y-5">
              {Object.entries(optionGroups).map(([group, options]) => {
                const isRequired = options.some((o) => o.isRequired);
                return (
                  <div key={group}>
                    <h3 className="text-sm font-semibold text-stone-900">
                      {group}
                      {isRequired && <span className="ml-1 text-red-500">*</span>}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {options
                        .sort((a, b) => a.displayOrder - b.displayOrder)
                        .map((option) => {
                          const isSelected = selectedOptions[group]?.id === option.id;
                          return (
                            <button
                              key={option.id}
                              onClick={() => selectOption(group, option)}
                              className={cn(
                                "rounded-xl border-2 px-4 py-2 text-sm font-medium transition-colors",
                                isSelected
                                  ? "border-brown-600 bg-brown-50 text-brown-700"
                                  : "border-stone-200 text-stone-600 hover:border-stone-300"
                              )}
                            >
                              {option.name}
                              {option.priceModifier > 0 && (
                                <span className="ml-1 text-xs text-stone-400">
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

          {/* Special Instructions */}
          <div className="mt-6">
            <label htmlFor="special-instructions" className="text-sm font-semibold text-stone-900">
              Special Instructions
            </label>
            <textarea
              id="special-instructions"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Any special requests? (optional)"
              rows={2}
              maxLength={200}
              className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 focus:border-brown-500 focus:outline-none focus:ring-2 focus:ring-brown-500/20"
            />
          </div>

          {/* Quantity & Add to Cart */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-xl border border-stone-200">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-10 w-10 items-center justify-center text-stone-500 hover:text-stone-900"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-semibold text-stone-900">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-10 w-10 items-center justify-center text-stone-500 hover:text-stone-900"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!item.isAvailable}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brown-600 py-3 font-semibold text-white transition-colors hover:bg-brown-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingCart className="h-5 w-5" />
              Add to Cart — {formatCurrency(calculateTotal())}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
