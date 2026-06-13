export class SwipeGesture {
	isSwiping = $state(false);
	swipeDeltaX = $state(0);
	containerWidth = $state(0);

	private pointerIsDown = false;
	private startX = 0;
	private startY = 0;

	onStart(e: PointerEvent) {
		this.pointerIsDown = true;
		this.startX = e.clientX;
		this.startY = e.clientY;
		this.isSwiping = false;
	}

	onMove(e: PointerEvent) {
		if (!this.pointerIsDown) return;
		const el = e.currentTarget as HTMLElement;
		const dx = e.clientX - this.startX;
		const dy = e.clientY - this.startY;
		if (!this.isSwiping && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
			this.isSwiping = true;
			el.setPointerCapture(e.pointerId);
		}
		if (this.isSwiping) this.swipeDeltaX = dx;
	}

	onEnd(e: PointerEvent, onSwipe: (toRight: boolean) => void) {
		this.pointerIsDown = false;
		if (!this.isSwiping) return;
		const dx = e.clientX - this.startX;
		if (Math.abs(dx) > 40) onSwipe(dx > 0);
		this.isSwiping = false;
		this.swipeDeltaX = 0;
	}
}
