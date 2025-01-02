import { ApiClient } from "$lib/api/client";
import ConfirmModal, {
  type Props as ConfirmModalProps,
} from "$lib/components/modals/ConfirmModal.svelte";
import InputModal, {
  type Props as InputModalProps,
} from "$lib/components/modals/InputModal.svelte";
import { modals } from "svelte-modals";

export function openConfirm(props: ConfirmModalProps) {
  return modals.open(ConfirmModal, props);
}

export function openInput(props: InputModalProps) {
  return modals.open(InputModal, props);
}

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
