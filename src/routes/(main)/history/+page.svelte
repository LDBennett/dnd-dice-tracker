<script lang="ts">
	import { HistoryEditor } from '@fe-widgets/history-editor';

	import { page } from '$app/state';

	const initialSessionId = $derived(page.url.searchParams.get('session'));
</script>

<HistoryEditor {initialSessionId} />
