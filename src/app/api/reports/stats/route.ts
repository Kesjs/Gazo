import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId || userId !== session.user.id) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const supabase = createClient();

    // Get current date info
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7);

    // Fetch all user data
    const [subscriptionsResult, transactionsResult] = await Promise.all([
      supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId),
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    ]);

    if (subscriptionsResult.error || transactionsResult.error) {
      throw new Error('Failed to fetch data');
    }

    const subscriptions = subscriptionsResult.data || [];
    const transactions = transactionsResult.data || [];

    // Calculate stats
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
    const totalInvested = activeSubscriptions.reduce((sum, s) => sum + s.amount, 0);
    const currentBalance = activeSubscriptions.reduce((sum, s) => sum + s.static_balance + s.dynamic_balance, 0);

    // Monthly downloads (we'll simulate this based on report generations or use a counter)
    // For now, we'll calculate based on transactions in the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentTransactions = transactions.filter(t =>
      new Date(t.created_at) > thirtyDaysAgo
    );

    // Performance calculation
    const performance = totalInvested > 0
      ? ((currentBalance - totalInvested) / totalInvested) * 100
      : 0;

    // Last generation date (most recent transaction)
    const lastTransaction = transactions.length > 0 ? transactions[0] : null;
    const lastGeneration = lastTransaction
      ? new Date(lastTransaction.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
      : 'Jamais';

    const stats = {
      availableReports: 4, // We have 4 report types available
      monthlyDownloads: Math.min(recentTransactions.length, 50), // Cap at reasonable number
      performance: performance.toFixed(1),
      lastGeneration
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
