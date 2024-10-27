<script lang="ts">
  import {
    Home,
    Library,
    LogIn,
    LogOut,
    Menu,
    Server,
    User,
  } from "lucide-svelte";
  import "../../app.css";

  const { data, children } = $props();

  let showSideMenu = $state(false);
</script>

<header
  class="fixed left-0 right-0 top-0 z-30 flex h-16 items-center gap-4 bg-[--bg-color] px-4 py-2"
>
  <button
    onclick={() => {
      showSideMenu = true;
    }}
  >
    <Menu size="32" />
  </button>

  <a class="text-3xl font-medium text-[--logo-color]" href="/">Sewaddle</a>
</header>

<main class="mt-16">
  {@render children()}
</main>

{#if showSideMenu}
  <button
    class="fixed inset-0 z-50 bg-[--modal-overlay-bg]"
    onclick={() => {
      showSideMenu = false;
    }}
  ></button>
{/if}

<aside
  class={`fixed bottom-0 top-0 z-50 flex w-80 flex-col bg-[--bg-color] px-4 text-[--fg-color] transition-transform duration-300 ${showSideMenu ? "translate-x-0" : "-translate-x-[100%]"}`}
>
  <div class="flex h-16 items-center gap-4 px-2 py-2">
    <button
      onclick={() => {
        showSideMenu = false;
      }}
    >
      <Menu size="32" />
    </button>
    <a
      class="text-3xl font-medium text-[--logo-color]"
      href="/"
      onclick={() => {
        showSideMenu = false;
      }}
    >
      Sewaddle
    </a>
  </div>

  {#snippet link(title: string, icon: any, href?: string)}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <svelte:element
      this={href ? "a" : "button"}
      class="hover:text-[--on-primary flex w-full items-center gap-2 rounded px-2 py-2 hover:bg-[--primary] hover:text-[--on-primary]"
      onclick={() => {
        showSideMenu = false;
      }}
      {href}
    >
      <svelte:component this={icon} size="32"></svelte:component>
      <p class="text-xl">{title}</p>
    </svelte:element>
  {/snippet}

  <div class="flex flex-col gap-2 py-2">
    {@render link("Home", Home, "/")}
    {@render link("Series", Library, "/series")}
    <!-- <Link title="Home" href="/" icon={Home} onClick={close} />
    <Link title="Artists" href="/artists" icon={Users} onClick={close} />
    <Link title="Albums" href="/albums" icon={DiscAlbum} onClick={close} />
    <Link title="Tracks" href="/tracks" icon={FileMusic} onClick={close} /> -->

    <!-- {#if data.user}
      <Link
        title="Playlists"
        href="/playlists"
        icon={ListMusic}
        onClick={close}
      />
    {/if} -->
  </div>
  <div class="flex-grow"></div>
  <div class="flex flex-col gap-2 py-4">
    {#if data.user}
      {@render link(data.user.username, User, "/account")}
      <!-- <Link
        title={data.user.username}
        href="/account"
        icon={User}
        onClick={close}
      /> -->

      {#if data.user.isOwner}
        {@render link("Server", Server, "/server")}
        <!-- <Link title="Server" href="/server" icon={Server} onClick={close} /> -->
      {/if}

      <form class="w-full" action="/logout" method="POST">
        {@render link("Logout", LogOut)}
      </form>
    {:else}
      {@render link("Login", LogIn, "/login")}
      <!-- <Link title="Login" href="/login" icon={LogIn} onClick={close} /> -->
    {/if}
  </div>
</aside>

<svelte:head>
  <title>Sewaddle</title>
</svelte:head>
