<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { PUBLIC_ALLOW_REGISTRATION } from '$env/static/public';

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
</script>

{#if open}
	<!-- Backdrop -->
	<button
		type="button"
		class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
		onclick={close}
		aria-label="Close"
		in:fade={{ duration: 150 }}
		out:fade={{ duration: 120 }}
	></button>

	<!-- Modal card -->
	<div
		class="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-sm -translate-y-1/2 rounded-3xl bg-slate-800 p-6 shadow-2xl"
		in:scale={{ start: 0.92, duration: 220, easing: cubicOut }}
		out:scale={{ start: 0.92, duration: 150, easing: cubicOut }}
		role="dialog"
		aria-modal="true"
		aria-label="Sign in"
	>
		<!-- Header -->
		<div class="mb-5 flex items-center justify-between">
			<h2 class="text-lg font-bold text-white">
				{mode === 'login' ? 'Sign In' : 'Create Account'}
			</h2>
			<button
				type="button"
				onclick={close}
				class="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-700 hover:text-white"
				aria-label="Close">✕</button
			>
		</div>

		<!-- Mode toggle -->
		{#if allowRegistration}
			<div class="mb-5 flex rounded-xl bg-slate-700 p-1">
				<button
					type="button"
					onclick={() => { mode = 'login'; error = ''; }}
					class="flex-1 rounded-lg py-2 text-sm font-semibold transition {mode === 'login'
						? 'bg-amber-400 text-slate-900'
						: 'text-slate-400 hover:text-white'}"
				>Sign In</button>
				<button
					type="button"
					onclick={() => { mode = 'register'; error = ''; }}
					class="flex-1 rounded-lg py-2 text-sm font-semibold transition {mode === 'register'
						? 'bg-amber-400 text-slate-900'
						: 'text-slate-400 hover:text-white'}"
				>Register</button>
			</div>
		{/if}

		<!-- Form -->
		<div class="flex flex-col gap-3">
			{#if mode === 'register'}
				<input
					type="text"
					bind:value={name}
					placeholder="Name"
					autocomplete="name"
					class="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
				/>
			{/if}

			<input
				type="email"
				bind:value={email}
				placeholder="Email"
				autocomplete="email"
				class="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
			/>

			<input
				type="password"
				bind:value={password}
				placeholder="Password"
				autocomplete={mode === 'login' ? 'current-password' : 'new-password'}
				class="w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
			/>

			{#if error}
				<p class="rounded-lg bg-red-900/40 px-3 py-2 text-xs text-red-400">{error}</p>
			{/if}

			<button
				type="button"
				onclick={submit}
				disabled={loading}
				class="mt-1 w-full rounded-xl bg-amber-400 py-3.5 text-sm font-bold text-slate-900 transition hover:bg-amber-300 active:scale-95 disabled:opacity-50"
			>
				{#if loading}
					{mode === 'login' ? 'Signing in…' : 'Creating account…'}
				{:else}
					{mode === 'login' ? 'Sign In' : 'Create Account'}
				{/if}
			</button>
		</div>
	</div>
{/if}
