<script lang="ts">
	import Logo from '$lib/assets/logo.png';
	import { getAppContext } from '@fe-shared/context';
	import Button from '../buttons/Button.svelte';

	const app = getAppContext();

	const pillStyle = $derived(`transform: translateX(${app.rollMode ? '100%' : '0%'})`);
</script>

<header
	class="fixed top-0 right-0 left-0 z-50 border-b border-stone-700/60 bg-stone-900/95 backdrop-blur"
	style="padding-top: env(safe-area-inset-top)"
>
	<div class="mx-auto max-w-225">
		<!-- Row 1: logo + actions -->
		<div class="flex h-14 items-center justify-between px-4">
			<div class="flex items-center gap-2">
				<img src={Logo} alt="Logo" class="h-6 w-6" />
				<span class="font-bold text-orange-400">D&D Dice Tracker</span>
			</div>

			<div class="flex items-center gap-1">
				<!-- Roll mode toggle -->
				<div class="relative flex overflow-hidden rounded-xl bg-stone-800 text-xs font-semibold">
					<div
						class="absolute inset-y-0 w-1/2 rounded-xl bg-orange-400 transition-transform duration-200 ease-out"
						style={pillStyle}
					></div>
					<button
						type="button"
						onclick={() => (app.rollMode = false)}
						class={['relative z-10 px-4 py-2 transition-colors', app.rollMode ? 'text-stone-400' : 'text-stone-900']}>Log</button
					>
					<button
						type="button"
						onclick={() => (app.rollMode = true)}
						class={['relative z-10 px-4 py-2 transition-colors', app.rollMode ? 'text-stone-900' : 'text-stone-400']}>Quick</button
					>
				</div>

				{#if app.user}
					<form method="post" action="/signout">
						<Button type="submit">Sign out</Button>
					</form>
				{:else}
					<button
						type="button"
						onclick={() => app.openLogin()}
						class="rounded-lg bg-orange-400 px-4 py-2 text-sm font-semibold text-stone-900 transition hover:bg-orange-300 active:scale-95"
						>Sign In</button
					>
				{/if}
			</div>
		</div>

	</div>
</header>
