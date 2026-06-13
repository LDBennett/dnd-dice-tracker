<script lang="ts">
	interface Props {
		singleOpacity: number;
		multiOpacity: number;
		gradientProgress: number;
		isSwiping: boolean;
		containerWidth: number;
		onpointerdown: (e: PointerEvent) => void;
		onpointermove: (e: PointerEvent) => void;
		onpointerup: (e: PointerEvent) => void;
		onpointercancel: (e: PointerEvent) => void;
	}

	let {
		singleOpacity,
		multiOpacity,
		gradientProgress,
		isSwiping,
		containerWidth = $bindable(),
		onpointerdown,
		onpointermove,
		onpointerup,
		onpointercancel
	}: Props = $props();
</script>

<div
	class="flex flex-col"
	bind:clientWidth={containerWidth}
	role="group"
	aria-label="Mode selector — swipe to switch"
	style="touch-action: pan-y"
	{onpointerdown}
	{onpointermove}
	{onpointerup}
	{onpointercancel}
>
	<div class="relative h-7">
		<div
			class={[
				'absolute left-0 flex items-center gap-2 transition-all duration-300',
				singleOpacity > 0.5 ? 'text-accent' : 'text-stone-500'
			]}
			style={`opacity: ${singleOpacity}; pointer-events: ${singleOpacity > 0.1 ? 'auto' : 'none'};`}
		>
			<span class="mdi mdi-hexagon text-sm" aria-hidden="true"></span>
			<span class="text-sm font-semibold">Single Roll</span>
		</div>
		<div
			class={[
				'absolute right-0 flex items-center gap-2 transition-all duration-300',
				multiOpacity > 0.5 ? 'text-accent' : 'text-stone-500'
			]}
			style={`opacity: ${multiOpacity}; pointer-events: ${multiOpacity > 0.1 ? 'auto' : 'none'};`}
		>
			<span class="text-sm font-semibold">Multi Roll</span>
			<span class="mdi mdi-hexagon-multiple-outline text-sm" aria-hidden="true"></span>
		</div>
	</div>

	<div
		class={['accent-gradient h-1.5 overflow-hidden rounded-full', !isSwiping && 'gradient-animate']}
		style={`--gradient-pos: ${gradientProgress * 100}%;`}
	></div>
</div>

<style>
	.gradient-animate {
		transition: --gradient-pos 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.accent-gradient {
		background: linear-gradient(
			90deg,
			transparent calc(var(--gradient-pos) - 40%),
			color-mix(in srgb, var(--accent) 60%, transparent) var(--gradient-pos),
			transparent calc(var(--gradient-pos) + 40%)
		);
	}
</style>
