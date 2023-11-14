<script lang="ts">
  import { browser } from "$app/environment";
  import { page } from "$app/stores";
  // import { shortcut, type ShortcutTrigger } from "@svelte-put/shortcut";

  let test = [
    [1000, 1200],
    [1112, 1600],
    [1127, 1600],
    [1423, 2048],
    [1428, 2048],
    [1488, 2100],
    [1600, 1148],
    [1693, 1200],
    [1694, 1200],
    [1800, 1350],
    [2133, 1517],
    [2133, 1586],
    [2133, 1590],
    [2560, 1803],
    [2560, 1805],
    [700, 1140],
    [700, 1214],
    [700, 300],
    [700, 900],
    [720, 3096],
    [720, 3479],
    [720, 3652],
    [720, 855],
    [783, 1000],
    [825, 1400],
    [849, 1250],
    [852, 1250],
  ];

  function getPageUrl(page: number) {
    if (page >= test.length) {
      return null;
    }

    let pageSize = test[page];
    return `https://placehold.co/${pageSize[0]}x${pageSize[1]}.png`;
  }

  function increment() {
    if (pageNum + 1 < test.length) {
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

  let pageNum = parseInt($page.url.searchParams.get("page") ?? "0");
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
