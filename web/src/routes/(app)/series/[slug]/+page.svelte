<script lang="ts">
  import {
    Bookmark,
    BookMinus,
    BookPlus,
    Check,
    EllipsisVertical,
  } from "lucide-svelte";

  const { data } = $props();

  type Chapter = (typeof data.chapters)[number];

  let showPopupMenu = $state("");
  let selectedChapters = $state<string[]>([]);

  function isSelected(chapterSlug: string) {
    for (let i = 0; i < selectedChapters.length; i++) {
      if (selectedChapters[i] === chapterSlug) {
        return true;
      }
    }

    return false;
  }
</script>

<div class="flex flex-col gap-2 px-5">
  <div class="flex justify-center md:fixed md:h-full">
    <div class="w-[280px]">
      <img
        class="h-[360px] w-[280px] rounded object-cover"
        src={data.serie.cover}
        alt=""
      />
      <div class="h-2"></div>
      <p class="line-clamp-2 text-center font-bold">{data.serie.name}</p>
      <p>{data.serie.user?.bookmark?.chapterSlug}</p>
    </div>
  </div>
  <div class="md:ml-4 md:pl-[280px]">
    <div class="flex flex-col gap-2">
      {#snippet normalChapter(chapter: Chapter)}
        <div class="group relative flex items-center gap-2 border-b pb-1 pr-4">
          <div class="flex flex-grow items-center gap-2">
            <img
              class="h-14 w-10 rounded object-cover"
              loading="lazy"
              src={chapter.coverArt}
              alt="Chapter Cover"
            />
            <div class="flex flex-col gap-1">
              <a
                class="line-clamp-1 font-medium"
                title={chapter.title}
                href={`/view/${chapter.serieSlug}/${chapter.slug}`}
              >
                {chapter.title}
              </a>
              {#if chapter.user?.isMarked}
                <p class="line-clamp-1 text-sm font-light">Read</p>
              {/if}
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              class="block rounded-full p-1 hover:bg-black/20"
              onclick={() => {
                showPopupMenu = chapter.slug;
              }}
            >
              <EllipsisVertical size="25" />
            </button>
            <button
              class="flex h-6 w-6 items-center justify-center rounded border"
              onclick={() => {
                selectedChapters.push(chapter.slug);
              }}
            >
              {#if isSelected(chapter.slug)}
                <Check size="18" />
              {/if}
            </button>
          </div>
          <div
            class={`popup absolute right-7 top-full z-50 -translate-y-4 rounded bg-red-400 ${showPopupMenu === chapter.slug ? "" : "hidden"}`}
          >
            <div class="flex flex-col">
              <form action="?/markChapters" method="post">
                <input
                  name="serieSlug"
                  value={data.serie.slug}
                  type="hidden"
                />
                <input name="chapters[]" value={chapter.slug} type="hidden" />
                <button
                  class="flex w-full gap-1 rounded px-4 py-2 hover:bg-red-200"
                >
                  <BookPlus />
                  <p>Mark as Read</p>
                </button>
              </form>

              <form action="?/unmarkChapters" method="post">
                <input
                  name="serieSlug"
                  value={data.serie.slug}
                  type="hidden"
                />
                <input name="chapters[]" value={chapter.slug} type="hidden" />
                <button
                  class="flex w-full gap-1 rounded px-4 py-2 hover:bg-red-200"
                >
                  <BookMinus />
                  <p>Mark as not Read</p>
                </button>
              </form>

              <form action="?/setBookmark" method="post">
                <input
                  name="serieSlug"
                  value={data.serie.slug}
                  type="hidden"
                />
                <input name="chapterSlug" value={chapter.slug} type="hidden" />
                <button
                  class="flex w-full gap-1 rounded px-4 py-2 hover:bg-red-200"
                >
                  <Bookmark />
                  <p>Set as Bookmark</p>
                </button>
              </form>
            </div>
          </div>
        </div>
      {/snippet}

      {#snippet editChapter(chapter: Chapter, index: number)}
        <button
          class="group relative flex items-center gap-2 border-b pb-1 pr-4"
          onclick={(e) => {
            if (e.shiftKey) {
              const firstSelected = selectedChapters[0];
              let first = data.chapters.findIndex(
                (i) => i.slug === firstSelected,
              );

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

              const slugs = items.map((i) => data.chapters[i].slug);
              selectedChapters = slugs;
            } else {
              if (isSelected(chapter.slug)) {
                selectedChapters = selectedChapters.filter(
                  (slug) => slug !== chapter.slug,
                );
              } else {
                selectedChapters.push(chapter.slug);
              }
            }
          }}
        >
          <div class="flex flex-grow items-center gap-2">
            <img
              class="h-14 w-10 rounded object-cover"
              loading="lazy"
              src={chapter.coverArt}
              alt="Chapter Cover"
            />
            <div class="flex flex-col gap-1">
              <a
                class="line-clamp-1 font-medium"
                title={chapter.title}
                href={`/view/${chapter.serieSlug}/${chapter.slug}`}
              >
                {chapter.title}
              </a>
              {#if chapter.user?.isMarked}
                <p class="line-clamp-1 text-start text-sm font-light">Read</p>
              {/if}
            </div>
          </div>
          <div class="flex items-center gap-2">
            <div
              class="flex h-6 w-6 items-center justify-center rounded border"
            >
              {#if isSelected(chapter.slug)}
                <Check size="18" />
              {/if}
            </div>
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
  </div>
</div>

{#if showPopupMenu !== ""}
  <button
    class="fixed inset-0 z-40 bg-purple-400/50"
    onclick={() => {
      showPopupMenu = "";
    }}
  >
  </button>
{/if}

{#if selectedChapters.length > 0}
  <div class="fixed bottom-0 left-1/2 bg-red-300 p-10">
    <form action="?/markChapters" method="post">
      <input name="serieSlug" value={data.serie.slug} type="hidden" />
      {#each selectedChapters as chapter}
        <input name="chapters[]" value={chapter} type="hidden" />
      {/each}

      <button>Mark Chapters</button>
    </form>

    <form action="?/unmarkChapters" method="post">
      <input name="serieSlug" value={data.serie.slug} type="hidden" />
      {#each selectedChapters as chapter}
        <input name="chapters[]" value={chapter} type="hidden" />
      {/each}

      <button>Unmark Chapters</button>
    </form>
  </div>
{/if}
