import { z } from "zod";

export const Collection = z.object({
  id: z.string(),

  created: z.coerce.date(),
  updated: z.coerce.date(),

  collectionId: z.string(),
  collectionName: z.string(),
});
export type Collection = z.infer<typeof Collection>;

export function createGetListSchema<ItemType extends z.AnyZodObject>(
  itemType: ItemType,
) {
  return z.object({
    items: z.array(itemType),
    page: z.number(),
    perPage: z.number(),
    totalItems: z.number(),
    totalPages: z.number(),
  });
}
