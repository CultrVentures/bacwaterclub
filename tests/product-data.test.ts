import { existsSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { PRODUCT, formatPriceCents, getVariant } from "@/lib/product";

const publicDir = path.resolve(__dirname, "..", "public");

function resolvePublicPath(relative: string): string {
  return path.join(publicDir, relative.replace(/^\//, ""));
}

describe("PRODUCT data", () => {
  it("has at least one variant with a valid price", () => {
    expect(PRODUCT.variants.length).toBeGreaterThan(0);
    for (const variant of PRODUCT.variants) {
      expect(variant.priceCents).toBeGreaterThan(0);
      expect(variant.vialCount).toBeGreaterThan(0);
      expect(variant.totalMl).toBe(variant.vialCount * 30);
    }
  });

  it("has unique variant ids and SKUs", () => {
    const ids = new Set(PRODUCT.variants.map((v) => v.id));
    const skus = new Set(PRODUCT.variants.map((v) => v.sku));
    expect(ids.size).toBe(PRODUCT.variants.length);
    expect(skus.size).toBe(PRODUCT.variants.length);
  });

  it("has compareAt prices that are higher than the sale price when set", () => {
    for (const variant of PRODUCT.variants) {
      if (variant.compareAtCents != null) {
        expect(variant.compareAtCents).toBeGreaterThan(variant.priceCents);
      }
    }
  });

  it("has the expected 2-pack and 4-pack pricing", () => {
    expect(getVariant("2pack").priceCents).toBe(2500);
    expect(getVariant("4pack").priceCents).toBe(4500);
  });

  it("throws for unknown variant ids", () => {
    // @ts-expect-error — intentionally bad id
    expect(() => getVariant("999pack")).toThrow();
  });

  it("points every gallery image at an existing file on disk", () => {
    for (const src of PRODUCT.gallery) {
      expect(existsSync(resolvePublicPath(src))).toBe(true);
    }
  });

  it("points every variant main image at an existing file on disk", () => {
    for (const variant of PRODUCT.variants) {
      expect(existsSync(resolvePublicPath(variant.mainImage))).toBe(true);
    }
  });

  it("points every lifestyle image at an existing file on disk", () => {
    for (const src of PRODUCT.lifestyleImages) {
      expect(existsSync(resolvePublicPath(src))).toBe(true);
    }
  });

  it("includes at least three FAQ entries", () => {
    expect(PRODUCT.faq.length).toBeGreaterThanOrEqual(3);
    for (const entry of PRODUCT.faq) {
      expect(entry.question.length).toBeGreaterThan(0);
      expect(entry.answer.length).toBeGreaterThan(0);
    }
  });
});

describe("formatPriceCents", () => {
  it("formats whole-dollar amounts without cents", () => {
    expect(formatPriceCents(2500)).toBe("$25");
  });

  it("formats non-whole amounts with cents", () => {
    expect(formatPriceCents(2599)).toBe("$25.99");
  });
});
