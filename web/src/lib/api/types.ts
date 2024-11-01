// DO NOT EDIT THIS: This file was generated by the Pyrin Typescript Generator
import { z } from "zod";

export const Serie = z.object({
  slug: z.string(),
  name: z.string(),
  cover: z.string(),
  chapterCount: z.number(),
});
export type Serie = z.infer<typeof Serie>;

export const GetSeries = z.object({
  series: z.array(Serie),
});
export type GetSeries = z.infer<typeof GetSeries>;

export const Bookmark = z.object({
  chapterSlug: z.string(),
});
export type Bookmark = z.infer<typeof Bookmark>;

export const SerieUserData = z.object({
  bookmark: Bookmark.nullable().optional(),
});
export type SerieUserData = z.infer<typeof SerieUserData>;

export const GetSerieBySlug = z.object({
  slug: z.string(),
  name: z.string(),
  cover: z.string(),
  chapterCount: z.number(),
  user: SerieUserData.nullable().optional(),
});
export type GetSerieBySlug = z.infer<typeof GetSerieBySlug>;

export const ChapterUserData = z.object({
  isMarked: z.boolean(),
});
export type ChapterUserData = z.infer<typeof ChapterUserData>;

export const Chapter = z.object({
  serieSlug: z.string(),
  slug: z.string(),
  title: z.string(),
  number: z.number(),
  coverArt: z.string(),
  user: ChapterUserData.nullable().optional(),
});
export type Chapter = z.infer<typeof Chapter>;

export const GetSerieChaptersBySlug = z.object({
  chapters: z.array(Chapter),
});
export type GetSerieChaptersBySlug = z.infer<typeof GetSerieChaptersBySlug>;

export const GetChapters = z.object({
  chapters: z.array(Chapter),
});
export type GetChapters = z.infer<typeof GetChapters>;

export const GetChapterBySlug = z.object({
  serieSlug: z.string(),
  slug: z.string(),
  title: z.string(),
  number: z.number(),
  coverArt: z.string(),
  user: ChapterUserData.nullable().optional(),
  nextChapter: z.string().nullable(),
  prevChapter: z.string().nullable(),
  pages: z.array(z.string()),
});
export type GetChapterBySlug = z.infer<typeof GetChapterBySlug>;

export const PostUserMarkChaptersBody = z.object({
  serieSlug: z.string(),
  chapters: z.array(z.string()),
});
export type PostUserMarkChaptersBody = z.infer<typeof PostUserMarkChaptersBody>;

export const PostUserUnmarkChaptersBody = z.object({
  serieSlug: z.string(),
  chapters: z.array(z.string()),
});
export type PostUserUnmarkChaptersBody = z.infer<typeof PostUserUnmarkChaptersBody>;

export const PostUserUpdateBookmarkBody = z.object({
  serieSlug: z.string(),
  chapterSlug: z.string(),
  page: z.number(),
});
export type PostUserUpdateBookmarkBody = z.infer<typeof PostUserUpdateBookmarkBody>;

export const GetSystemInfo = z.object({
  version: z.string(),
});
export type GetSystemInfo = z.infer<typeof GetSystemInfo>;

export const PostAuthSignup = z.object({
  id: z.string(),
  username: z.string(),
});
export type PostAuthSignup = z.infer<typeof PostAuthSignup>;

export const PostAuthSignupBody = z.object({
  username: z.string(),
  password: z.string(),
  passwordConfirm: z.string(),
});
export type PostAuthSignupBody = z.infer<typeof PostAuthSignupBody>;

export const PostAuthSignin = z.object({
  token: z.string(),
});
export type PostAuthSignin = z.infer<typeof PostAuthSignin>;

export const PostAuthSigninBody = z.object({
  username: z.string(),
  password: z.string(),
});
export type PostAuthSigninBody = z.infer<typeof PostAuthSigninBody>;

export const GetAuthMe = z.object({
  id: z.string(),
  username: z.string(),
  isOwner: z.boolean(),
});
export type GetAuthMe = z.infer<typeof GetAuthMe>;

