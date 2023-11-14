<script lang="ts">
  export let data;

  let test = new Array(100)
    .fill(0)
    .map((_item, index) => ({ index, name: `Chapter ${index}` }));
</script>

<div class="p-2">
  <p>{data.details.title}</p>

  <div class="flex flex-col gap-1">
    {#each test as chapter (chapter.index)}
      <div class="flex justify-between bg-red-200 py-1">
        <a href="/view/1/1" class="group relative flex flex-grow cursor-pointer gap-2">
          <p class="w-12 text-right">1</p>
          <img src="https://placehold.co/48x64.png" alt="" />
          <p class="group-hover:underline">{chapter.name}</p>
        </a>

        <div class="flex items-center gap-4 p-4">
          <button>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="h-6 w-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
              />
            </svg>
          </button>
          <button
            class="flex h-6 w-6 items-center justify-center rounded border-2 border-black"
            >X</button
          >
        </div>
      </div>
    {/each}
  </div>
</div>
