export default function TrendsPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent-purple)]/10 flex items-center justify-center">
                <span className="text-3xl">📈</span>
            </div>
            <h2 className="text-xl font-bold">Trends & Comparisons</h2>
            <p className="text-[var(--color-text-secondary)] text-center max-w-md">
                Upload multiple reports to see inventory trends, production pipeline
                changes, and demand shifts over time. Coming after more reports are
                uploaded.
            </p>
        </div>
    );
}
