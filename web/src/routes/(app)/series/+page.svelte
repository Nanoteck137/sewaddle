<script>
  const { data } = $props();
</script>

<div class="flex flex-col">
  <div
    class="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7"
  >
    {#each data.series as serie}
      <div class="flex flex-col items-center">
        <div class="group">
          <a class="relative" href={`/series/${serie.id}`}>
            <img
              class="h-56 w-40 rounded object-cover group-hover:brightness-75"
              loading="lazy"
              src={serie.cover}
              alt={`${serie.name} Cover`}
            />

            <div
              class="absolute bottom-0 left-0 right-0 top-0 bg-purple-400/70"
            ></div>
          </a>
          <div class="h-2"></div>
          <a
            class="line-clamp-2 w-40 text-sm font-medium group-hover:underline"
            title={serie.name}
            href={`/series/${serie.id}`}
          >
            {serie.name}
          </a>
        </div>
        <div class="h-2"></div>
      </div>
    {/each}
  </div>
</div>
