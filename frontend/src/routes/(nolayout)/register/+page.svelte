<script lang="ts">
  import Input from "$lib/TextInput.svelte";
  import { RegisterSchema } from "$lib/schemas/index.js";
  import { superForm } from "sveltekit-superforms/client";
  import SuperDebug from "sveltekit-superforms/client/SuperDebug.svelte";

  export let data;
  const { form, errors, enhance } = superForm(data.form, {
    validators: RegisterSchema,
    taintedMessage: null,
  });
</script>

<SuperDebug data={$form} />

<div class="flex h-full w-full md:items-center">
  <div
    class="w-full p-6 md:mx-auto md:max-w-lg md:rounded md:border-2 md:border-gray-500"
  >
    <a class="block text-center text-4xl" href="/">Sewaddle</a>
    <div class="h-4"></div>
    <p class="block text-center text-2xl">Create Account</p>
    <form class="mt-10 flex flex-col gap-8 md:mt-6" method="post" use:enhance>
      <Input
        type="text"
        id="username"
        name="username"
        title="Username"
        bind:value={$form.username}
        errors={$errors.username}
      />
      <Input
        type="password"
        id="password"
        name="password"
        title="Password"
        bind:value={$form.password}
        errors={$errors.password}
      />
      <Input
        type="password"
        id="passwordConfirm"
        name="passwordConfirm"
        title="Confirm Password"
        bind:value={$form.passwordConfirm}
        errors={$errors.passwordConfirm}
      />

      <button class="rounded bg-red-300 py-2" type="submit">Login</button>
    </form>
    <p>Already have an account? <a href="/login" class="text-blue-400">Login</a></p>
  </div>
</div>
