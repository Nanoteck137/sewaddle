<script lang="ts">
  import { Toaster } from "svelte-5-french-toast";

  const { children } = $props();
</script>

<Toaster position="top-right" />

{@render children()}
