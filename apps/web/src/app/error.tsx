"use client";

import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center p-4">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Something went wrong!</h2>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
                We encountered an unexpected error. Please try again later.
            </p>
            <button
                onClick={() => reset()}
                className="rounded-md bg-lime-500 px-4 py-2 text-black font-medium hover:bg-lime-400 transition-colors"
            >
                Try again
            </button>
        </div>
    );
}
