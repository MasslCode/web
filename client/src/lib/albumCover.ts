import type { SyntheticEvent } from 'react';

export const albumPlaceholder = '/album-placeholder.svg';

export function handleCoverError(event: SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget;
  if (image.getAttribute('src') !== albumPlaceholder) image.src = albumPlaceholder;
}
