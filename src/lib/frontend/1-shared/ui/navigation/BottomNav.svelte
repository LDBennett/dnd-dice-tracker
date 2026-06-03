<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import NavTabButton from './NavTabButton.svelte';

	const currentPath = $derived($page.url.pathname);

	let isRollAnimating = $state(false);

	function handleRollClick() {
		isRollAnimating = true;
		setTimeout(() => { isRollAnimating = false; }, 500);
		goto(resolve('/'));
	}
</script>

<nav
	class="fixed right-0 bottom-0 left-0 z-50 flex justify-center"
	style="padding-bottom: env(safe-area-inset-bottom)"
>
	<div
		class="relative mx-4 mb-4 w-full max-w-sm"
		style="filter: drop-shadow(0 4px 24px rgb(0 0 0 / 0.5))"
	>
		<!-- Bar with circular notch cut at top-center -->
		<div
			class="flex h-16 items-center justify-between rounded-2xl bg-stone-800 px-8"
			style="mask-image: radial-gradient(circle 36px at 50% 0%, transparent 35px, black 36px); -webkit-mask-image: radial-gradient(circle 36px at 50% 0%, transparent 35px, black 36px);"
		>
			<!-- History -->
			<NavTabButton href="/history" label="History" active={currentPath === '/history'} animClass="anim-bounce">
				{#snippet icon()}
					<svg
						width="22"
						height="22"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
						<rect x="9" y="3" width="6" height="4" rx="2" />
						<path d="M9 12h6M9 16h4" />
					</svg>
				{/snippet}
			</NavTabButton>

			<!-- Center spacer — label for Roll page -->
			<div class="relative flex w-18 shrink-0 items-end justify-center pb-2">
				<span
					class={[
						'mt-8.5 text-xs font-semibold transition-colors',
						currentPath === '/' ? 'text-orange-400' : 'text-stone-500'
					]}>Roll</span
				>
			</div>

			<!-- Stats -->
			<NavTabButton href="/stats" label="Stats" active={currentPath === '/stats'} animClass="anim-pop">
				{#snippet icon()}
					<svg
						width="22"
						height="22"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M18 20V10M12 20V4M6 20v-6" />
					</svg>
				{/snippet}
			</NavTabButton>
		</div>

		<button
			type="button"
			onclick={handleRollClick}
			aria-label="Roll Dice"
			class={[
				'absolute top-0 left-1/2 flex h-17 w-17 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-orange-400 transition active:scale-95',
				currentPath === '/' ? 'shadow-lg shadow-orange-400/40' : 'opacity-90'
			]}
		>
			<svg
				width="30"
				height="30"
				viewBox="0 0 24 24"
				fill="none"
				stroke="white"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class={[isRollAnimating && 'anim-spin360']}
			>
				<polygon points="12,2 22,9 18,22 6,22 2,9" />
				<polyline points="2,9 12,13 22,9" />
				<line x1="12" y1="2" x2="12" y2="13" />
				<line x1="18" y1="22" x2="12" y2="13" />
				<line x1="6" y1="22" x2="12" y2="13" />
			</svg>
		</button>
	</div>
</nav>
