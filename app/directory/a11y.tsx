// Small pieces of text for screen readers only.

// Every outside link opens in a new tab; this says so.
export function NewTab() {
  return <span className="sr-only"> (opens in a new tab)</span>;
}

// The ↗ that marks an outside link, which screen readers would otherwise read
// as "north east arrow".
export function OutArrow() {
  return <span aria-hidden="true"> &#8599;</span>;
}
