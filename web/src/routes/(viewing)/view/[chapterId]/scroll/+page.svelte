<script lang="ts">
  import { goto } from "$app/navigation";
  import { createApiClient, formatError } from "$lib";
  import Modal from "$lib/components/Modal.svelte";
  import { cn } from "$lib/utils.js";
  import { Button, buttonVariants, Sheet } from "@nanoteck137/nano-ui";
  import {
    ArrowBigLeft,
    Bookmark,
    ChevronLeft,
    ChevronRight,
    CircleChevronLeft,
    CircleEllipsis,
    StepBack,
    StepForward,
  } from "lucide-svelte";
  import toast from "svelte-5-french-toast";

  const { data } = $props();
  const apiClient = createApiClient(data);
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

<Sheet.Root>
  <Sheet.Trigger
    class={cn(
      buttonVariants({ size: "icon-lg" }),
      "fixed bottom-10 left-10 rounded-full border",
    )}
  >
    <CircleEllipsis size="30" />
  </Sheet.Trigger>
  <Sheet.Content side="bottom">
    <Sheet.Header>
      <Sheet.Title class="text-center">{data.chapter.name}</Sheet.Title>
    </Sheet.Header>

    <div class="h-4"></div>

    <div class="flex flex-col justify-center gap-2 sm:flex-row">
      <Button
        variant="outline"
        disabled={!data.chapter.prevChapter}
        onclick={() => {
          goto(`/view/${data.chapter.prevChapter}/scroll`);
        }}
      >
        <ChevronLeft />
        Prev Chapter
      </Button>
      <Button
        variant="outline"
        disabled={!data.chapter.nextChapter}
        onclick={() => {
          goto(`/view/${data.chapter.nextChapter}/scroll`);
        }}
      >
        <ChevronRight />
        Next Chapter
      </Button>
      <Button
        variant="outline"
        onclick={async () => {
          const res = await apiClient.updateBookmark({
            serieId: data.chapter.serieId,
            chapterId: data.chapter.id,
            page: 0,
          });
          if (!res.success) {
            toast.error("Error: " + formatError(res.error));
            console.log(formatError(res.error));
            return;
          }

          toast.success("Updated bookmark");
        }}
      >
        <Bookmark />
        Update Bookmark
      </Button>
      <Button href="/series/{data.chapter.serieId}" variant="outline">
        <CircleChevronLeft />
        Go to Series
      </Button>
    </div>
  </Sheet.Content>
</Sheet.Root>
