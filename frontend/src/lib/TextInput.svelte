<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  interface $$Props extends HTMLInputAttributes {
    id: string;
    title: string;
    value: string;
    errors?: string[];
  }

  export let id: string;
  export let title: string;
  export let value: string;
  export let errors: string[] | undefined = undefined;
</script>

<div class="relative">
  <input
    class="peer h-10 w-full cursor-text border-0 border-b-2 bg-transparent p-0 placeholder-transparent transition-colors focus:border-blue-400 focus:ring-0"
    {...$$restProps}
    {id}
    placeholder={title}
    bind:value
  />
  <label
    class="absolute -top-4 left-0 cursor-text text-sm transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-300 peer-focus:-top-4 peer-focus:text-sm peer-focus:text-blue-400"
    for={id}
  >
    {title}
  </label>

  {#if errors && errors.length > 0}
    {#each errors as error}
      <p class="text-sm text-red-400">{error}</p>
    {/each}
  {/if}
</div>
