import { ApiClient } from "$lib/api/client";

export function createApiClient(data: {
  apiAddress: string;
  userToken?: string;
}) {
  const apiClient = new ApiClient(data.apiAddress);
  apiClient.setToken(data.userToken);
  return apiClient;
}

type BareBoneError = {
  code: number;
  message: string;
  type: string;
};

export function formatError(err: BareBoneError) {
  return `${err.type} (${err.code}): ${err.message}`;
}
