-- CreateIndex
CREATE INDEX "addresses_userId_idx" ON "addresses"("userId");

-- CreateIndex
CREATE INDEX "menu_item_options_menuItemId_idx" ON "menu_item_options"("menuItemId");

-- CreateIndex
CREATE INDEX "menu_items_categoryId_idx" ON "menu_items"("categoryId");

-- CreateIndex
CREATE INDEX "menu_items_isAvailable_isFeatured_idx" ON "menu_items"("isAvailable", "isFeatured");

-- CreateIndex
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");

-- CreateIndex
CREATE INDEX "order_items_menuItemId_idx" ON "order_items"("menuItemId");

-- CreateIndex
CREATE INDEX "promo_redemptions_promoCodeId_idx" ON "promo_redemptions"("promoCodeId");

-- CreateIndex
CREATE INDEX "promo_redemptions_userId_idx" ON "promo_redemptions"("userId");
