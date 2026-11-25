/** Instant-navigation fallback for dynamic routes (shown only for a beat). */
export default function RouteLoading() {
  return (
    <div className="shell flex min-h-[80vh] items-center pt-24" aria-busy="true" aria-label="Loading">
      <div className="h-px w-40 overflow-hidden bg-line">
        <div className="h-full w-1/3 animate-[loadbar_1.2s_ease-in-out_infinite] bg-lime" />
      </div>
    </div>
  );
}
