import { fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms/server";
import type { Actions, PageServerLoad } from "./$types";
import { LoginSchema } from "$lib/schemas";

export const load: PageServerLoad = async (event) => {
  const form = await superValidate(event, LoginSchema);
  return { form };
};

export const actions: Actions = {
  default: async (event) => {
    const form = await superValidate(event, LoginSchema);
    console.log(form);

    if (!form.valid) {
      return fail(400, {
        form,
      });
    }

    // TODO(patrik): Login

    throw redirect(302, "/");
  },
};
