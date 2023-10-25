import { Router } from "express";
import { existsSync } from "fs";
import path from "path";
import { ZodError, z } from "zod";
import { getTargetDir } from "../env";

const FetchMangaImageSchema = z.object({
  mangaId: z.string().cuid2(),
  image: z.string(),
});

const FetchChapterImageSchema = z.object({
  mangaId: z.string().cuid2(),
  chapterIndex: z.coerce.number(),
  image: z.string(),
});

export default Router()
  .get("/manga/:mangaId/:image", async (req, res) => {
    setTimeout(async () => {
      try {
        const params = await FetchMangaImageSchema.parseAsync(req.params);

        const p = path.join(getTargetDir(), params.mangaId, "images");
        console.log(p);

        if (!existsSync(path.join(p, params.image))) {
          res.status(404);
          return;
        }

        res.sendFile(params.image, { root: p, maxAge: 86400 * 30 * 1000 });
      } catch (e) {
        if (e instanceof ZodError) {
          res.status(400).json({ message: e.errors[0].message });
          return;
        }
      }
    }, 1000);
  })
  .get("/chapter/:mangaId/:chapterIndex/:image", async (req, res) => {
    try {
      const params = await FetchChapterImageSchema.parseAsync(req.params);

      const p = path.join(
        getTargetDir(),
        params.mangaId,
        "chapters",
        params.chapterIndex.toString(),
      );
      res.sendFile(params.image, { root: p });
    } catch (e) {
      if (e instanceof ZodError) {
        res.status(400).json({ message: e.errors[0].message });
        return;
      }
    }
  });
