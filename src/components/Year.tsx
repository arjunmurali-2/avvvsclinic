'use client';

import { useEffect, useState } from 'react';

/** The current year, corrected in the browser so a prerendered page never goes stale. */
export function Year({ since }: { since?: number }) {
  const [y, setY] = useState(() => new Date().getFullYear());
  useEffect(() => setY(new Date().getFullYear()), []);
  return <span suppressHydrationWarning>{since ? y - since : y}</span>;
}
