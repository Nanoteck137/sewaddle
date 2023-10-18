import { and, eq } from "drizzle-orm";
import { db } from "./db";
import {
  chapters,
  mangas,
  createId,
  users,
  userChapterMarked,
  userBookmarks,
} from "./schema";
import fs from "fs";
import axios from "axios";
import { env } from "./env";
import path from "path";

async function reset(target: string) {
  const ids = await db.query.mangas.findMany({ columns: { id: true } });
  console.log("Removing", ids.length);

  for (let id of ids) {
    const p = path.join(target, id.id);
    if (fs.existsSync(p)) {
      console.log("Removing", p);
      fs.rmSync(p, { recursive: true, force: true });
    }
    await db.delete(mangas).where(eq(mangas.id, id.id));
  }

  const userIds = await db.query.users.findMany({ columns: { id: true } });

  for (let id of userIds) {
    await db.delete(users).where(eq(users.id, id.id));
  }
}

const names = [
  "JoJo's Bizarre Adventure Part 9: The JoJoLands",
  "JoJo's Bizarre Adventure Part 8: Jojolion",
  "JoJo's Bizarre Adventure Part 7: Steel Ball Run",
  "JoJo's Bizarre Adventure Part 6: Stone Ocean",
  "JoJo's Bizarre Adventure Part 5: Golden Wind",
  "JoJo's Bizarre Adventure Part 4: Diamond Is Unbreakable",
  "JoJo's Bizarre Adventure Part 3: Stardust Crusaders",
  "JoJo's Bizarre Adventure Part 2: Battle Tendency",
  "JoJo's Bizarre Adventure Part 1: Phantom Blood",
  "The Quintessential Quintuplets",
  "Hell's Paradise: Jigokuraku",
  "Jujutsu Kaisen",
  "My Hero Academia",
  "One-Punch Man",
  "Tokyo Ghoul",
  "Chainsaw Man",
];

const coverSizes = [
  [400, 636],
  [460, 634],
  [460, 643],
  [460, 652],
  [460, 653],
  [460, 657],
  [460, 715],
  [460, 717],
  [460, 718],
  [460, 720],
  [460, 722],
  [460, 723],
];

const pageSizes = [
  [1000, 1200],
  [1112, 1600],
  [1127, 1600],
  [1423, 2048],
  [1428, 2048],
  [1488, 2100],
  [1600, 1148],
  [1693, 1200],
  [1694, 1200],
  [1800, 1350],
  [2133, 1517],
  [2133, 1586],
  [2133, 1590],
  [2560, 1803],
  [2560, 1805],
  [700, 1140],
  [700, 1214],
  [700, 300],
  [700, 900],
  [720, 3096],
  [720, 3479],
  [720, 3652],
  [720, 855],
  [783, 1000],
  [825, 1400],
  [849, 1250],
  [852, 1250],
];

async function getImage(target: string, width: number, height: number) {
  let name = `${width}x${height}.png`;
  let output = path.join(target, name);

  if (fs.existsSync(output)) {
    console.log("Using cached image");
    return output;
  }

  let url = `https://dummyimage.com/${name}/9123eb/fff`;
  const result = await axios.get(url, {
    responseType: "arraybuffer",
  });
  fs.writeFileSync(output, result.data);

  return output;
}

async function main() {
  await reset(env.TARGET_PATH);

  const cache = path.join(env.TARGET_PATH, "cache");
  fs.mkdirSync(cache, { recursive: true });

  const [admin] = await db
    .insert(users)
    .values({ username: "admin", password: "admin" })
    .returning({ userId: users.id });

  for (let i = 0; i < 10; i++) {
    const coverSize = coverSizes[Math.floor(Math.random() * coverSizes.length)];
    let coverImage = await getImage(cache, coverSize[0], coverSize[1]);

    const id = createId();
    const p = path.join(env.TARGET_PATH, id);
    fs.mkdirSync(p, { recursive: true });

    const chaptersPath = path.join(p, "chapters");
    fs.mkdirSync(chaptersPath, { recursive: true });

    const coverDest = path.join(p, "cover.png");
    fs.copyFileSync(coverImage, coverDest);

    const name = names[Math.floor(Math.random() * names.length)];
    const [res] = await db
      .insert(mangas)
      .values({ id, title: name, cover: path.basename(coverDest) })
      .returning({ id: mangas.id });
    // console.log(res);

    const numChapters = Math.floor(Math.random() * 10) + 2;
    for (let chapterIndex = 1; chapterIndex <= numChapters; chapterIndex++) {
      if (chapterIndex == 4) continue;

      const chapterPath = path.join(chaptersPath, chapterIndex.toString());
      fs.mkdirSync(chapterPath, { recursive: true });

      const pages = [];

      const numPages = Math.floor(Math.random() * 30) + 6;
      for (let pageIndex = 0; pageIndex < numPages; pageIndex++) {
        let pageSize = pageSizes[Math.floor(Math.random() * pageSizes.length)];
        let pageImage = await getImage(cache, pageSize[0], pageSize[1]);
        const page = `${pageIndex}.png`;
        fs.copyFileSync(pageImage, path.join(chapterPath, page));
        pages.push(page);
      }

      await db.insert(chapters).values({
        index: chapterIndex,
        name: `Chapter ${chapterIndex}`,
        mangaId: res.id,
        cover: pages[0],
        pages,
      });

      if (Math.random() > 0.5) {
        await db.insert(userChapterMarked).values({
          userId: admin.userId,
          mangaId: res.id,
          index: chapterIndex,
        });
      }

      if (chapterIndex === 2) {
        await db.insert(userBookmarks).values({
          userId: admin.userId,
          mangaId: res.id,
          chapterIndex,
          page: 0,
        });
      }
    }
  }

  const res = await db.query.mangas.findMany({
    with: {
      chapters: true,
    },
  });

  console.log(
    "Query",
    res,
    // res.map((r) => r.chapters),
    // res.map((r) => r.chapters.map((c) => c.pages)),
  );

  const user = await db.query.users.findMany();
  console.log("Users", user);

  const chapterRead = await db.query.userChapterMarked.findMany();
  console.log("chapterRead", chapterRead);

  const userBookmarkValues = await db.query.userBookmarks.findMany();
  console.log("chapterRead", userBookmarkValues);
}

main().catch((e) => {
  console.error(e);
});
