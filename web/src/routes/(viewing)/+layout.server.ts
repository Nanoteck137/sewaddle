import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
  return {
    apiAddress: locals.apiAddress,
    userToken: locals.token,
    user: locals.user,
  };
};
