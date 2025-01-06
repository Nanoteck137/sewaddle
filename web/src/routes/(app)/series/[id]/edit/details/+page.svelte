<script lang="ts">
  import { goto } from "$app/navigation";
  import { createApiClient, formatError } from "$lib";
  import {
    Breadcrumb,
    Button,
    Card,
    Input,
    Label,
  } from "@nanoteck137/nano-ui";
  import toast from "svelte-5-french-toast";

  const { data } = $props();
  const apiClient = createApiClient(data);

  let name = $state(data.serie.name);
  let malId = $state(data.serie.malId);
  let anilistId = $state(data.serie.anilistId);

  async function submit() {
    const res = await apiClient.editSerie(data.serie.id, {
      name: name,
      malId: malId,
      anilistId: anilistId,
    });
    if (!res.success) {
      toast.error("Error: " + formatError(res.error));
      console.error(formatError(res.error), res.error);

      return;
    }

    toast.success("Saved Changes");
    goto(`/series/${data.serie.id}/edit`, { invalidateAll: true });
  }
</script>

<div class="py-2">
  <Breadcrumb.Root>
    <Breadcrumb.List>
      <Breadcrumb.Item>
        <Breadcrumb.Link href="/series">Series</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Separator />
      <Breadcrumb.Item>
        <Breadcrumb.Link href="/series/{data.serie.id}">
          {data.serie.name}
        </Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Separator />
      <Breadcrumb.Item>
        <Breadcrumb.Link href="/series/{data.serie.id}/edit">
          Edit
        </Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Separator />
      <Breadcrumb.Item>
        <Breadcrumb.Page>Edit Details</Breadcrumb.Page>
      </Breadcrumb.Item>
    </Breadcrumb.List>
  </Breadcrumb.Root>
</div>

{#snippet cardContent()}
  <div class="flex flex-col gap-4">
    <div class="flex w-full flex-col gap-2">
      <Label for="name">Name</Label>
      <Input id="name" type="text" bind:value={name} />
    </div>

    <div class="flex w-full flex-col gap-2">
      <Label for="malId">MyAnimeList ID</Label>
      <Input id="malId" type="text" bind:value={malId} />
    </div>

    <div class="flex w-full flex-col gap-2">
      <Label for="anilistId">AniList ID</Label>
      <Input id="anilistId" type="text" bind:value={anilistId} />
    </div>
  </div>
{/snippet}

<form
  onsubmit={(e) => {
    e.preventDefault();
    submit();
  }}
>
  <Card.Root class="mx-auto w-full max-w-[560px]">
    <Card.Header>
      <Card.Title>Edit Serie Details</Card.Title>
    </Card.Header>
    <Card.Content class="flex flex-col gap-4">
      {@render cardContent()}
    </Card.Content>
    <Card.Footer class="flex justify-end gap-4">
      <Button href="/series/{data.serie.id}/edit" variant="outline">
        Back
      </Button>
      <Button type="submit">Save</Button>
    </Card.Footer>
  </Card.Root>
</form>
