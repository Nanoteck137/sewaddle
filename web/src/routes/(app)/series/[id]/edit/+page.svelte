<script lang="ts">
  import { cn } from "$lib/utils";
  import {
    Bookmark,
    BookmarkMinus,
    BookmarkPlus,
    BookMinus,
    BookOpen,
    BookPlus,
    Check,
    Edit,
    EllipsisVertical,
    FolderPen,
    Import,
    ListOrdered,
    Play,
    Trash,
    X,
  } from "lucide-svelte";
  import {
    Breadcrumb,
    Button,
    buttonVariants,
    Checkbox,
    DropdownMenu,
    Separator,
  } from "@nanoteck137/nano-ui";
  import { createApiClient, formatError, openConfirm } from "$lib";
  import { goto, invalidateAll } from "$app/navigation";
  import toast from "svelte-5-french-toast";

  const { data } = $props();
  const apiClient = createApiClient(data);

  let selectedChapters = $state<string[]>([]);
  let isEditing = $derived(selectedChapters.length > 0);

  function isSelected(chapterId: string) {
    for (let i = 0; i < selectedChapters.length; i++) {
      if (selectedChapters[i] === chapterId) {
        return true;
      }
    }

    return false;
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
        <Breadcrumb.Page>Edit</Breadcrumb.Page>
      </Breadcrumb.Item>
    </Breadcrumb.List>
  </Breadcrumb.Root>
</div>

<div class="flex gap-2">
  <div class="relative h-[231px] w-[180px] min-w-[180px]">
    <img
      class="inline-flex h-full w-full items-center justify-center rounded border object-cover text-xs"
      src={data.serie.coverArt.medium}
      alt="cover"
    />
    <div class="absolute inset-0 flex justify-end rounded p-1">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          class={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "rounded-full",
          )}
        >
          <EllipsisVertical />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="center">
          <DropdownMenu.Group>
            <DropdownMenu.Item onSelect={() => {}}>
              <Play />
              Play
            </DropdownMenu.Item>

            <!-- <DropdownMenu.Item
              onSelect={() => {
                goto(`/albums/${data.album.id}/edit/details`);
              }}
            >
              <Edit />
              Edit Album
            </DropdownMenu.Item>

            <DropdownMenu.Item
              onSelect={() => {
                goto(`/albums/${data.album.id}/edit/import`);
              }}
            >
              <Import />
              Import Tracks
            </DropdownMenu.Item> -->

            <!-- <DropdownMenu.Item
              onSelect={() => {
                goto(`/albums/${data.album.id}/edit/cover`);
              }}
            >
              <Wallpaper />
              Change Cover Art
            </DropdownMenu.Item> -->

            <DropdownMenu.Separator />

            <DropdownMenu.Item
              onSelect={async () => {
                const confirmed = await openConfirm({
                  title: "Delete this serie?",
                  description: "You are about to delete this serie",
                });

                if (confirmed) {
                  const res = await apiClient.deleteSerie(data.serie.id);
                  if (!res.success) {
                    toast.error("Error: " + formatError(res.error));
                    console.error(formatError(res.error));
                    return;
                  }

                  goto("/series", { invalidateAll: true });
                }
              }}
            >
              <Trash />
              Remove
            </DropdownMenu.Item>
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  </div>

  <div class="flex flex-col py-2">
    <p class="font-bold">
      {data.serie.name}
    </p>

    <!-- {#if data.album.name.other}
      <p class="text-xs">Other Name: {data.album.name.other}</p>
    {/if}

    {#if data.album.year}
      <p class="text-xs">Year: {data.album.year}</p>
    {/if}

    {#if data.album.tags.length > 0}
      <p class="text-xs">Tags: {data.album.tags.join(", ")}</p>
    {/if}

    {#if data.album.featuringArtists.length > 0}
      <p class="text-xs">Featuring Artists</p>
      {#each data.album.featuringArtists as artist}
        <p class="pl-2 text-xs">{artist.name.default}</p>
      {/each}
    {/if} -->
  </div>
</div>

<div class="py-4">
  <Separator />
</div>

<div class="flex gap-2">
  <Button class="w-full" variant="outline">
    <ListOrdered />
    Re-Calculate Chapter Order
  </Button>
  <!-- <Button href="edit/import" class="w-full" variant="outline">
      <Import />
      Import Tracks
    </Button> -->
</div>

<div class="flex justify-between px-2 py-2 text-xs">
  <p>Chapters</p>
  <p>{data.chapters.length} chapter(s)</p>
</div>

<div>
  <div class={`flex flex-col gap-2 ${selectedChapters.length > 0 ? "" : ""}`}>
    {#each data.chapters as chapter, i}
      <div class="group relative flex items-center gap-2 px-2">
        {#if isEditing}
          <!-- svelte-ignore a11y_consider_explicit_label -->
          <button
            class="absolute inset-0"
            onclick={(e) => {
              if (e.shiftKey) {
                const firstSelected =
                  selectedChapters.length <= 0 ? 0 : selectedChapters[0];
                let first = data.chapters.findIndex(
                  (i) => i.id === firstSelected,
                );

                let last = i;
                if (first > last) {
                  const tmp = last;
                  last = first;
                  first = tmp;
                }

                const items = [];
                const numItems = last - first + 1;
                for (let i = 0; i < numItems; i++) {
                  items.push(first + i);
                }

                const ids = items.map((i) => data.chapters[i].id);
                selectedChapters = ids;
              } else {
                if (isSelected(chapter.id)) {
                  selectedChapters = selectedChapters.filter(
                    (id) => id !== chapter.id,
                  );
                } else {
                  selectedChapters.push(chapter.id);
                }
              }
            }}
          ></button>
        {/if}
        <div class="flex flex-grow items-center gap-2">
          <img
            class="h-[51px] w-[40px] rounded object-cover"
            loading="lazy"
            src={chapter.coverArt.small}
            alt="cover"
          />
          <div class="flex flex-col">
            <p class="text-sm" title={chapter.name}>
              {chapter.name}
            </p>

            <p class="text-xs">Pages: {chapter.pages.length}</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          {#if !isEditing}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger
                class={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "rounded-full",
                )}
              >
                <EllipsisVertical />
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="end">
                <DropdownMenu.Group>
                  <DropdownMenu.Item
                    onSelect={async () => {
                      const confirmed = await openConfirm({
                        title: "Delete this chapter?",
                        description: "You are about to delete this chapter",
                      });

                      if (confirmed) {
                        const res = await apiClient.removeChapter(chapter.id);
                        if (!res.success) {
                          toast.error("Error: " + formatError(res.error));
                          console.error(formatError(res.error));
                        }

                        await invalidateAll();
                      }
                    }}
                  >
                    <Trash />
                    Remove
                  </DropdownMenu.Item>
                </DropdownMenu.Group>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          {/if}

          <Checkbox
            checked={isSelected(chapter.id)}
            onCheckedChange={() => {
              selectedChapters.push(chapter.id);
            }}
          />
        </div>
      </div>
      <Separator />
    {/each}
  </div>

  <div class="h-4"></div>

  {#if isEditing}
    <div
      class="sticky bottom-4 border border-border/40 bg-background bg-background/95 px-6 py-3 text-foreground backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div class="flex flex-col justify-center gap-2 md:flex-row">
        <div class="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onclick={() => {
              selectedChapters = [];
            }}
          >
            <X />
          </Button>

          <Button
            class="flex-grow"
            variant="outline"
            onclick={async () => {
              const confirmed = await openConfirm({
                title: "Are you sure?",
                description: `You are about to delete ${selectedChapters.length} chapter(s)`,
              });

              if (confirmed) {
                for (const id of selectedChapters) {
                  const res = await apiClient.removeChapter(id);
                  if (!res.success) {
                    toast.error("Error: " + formatError(res.error));
                    console.error(formatError(res.error));
                  }
                }

                selectedChapters = [];
                await invalidateAll();
              }
            }}
          >
            <Trash />
            Remove
          </Button>
        </div>
      </div>
    </div>
  {/if}
</div>
