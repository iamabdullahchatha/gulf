/** Renders a title with one phrase set in the editorial serif accent (<em>). */
export function AccentTitle({ title, accent }: { title: string; accent?: string }) {
  if (!accent) return <>{title}</>
  const i = title.indexOf(accent)
  if (i < 0) return <>{title}</>
  return (
    <>
      {title.slice(0, i)}
      <em>{accent}</em>
      {title.slice(i + accent.length)}
    </>
  )
}
