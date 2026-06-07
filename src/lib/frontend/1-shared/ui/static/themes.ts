export type Theme = {
	id: string;
	label: string;
	accent: string;
	icon: string;
	palette: [string, string, string, string];
};

export const THEMES: Theme[] = [
	{
		id: 'default',
		label: 'Default',
		icon: 'mdi-restore',
		accent: '#fb923c',
		palette: ['#fb923c', '#c2410c', '#7c3b1a', '#fed7aa']
	},
	{
		id: 'artificer',
		label: 'Artificer',
		icon: 'mdi-state-machine',
		accent: '#2dd4bf',
		palette: ['#2dd4bf', '#0f766e', '#134e4a', '#99f6e4']
	},
	{
		id: 'barbarian',
		label: 'Barbarian',
		icon: 'mdi-emoticon-angry',
		accent: '#ef4444',
		palette: ['#ef4444', '#b91c1c', '#7f1d1d', '#fecaca']
	},
	{
		id: 'bard',
		label: 'Bard',
		icon: 'mdi-music',
		accent: '#ec4899',
		palette: ['#ec4899', '#be185d', '#831843', '#fbcfe8']
	},
	{
		id: 'druid',
		label: 'Druid',
		icon: 'mdi-paw',
		accent: '#f59e0b',
		palette: ['#f59e0b', '#b45309', '#78350f', '#fde68a']
	},
	{
		id: 'fighter',
		label: 'Fighter',
		icon: 'mdi-sword-cross',
		accent: '#94a3b8',
		palette: ['#94a3b8', '#475569', '#1e293b', '#e2e8f0']
	},
	{
		id: 'paladin',
		label: 'Paladin',
		icon: 'mdi-shield-cross',
		accent: '#facc15',
		palette: ['#facc15', '#a16207', '#713f12', '#fef08a']
	},
	{
		id: 'pugilist',
		label: 'Pugilist',
		icon: 'mdi-box-cutter',
		accent: '#b45309',
		palette: ['#b45309', '#92400e', '#78350f', '#fcd34d']
	},
	{
		id: 'ranger',
		label: 'Ranger',
		icon: 'mdi-bow-arrow',
		accent: '#22c55e',
		palette: ['#22c55e', '#15803d', '#14532d', '#bbf7d0']
	},
	{
		id: 'rogue',
		label: 'Rogue',
		icon: 'mdi-knife',
		accent: '#8b5cf6',
		palette: ['#8b5cf6', '#6d28d9', '#4c1d95', '#ddd6fe']
	},
	{
		id: 'sorcerer',
		label: 'Sorcerer',
		icon: 'mdi-fire',
		accent: '#fb923c',
		palette: ['#fb923c', '#c2410c', '#7c3b1a', '#fed7aa']
	},
	{
		id: 'wizard',
		label: 'Wizard',
		icon: 'mdi-wizard-hat',
		accent: '#6366f1',
		palette: ['#6366f1', '#4338ca', '#312e81', '#c7d2fe']
	}
];
