// Picks the photo for each home-page category tile from the real catalog.
//
// 1. A category with products shows its newest in-stock product (or its newest
//    product if they're all sold out).
// 2. An empty category borrows a photo from another category's product that no
//    other tile is using yet (in-stock first), so tiles don't repeat.
// 3. Only if the store has no product photos at all does a tile fall back to
//    the category's own placeholder image.

type CategoryLike = { name: string; image: string };
type ProductLike = { category: string; images: string[]; isSoldOut?: boolean; stock?: number };

const firstImage = (product: ProductLike) => product.images.find((image) => typeof image === "string" && image.length > 0);
const isAvailable = (product: ProductLike) => !product.isSoldOut && Number(product.stock ?? 1) > 0;

/** `products` must be newest first (as the catalog returns them). Returns category name → image URL. */
export function pickCategoryImages(categories: CategoryLike[], products: ProductLike[]): Record<string, string> {
  const withPhoto = products.filter((product) => firstImage(product));
  // In-stock first, keeping newest-first order within each group (sort is stable).
  const ranked = [...withPhoto].sort((a, b) => Number(isAvailable(b)) - Number(isAvailable(a)));

  const picked: Record<string, string> = {};
  const used = new Set<string>();

  for (const category of categories) {
    const own = ranked.find((product) => product.category === category.name);
    if (own) {
      picked[category.name] = firstImage(own)!;
      used.add(picked[category.name]);
    }
  }

  // Distinct photos not on any tile yet (two products can share the same photo).
  const spare = [...new Set(ranked.map((product) => firstImage(product)!))].filter((image) => !used.has(image));
  let next = 0;
  for (const category of categories) {
    if (picked[category.name]) continue;
    if (spare.length > 0 && next < spare.length) {
      picked[category.name] = spare[next++];
    } else if (ranked.length > 0) {
      // More empty categories than spare photos: reuse product photos in turn.
      picked[category.name] = firstImage(ranked[(next++ - spare.length) % ranked.length])!;
    } else {
      picked[category.name] = category.image;
    }
  }
  return picked;
}
