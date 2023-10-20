import path from "path";
import { env } from "../env";
import { MangaMetadata } from "../model/manga";
import fs from "fs";

export function writeMangaMetadata(manga: MangaMetadata) {
  let mangaDir = path.join(env.TARGET_PATH, manga.id.toString());

  const metadataFile = path.join(mangaDir, "manga.json");
  fs.writeFileSync(metadataFile, JSON.stringify(manga, null, 2));
}

export function readMangaMetadataFromDir(dir: string) {
  const mangaDataFile = path.join(dir, "manga.json");

  const s = fs.readFileSync(mangaDataFile);
  const obj = JSON.parse(s.toString());

  return MangaMetadata.parse(obj);
}

export function readMangaMetadataWithId(mangaId: string) {
  const mangaDir = path.join(env.TARGET_PATH, mangaId);
  return readMangaMetadataFromDir(mangaDir);
}
