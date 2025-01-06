<script lang="ts">
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

  async function submit(formData: FormData) {
    const res = await apiClient.changeSerieCover(data.serie.id, formData);
    if (!res.success) {
      toast.error("Error: " + formatError(res.error));
      console.error(formatError(res.error), res.error);

      return;
    }

    toast.success("Changed cover");

    // TODO(patrik): Not the best solution, but i need the browser to
    // refresh for the new image to show
    window.location.href = `/series/${data.serie.id}/edit`;
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
        <Breadcrumb.Page>Change Cover Art</Breadcrumb.Page>
      </Breadcrumb.Item>
    </Breadcrumb.List>
  </Breadcrumb.Root>
</div>

<form
  onsubmit={(e) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    submit(formData);
  }}
>
  <Card.Root class="mx-auto w-full max-w-[560px]">
    <Card.Header>
      <Card.Title>Change Album Cover</Card.Title>
    </Card.Header>
    <Card.Content class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <Label for="coverArt">Cover Art</Label>
        <Input
          id="coverArt"
          name="cover"
          type="file"
          accept="image/png,image/jpeg"
        />
      </div>
    </Card.Content>
    <Card.Footer class="flex justify-end gap-4">
      <Button href="/series/{data.serie.id}/edit" variant="outline">
        Back
      </Button>
      <Button type="submit">Save</Button>
    </Card.Footer>
  </Card.Root>
</form>
