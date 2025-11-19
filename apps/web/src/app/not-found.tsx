import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center p-4 text-center">
            <h2 className="text-6xl font-bold text-lime-500 mb-4">404</h2>
            <h3 className="text-2xl font-semibold text-foreground mb-2">Page Not Found</h3>
            <p className="text-muted-foreground mb-8 max-w-md">
                The page you are looking for doesn&apos;t exist or has been moved.
            </p>
            <Link
                href="/"
                className="rounded-md bg-lime-500 px-6 py-3 text-black font-medium hover:bg-lime-400 transition-colors"
            >
                Return Home
            </Link>
        </div>
    );
}
