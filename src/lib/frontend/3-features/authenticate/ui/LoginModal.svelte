<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { PUBLIC_ALLOW_REGISTRATION } from '$env/static/public';
	import { Modal, TabBar } from '@fe-shared/ui';

	const allowRegistration = PUBLIC_ALLOW_REGISTRATION === 'true';

	let { open = $bindable(false) }: { open: boolean } = $props();

	let mode    = $state<'login' | 'register'>('login');
	let email   = $state('');
	let password = $state('');
	let name    = $state('');
	let error   = $state('');
	let loading = $state(false);

	function close() {
		open = false;
		error = '';
	}

	async function submit() {
		error   = '';
		loading = true;
		try {
			const endpoint = mode === 'login'
				? '/api/auth/sign-in/email'
				: '/api/auth/sign-up/email';
			const body = mode === 'login'
				? { email, password }
				: { email, password, name };

			const res = await fetch(endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});

			if (res.ok) {
				await invalidateAll();
				close();
			} else {
				const data = await res.json().catch(() => ({}));
				error = data.message ?? (mode === 'login' ? 'Sign in failed' : 'Registration failed');
			}
		} catch {
			error = 'Network error. Please try again.';
		} finally {
			loading = false;
		}
	}

	const authTabs = [
		{ value: 'login', label: 'Sign In' },
		{ value: 'register', label: 'Register' }
	];
</script>

{#if open}
	<Modal onclose={close} class="p-6" aria-label="Sign in">
		<div class="mb-5 flex items-center justify-between">
			<h2 class="text-lg font-bold text-white">
				{mode === 'login' ? 'Sign In' : 'Create Account'}
			</h2>
			<button
				type="button"
				onclick={close}
				class="flex h-8 w-8 items-center justify-center rounded-xl text-stone-400 transition hover:bg-stone-700 hover:text-white"
				aria-label="Close"
			><span class="mdi mdi-close"></span></button>
		</div>

		{#if allowRegistration}
			<TabBar
				items={authTabs}
				value={mode}
				onchange={(v) => { mode = v as 'login' | 'register'; error = ''; }}
				class="mb-5"
			/>
		{/if}

		<div class="flex flex-col gap-3">
			{#if mode === 'register'}
				<input
					type="text"
					bind:value={name}
					placeholder="Name"
					autocomplete="name"
					class="w-full rounded-xl border border-stone-600 bg-stone-700 px-4 py-3 text-sm text-white placeholder-stone-500 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
				/>
			{/if}

			<input
				type="email"
				bind:value={email}
				placeholder="Email"
				autocomplete="email"
				class="w-full rounded-xl border border-stone-600 bg-stone-700 px-4 py-3 text-sm text-white placeholder-stone-500 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
			/>

			<input
				type="password"
				bind:value={password}
				placeholder="Password"
				autocomplete={mode === 'login' ? 'current-password' : 'new-password'}
				class="w-full rounded-xl border border-stone-600 bg-stone-700 px-4 py-3 text-sm text-white placeholder-stone-500 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
			/>

			{#if error}
				<p class="rounded-lg bg-red-900/40 px-3 py-2 text-xs text-red-400">{error}</p>
			{/if}

			<button
				type="button"
				onclick={submit}
				disabled={loading}
				class="mt-1 w-full rounded-xl bg-orange-400 py-3.5 text-sm font-bold text-stone-900 transition hover:bg-orange-300 active:scale-95 disabled:opacity-50"
			>
				{#if loading}
					{mode === 'login' ? 'Signing in…' : 'Creating account…'}
				{:else}
					{mode === 'login' ? 'Sign In' : 'Create Account'}
				{/if}
			</button>
		</div>
	</Modal>
{/if}
