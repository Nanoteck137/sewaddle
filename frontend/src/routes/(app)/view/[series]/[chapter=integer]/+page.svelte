<script lang="ts">
  import { browser } from "$app/environment";
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  // import { shortcut, type ShortcutTrigger } from "@svelte-put/shortcut";

  export let data;

  let showLastPageIndicator = false;

  function getPageUrl(page: number) {
    if (page >= data.chapter.pages.length) {
      return null;
    }

    return data.chapter.pages[page];
  }

  async function increment() {
    if (pageNum + 1 < data.chapter.pages.length) {
      pageNum++;
    } else {
      // TODO(patrik): Next chapter
      if (lastPage) {
        if (!showLastPageIndicator) {
          showLastPageIndicator = true;
        } else {
          // TODO(patrik): goto is not working
          window.location.href = `/view/${data.chapter.mangaId}/${data.chapter.nextChapter}?page=0`;
        }
      }
    }
  }

  function decrement() {
    showLastPageIndicator = false;
    if (pageNum - 1 >= 0) {
      pageNum--;
    } else {
      // TODO(patrik): Prev chapter
    }
  }

  function getPageNum() {
    const p = $page.url.searchParams.get("page");

    if (p === null) {
      return 0;
    }

    if (p === "") {
      return data.chapter.pages.length - 1;
    }

    const res = Number(p);
    if (isNaN(res)) {
      return 0;
    }

    return res;
  }

  let pageNum = getPageNum();
  $: imageUrl = getPageUrl(pageNum);
  $: nextImageUrl = getPageUrl(pageNum + 1);
  $: lastPage = pageNum >= data.chapter.pages.length - 1;
  $: {
    if (browser) {
      $page.url.searchParams.set("page", pageNum.toString());
      history.replaceState(history.state, "", $page.url);
    }
  }

  // type Key = {
  //   key: string,
  //   action: "nextpage" | "prevpage";
  // };
  //
  // const keys: Key[] = [];
  // const trigger: ShortcutTrigger[] = keys.map((k) => {
  //   const callbacks: Record<Key["action"], () => void> = {
  //     "nextpage": increment,
  //     "prevpage": decrement,
  //   }
  //
  //   // const key = parseKey(k.key);
  //
  //   return {
  //     key: "j",
  //     // ...key,
  //     // callback: callbacks["nextpage"],
  //   };
  // });
</script>

<!-- <svelte:window -->
<!--   use:shortcut={{ -->
<!--     trigger, -->
<!--   }} -->
<!-- /> -->

<div class="relative flex h-full w-full justify-center">
  <button
    class="absolute left-0 h-full w-1/2 cursor-w-resize"
    on:click={increment}
  ></button>
  <img class="h-full object-scale-down" src={imageUrl} alt="" />
  <button
    class="absolute right-0 h-full w-1/2 cursor-e-resize"
    on:click={decrement}
  ></button>
</div>

{#if showLastPageIndicator}
  <div
    class="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col justify-center gap-2 rounded bg-gray-700/95 p-10 text-xl"
  >
    <p class="text-center">Last page</p>
    <a
      class="text-sm text-blue-400 hover:text-blue-300"
      href={`/series/${data.chapter.mangaId}`}>Back to Manga</a
    >
  </div>
{/if}

{#if nextImageUrl}
  <img class="hidden" src={nextImageUrl} alt="" />
{/if}
