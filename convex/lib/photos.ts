import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
export function productPhotos(
  product: Pick<Doc<"products">, "photos" | "image" | "images">,
) {
  return (
    product.photos ??
    [product.image, ...(product.images ?? [])]
      .filter(Boolean)
      .map((url) => ({ url }))
  );
}
export async function resolveProductPhotos(
  ctx: QueryCtx,
  product: Doc<"products">,
) {
  if (!product.photos) return product;
  const urls = await Promise.all(
    product.photos.map((photo) =>
      "url" in photo ? photo.url : ctx.storage.getUrl(photo.storageId),
    ),
  );
  return {
    ...product,
    image: urls[0] ?? "/photo-unavailable.svg",
    images: urls.slice(1).map((url) => url ?? "/photo-unavailable.svg"),
  };
}
export async function resolveOrderPhotos(ctx: QueryCtx, order: Doc<"orders">) {
  return {
    ...order,
    items: await Promise.all(
      order.items.map(async (item) => ({
        ...item,
        image: item.imageStorageId
          ? ((await ctx.storage.getUrl(item.imageStorageId)) ??
            "/photo-unavailable.svg")
          : item.image,
      })),
    ),
  };
}
