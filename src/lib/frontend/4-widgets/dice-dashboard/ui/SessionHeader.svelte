<script lang="ts">
	import { getAppContext } from '@fe-shared/context';
	import type { SessionRecord } from '@fe-shared/lib';
	import { fmtDate, fmtTime } from '@fe-shared/lib';
	import type { DropdownItem } from '@fe-shared/ui';
	import { DropdownMenu, IconButton, TextInput } from '@fe-shared/ui';

	import type { DiceLoggerState } from '../state/diceLogger.svelte';

	let { s }: { s: DiceLoggerState } = $props();

	const app = getAppContext();
</script>

{#if !app.isGuest}
	<div class="flex flex-col gap-2">
		<div class="flex items-center gap-3 rounded-2xl bg-stone-800/60 px-4 py-2.5">
			<div class="flex min-w-0 flex-1 flex-col gap-0.5">
				<div class="flex items-center gap-1.5">
					{#if s.editingTitle}
						<TextInput
							id="session-name"
							bind:value={s.titleDraft}
							onblur={s.commitTitle}
							onkeydown={(e: KeyboardEvent) => s.onTitleKeydown(e)}
							placeholder="Unnamed session"
							autofocus
							class="font-semibold"
						/>
					{:else if app.session.currentSessionId !== null}
						<span class="truncate text-sm font-semibold text-white"
							>{app.session.currentSessionName || 'Unnamed session'}</span
						>
						<IconButton icon="mdi-pencil-outline" size="sm" onclick={() => s.startEditTitle()} />
					{:else}
						<span class="text-sm font-semibold text-stone-500">No session</span>
					{/if}
				</div>
				{#if app.session.rolledAt !== null}
					<p class="text-xs text-stone-500">
						{fmtDate(app.session.rolledAt)} · {fmtTime(app.session.rolledAt)}
					</p>
				{/if}
			</div>
			<DropdownMenu items={s.sessionMenuItems as DropdownItem[]} direction="down" align="right">
				{#snippet trigger(toggle)}
					<IconButton icon="mdi-dots-vertical" size="sm" onclick={toggle} />
				{/snippet}
			</DropdownMenu>
		</div>

		{#if s.pickerOpen}
			<div class="flex flex-col overflow-hidden rounded-2xl bg-stone-800/60">
				{#if s.pickerLoading}
					<p class="px-4 py-3 text-xs text-stone-500">Loading…</p>
				{:else if s.pickerItems.length === 0}
					<p class="px-4 py-3 text-xs text-stone-500">No other sessions</p>
				{:else}
					{#each s.pickerItems as session (session.id)}
						<button
							type="button"
							onclick={() => s.continueSession(session as SessionRecord)}
							class="flex items-center gap-3 px-4 py-2.5 text-left transition hover:bg-stone-700/60 active:bg-stone-700"
						>
							<span class="min-w-0 flex-1 truncate text-sm text-white"
								>{session.name || 'Unnamed session'}</span
							>
							<span class="shrink-0 text-xs text-stone-500">{fmtDate(session.rolledAt)}</span>
						</button>
					{/each}
				{/if}
			</div>
		{/if}
	</div>
{/if}
