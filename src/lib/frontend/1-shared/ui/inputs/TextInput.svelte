<script lang="ts">
	let {
		value = $bindable(''),
		type = 'text',
		placeholder,
		class: extraClass,
		...restProps
	}: {
		value?: string;
		type?: string;
		placeholder?: string;
		class?: string;
		[key: string]: unknown;
	} = $props();
</script>

<input
	{type}
	bind:value
	{placeholder}
	class={['w-full rounded-xl border border-stone-600 bg-stone-700/60 px-3 py-2.5 text-sm text-white placeholder-stone-500 focus:border-orange-400 focus:ring-1 focus:ring-orange-400/30 focus:outline-none', extraClass]}
	{...restProps}
/>
