<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    open: boolean;
    onClose: () => void;

    children?: Snippet;
  };

  const { open, onClose, children }: Props = $props();

  $effect(() => {
    if (open) {
      document
        .getElementsByTagName("body")[0]
        .classList.add("overflow-y-hidden");
    } else {
      document
        .getElementsByTagName("body")[0]
        .classList.remove("overflow-y-hidden");
    }
  });
</script>

{#if open}
  <button class="fixed inset-0 bg-black/70" onclick={() => onClose()}></button>
  <div class="fixed bottom-0 left-0 top-0 w-52 bg-red-400/90">
    {#if children}
      {@render children()}
    {/if}
  </div>
{/if}
