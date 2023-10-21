import path from "path";
import { env } from "../env";
import { MangaMetadata } from "../model/manga";
import fs from "fs";

export function writeMangaMetadata(dir: string, manga: MangaMetadata) {
  const metadataFile = path.join(dir, "manga.json");
  fs.writeFileSync(metadataFile, JSON.stringify(manga, null, 2));
}

export function readMangaMetadataFromDir(dir: string) {
  const mangaDataFile = path.join(dir, "manga.json");

  const s = fs.readFileSync(mangaDataFile);
  const obj = JSON.parse(s.toString());

  return MangaMetadata.parse(obj);
}

// TODO(patrik): This is wrong because the directory name might not actually
// be the mangaId
export function readMangaMetadataWithId(base: string, mangaId: string) {
  const mangaDir = path.join(base, mangaId);
  return readMangaMetadataFromDir(mangaDir);
}
