<script lang="ts">
	import './layout.css';

	import { page } from '$app/state';
</script>

<div
	class="logo-text flex min-h-screen flex-col items-center justify-center bg-stone-900 px-6 text-center"
>
	<div class="animate-spin-slow mb-6">
		<svg viewBox="0 0 100 100" width="96" height="96" aria-hidden="true">
			<polygon
				points="50,4 96,27 96,73 50,96 4,73 4,27"
				fill="#7f1d1d33"
				stroke="#ef4444"
				stroke-width="5"
				stroke-linejoin="round"
			/>
			<text
				x="50"
				y="54"
				text-anchor="middle"
				dominant-baseline="middle"
				fill="#ef4444"
				font-size="36"
				font-weight="900"
				font-family="system-ui, sans-serif">1</text
			>
		</svg>
	</div>

	<h1 class="mb-2 text-3xl font-black tracking-tight text-red-400">Critical Failure</h1>

	<p class="mb-1 text-lg font-semibold text-stone-300">You rolled a Natural 1.</p>
	<p class="mb-8 text-sm text-stone-500">
		{page.error?.message ?? 'Something went catastrophically wrong. Your party is not impressed.'}
	</p>

	<div class="mb-8 rounded-2xl bg-red-900/20 px-6 py-4 ring-1 ring-red-800/40">
		<p class="text-xs font-semibold tracking-widest text-red-500 uppercase">Error {page.status}</p>
	</div>

	<button
		type="button"
		onclick={() => (window.location.href = '/')}
		class="rounded-2xl bg-red-500 px-8 py-4 text-base font-black text-stone-950 shadow-lg transition hover:brightness-110 active:scale-95"
	>
		Roll Again
	</button>
</div>

<style>
	.logo-text {
		font-family: 'Cinzel Decorative', serif;
	}
	@keyframes spin-slow {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
	.animate-spin-slow {
		animation: spin-slow 8s linear infinite;
	}
</style>
