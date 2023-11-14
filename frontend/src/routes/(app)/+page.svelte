<script lang="ts">
  let test = new Array(100).fill(0).map((_item, index) => `Test ${index}`);
</script>

<div
  class="grid grid-cols-1 place-items-center gap-2 p-2 md:grid-cols-3 lg:grid-cols-4"
>
  {#each test as t}
    <a
      href="/series/1"
      class="relative flex h-[560px] w-full max-w-[390px] select-none flex-col overflow-clip rounded bg-red-300 transition-transform active:scale-95 md:h-[450px]"
      draggable="false"
    >
      <div class="relative h-full w-full">
        <img
          class="pointer-events-none absolute flex h-full w-full border-b-2 object-cover"
          src="https://placehold.co/380x500.png"
          alt=""
        />
      </div>
      <p class="w-full p-4 text-center">{t}</p>
    </a>
  {/each}
</div>
