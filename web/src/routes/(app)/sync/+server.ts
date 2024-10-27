import { error, redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ locals, request }) => {
  const res = await locals.apiClient.runLibrarySync();
  if (!res.success) {
    throw error(res.error.code, { message: res.error.message });
  }

  const formData = await request.formData();
  const redirectTo = formData.get("redirectTo");
  if (!redirectTo) {
    throw redirect(301, "/");
  } else {
    throw redirect(301, redirectTo.toString());
  }

  return new Response();
};
