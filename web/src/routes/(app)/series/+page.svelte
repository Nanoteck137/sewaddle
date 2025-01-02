<script>
  const { data } = $props();
</script>

<div class="flex flex-col">
  <div
    class="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7"
  >
    {#each data.series as serie}
      <div class="group flex flex-col items-center">
        <a href={`/series/${serie.id}`} title={serie.name}>
          <img
            class="h-[206px] max-w-[160px] rounded border object-cover group-hover:brightness-75 group-active:scale-95"
            loading="lazy"
            src={serie.coverArt.medium}
            alt="cover"
          />

          <div class="h-2"></div>

          <p
            class="line-clamp-2 w-40 text-center text-xs group-hover:underline"
          >
            {serie.name}
          </p>
        </a>
      </div>
    {/each}
  </div>
</div>
