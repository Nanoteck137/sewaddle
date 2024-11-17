import { z } from "zod";
import * as api from "./types";
import { BaseApiClient, type ExtraOptions } from "./base-client";

export const GET_SERIES_URL = "/api/v1/series"
export const GET_SERIE_BY_ID_URL = "/api/v1/series/:id"
export const GET_SERIE_CHAPTERS_URL = "/api/v1/series/:id/chapters"
export const GET_CHAPTERS_URL = "/api/v1/chapters"
export const GET_CHAPTER_BY_ID_URL = "/api/v1/chapters/:id"
export const MARK_CHAPTERS_URL = "/api/v1/user/markChapters"
export const UNMARK_CHAPTERS_URL = "/api/v1/user/unmarkChapters"
export const UPDATE_BOOKMARK_URL = "/api/v1/user/updateBookmark"
export const GET_SYSTEM_INFO_URL = "/api/v1/system/info"
export const SIGNUP_URL = "/api/v1/auth/signup"
export const SIGNIN_URL = "/api/v1/auth/signin"
export const GET_ME_URL = "/api/v1/auth/me"

export class ApiClient extends BaseApiClient {
  constructor(baseUrl: string) {
    super(baseUrl);
  }
  
  getSeries(options?: ExtraOptions) {
    return this.request("/api/v1/series", "GET", api.GetSeries, z.undefined(), undefined, options)
  }
  
  getSerieById(id: string, options?: ExtraOptions) {
    return this.request(`/api/v1/series/${id}`, "GET", api.GetSerieById, z.undefined(), undefined, options)
  }
  
  getSerieChapters(id: string, options?: ExtraOptions) {
    return this.request(`/api/v1/series/${id}/chapters`, "GET", api.GetSerieChaptersById, z.undefined(), undefined, options)
  }
  
  getChapters(options?: ExtraOptions) {
    return this.request("/api/v1/chapters", "GET", api.GetChapters, z.undefined(), undefined, options)
  }
  
  getChapterById(id: string, options?: ExtraOptions) {
    return this.request(`/api/v1/chapters/${id}`, "GET", api.GetChapterById, z.undefined(), undefined, options)
  }
  
  markChapters(body: api.PostUserMarkChaptersBody, options?: ExtraOptions) {
    return this.request("/api/v1/user/markChapters", "POST", z.undefined(), z.undefined(), body, options)
  }
  
  unmarkChapters(body: api.PostUserUnmarkChaptersBody, options?: ExtraOptions) {
    return this.request("/api/v1/user/unmarkChapters", "POST", z.undefined(), z.undefined(), body, options)
  }
  
  updateBookmark(body: api.PostUserUpdateBookmarkBody, options?: ExtraOptions) {
    return this.request("/api/v1/user/updateBookmark", "POST", z.undefined(), z.undefined(), body, options)
  }
  
  getSystemInfo(options?: ExtraOptions) {
    return this.request("/api/v1/system/info", "GET", api.GetSystemInfo, z.undefined(), undefined, options)
  }
  
  signup(body: api.PostAuthSignupBody, options?: ExtraOptions) {
    return this.request("/api/v1/auth/signup", "POST", api.PostAuthSignup, z.undefined(), body, options)
  }
  
  signin(body: api.PostAuthSigninBody, options?: ExtraOptions) {
    return this.request("/api/v1/auth/signin", "POST", api.PostAuthSignin, z.undefined(), body, options)
  }
  
  getMe(options?: ExtraOptions) {
    return this.request("/api/v1/auth/me", "GET", api.GetAuthMe, z.undefined(), undefined, options)
  }
}
