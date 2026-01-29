import { RemixBrowser } from "@remix-run/react";
<parameter name="startTransition, StrictMode } from " react";
import { hydrateRoot } from "react-dom/client";

console.log('[Hydration] Starting...');

startTransition(() => {
    try {
        console.log('[Hydration] Calling hydrateRoot...');
        hydrateRoot(
            document,
            <StrictMode>
                <RemixBrowser />
            </StrictMode>
        );
        console.log('[Hydration] Success!');

        // Test if event listeners work
        setTimeout(() => {
            console.log('[Hydration] React should be ready now');
        }, 1000);
    } catch (error) {
        console.error('[Hydration] ERROR:', error);
        alert('Hydration failed! Check console.');
    }
});
