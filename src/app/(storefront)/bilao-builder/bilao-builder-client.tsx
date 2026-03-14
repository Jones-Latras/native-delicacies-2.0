"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Plus,
  Minus,
  ShoppingCart,
  Check,
  ArrowLeft,
  Search,
  RotateCcw,
  X,
} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatCurrency, cn } from "@/lib/utils";
import type { MenuItem } from "@/types";
import { BILAO_SIZES, PIECE_COLORS, type BilaoSize } from "./bilao-config";

interface BilaoItem {
  menuItem: MenuItem;
  quantity: number;
}

export function BilaoBuilderClient({ items }: { items: MenuItem[] }) {
  const addItem = useCartStore((s) => s.addItem);

  const [selectedSize, setSelectedSize] = useState<BilaoSize | null>(null);
  const [bilaoItems, setBilaoItems] = useState<BilaoItem[]>([]);
  const [added, setAdded] = useState(false);
  const [search, setSearch] = useState("");

  // Derived values
  const totalPieces = bilaoItems.reduce((sum, bi) => sum + bi.quantity, 0);
  const maxPieces = selectedSize?.pieces ?? 0;
  const progress = maxPieces > 0 ? Math.min(100, Math.round((totalPieces / maxPieces) * 100)) : 0;
  const isFull = totalPieces >= maxPieces;
  const canAddMore = selectedSize !== null && totalPieces < maxPieces;
  const bilaoTotal = bilaoItems.reduce((sum, bi) => sum + bi.menuItem.price * bi.quantity, 0);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(q));
  }, [items, search]);

  // Color mapping per item
  const itemColorMap = useMemo(() => {
    const map = new Map<string, (typeof PIECE_COLORS)[number]>();
    items.forEach((item, i) => {
      map.set(item.id, PIECE_COLORS[i % PIECE_COLORS.length]);
    });
    return map;
  }, [items]);

  function getItemQuantity(itemId: string) {
    return bilaoItems.find((bi) => bi.menuItem.id === itemId)?.quantity ?? 0;
  }

  function handleAddToBilao(item: MenuItem) {
    if (!canAddMore) return;
    setBilaoItems((prev) => {
      const existing = prev.find((bi) => bi.menuItem.id === item.id);
      if (existing) {
        return prev.map((bi) =>
          bi.menuItem.id === item.id ? { ...bi, quantity: bi.quantity + 1 } : bi
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
    setAdded(false);
  }

  function handleRemoveFromBilao(itemId: string) {
    setBilaoItems((prev) => {
      const existing = prev.find((bi) => bi.menuItem.id === itemId);
      if (!existing) return prev;
      if (existing.quantity <= 1) return prev.filter((bi) => bi.menuItem.id !== itemId);
      return prev.map((bi) =>
        bi.menuItem.id === itemId ? { ...bi, quantity: bi.quantity - 1 } : bi
      );
    });
    setAdded(false);
  }

  function handleAddToCart() {
    if (!selectedSize || !isFull) return;

    const bilaoLabel = `${selectedSize.name} Bilao`;

    for (const bi of bilaoItems) {
      addItem({
        menuItemId: bi.menuItem.id,
        name: bi.menuItem.name,
        price: bi.menuItem.price,
        quantity: bi.quantity,
        customizations: {},
        specialInstructions: `Part of ${bilaoLabel} (${selectedSize.pieces} pcs)`,
      });
    }

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setSelectedSize(null);
      setBilaoItems([]);
      setSearch("");
    }, 1500);
  }

  function handleReset() {
    setBilaoItems([]);
    setAdded(false);
  }

  function handleSizeSelect(size: BilaoSize) {
    setSelectedSize(size);
    setBilaoItems([]);
    setAdded(false);
    setSearch("");
  }

  // Generate pieces for the bilao tray visualization
  const trayPieces = useMemo(() => {
    const pieces: { id: string; label: string; bg: string; text: string }[] = [];
    bilaoItems.forEach((bi) => {
      const color = itemColorMap.get(bi.menuItem.id) ?? PIECE_COLORS[0];
      const label = bi.menuItem.name.slice(0, 4).toUpperCase();
      for (let i = 0; i < bi.quantity; i++) {
        pieces.push({
          id: `${bi.menuItem.id}-${i}`,
          label,
          bg: color.bg,
          text: color.text,
        });
      }
    });
    return pieces;
  }, [bilaoItems, itemColorMap]);

  return (
    <div className="min-h-screen bg-[#f8f7f6]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-stone-500">
          <Link href="/" className="hover:text-brown-600">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/menu" className="hover:text-brown-600">
            Menu
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-stone-900">Bilao Builder</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-900">Build Your Bilao</h1>
          <p className="mt-1 text-stone-500">
            Create your perfect bilao platter by choosing a size and filling it with your favorite delicacies
          </p>
        </div>

        {/* Main two-column layout */}
        <div className="flex flex-col gap-8 md:flex-row">
          {/* ─── LEFT COLUMN: Builder + Visualizer ─── */}
          <div className="flex-[1.5]">
            {/* Step 1: Choose Size */}
            <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-stone-900">
                Step 1: Choose Your Bilao Size
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {BILAO_SIZES.map((size) => {
                  const isSelected = selectedSize?.id === size.id;
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => handleSizeSelect(size)}
                      className={cn(
                        "rounded-xl border-2 p-4 text-center transition-all",
                        isSelected
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-stone-200 bg-white hover:border-primary/50"
                      )}
                    >
                      <div className="text-lg font-bold text-stone-900">{size.name}</div>
                      <div className="text-sm text-stone-500">{size.pieces} pieces</div>
                      <div className="mt-2 text-sm text-stone-400">
                        Price based on items
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visual Bilao Tray */}
            {selectedSize && (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-stone-900">
                    Your Bilao
                  </h2>
                  {bilaoItems.length > 0 && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="flex items-center gap-1 text-sm text-stone-500 hover:text-red-600"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reset
                    </button>
                  )}
                </div>

                {/* Circular bilao tray */}
                <div className="relative mx-auto aspect-square max-w-lg rounded-full border-8 border-primary/20 bg-primary/5 p-6">
                  {/* Radial dot pattern */}
                  <div
                    className="absolute inset-0 rounded-full opacity-10"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle, #8b4513 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}
                  />

                  {/* Pieces grid */}
                  <div className="relative grid h-full grid-cols-5 place-items-center gap-1 overflow-hidden">
                    {trayPieces.map((piece) => (
                      <div
                        key={piece.id}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full text-[10px] font-bold shadow-sm",
                          piece.bg,
                          piece.text
                        )}
                      >
                        {piece.label}
                      </div>
                    ))}
                    {/* Empty slots — show up to 30 to avoid overwhelming the UI */}
                    {Array.from(
                      { length: Math.max(0, Math.min(30, maxPieces - trayPieces.length)) },
                      (_, i) => (
                        <div
                          key={`empty-${i}`}
                          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-stone-300"
                        />
                      )
                    )}
                  </div>

                  {/* Counter badge */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-stone-700 shadow-md">
                    {totalPieces} / {maxPieces} pieces selected
                  </div>
                </div>

                {/* Selected items legend */}
                {bilaoItems.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    {bilaoItems.map((bi) => {
                      const color = itemColorMap.get(bi.menuItem.id) ?? PIECE_COLORS[0];
                      return (
                        <span
                          key={bi.menuItem.id}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                            color.bg,
                            color.text
                          )}
                        >
                          <span
                            className={cn("h-2 w-2 rounded-full", color.bg)}
                            style={{ filter: "brightness(0.8)" }}
                          />
                          {bi.menuItem.name} × {bi.quantity}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ─── RIGHT COLUMN: Product Selection + Summary ─── */}
          {selectedSize && (
            <div className="flex-1">
              <div className="flex h-[700px] flex-col rounded-xl bg-white shadow-sm">
                {/* Header */}
                <div className="border-b border-stone-100 p-4">
                  <h2 className="text-lg font-semibold text-stone-900">
                    Step 2: Add Delicacies
                  </h2>
                  <p className="text-sm text-stone-500">
                    Select items to fill your {selectedSize.name} bilao
                  </p>
                  {/* Search */}
                  <div className="relative mt-3">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Search delicacies..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full rounded-lg border border-stone-200 bg-stone-50 py-2 pl-10 pr-8 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Scrollable product grid */}
                <div className="flex-1 overflow-y-auto p-4">
                  {filteredItems.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center text-stone-400">
                      <Search className="mb-2 h-8 w-8" />
                      <p className="text-sm">No items found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {filteredItems.map((item) => {
                        const qty = getItemQuantity(item.id);
                        const color = itemColorMap.get(item.id) ?? PIECE_COLORS[0];
                        return (
                          <div
                            key={item.id}
                            className={cn(
                              "group relative overflow-hidden rounded-xl border-2 transition-all",
                              qty > 0
                                ? "border-primary/30 bg-primary/5"
                                : "border-stone-200 bg-white hover:border-stone-300"
                            )}
                          >
                            {/* Image area */}
                            <div className="relative aspect-square bg-gradient-to-br from-stone-100 to-stone-50">
                              {item.imageUrl ? (
                                <Image
                                  src={item.imageUrl}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 50vw, 200px"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center">
                                  <span className="text-3xl">🍘</span>
                                </div>
                              )}

                              {/* Add button */}
                              <button
                                type="button"
                                onClick={() => handleAddToBilao(item)}
                                disabled={!canAddMore}
                                className={cn(
                                  "absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full shadow-md transition-all",
                                  canAddMore
                                    ? "bg-primary text-white hover:scale-110"
                                    : "cursor-not-allowed bg-stone-200 text-stone-400"
                                )}
                              >
                                <Plus className="h-4 w-4" />
                              </button>

                              {/* Quantity badge */}
                              {qty > 0 && (
                                <div className="absolute left-2 top-2 flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFromBilao(item.id)}
                                    className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-stone-600 shadow-sm hover:bg-red-50 hover:text-red-600"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </button>
                                  <span
                                    className={cn(
                                      "rounded-full px-2 py-0.5 text-xs font-bold",
                                      color.bg,
                                      color.text
                                    )}
                                  >
                                    {qty}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Item info */}
                            <div className="p-2">
                              <h4 className="truncate text-sm font-semibold text-stone-900">
                                {item.name}
                              </h4>
                              <p className="text-xs text-stone-500">
                                {formatCurrency(item.price)} per piece
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer summary */}
                <div className="border-t border-stone-100 p-4">
                  {/* Total */}
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-semibold text-stone-900">Total</span>
                    <span className="text-xl font-bold text-primary">
                      {formatCurrency(bilaoTotal)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="mb-1 flex items-center justify-between text-xs text-stone-500">
                      <span>
                        {totalPieces} / {maxPieces} pieces
                      </span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-stone-200">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          isFull ? "bg-green-500" : "bg-primary"
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Add to cart button */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!isFull || added}
                    className={cn(
                      "flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white transition-all",
                      added
                        ? "bg-green-600"
                        : isFull
                        ? "bg-primary hover:bg-brown-700"
                        : "cursor-not-allowed bg-stone-300"
                    )}
                  >
                    {added ? (
                      <>
                        <Check className="h-5 w-5" />
                        Added to Cart!
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5" />
                        Complete &amp; Add to Cart
                      </>
                    )}
                  </button>

                  {!isFull && totalPieces > 0 && (
                    <p className="mt-2 text-center text-xs text-stone-400">
                      Add {maxPieces - totalPieces} more piece{maxPieces - totalPieces !== 1 ? "s" : ""} to complete your bilao
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Back to menu */}
        <div className="mt-8">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-sm font-medium text-brown-600 hover:text-brown-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Menu
          </Link>
        </div>
      </div>
    </div>
  );
}
