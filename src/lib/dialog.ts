import type { MouseEvent } from 'react';

/** Un clic en el backdrop apunta al diálogo, pero queda fuera de sus límites. */
export function closeOnBackdrop(event: MouseEvent<HTMLDialogElement>) {
  if (event.target !== event.currentTarget) return;
  const rect = event.currentTarget.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) event.currentTarget.close();
}
