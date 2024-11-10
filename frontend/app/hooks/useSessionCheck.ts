// services/frontend/frontend/hooks/useSessionCheck.ts
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const useSessionCheck = () => {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            // Redirect to the login page if the session is not authenticated
            router.push('/login');
        }
    }, [status, router]);

    return { session, status };
};
