<script lang="ts">
  import Modal from "$lib/components/Modal.svelte";
  import {
    ArrowBigLeft,
    Bookmark,
    CircleEllipsis,
    StepBack,
    StepForward,
  } from "lucide-svelte";

  const { data } = $props();

  type Func = () => void;

  let sideMenuOpen = $state(false);
</script>

<div class="flex justify-center py-20">
  {#if data.chapter.prevChapter}
    <a class="text-3xl" href={`/view/${data.chapter.prevChapter}/scroll`}
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
      <input name="serieId" value={data.chapter.serieId} type="hidden" />
      <input name="currentChapterId" value={data.chapter.id} type="hidden" />
      <input
        name="nextChapterId"
        value={data.chapter.nextChapter}
        type="hidden"
      />
      <button class="text-3xl">Next Chapter</button>
    </form>
  {/if}
</div>

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

    <!-- {#if data.layout === "paged"}
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
    {/if} -->

    <form action="?/bookmarkChapter" method="post">
      <input name="serieId" value={data.chapter.serieId} type="hidden" />
      <input name="chapterId" value={data.chapter.id} type="hidden" />
      {@render menuButton("Update Bookmark", Bookmark)}
    </form>

    {@render menuButton(
      "Go back",
      ArrowBigLeft,
      `/series/${data.chapter.serieId}`,
      () => {
        sideMenuOpen = false;
      },
    )}
  </div>
</Modal>
