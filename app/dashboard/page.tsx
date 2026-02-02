import { redirect } from 'next/navigation';
import { getServerUser, getDashboardPath } from '@/lib/auth.server';

/**
 * Dashboard root page - redirects to role-specific dashboard
 */
export default async function DashboardPage() {
    const user = await getServerUser();

    if (!user) {
        redirect('/login');
    }

    // Redirect to role-specific dashboard
    const dashboardPath = getDashboardPath(user.role);
    redirect(dashboardPath);
}
