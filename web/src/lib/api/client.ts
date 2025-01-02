import { z } from "zod";
import * as api from "./types";
import { BaseApiClient, type ExtraOptions } from "./base-client";


export class ApiClient extends BaseApiClient {
  constructor(baseUrl: string) {
    super(baseUrl);
  }
  
  getSeries(options?: ExtraOptions) {
    return this.request("/api/v1/series", "GET", api.GetSeries, z.any(), undefined, options)
  }
  
  getSerieById(id: string, options?: ExtraOptions) {
    return this.request(`/api/v1/series/${id}`, "GET", api.GetSerieById, z.any(), undefined, options)
  }
  
  getSerieChapters(id: string, options?: ExtraOptions) {
    return this.request(`/api/v1/series/${id}/chapters`, "GET", api.GetSerieChapters, z.any(), undefined, options)
  }
  
  createSerie(body: api.CreateSerieBody, options?: ExtraOptions) {
    return this.request("/api/v1/series", "POST", api.CreateSerie, z.any(), body, options)
  }
  
  deleteSerie(id: string, options?: ExtraOptions) {
    return this.request(`/api/v1/series/${id}`, "DELETE", z.undefined(), z.any(), undefined, options)
  }
  
  getChapters(options?: ExtraOptions) {
    return this.request("/api/v1/chapters", "GET", api.GetChapters, z.any(), undefined, options)
  }
  
  getChapterById(id: string, options?: ExtraOptions) {
    return this.request(`/api/v1/chapters/${id}`, "GET", api.GetChapterById, z.any(), undefined, options)
  }
  
  removeChapter(id: string, options?: ExtraOptions) {
    return this.request(`/api/v1/chapters/${id}`, "DELETE", z.undefined(), z.any(), undefined, options)
  }
  
  markChapters(body: api.PostUserMarkChaptersBody, options?: ExtraOptions) {
    return this.request("/api/v1/user/markChapters", "POST", z.undefined(), z.any(), body, options)
  }
  
  unmarkChapters(body: api.PostUserUnmarkChaptersBody, options?: ExtraOptions) {
    return this.request("/api/v1/user/unmarkChapters", "POST", z.undefined(), z.any(), body, options)
  }
  
  updateBookmark(body: api.PostUserUpdateBookmarkBody, options?: ExtraOptions) {
    return this.request("/api/v1/user/updateBookmark", "POST", z.undefined(), z.any(), body, options)
  }
  
  getSystemInfo(options?: ExtraOptions) {
    return this.request("/api/v1/system/info", "GET", api.GetSystemInfo, z.any(), undefined, options)
  }
  
  signup(body: api.SignupBody, options?: ExtraOptions) {
    return this.request("/api/v1/auth/signup", "POST", api.Signup, z.any(), body, options)
  }
  
  signin(body: api.SigninBody, options?: ExtraOptions) {
    return this.request("/api/v1/auth/signin", "POST", api.Signin, z.any(), body, options)
  }
  
  changePassword(body: api.ChangePasswordBody, options?: ExtraOptions) {
    return this.request("/api/v1/auth/password", "PATCH", z.undefined(), z.any(), body, options)
  }
  
  getMe(options?: ExtraOptions) {
    return this.request("/api/v1/auth/me", "GET", api.GetMe, z.any(), undefined, options)
  }
  
  changeSerieCover(id: string, formData: FormData, options?: ExtraOptions) {
    return this.requestWithFormData(`/api/v1/series/${id}/cover`, "POST", z.undefined(), z.undefined(), formData, options)
  }
  
  uploadChapter(formData: FormData, options?: ExtraOptions) {
    return this.requestWithFormData("/api/v1/chapters", "POST", z.undefined(), z.undefined(), formData, options)
  }
}
