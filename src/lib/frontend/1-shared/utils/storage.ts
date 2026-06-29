export function persist(key: string, value: string | null): void {
	if (value !== null && value !== '') localStorage.setItem(key, value);
	else localStorage.removeItem(key);
}
