<script lang="ts">
	interface Props {
		batchMode: boolean;
		onSetMode: (batch: boolean) => void;
		onpointerdown: (e: PointerEvent) => void;
		onpointermove: (e: PointerEvent) => void;
		onpointerup: (e: PointerEvent) => void;
		onpointercancel: (e: PointerEvent) => void;
	}

	let { batchMode, onSetMode, onpointerdown, onpointermove, onpointerup, onpointercancel }: Props =
		$props();
</script>

<div
	class="flex items-center justify-center gap-3"
	role="group"
	aria-label="Mode selector — swipe to switch"
	style="touch-action: pan-y"
	{onpointerdown}
	{onpointermove}
	{onpointerup}
	{onpointercancel}
>
	<button
		type="button"
		onclick={() => onSetMode(false)}
		class="flex items-center justify-center"
		aria-label="Single roll mode"
	>
		<span
			class={[
				'mdi mdi-hexagon-outline transition-all duration-200',
				!batchMode ? 'text-accent scale-125' : 'scale-100 text-stone-600'
			]}
			style="transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1)"
			aria-hidden="true"
		></span>
	</button>

	<div class="flex items-center gap-1.5">
		<button
			type="button"
			onclick={() => onSetMode(false)}
			class={['h-1.5 w-6 rounded-full transition-colors duration-300', !batchMode ? 'bg-accent' : 'bg-stone-600']}
			aria-label="Single roll mode"
		></button>
		<button
			type="button"
			onclick={() => onSetMode(true)}
			class={['h-1.5 w-6 rounded-full transition-colors duration-300', batchMode ? 'bg-accent' : 'bg-stone-600']}
			aria-label="Batch roll mode"
		></button>
	</div>

	<button
		type="button"
		onclick={() => onSetMode(true)}
		class="flex items-center justify-center"
		aria-label="Batch roll mode"
	>
		<span
			class={[
				'mdi mdi-hexagon-multiple-outline transition-all duration-200',
				batchMode ? 'text-accent scale-125' : 'scale-100 text-stone-600'
			]}
			style="transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1)"
			aria-hidden="true"
		></span>
	</button>
</div>
