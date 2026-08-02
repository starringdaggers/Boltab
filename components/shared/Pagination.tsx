export default function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center gap-1.5 mt-4">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-taupe/30 text-vandyke disabled:opacity-40 hover:border-choc transition-colors text-sm"
        aria-label="Previous page"
      >
        ‹
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
            p === page
              ? "bg-choc text-antique"
              : "border border-taupe/30 text-vandyke hover:border-choc"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-taupe/30 text-vandyke disabled:opacity-40 hover:border-choc transition-colors text-sm"
        aria-label="Next page"
      >
        ›
      </button>
    </div>
  );
}
