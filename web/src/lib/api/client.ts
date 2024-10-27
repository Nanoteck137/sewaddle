import { z } from "zod";
import * as api from "./types";
import { BaseApiClient, createError, type ExtraOptions } from "./base-client";

export class ApiClient extends BaseApiClient {
  constructor(baseUrl: string) {
    super(baseUrl);
  }
  
  getSeries(options?: ExtraOptions) {
    const error = createError(
      z.enum(["UNKNOWN_ERROR"]),
      z.map(z.string(), z.string()).optional(),
    )
    return this.request("/api/v1/series", "GET", api.GetSeries, error, undefined, options)
  }
  
  getSerieById(slug: string, options?: ExtraOptions) {
    const error = createError(
      z.enum(["UNKNOWN_ERROR", "SERIE_NOT_FOUND"]),
      z.map(z.string(), z.string()).optional(),
    )
    return this.request(`/api/v1/series/${slug}`, "GET", api.GetSerieBySlug, error, undefined, options)
  }
  
  getSerieChapters(slug: string, options?: ExtraOptions) {
    const error = createError(
      z.enum(["UNKNOWN_ERROR"]),
      z.map(z.string(), z.string()).optional(),
    )
    return this.request(`/api/v1/series/${slug}/chapters`, "GET", api.GetSerieChaptersBySlug, error, undefined, options)
  }
  
  getChapters(options?: ExtraOptions) {
    const error = createError(
      z.enum(["UNKNOWN_ERROR"]),
      z.map(z.string(), z.string()).optional(),
    )
    return this.request("/api/v1/chapters", "GET", api.GetChapters, error, undefined, options)
  }
  
  getChapterBySlug(serieSlug: string, slug: string, options?: ExtraOptions) {
    const error = createError(
      z.enum(["UNKNOWN_ERROR"]),
      z.map(z.string(), z.string()).optional(),
    )
    return this.request(`/api/v1/chapters/${serieSlug}/${slug}`, "GET", api.GetChapterBySlug, error, undefined, options)
  }
  
  getLibraryStatus(options?: ExtraOptions) {
    const error = createError(
      z.enum(["UNKNOWN_ERROR"]),
      z.map(z.string(), z.string()).optional(),
    )
    return this.request("/api/v1/library/status", "GET", api.GetLibraryStatus, error, undefined, options)
  }
  
  runLibrarySync(options?: ExtraOptions) {
    const error = createError(
      z.enum(["UNKNOWN_ERROR"]),
      z.map(z.string(), z.string()).optional(),
    )
    return this.request("/api/v1/library/sync", "POST", z.undefined(), error, undefined, options)
  }
  
  markChapters(body: api.PostUserMarkChaptersBody, options?: ExtraOptions) {
    const error = createError(
      z.enum(["UNKNOWN_ERROR"]),
      z.map(z.string(), z.string()).optional(),
    )
    return this.request("/api/v1/user/markChapters", "POST", z.undefined(), error, body, options)
  }
  
  unmarkChapters(body: api.PostUserUnmarkChaptersBody, options?: ExtraOptions) {
    const error = createError(
      z.enum(["UNKNOWN_ERROR"]),
      z.map(z.string(), z.string()).optional(),
    )
    return this.request("/api/v1/user/unmarkChapters", "POST", z.undefined(), error, body, options)
  }
  
  updateBookmark(body: api.PostUserUpdateBookmarkBody, options?: ExtraOptions) {
    const error = createError(
      z.enum(["UNKNOWN_ERROR"]),
      z.map(z.string(), z.string()).optional(),
    )
    return this.request("/api/v1/user/updateBookmark", "POST", z.undefined(), error, body, options)
  }
  
  getSystemInfo(options?: ExtraOptions) {
    const error = createError(
      z.enum(["UNKNOWN_ERROR"]),
      z.map(z.string(), z.string()).optional(),
    )
    return this.request("/api/v1/system/info", "GET", api.GetSystemInfo, error, undefined, options)
  }
  
  runSystemSetup(body: api.PostSystemSetupBody, options?: ExtraOptions) {
    const error = createError(
      z.enum(["UNKNOWN_ERROR"]),
      z.map(z.string(), z.string()).optional(),
    )
    return this.request("/api/v1/system/setup", "POST", z.undefined(), error, body, options)
  }
  
  signup(body: api.PostAuthSignupBody, options?: ExtraOptions) {
    const error = createError(
      z.enum(["UNKNOWN_ERROR"]),
      z.map(z.string(), z.string()).optional(),
    )
    return this.request("/api/v1/auth/signup", "POST", api.PostAuthSignup, error, body, options)
  }
  
  signin(body: api.PostAuthSigninBody, options?: ExtraOptions) {
    const error = createError(
      z.enum(["UNKNOWN_ERROR"]),
      z.map(z.string(), z.string()).optional(),
    )
    return this.request("/api/v1/auth/signin", "POST", api.PostAuthSignin, error, body, options)
  }
  
  getMe(options?: ExtraOptions) {
    const error = createError(
      z.enum(["UNKNOWN_ERROR"]),
      z.map(z.string(), z.string()).optional(),
    )
    return this.request("/api/v1/auth/me", "GET", api.GetAuthMe, error, undefined, options)
  }
}
