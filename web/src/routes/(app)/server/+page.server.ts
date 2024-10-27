import { error } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
  runSync: async ({ locals }) => {
    const res = await locals.apiClient.runLibrarySync();
    if (!res.success) {
      throw error(res.error.code, { message: res.error.message });
    }
  },
};
