import { BuyBox } from "@/components/product/buy-box";
import { ProductGallery } from "@/components/product/product-gallery";
import { PRODUCT } from "@/lib/product";

export function ProductHero() {
  return (
    <section id="product" className="section-spacing">
      <div className="container-shell">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-start lg:gap-14">
          <ProductGallery images={PRODUCT.gallery} alt={PRODUCT.name} />
          <BuyBox />
        </div>
      </div>
    </section>
  );
}
