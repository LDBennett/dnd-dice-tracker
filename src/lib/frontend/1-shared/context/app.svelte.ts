import { getContext } from 'svelte';
import type { ISession } from '../lib/types/session.types';

export type User = { name: string; email: string };

export class AppContext {
	rollMode    = $state(false);
	rightHanded = $state(false);
	showLogin   = $state(false);
	user        = $state<User | null>(null);
	isGuest     = $derived(!this.user);
	session: ISession;

	constructor(init: { user?: User | null; rollMode?: boolean; rightHanded?: boolean; session: ISession }) {
		this.session     = init.session;
		this.user        = init.user ?? null;
		this.rollMode    = init.rollMode ?? false;
		this.rightHanded = init.rightHanded ?? false;
	}

	openLogin()  { this.showLogin = true; }
	closeLogin() { this.showLogin = false; }
}

export const APP_CONTEXT_KEY = Symbol('app');
export function getAppContext() { return getContext<AppContext>(APP_CONTEXT_KEY); }
