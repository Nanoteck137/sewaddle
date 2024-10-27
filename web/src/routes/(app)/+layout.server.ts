import type { GetAuthMe } from "$lib/api/types";
import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
  let user: GetAuthMe | undefined = undefined;

  if (locals.loggedIn) {
    const res = await locals.apiClient.getMe();
    if (!res.success) {
      throw error(res.error.code, { message: res.error.message });
    }

    user = res.data;
  }

  return {
    user,
  };
};
