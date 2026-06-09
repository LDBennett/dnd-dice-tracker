<script lang="ts">
	import { getAppContext } from '@fe-shared/context';
	import { IconButton, ConfirmModal, DropdownMenu, Logo } from '@fe-shared/ui';
	import type { DropdownItem } from '@fe-shared/ui';

	const app = getAppContext();

	let confirmingSignOut = $state(false);
	let signOutForm = $state<HTMLFormElement | null>(null);

	const accountItems = $derived<DropdownItem[]>([
		{ label: 'Theme', icon: 'mdi-palette-outline', onclick: () => app.openThemePicker() },
		...(app.user
			? [{ label: 'Sign out', icon: 'mdi-logout', onclick: () => (confirmingSignOut = true) }]
			: [{ label: 'Sign in', icon: 'mdi-login', onclick: () => app.openLogin() }])
	]);

	function submitSignOut() {
		confirmingSignOut = false;
		signOutForm?.requestSubmit();
	}
</script>

<header
	class="fixed top-0 right-0 left-0 z-50 border-b border-stone-700/60 bg-stone-900/95 backdrop-blur"
	style="padding-top: env(safe-area-inset-top)"
>
	<div class="mx-auto max-w-225">
		<div class="flex h-14 items-center justify-between px-4">
			<div class="flex items-center gap-2">
				<Logo class="h-6 w-6" />

				<span class="text-accent logo-text font-bold">Tabula Rollsa</span>
			</div>

			<div class="flex items-center gap-1">
				<DropdownMenu items={accountItems} direction="down" align="right">
					{#snippet trigger(toggle)}
						<IconButton icon="mdi-account-circle-outline" onclick={toggle} aria-label="Account" />
					{/snippet}
				</DropdownMenu>
			</div>
		</div>
	</div>
</header>

<!-- Hidden sign-out form -->
<form bind:this={signOutForm} method="post" action="/signout" class="hidden"></form>

{#if confirmingSignOut}
	<ConfirmModal
		title="Sign out?"
		message="You'll need to sign in again to save your rolls."
		confirmLabel="Sign out"
		onConfirm={submitSignOut}
		onCancel={() => (confirmingSignOut = false)}
	/>
{/if}
