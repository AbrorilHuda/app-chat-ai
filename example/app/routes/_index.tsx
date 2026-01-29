export default function Index() {
    // Test if this even renders
    console.log('[Index] Component rendering at:', new Date().toISOString());

    return (
        <div className="p-8 bg-white min-h-screen">
            <h1 className="text-3xl font-bold mb-4">Hydration Test</h1>

            <div className="space-y-4">
                <p className="text-lg">If you see this, HTML is rendering.</p>

                <button
                    onClick={() => {
                        alert('React onClick works!');
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700"
                    type="button"
                >
                    Click Me - Test React Event
                </button>

                <button
                    onMouseOver={() => console.log('Mouse over!')}
                    onMouseOut={() => console.log('Mouse out!')}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg text-lg font-semibold"
                    type="button"
                >
                    Hover Me - Test Mouse Events
                </button>

                <div className="mt-4 p-4 bg-gray-100 rounded">
                    <p className="font-mono text-sm">
                        Check Console (F12) for logs:
                    </p>
                    <ul className="font-mono text-sm mt-2 space-y-1">
                        <li>• [Index] Component rendering at: ...</li>
                        <li>• Mouse over! (when hovering)</li>
                        <li>• Mouse out! (when leaving)</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}