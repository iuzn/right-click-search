"use client";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', color: '#fff' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Something went wrong!</h2>
                    <button
                        onClick={() => reset()}
                        style={{ borderRadius: '0.375rem', backgroundColor: '#84cc16', padding: '0.5rem 1rem', color: '#000', fontWeight: '500', cursor: 'pointer', border: 'none' }}
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}
