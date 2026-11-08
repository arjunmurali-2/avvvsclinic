'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { moveDoctor } from '../../actions';

export function MoveDoctor({ id, first, last }: { id: number; first: boolean; last: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const move = (by: -1 | 1) => start(async () => { await moveDoctor(id, by); router.refresh(); });
  return (
    <span className="ad-block-tools">
      <button type="button" disabled={pending || first} onClick={() => move(-1)} aria-label="Move up">Up</button>
      <button type="button" disabled={pending || last} onClick={() => move(1)} aria-label="Move down">Down</button>
    </span>
  );
}
