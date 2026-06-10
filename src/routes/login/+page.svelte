<script lang="ts">
	import { enhance } from '$app/forms';

	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let mode = $state<'login' | 'register'>('login');
</script>

<div
	class="flex min-h-screen flex-col items-center justify-center bg-stone-900 px-4 py-12"
	style="padding-bottom: max(3rem, env(safe-area-inset-bottom))"
>
	<div class="w-full max-w-sm">
		<div class="mb-8 text-center">
			<div class="mb-2 text-5xl">⚔️</div>
			<h1 class="text-3xl font-bold text-orange-400">D&D Dice Tracker</h1>
			<p class="mt-1 text-stone-400">Log your physical rolls</p>
		</div>

		<div class="mb-6 flex rounded-xl bg-stone-800 p-1">
			<button
				type="button"
				onclick={() => (mode = 'login')}
				class={[
					'flex-1 rounded-lg py-3 text-sm font-semibold transition-colors',
					mode === 'login' ? 'bg-orange-400 text-stone-900' : 'text-stone-400 hover:text-white'
				]}
			>
				Sign In
			</button>
			<button
				type="button"
				onclick={() => (mode = 'register')}
				class={[
					'flex-1 rounded-lg py-3 text-sm font-semibold transition-colors',
					mode === 'register' ? 'bg-orange-400 text-stone-900' : 'text-stone-400 hover:text-white'
				]}
			>
				Register
			</button>
		</div>

		<form
			method="post"
			action={mode === 'login' ? '?/signInEmail' : '?/signUpEmail'}
			use:enhance
			class="space-y-4"
		>
			{#if mode === 'register'}
				<div>
					<label for="name" class="mb-1 block text-sm font-medium text-stone-300">Name</label>
					<input
						id="name"
						name="name"
						type="text"
						autocomplete="name"
						class="w-full rounded-xl border border-stone-600 bg-stone-800 px-4 py-3 text-white placeholder-stone-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 focus:outline-none"
						placeholder="Your adventurer name"
					/>
				</div>
			{/if}

			<div>
				<label for="email" class="mb-1 block text-sm font-medium text-stone-300">Email</label>
				<input
					id="email"
					name="email"
					type="email"
					autocomplete="email"
					class="w-full rounded-xl border border-stone-600 bg-stone-800 px-4 py-3 text-white placeholder-stone-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 focus:outline-none"
					placeholder="you@example.com"
				/>
			</div>

			<div>
				<label for="password" class="mb-1 block text-sm font-medium text-stone-300">Password</label>
				<input
					id="password"
					name="password"
					type="password"
					autocomplete={mode === 'login' ? 'current-password' : 'new-password'}
					class="w-full rounded-xl border border-stone-600 bg-stone-800 px-4 py-3 text-white placeholder-stone-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 focus:outline-none"
					placeholder="••••••••"
				/>
			</div>

			{#if form?.message}
				<p class="rounded-lg bg-red-900/40 px-4 py-3 text-sm text-red-400">{form.message}</p>
			{/if}

			<button
				type="submit"
				class="w-full rounded-xl bg-orange-400 py-4 text-base font-bold text-stone-900 transition hover:bg-orange-300 active:scale-95"
			>
				{mode === 'login' ? 'Sign In' : 'Create Account'}
			</button>
		</form>
	</div>
</div>
