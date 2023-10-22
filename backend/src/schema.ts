import { init } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  foreignKey,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const createId = init({
  length: 8,
});

export const createChapterId = init({
  length: 12,
});

export const createUserId = init({
  length: 16,
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(createUserId),

  username: text("username").notNull().unique(),
  // TODO(patrik): Hash password
  password: text("password").notNull(),

  isAdmin: integer("isAdmin", { mode: "boolean" }).default(false),
});

export const userChapterMarked = sqliteTable(
  "userChapterMarked",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    mangaId: text("mangaId").notNull(),
    index: integer("index").notNull(),
  },
  (userChapterRead) => ({
    pk: primaryKey(
      userChapterRead.userId,
      userChapterRead.mangaId,
      userChapterRead.index,
    ),
    chapterReference: foreignKey(() => ({
      columns: [userChapterRead.mangaId, userChapterRead.index],
      foreignColumns: [chapters.mangaId, chapters.index],
    })).onDelete("cascade"),
  }),
);

export const userBookmarks = sqliteTable(
  "userBookmarks",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    mangaId: text("mangaId")
      .notNull()
      .references(() => mangas.id, { onDelete: "cascade" }),
    chapterIndex: integer("chapterIndex").notNull(),
    page: integer("page").notNull(),
  },
  (userBookmark) => ({
    pk: primaryKey(userBookmark.userId, userBookmark.mangaId),
    chapterReference: foreignKey(() => ({
      columns: [userBookmark.mangaId, userBookmark.chapterIndex],
      foreignColumns: [chapters.mangaId, chapters.index],
    })).onDelete("cascade"),
  }),
);

export const mangas = sqliteTable(
  "mangas",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    title: text("title").notNull(),

    anilistId: integer("anilistId"),
    malId: integer("malId"),

    description: text("description"),
    color: text("color"),

    cover: text("cover").notNull(),

    available: integer("available", { mode: "boolean" })
      .notNull()
      .default(true),
  },
  (mangas) => ({
    anilistIndex: uniqueIndex("anilistIndex").on(mangas.anilistId),
    malIndex: uniqueIndex("malIndex").on(mangas.malId),
  }),
);

export const mangaRelations = relations(mangas, ({ many }) => ({
  chapters: many(chapters),
}));

export const chapters = sqliteTable(
  "chapters",
  {
    // id: text("id").primaryKey().$defaultFn(createId),
    index: integer("index").notNull(),
    name: text("name").notNull(),

    mangaId: text("mangaId")
      .references(() => mangas.id, { onDelete: "cascade" })
      .notNull(),

    cover: text("cover").notNull(),
    pages: text("pages", { mode: "json" }).$type<string[]>().notNull(),

    available: integer("available", { mode: "boolean" })
      .notNull()
      .default(true),
  },
  (chapters) => ({
    pk: primaryKey(chapters.mangaId, chapters.index),
    // indexIndex: uniqueIndex("indexIndex").on(chapters.mangaId, chapters.index),
  }),
);

export const chaptersRelations = relations(chapters, ({ one }) => ({
  manga: one(mangas, {
    fields: [chapters.mangaId],
    references: [mangas.id],
  }),
}));

export const serverConfig = sqliteTable("serverConifg", {
  id: integer("id").primaryKey().default(0),
  owner: text("owner")
    .references(() => users.id)
    .notNull(),
});
export type ServerConfig = typeof serverConfig.$inferSelect;

export const serverConfigRelations = relations(serverConfig, ({ one }) => ({
  owner: one(users, {
    fields: [serverConfig.owner],
    references: [users.id],
  }),
}));
