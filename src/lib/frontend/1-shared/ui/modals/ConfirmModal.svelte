<script lang="ts">
	import Modal from './Modal.svelte';
	import Button from '../buttons/Button.svelte';

	let {
		title,
		message,
		confirmLabel = 'Delete',
		onConfirm,
		onCancel
	}: {
		title: string;
		message?: string;
		confirmLabel?: string;
		onConfirm: () => void;
		onCancel: () => void;
	} = $props();
</script>

<Modal onclose={onCancel} class="border-2 border-red-500/30 p-5">
	<p class="mb-1 text-lg font-black text-white">{title}</p>
	{#if message}
		<p class="mb-5 text-sm text-stone-400">{message}</p>
	{:else}
		<div class="mb-5"></div>
	{/if}
	<div class="flex gap-3">
		<Button fullWidth onclick={onCancel}>Cancel</Button>
		<Button variant="primary" fullWidth onclick={onConfirm} style="background: #ef4444;">
			{confirmLabel}
		</Button>
	</div>
</Modal>
