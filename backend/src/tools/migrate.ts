import { z } from "zod";
import { db } from "../db";
import { mangas, userBookmarks, userChapterMarked, users } from "../schema";
import { and, eq } from "drizzle-orm";

const User = z.object({
  username: z.string(),
});

const Manga = z.object({
  englishTitle: z.string(),
});

const Chapter = z.object({
  idx: z.number(),
  expand: z.object({
    manga: Manga,
  }),
});

const Expanded = z.object({
  expand: z.object({
    user: User,
    chapter: Chapter,
  }),
});

async function fetchPage(endpoint: string, collection: string, page: number) {
  let perPage = 500;
  const res = await fetch(
    `${endpoint}/api/collections/${collection}/records?perPage=${perPage}&page=${page}&expand=user,chapter.manga`,
  );
  const obj = await res.json();
  const PageSchema = z.object({
    totalPages: z.number(),
    items: z.array(Expanded),
  });
  const p = PageSchema.parse(obj);
  return p;
}

async function getAllMarks(endpoint: string, collection: string) {
  const firstPage = await fetchPage(endpoint, collection, 1);
  for (let i = 0; i < firstPage.totalPages - 1; i++) {
    const p = await fetchPage(endpoint, collection, i + 2);
    p.items.forEach((i) => firstPage.items.push(i));
  }

  return firstPage.items;
}

async function syncBookmarks(endpoint: string) {
  const bookmarks = await getAllMarks(endpoint, "userBookmarks");
  console.log(bookmarks.length);

  for (const bookmark of bookmarks) {
    const ex = bookmark.expand;

    const manga = await db.query.mangas.findFirst({
      where: and(
        eq(mangas.title, ex.chapter.expand.manga.englishTitle),
        eq(mangas.available, true),
      ),
    });

    if (!manga) {
      console.log(
        `No manga with title: ${ex.chapter.expand.manga.englishTitle}`,
      );
      continue;
    }

    const user = await db.query.users.findFirst({
      where: eq(users.username, ex.user.username),
      columns: { id: true },
    });

    if (!user) {
      console.log(`Missing user: ${ex.user.username}`);
      continue;
    }

    await db
      .insert(userBookmarks)
      .values({
        userId: user.id,
        mangaId: manga.id,
        chapterIndex: ex.chapter.idx,
        page: 0,
      })
      .onConflictDoNothing();
  }
}

async function syncMarks(endpoint: string) {
  const marks = await getAllMarks(endpoint, "userMarkedChapters");
  console.log(marks.length);

  for (const mark of marks) {
    const ex = mark.expand;

    const manga = await db.query.mangas.findFirst({
      where: and(
        eq(mangas.title, ex.chapter.expand.manga.englishTitle),
        eq(mangas.available, true),
      ),
    });

    if (!manga) {
      console.log(
        `No manga with title: ${ex.chapter.expand.manga.englishTitle}`,
      );
      continue;
    }

    const user = await db.query.users.findFirst({
      where: eq(users.username, ex.user.username),
      columns: { id: true },
    });

    if (!user) {
      console.log(`Missing user: ${ex.user.username}`);
      continue;
    }

    await db
      .insert(userChapterMarked)
      .values({
        userId: user.id,
        index: ex.chapter.idx,
        mangaId: manga.id,
      })
      .onConflictDoNothing();
  }
}

async function main() {
  const endpoint = process.argv[2];
  await syncMarks(endpoint);
  await syncBookmarks(endpoint);
}

main()
  .then(() => console.log("Successful"))
  .catch(console.error);
