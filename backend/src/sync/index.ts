import { and, eq } from "drizzle-orm";
import { existsSync } from "fs";
import fs from "fs/promises";
import path from "path";
import { db } from "../db";
import { getCollectionDir, getTargetDir } from "../env";
import { chapters, mangas } from "../schema";
import { readMangaMetadataFromDir } from "../util/manga";

const CHAPTERS_DIR = "chapters";
const IMAGES_DIR = "images";
const MANGA_FILENAME = "manga.json";

function isValidEntry(p: string) {
  const chapterDirExists = existsSync(path.join(p, CHAPTERS_DIR));
  const imageDirExists = existsSync(path.join(p, IMAGES_DIR));
  const mangaFileExists = existsSync(path.join(p, MANGA_FILENAME));

  return chapterDirExists && imageDirExists && mangaFileExists;
}

async function syncDatabase() {
  const targetDir = getTargetDir();

  // TODO(patrik): We dont need the filter anymore
  const entries = (await fs.readdir(targetDir)).filter((e) => e !== "cache");

  const mangaList = await db.query.mangas.findMany({
    where: eq(mangas.available, true),
    with: {
      chapters: {
        where: eq(chapters.available, true),
      },
    },
  });

  const mangaCollection = entries
    .map((e) => path.join(targetDir, e))
    .filter((dir) => {
      return isValidEntry(dir);
    })
    .map((dir) => {
      return readMangaMetadataFromDir(dir);
    });

  const missingManga = mangaCollection.filter(
    (m) => !mangaList.find((ml) => ml.id === m.id),
  );

  const deletedManga = mangaList.filter(
    (manga) => !mangaCollection.find((m) => m.id === manga.id),
  );

  const changedManga = mangaList
    .filter((m) => !deletedManga.find((dm) => dm.id === m.id))
    .map((m) => {
      const obj = mangaCollection.find((mc) => mc.id === m.id);

      return {
        mangaId: m.id,
        changes: {
          title: obj && m.title !== obj.title ? obj.title : undefined,
          cover: obj && m.cover !== obj.cover ? obj.cover : undefined,

          description:
            obj && m.description !== obj.description
              ? obj.description
              : undefined,
          anilistId:
            obj && m.anilistId !== obj.anilistId ? obj.anilistId : undefined,
          malId: obj && m.malId !== obj.malId ? obj.malId : undefined,
          status: obj && m.status !== obj.status ? obj.status : undefined,
          startDate:
            obj && m.startDate !== obj.startDate ? obj.startDate : undefined,
          endDate: obj && m.endDate !== obj.endDate ? obj.endDate : undefined,
        },
      };
    })
    .filter((c) => !Object.values(c.changes).every((e) => e === undefined));

  console.log("Changed Manga", changedManga);

  console.log(
    "Deleted Manga",
    deletedManga.map((m) => m.id),
  );

  console.log(
    "Missing Manga",
    missingManga.map((m) => m.id),
  );

  const missingChapters = mangaCollection
    .map((manga) => {
      const exists = mangaList.find((m) => m.id === manga.id);
      return manga.chapters
        .filter(
          (chapter) =>
            !exists?.chapters.find((c) => c.index === chapter.index),
        )
        .map((chapter) => ({ mangaId: manga.id, ...chapter }))
        .filter((c) => c !== undefined);
    })
    .flat();

  console.log(
    "Missing Chapters",
    missingChapters.map((c) => `${c.mangaId} : ${c.index}`),
  );

  const deletedChapters = mangaList
    .map((manga) => {
      const collection = mangaCollection.find((m) => m.id === manga.id);
      return manga.chapters.filter((chapter) => {
        return !collection?.chapters.find((c) => c.index === chapter.index);
      });
    })
    .flat();

  console.log(
    "Deleted Chapters",
    deletedChapters.map((c) => `${c.mangaId} : ${c.index}`),
  );

  const compareStringArrays = (a: string[], b: string[]) =>
    a.length === b.length && a.every((element, index) => element === b[index]);

  const changedChapters = mangaList
    .map((manga) => {
      const collection = mangaCollection.find((m) => m.id === manga.id);
      return manga.chapters.map((chapter) => {
        const colChapter = collection?.chapters.find(
          (c) => c.index === chapter.index,
        );

        return {
          mangaId: manga.id,
          chapterIndex: chapter.index,
          changes: {
            name:
              chapter.name != colChapter?.name ? colChapter?.name : undefined,
            pages:
              colChapter &&
              !compareStringArrays(chapter.pages, colChapter.pages)
                ? colChapter.pages
                : undefined,
          },
        };
      });
    })
    .flat()
    .filter((c) => !Object.values(c.changes).every((e) => e === undefined));

  console.log("Chapter Changes", changedChapters);

  for (const chapter of deletedChapters) {
    await db
      .update(chapters)
      .set({ available: false })
      .where(
        and(
          eq(chapters.mangaId, chapter.mangaId),
          eq(chapters.index, chapter.index),
        ),
      );
  }

  for (const manga of deletedManga) {
    await db
      .update(mangas)
      .set({ available: false })
      .where(eq(mangas.id, manga.id));
  }

  for (const manga of missingManga) {
    await db
      .insert(mangas)
      .values({
        ...manga,
      })
      .onConflictDoUpdate({
        target: mangas.id,
        set: { available: true },
      });
  }

  for (const chapter of missingChapters) {
    await db
      .insert(chapters)
      .values({
        ...chapter,
        cover: chapter.pages[0],
      })
      .onConflictDoUpdate({
        target: [chapters.mangaId, chapters.index],
        set: { ...chapter, available: true },
      });
  }

  for (const manga of changedManga) {
    await db
      .update(mangas)
      .set(manga.changes)
      .where(eq(mangas.id, manga.mangaId));
  }

  for (const chapter of changedChapters) {
    await db
      .update(chapters)
      .set(chapter.changes)
      .where(
        and(
          eq(chapters.mangaId, chapter.mangaId),
          eq(chapters.index, chapter.chapterIndex),
        ),
      );
  }
}

// TODO(patrik): Detect deletion
async function syncTarget() {
  const collectionDir = getCollectionDir();
  const targetDir = getTargetDir();

  const entries = (await fs.readdir(collectionDir)).filter((e) =>
    isValidEntry(path.join(collectionDir, e)),
  );
  console.log(entries);

  if (existsSync(targetDir)) {
    (await fs.readdir(targetDir)).forEach((e) => {
      fs.unlink(path.join(targetDir, e));
    });
  } else {
    await fs.mkdir(targetDir, { recursive: true });
  }

  entries.forEach((e) => {
    const src = path.resolve(path.join(collectionDir, e));
    const metadata = readMangaMetadataFromDir(src);
    const dest = path.join(targetDir, metadata.id.toString());
    if (!existsSync(dest)) {
      fs.symlink(src, dest);
    }
  });
}

export async function fullSync() {
  await syncTarget();
  console.log("Target syncing successful");

  await syncDatabase();
  console.log("Database syncing successful");
}
