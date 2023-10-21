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
import fs, { write } from "fs";
import axios from "axios";
import { env } from "./env";
import path from "path";
import commander, { Command } from "commander";
import { z } from "zod";
import { ChapterMetadata, MangaMetadata } from "./model/manga";
import { readMangaMetadataWithId, writeMangaMetadata } from "./util/manga";

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

const program = new Command();

function customParseInt(value: string, prev: number) {
  // parseInt takes a string and a radix
  const parsedValue = parseInt(value, 10);
  if (isNaN(parsedValue)) {
    throw new commander.InvalidArgumentError("not a number");
  }
  return parsedValue;
}

program
  .command("gen")
  .argument("<num>", "Number of mangas to generate", customParseInt)
  .action(async (num: number) => {
    console.log(num);
    for (let i = 0; i < num; i++) {
      const manga = await generateManga();
      console.log(manga);
      await addChapter(manga);
      await addChapter(manga);
      await addChapter(manga);
      await addChapter(manga);
      // console.log(manga);

      const dir = path.join(env.TEST_PATH, manga.id.toString());
      writeMangaMetadata(dir, manga);
    }
  });

program.command("reset").action(() => {
  const entries = fs.readdirSync(env.TEST_PATH);
  for (let entry of entries) {
    if (entry === "cache") continue;
    const p = path.join(env.TEST_PATH, entry);
    fs.rmSync(p, { recursive: true, force: true });
  }
});

program.command("change-manga").action(() => {});
program.command("add-chapters").action(async () => {
  const entries = fs.readdirSync(env.TEST_PATH).filter((c) => c !== "cache");
  const randomMangaId = entries[Math.floor(Math.random() * entries.length)];
  const manga = readMangaMetadataWithId(env.TEST_PATH, randomMangaId);
  await addChapter(manga);
  console.log(manga);

  const dir = path.join(env.TEST_PATH, manga.id.toString());
  writeMangaMetadata(dir, manga);
});

program.command("add-pages").action(async () => {
  const entries = fs.readdirSync(env.TEST_PATH).filter((c) => c !== "cache");
  const randomMangaId = entries[Math.floor(Math.random() * entries.length)];
  const manga = readMangaMetadataWithId(env.TEST_PATH, randomMangaId);

  const mangaDir = path.join(env.TEST_PATH, manga.id.toString());
  const chaptersDir = path.join(mangaDir, "chapters");

  const chapter =
    manga.chapters[Math.floor(Math.random() * manga.chapters.length)];

  const chapterPath = path.join(chaptersDir, chapter.index.toString());

  await addPage(chapter, chapterPath);

  const dir = path.join(env.TEST_PATH, manga.id.toString());
  writeMangaMetadata(dir, manga);
});

program.parse();

const opts = program.opts();
console.log(opts);

async function addPage(chapter: ChapterMetadata, dir: string) {
  const pageIndex = chapter.pages.length;
  let pageSize = pageSizes[Math.floor(Math.random() * pageSizes.length)];
  let pageImage = await getImage(pageSize[0], pageSize[1]);
  const page = `${pageIndex}.png`;
  fs.copyFileSync(pageImage, path.join(dir, page));
  chapter.pages.push(page);
}

async function addChapter(manga: MangaMetadata) {
  const mangaDir = path.join(env.TEST_PATH, manga.id.toString());
  const chaptersDir = path.join(mangaDir, "chapters");

  const chapterIndex = manga.chapters.length + 1;

  const chapterPath = path.join(chaptersDir, chapterIndex.toString());
  fs.mkdirSync(chapterPath, { recursive: true });

  const chapter: ChapterMetadata = {
    index: chapterIndex,
    name: `Chapter ${chapterIndex}`,
    pages: [],
  };

  const pages = [];
  const numPages = Math.floor(Math.random() * 30) + 6;
  for (let pageIndex = 0; pageIndex < numPages; pageIndex++) {
    await addPage(chapter, chapterPath);
  }

  console.log("Chapter", chapter);

  manga.chapters.push(chapter);
}

async function generateManga() {
  const coverSize = coverSizes[Math.floor(Math.random() * coverSizes.length)];
  let coverImage = await getImage(coverSize[0], coverSize[1]);

  const id = createId();
  const p = path.join(env.TEST_PATH, id);
  fs.mkdirSync(p, { recursive: true });

  const chaptersDir = path.join(p, "chapters");
  fs.mkdirSync(chaptersDir, { recursive: true });

  const imagesDir = path.join(p, "images");
  fs.mkdirSync(imagesDir, { recursive: true });

  const coverDest = path.join(imagesDir, "cover.png");
  fs.copyFileSync(coverImage, coverDest);

  const title = names[Math.floor(Math.random() * names.length)];

  const manga: MangaMetadata = {
    id,
    title,
    cover: "cover.png",
    chapters: [],
  };

  return manga;
}

async function getImage(width: number, height: number) {
  const cache = path.join(env.TEST_PATH, "cache");

  let name = `${width}x${height}.png`;
  let output = path.join(cache, name);

  if (fs.existsSync(output)) {
    return output;
  }

  fs.mkdirSync(cache, { recursive: true });

  let url = `https://dummyimage.com/${name}/9123eb/fff`;
  const result = await axios.get(url, {
    responseType: "arraybuffer",
  });
  fs.writeFileSync(output, result.data);

  return output;
}
