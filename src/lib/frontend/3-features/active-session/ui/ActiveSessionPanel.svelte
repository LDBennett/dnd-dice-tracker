<script lang="ts">
	import { getAppContext } from '@fe-shared/context';
	import { SessionCard } from '@fe-entities/session';
	import type { RollResult } from '@fe-entities/session';

	const app = getAppContext();
	const session = app.session;

	const sessionData = $derived({
		id: session.currentSessionId ?? '',
		rolls: session.currentSessionRolls,
		modifier: 0,
		rolledAt: session.rolledAt ?? new Date().toISOString(),
		name: session.currentSessionName
	});
</script>

{#if session.currentSessionRolls.length > 0 && session.currentSessionId}
	<SessionCard
		session={sessionData}
		isGuest={false}
		live={true}
		editMode={true}
		savingId={session.saving ? session.currentSessionId : null}
		savedId={null}
		onSaveName={(_, name) => session.patch({ name })}
		onSaveRolls={(_, rolls) => session.patch({ rolls: rolls as RollResult[] })}
		onDelete={() => session.reset()}
	/>
{/if}
