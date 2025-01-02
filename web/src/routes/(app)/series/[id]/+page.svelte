<script lang="ts">
  import { goto, invalidateAll } from "$app/navigation";
  import { createApiClient, formatError } from "$lib";
  import { Serie } from "$lib/api/types.js";
  import { cn } from "$lib/utils.js";
  import {
    Button,
    buttonVariants,
    Checkbox,
    DropdownMenu,
  } from "@nanoteck137/nano-ui";
  import {
    Bookmark,
    BookmarkMinus,
    BookmarkPlus,
    BookmarkX,
    BookMinus,
    BookOpen,
    BookPlus,
    Check,
    EllipsisVertical,
    Users,
    X,
  } from "lucide-svelte";
  import toast from "svelte-5-french-toast";

  const { data } = $props();
  const apiClient = createApiClient(data);

  type Chapter = (typeof data.chapters)[number];

  let selectedChapters = $state<string[]>([]);

  function isSelected(chapterId: string) {
    for (let i = 0; i < selectedChapters.length; i++) {
      if (selectedChapters[i] === chapterId) {
        return true;
      }
    }

    return false;
  }
</script>

<div class="flex flex-col items-center gap-2">
  <img
    class="h-[360px] w-[280px] rounded object-cover"
    src={data.serie.coverArt.large}
    alt=""
  />

  <p class="line-clamp-2 text-center font-bold">{data.serie.name}</p>

  {#if data.serie.user?.bookmark?.chapterId}
    <Button
      href="/view/{data.serie.user?.bookmark?.chapterId}/scroll"
      variant="outline"
    >
      Continue
    </Button>
  {/if}
</div>

<div class="h-4"></div>

<div>
  <div class={`flex flex-col gap-2 ${selectedChapters.length > 0 ? "" : ""}`}>
    {#snippet normalChapter(chapter: Chapter)}
      <div class="group relative flex items-center gap-2 border-b pb-1 pr-4">
        <div class="flex flex-grow items-center gap-2">
          <img
            class="h-14 w-10 rounded object-cover"
            loading="lazy"
            src={chapter.coverArt.small}
            alt="Chapter Cover"
          />
          <div class="flex flex-col gap-1">
            <a
              class="line-clamp-1 flex items-center gap-2 font-medium"
              title={chapter.name}
              href={`/view/${chapter.id}/scroll`}
            >
              {#if data.serie.user?.bookmark?.chapterId === chapter.id}
                <Check size={14} />
              {/if}
              {chapter.name}
            </a>
            {#if chapter.user?.isMarked}
              <p class="line-clamp-1 text-sm font-light">Read</p>
            {/if}
          </div>
        </div>

        <div class="flex items-center gap-2">
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
                    goto(`/view/${chapter.id}/scroll`);
                  }}
                >
                  <BookOpen />
                  Read Chapter
                </DropdownMenu.Item>

                {#if data.user}
                  {#if !chapter.user?.isMarked}
                    <DropdownMenu.Item
                      onSelect={async () => {
                        const res = await apiClient.markChapters({
                          chapters: [chapter.id],
                        });
                        if (!res.success) {
                          toast.error("Error: " + formatError(res.error));
                          console.error(formatError(res.error));
                        }

                        await invalidateAll();
                      }}
                    >
                      <BookPlus />
                      Mark as Read
                    </DropdownMenu.Item>
                  {:else}
                    <DropdownMenu.Item
                      onSelect={async () => {
                        const res = await apiClient.unmarkChapters({
                          chapters: [chapter.id],
                        });
                        if (!res.success) {
                          toast.error("Error: " + formatError(res.error));
                          console.error(formatError(res.error));
                        }

                        await invalidateAll();
                      }}
                    >
                      <BookMinus />
                      Mark as not Read
                    </DropdownMenu.Item>
                  {/if}
                {/if}

                {#if data.user}
                  <DropdownMenu.Item
                    onSelect={async () => {
                      const res = await apiClient.updateBookmark({
                        serieId: data.serie.id,
                        chapterId: chapter.id,
                        page: 0,
                      });
                      if (!res.success) {
                        toast.error("Error: " + formatError(res.error));
                        console.error(formatError(res.error));
                      }

                      await invalidateAll();
                    }}
                  >
                    <Bookmark />
                    Set as Bookmark
                  </DropdownMenu.Item>
                {/if}
              </DropdownMenu.Group>
            </DropdownMenu.Content>
          </DropdownMenu.Root>

          <Checkbox
            checked={false}
            onCheckedChange={() => {
              selectedChapters.push(chapter.id);
            }}
          />
        </div>
      </div>
    {/snippet}

    {#snippet editChapter(chapter: Chapter, index: number)}
      <button
        class="group relative flex items-center gap-2 border-b pb-1 pr-4"
        onclick={(e) => {
          if (e.shiftKey) {
            const firstSelected =
              selectedChapters.length <= 0 ? 0 : selectedChapters[0];
            let first = data.chapters.findIndex((i) => i.id === firstSelected);

            let last = index;
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
      >
        <div class="flex flex-grow items-center gap-2">
          <img
            class="h-14 w-10 rounded object-cover"
            loading="lazy"
            src={chapter.coverArt.small}
            alt="Chapter Cover"
          />
          <div class="flex flex-col gap-1">
            <a
              class="line-clamp-1 font-medium"
              title={chapter.name}
              href={`/view/${chapter.id}`}
            >
              {chapter.name}
            </a>
            <!-- {#if chapter.user?.isMarked}
                <p class="line-clamp-1 text-start text-sm font-light">Read</p>
              {/if} -->
          </div>
        </div>
        <div class="flex items-center gap-2">
          <Checkbox checked={isSelected(chapter.id)} />
        </div>
      </button>
    {/snippet}

    {#each data.chapters as chapter, i}
      {#if selectedChapters.length > 0}
        {@render editChapter(chapter, i)}
      {:else}
        {@render normalChapter(chapter)}
      {/if}
    {/each}
  </div>

  <div class="h-4"></div>

  {#if selectedChapters.length > 0}
    <div
      class="sticky bottom-4 border bg-background px-6 py-3 text-foreground"
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
              const res = await apiClient.markChapters({
                chapters: selectedChapters,
              });
              if (!res.success) {
                toast.error("Error: " + formatError(res.error));
                console.error(formatError(res.error));
              }

              selectedChapters = [];
              await invalidateAll();
            }}
          >
            <BookmarkPlus />
            Mark Chapters
          </Button>
        </div>

        <Button
          variant="outline"
          onclick={async () => {
            const res = await apiClient.unmarkChapters({
              chapters: selectedChapters,
            });
            if (!res.success) {
              toast.error("Error: " + formatError(res.error));
              console.error(formatError(res.error));
            }

            selectedChapters = [];
            await invalidateAll();
          }}
        >
          <BookmarkMinus />
          Unmark Chapters
        </Button>
      </div>
    </div>
  {/if}
</div>
