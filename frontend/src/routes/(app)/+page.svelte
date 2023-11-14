<script lang="ts">
  export let data;
</script>

<div
  class="grid grid-cols-1 place-items-center gap-2 p-2 md:grid-cols-3 lg:grid-cols-4"
>
  {#each data.list as serie (serie.id)}
    <a
      href={`/series/${serie.id}`}
      class="relative flex h-[560px] w-full max-w-[390px] select-none flex-col overflow-clip rounded bg-red-300 transition-transform active:scale-95 md:h-[450px]"
      draggable="false"
    >
      <div class="relative h-full w-full">
        <img
          class="pointer-events-none absolute flex h-full w-full border-b-2 object-cover"
          src={`${serie.cover}`}
          alt=""
          loading="lazy"
        />
      </div>
      <p class="w-full p-4 text-center">{serie.title}</p>
    </a>
  {/each}
</div>
