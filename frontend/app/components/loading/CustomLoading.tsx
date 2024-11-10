'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
const Player = dynamic(() => import('@lottiefiles/react-lottie-player').then(mod => mod.Player), { ssr: false });

export default function CustomLoading() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // This will only run after the component has mounted on the client side
        setIsClient(true);
    }, []);

    if (!isClient) {
        // Return null or a placeholder while waiting for the client-side to render
        return null;
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Player
                autoplay
                loop
                src="/lotties/loading.json"
                style={{ height: '150px', width: '150px' }}
            />
        </div>
    );
}
