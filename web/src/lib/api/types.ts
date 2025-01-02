// DO NOT EDIT THIS: This file was generated by the Pyrin Typescript Generator
import { z } from "zod";

export const Images = z.object({
  small: z.string(),
  medium: z.string(),
  large: z.string(),
});
export type Images = z.infer<typeof Images>;

export const Serie = z.object({
  id: z.string(),
  name: z.string(),
  coverArt: Images,
});
export type Serie = z.infer<typeof Serie>;

export const GetSeries = z.object({
  series: z.array(Serie),
});
export type GetSeries = z.infer<typeof GetSeries>;

export const Bookmark = z.object({
  chapterId: z.string(),
});
export type Bookmark = z.infer<typeof Bookmark>;

export const SerieUserData = z.object({
  bookmark: Bookmark.nullable().optional(),
});
export type SerieUserData = z.infer<typeof SerieUserData>;

export const GetSerieById = z.object({
  id: z.string(),
  name: z.string(),
  coverArt: Images,
  user: SerieUserData.nullable().optional(),
});
export type GetSerieById = z.infer<typeof GetSerieById>;

export const ChapterUserData = z.object({
  isMarked: z.boolean(),
});
export type ChapterUserData = z.infer<typeof ChapterUserData>;

export const Chapter = z.object({
  id: z.string(),
  name: z.string(),
  serieId: z.string(),
  pages: z.array(z.string()),
  coverArt: Images,
  user: ChapterUserData.nullable().optional(),
});
export type Chapter = z.infer<typeof Chapter>;

export const GetSerieChapters = z.object({
  chapters: z.array(Chapter),
});
export type GetSerieChapters = z.infer<typeof GetSerieChapters>;

export const CreateSerie = z.object({
  serieId: z.string(),
});
export type CreateSerie = z.infer<typeof CreateSerie>;

export const CreateSerieBody = z.object({
  name: z.string(),
});
export type CreateSerieBody = z.infer<typeof CreateSerieBody>;

export const GetChapters = z.object({
  chapters: z.array(Chapter),
});
export type GetChapters = z.infer<typeof GetChapters>;

export const GetChapterById = z.object({
  id: z.string(),
  name: z.string(),
  serieId: z.string(),
  pages: z.array(z.string()),
  coverArt: Images,
  user: ChapterUserData.nullable().optional(),
  nextChapter: z.string().nullable(),
  prevChapter: z.string().nullable(),
});
export type GetChapterById = z.infer<typeof GetChapterById>;

export const UploadChapterBody = z.object({
  name: z.string(),
  serieId: z.string(),
});
export type UploadChapterBody = z.infer<typeof UploadChapterBody>;

export const PostUserMarkChaptersBody = z.object({
  chapters: z.array(z.string()),
});
export type PostUserMarkChaptersBody = z.infer<typeof PostUserMarkChaptersBody>;

export const PostUserUnmarkChaptersBody = z.object({
  chapters: z.array(z.string()),
});
export type PostUserUnmarkChaptersBody = z.infer<typeof PostUserUnmarkChaptersBody>;

export const PostUserUpdateBookmarkBody = z.object({
  serieId: z.string(),
  chapterId: z.string(),
  page: z.number(),
});
export type PostUserUpdateBookmarkBody = z.infer<typeof PostUserUpdateBookmarkBody>;

export const GetSystemInfo = z.object({
  version: z.string(),
});
export type GetSystemInfo = z.infer<typeof GetSystemInfo>;

export const Signup = z.object({
  id: z.string(),
  username: z.string(),
});
export type Signup = z.infer<typeof Signup>;

export const SignupBody = z.object({
  username: z.string(),
  password: z.string(),
  passwordConfirm: z.string(),
});
export type SignupBody = z.infer<typeof SignupBody>;

export const Signin = z.object({
  token: z.string(),
});
export type Signin = z.infer<typeof Signin>;

export const SigninBody = z.object({
  username: z.string(),
  password: z.string(),
});
export type SigninBody = z.infer<typeof SigninBody>;

export const ChangePasswordBody = z.object({
  currentPassword: z.string(),
  newPassword: z.string(),
  newPasswordConfirm: z.string(),
});
export type ChangePasswordBody = z.infer<typeof ChangePasswordBody>;

export const GetMe = z.object({
  id: z.string(),
  username: z.string(),
  role: z.string(),
  displayName: z.string(),
  quickPlaylist: z.string().nullable(),
});
export type GetMe = z.infer<typeof GetMe>;

