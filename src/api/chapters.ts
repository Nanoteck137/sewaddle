import { ClientResponseError } from "pocketbase";

import { pb } from "./pocketbase";

// async function getMangaChaptersBasic(id: string, page: number) {
//   const raw = await pb
//     .collection(BASIC_CHAPTER_INFO_COLLECTION)
//     .getList(page, undefined, {
//       filter: `manga = '${id}'`,
//     });

//   return await GetBasicChapterList.parseAsync(raw);
// }

// async function getChapter(id: string) {
//   let raw = await pb.collection("chapters").getOne(id);
//   return Chapter.parseAsync(raw);
// }

// async function getNextChapter(chapter: Chapter) {
//   try {
//     const rec = await pb
//       .collection("chapters")
//       .getFirstListItem(`(manga="${chapter.manga}" && idx > ${chapter.idx})`, {
//         fields: "id",
//       });
//     return rec.id;
//   } catch (e) {
//     if (e instanceof ClientResponseError) {
//       return null;
//     }

//     throw e;
//   }
// }

// async function getPrevChapter(chapter: Chapter) {
//   try {
//     const rec = await pb
//       .collection("chapters")
//       .getFirstListItem(`(manga="${chapter.manga}" && idx < ${chapter.idx})`, {
//         fields: "id",
//       });
//     return rec.id;
//   } catch (e) {
//     if (e instanceof ClientResponseError) {
//       return null;
//     }

//     throw e;
//   }
// }

// export async function fetchUserLastReadChapter(
//   userId: string,
//   mangaId: string,
// ) {
//   try {
//     const rec = await pb
//       .collection("userLastReadChapter")
//       .getFirstListItem(`(user = "${userId}" && manga = "${mangaId}")`);
//     return await UserLastReadChapter.parseAsync(rec);
//   } catch (e) {
//     if (e instanceof ClientResponseError) {
//       // TODO(patrik): Is there anything we need to check here?
//       return null;
//     }

//     throw e;
//   }
// }

// export async function fetchUserChapterRead(userId: string, mangaId: string) {
//   try {
//     const list = await pb.collection("userChapterRead").getFullList({
//       filter: `user = "${userId}" && chapter.manga = "${mangaId}"`,
//     });
//     return await UserChapterReadList.parseAsync(list);
//   } catch (e) {
//     if (e instanceof ClientResponseError) {
//       // TODO(patrik): Is there anything we need to check here?
//       return null;
//     }

//     throw e;
//   }
// }

// export async function fetchMangaSaved(userId: string, mangaId: string) {
//   try {
//     const rec = await pb
//       .collection("userMangaSaved")
//       .getFirstListItem(`user = "${userId}" && manga = "${mangaId}"`);
//     // TODO(patrik): Parse?
//     return rec.id;
//   } catch (e) {
//     if (e instanceof ClientResponseError) {
//       // TODO(patrik): Is there anything we need to check here?
//       return null;
//     }

//     throw e;
//   }
// }

// export async function fetchAllChapterIds(mangaId: string) {
//   const recs = await pb
//     .collection("chapters")
//     .getFullList({ filter: `manga = "${mangaId}"`, fields: "id" });
//   return await OnlyIdList.parseAsync(recs);
// }

// export async function createUserChapterRead(userId: string, chapterId: string) {
//   return await pb.collection("userChapterRead").create(
//     {
//       user: userId,
//       chapter: chapterId,
//     },
//     { $autoCancel: false },
//   );
// }

// export async function deleteUserChapterRead(id: string) {
//   return await pb.collection("userChapterRead").delete(id);
// }

// export async function createUserLastReadChapter(
//   userId: string,
//   mangaId: string,
//   chapterId: string,
//   page: number,
// ) {
//   return await pb.collection("userLastReadChapter").create({
//     user: userId,
//     manga: mangaId,
//     chapter: chapterId,
//     page,
//   });
// }

// export async function updateUserLastReadChapter(
//   id: string,
//   chapterId: string,
//   page: number,
// ) {
//   return await pb.collection("userLastReadChapter").update(id, {
//     chapter: chapterId,
//     page,
//   });
// }
