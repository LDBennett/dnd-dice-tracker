export const DIE_COLOR: Record<number, string> = {
	4: '#f87171', // red-400
	6: '#60a5fa', // blue-400
	8: '#4ade80', // green-400
	10: '#22d3ee', // cyan-400
	12: '#f472b6', // pink-400
	20: '#facc15', // yellow-400  (gold — iconic for the d20)
	100: '#c084fc' // purple-400
};

// SVG polygon points for each die silhouette (100×100 viewBox, inset ~6px for stroke).
// null = circle (d100).
export const DIE_SHAPE: Record<number, string | null> = {
	4: '50,6 94,90 6,90',
	6: '6,6 94,6 94,94 6,94',
	8: '50,6 94,50 50,94 6,50',
	10: '50,6 92,40 75,94 25,94 8,40',
	12: '50,6 92,36 76,86 24,86 8,36',
	20: '50,6 88,28 88,72 50,94 12,72 12,28',
	100: null
};

export const DIE_TEXT_Y: Record<number, number> = {
	4: 62,
	6: 50,
	8: 50,
	10: 55,
	12: 50,
	20: 50,
	100: 50
};
