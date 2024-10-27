import { env } from "$env/dynamic/private";
import { ApiClient } from "$lib/api/client";
import { type Handle } from "@sveltejs/kit";

const apiAddress = env.API_ADDRESS ? env.API_ADDRESS : "";

export const handle: Handle = async ({ event, resolve }) => {
  const url = new URL(event.request.url);

  let addr = apiAddress;
  if (addr == "") {
    addr = url.origin;
  }

  const client = new ApiClient(addr);
  const auth = event.cookies.get("auth");
  if (auth) {
    const obj = JSON.parse(auth);
    client.setToken(obj.token);

    event.locals.loggedIn = true;
  }

  event.locals.apiClient = client;

  const response = await resolve(event);
  return response;
};
