export default function FeaturePage({ params }: { params: { feature: string } }) {
    const title = params.feature.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase());

    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <h1 className="text-4xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-neon-purple">
                {title}
            </h1>
            <p className="text-gray-400 max-w-md">
                This feature is currently under development. Stay tuned for updates!
            </p>
        </div>
    );
}
