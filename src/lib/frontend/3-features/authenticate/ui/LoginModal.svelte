<script lang="ts">
	import { Modal, TabBar, TextInput } from '@fe-shared/ui';

	import { invalidateAll } from '$app/navigation';
	import { PUBLIC_ALLOW_REGISTRATION } from '$env/static/public';

	import { LoginModalState } from '../state/loginModal.svelte';

	const allowRegistration = PUBLIC_ALLOW_REGISTRATION === 'true';

	let { open = $bindable(false) }: { open: boolean } = $props();

	const s = new LoginModalState();

	function close() {
		s.resetForm();
		open = false;
	}
</script>

{#if open}
	<Modal onclose={close} class="p-6" label="Sign in">
		<div class="mb-5 flex items-center justify-between">
			<h2 class="text-lg font-bold text-white">
				{s.mode === 'login' ? 'Sign In' : 'Create Account'}
			</h2>
			<button
				type="button"
				onclick={close}
				class="flex h-8 w-8 items-center justify-center rounded-xl text-stone-400 transition hover:bg-stone-700 hover:text-white"
				aria-label="Close"><span class="mdi mdi-close"></span></button
			>
		</div>

		{#if allowRegistration}
			<TabBar
				items={s.authTabs}
				value={s.mode}
				onchange={(v) => {
					s.mode = v as 'login' | 'register';
					s.error = '';
				}}
				class="mb-5"
			/>
		{/if}

		<div class="flex flex-col gap-3">
			{#if s.mode === 'register'}
				<TextInput bind:value={s.name} placeholder="Name" autocomplete="name" />
			{/if}

			<TextInput type="email" bind:value={s.email} placeholder="Email" autocomplete="email" />

			<TextInput
				type="password"
				bind:value={s.password}
				placeholder="Password"
				autocomplete={s.mode === 'login' ? 'current-password' : 'new-password'}
			/>

			{#if s.error}
				<p class="rounded-lg bg-red-900/40 px-3 py-2 text-xs text-red-400">{s.error}</p>
			{/if}

			<button
				type="button"
				onclick={() =>
					s.submit(async () => {
						await invalidateAll();
						close();
					})}
				disabled={s.loading}
				class="bg-accent mt-1 w-full rounded-xl py-3.5 text-sm font-bold text-stone-900 transition hover:brightness-110 active:scale-95 disabled:opacity-50"
			>
				{#if s.loading}
					{s.mode === 'login' ? 'Signing in…' : 'Creating account…'}
				{:else}
					{s.mode === 'login' ? 'Sign In' : 'Create Account'}
				{/if}
			</button>
		</div>
	</Modal>
{/if}
