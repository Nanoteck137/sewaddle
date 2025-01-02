<script lang="ts">
  import { navigating } from "$app/stores";
  import { Toaster } from "svelte-5-french-toast";
  import { modals, Modals } from "svelte-modals";

  const { children } = $props();

  $effect(() => {
    if ($navigating !== null) {
      if (modals.stack.length > 0) {
        modals.closeAll();
      }
    }
  });
</script>

<Toaster position="top-right" />
<Modals />

{@render children()}
