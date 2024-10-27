import { redirect } from "@sveltejs/kit";

export const POST = async ({ cookies, locals }) => {
  cookies.delete("auth", {
    path: "/",
    secure: false,
  });
  locals.loggedIn = false;
  locals.apiClient.setToken(undefined);

  throw redirect(303, "/login");
};
