<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import Modal from "$lib/components/Modal.svelte";
  import {
    ArrowBigLeft,
    Bookmark,
    CircleEllipsis,
    GalleryHorizontal,
    GalleryVertical,
    StepBack,
    StepForward,
  } from "lucide-svelte";

  const { data } = $props();

  type Func = () => void;

  let sideMenuOpen = $state(false);
</script>

<svelte:window
  onkeydown={(e) => {
    if (e.key === "ArrowLeft" || e.key === "j") {
      e.preventDefault();
      if (!data.isFirstPage) {
        goto(`?page=${data.page - 1}&layout=${data.layout}`);
      }
    }

    if (e.key === "ArrowRight" || e.key === "k") {
      e.preventDefault();
      if (data.isLastPage) {
        goto(
          `?page=${data.page}&layout=${data.layout}&showLastPageModal=true`,
        );
      } else {
        goto(`?page=${data.page + 1}&layout=${data.layout}`);
      }
    }
  }}
/>

{#if data.layout === "paged"}
  <div class="flex h-screen w-full items-center justify-center py-2">
    {#if !data.isFirstPage}
      <!-- svelte-ignore a11y_missing_content -->
      <a
        class="absolute left-0 h-full w-1/2 cursor-w-resize"
        href={`?page=${data.page - 1}&layout=${data.layout}`}
      ></a>
    {/if}
    {#if !data.isLastPage}
      <!-- svelte-ignore a11y_missing_content -->
      <a
        class="absolute right-0 h-full w-1/2 cursor-e-resize"
        href={`?page=${data.page + 1}&layout=${data.layout}`}
      ></a>
    {:else}
      <!-- svelte-ignore a11y_missing_content -->
      <a
        class="absolute right-0 h-full w-1/2 cursor-e-resize"
        href={`?page=${data.page}&layout=${data.layout}&showLastPageModal=true`}
      ></a>
    {/if}

    <img
      class="max-h-full border-2 object-scale-down"
      src={data.chapter.pages[data.page]}
      alt="Page"
    />
  </div>
{:else}
  <div class="flex justify-center py-20">
    {#if data.chapter.prevChapter}
      <a
        class="text-3xl"
        href={`/view/${data.chapter.serieSlug}/${data.chapter.prevChapter}?layout=${data.layout}`}
        >Previous Chapter</a
      >
    {/if}
  </div>
  <div class="flex flex-col items-center">
    {#each data.chapter.pages as page, i}
      <div id={`page-${i}`} class="flex max-w-[500px] justify-center">
        <img class="border" loading="lazy" src={page} alt={`Page ${i}`} />
      </div>
    {/each}
  </div>
  <div class="flex justify-center py-20">
    {#if data.chapter.nextChapter}
      <form action="?/updateAndNextChapter" method="post">
        <input name="serieSlug" value={data.chapter.serieSlug} type="hidden" />
        <input
          name="currentChapterSlug"
          value={data.chapter.slug}
          type="hidden"
        />
        <input
          name="nextChapterSlug"
          value={data.chapter.nextChapter}
          type="hidden"
        />
        <input name="layout" value={data.layout} type="hidden" />
        <button class="text-3xl">Next Chapter</button>
      </form>
    {/if}
  </div>
{/if}

<button
  class="fixed bottom-10 left-10 flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/60 text-white"
  onclick={() => {
    sideMenuOpen = true;
  }}
>
  <CircleEllipsis size="30" />
</button>

<!-- <button class="fixed inset-0 bg-black/70"></button>
<div class="fixed bottom-0 left-0 top-0 w-52 bg-red-400/90">
  <button></button>
</div> -->

{#snippet menuButton(text: string, icon: any, href?: string, click?: Func)}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <svelte:element
    this={href ? "a" : "button"}
    {href}
    class="jusitfy-center flex items-center"
    onclick={click}
  >
    <svelte:component this={icon} size="30" />
    <p class="text-lg">
      {text}
    </p>
  </svelte:element>
{/snippet}

<Modal
  open={sideMenuOpen}
  onClose={() => {
    sideMenuOpen = false;
  }}
>
  <div class="flex h-full w-full flex-col justify-center bg-blue-400 p-4">
    <p>{data.chapter.title}</p>

    <!-- {@render menuButton("Next Page", ChevronRight)}
    {@render menuButton("Previous Page", ChevronLeft)} -->
    {@render menuButton("First Page", StepBack)}
    {@render menuButton("Last Page", StepForward)}

    {#if data.layout === "paged"}
      {@render menuButton(
        "Scroll Layout",
        GalleryHorizontal,
        `?page=${data.page}&layout=scroll`,
      )}
    {:else}
      {@render menuButton(
        "Paged Layout",
        GalleryVertical,
        `?page=${data.page}&layout=paged`,
      )}
    {/if}

    <form action="?/bookmarkChapter" method="post">
      <input name="serieSlug" value={data.chapter.serieSlug} type="hidden" />
      <input name="chapterSlug" value={data.chapter.slug} type="hidden" />
      {@render menuButton("Update Bookmark", Bookmark)}
    </form>

    {@render menuButton(
      "Go back",
      ArrowBigLeft,
      `/series/${data.chapter.serieSlug}`,
      () => {
        sideMenuOpen = false;
      },
    )}
  </div>
</Modal>

{#if data.showLastPageModal}
  <div class="fixed inset-0 bg-black/80"></div>
  <div
    class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-400"
  >
    <p>Last Page</p>
    <a href={`?page=${data.page}&layout=${data.layout}`}>Close</a>
    {#if data.chapter.nextChapter}
      <form action="?/updateAndNextChapter" method="post">
        <input name="serieSlug" value={data.chapter.serieSlug} type="hidden" />
        <input
          name="currentChapterSlug"
          value={data.chapter.slug}
          type="hidden"
        />
        <input
          name="nextChapterSlug"
          value={data.chapter.nextChapter}
          type="hidden"
        />
        <input name="layout" value={data.layout} type="hidden" />
        <button>Next Chapter</button>
      </form>
    {/if}
  </div>
{/if}
