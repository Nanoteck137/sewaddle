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
    Separator,
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

<div class="flex flex-col items-center gap-2">
  <img
    class="h-[360px] w-[280px] rounded object-cover"
    src={data.serie.coverArt.large}
    alt=""
  />

  <p class="line-clamp-2 text-center text-sm font-semibold">
    {data.serie.name}
  </p>

  {#if data.serie.user?.bookmark?.chapterId}
    <Button
      href="/view/{data.serie.user?.bookmark?.chapterId}/scroll"
      variant="outline"
    >
      Continue
    </Button>
  {/if}
</div>

<div class="h-2"></div>
<Separator />

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
          <div class="flex flex-col gap-1">
            <a
              class="line-clamp-1 flex items-center gap-2 text-sm"
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
          {/if}

          {#if data.user}
            <Checkbox
              checked={isSelected(chapter.id)}
              onCheckedChange={() => {
                selectedChapters.push(chapter.id);
              }}
            />
          {/if}
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
