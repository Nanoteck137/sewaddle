import { z } from "zod";

export const Id = z.string();
export type Id = z.infer<typeof Id>;

export const ViewCollection = z.object({
  id: Id,

  collectionId: z.string(),
  collectionName: z.string(),
});
export type ViewCollection = z.infer<typeof ViewCollection>;

export const Collection = z.object({
  id: Id,

  created: z.coerce.date(),
  updated: z.coerce.date(),

  collectionId: z.string(),
  collectionName: z.string(),
});
export type Collection = z.infer<typeof Collection>;

export function createGetPagedListSchema<ItemType extends z.AnyZodObject>(
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

export function createGetFullListSchema<ItemType extends z.AnyZodObject>(
  itemType: ItemType,
) {
  return z.array(itemType);
}

export const OnlyId = Collection.pick({ id: true });
export type OnlyId = z.infer<typeof OnlyId>;

export const OnlyIdFullList = createGetFullListSchema(OnlyId);
export type OnlyIdFullList = z.infer<typeof OnlyIdFullList>;
