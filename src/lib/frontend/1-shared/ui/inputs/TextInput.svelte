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
	class={['w-full rounded-xl border border-slate-600 bg-slate-700/60 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 focus:outline-none', extraClass]}
	{...restProps}
/>
