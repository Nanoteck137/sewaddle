<script lang="ts">
  import { browser } from "$app/environment";
  import { page } from "$app/stores";
  // import { shortcut, type ShortcutTrigger } from "@svelte-put/shortcut";

  export let data;

  function getPageUrl(page: number) {
    if (page >= data.chapter.pages.length) {
      return null;
    }

    return data.chapter.pages[page];
  }

  function increment() {
    if (pageNum + 1 < data.chapter.pages.length) {
      pageNum++;
    } else {
      // TODO(patrik): Next chapter
    }
  }

  function decrement() {
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

{#if nextImageUrl}
  <img class="hidden" src={nextImageUrl} alt="" />
{/if}
