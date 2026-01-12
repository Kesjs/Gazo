import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { auth } from '@/lib/auth';

interface ReportData {
  reportType: 'performance' | 'gains' | 'portfolio' | 'monthly';
  startDate?: string;
  endDate?: string;
  userId: string;
}

interface ReportResult {
  id: string;
  title: string;
  type: string;
  generatedAt: string;
  data: any;
  summary: {
    totalInvested: number;
    totalEarnings: number;
    totalWithdrawals: number;
    currentBalance: number;
    performance: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ReportData = await request.json();
    const { reportType, startDate, endDate } = body;
    const userId = session.user.id;

    const supabase = createClient();

    // Calculate date range
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    // Fetch user's data
    const [subscriptionsResult, transactionsResult, plansResult] = await Promise.all([
      supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString()),
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at', { ascending: true }),
      supabase.from('plans').select('*')
    ]);

    if (subscriptionsResult.error || transactionsResult.error || plansResult.error) {
      throw new Error('Failed to fetch data');
    }

    const subscriptions = subscriptionsResult.data || [];
    const transactions = transactionsResult.data || [];
    const plans = plansResult.data || [];

    // Calculate report data based on type
    let reportData: any = {};
    let summary = {
      totalInvested: 0,
      totalEarnings: 0,
      totalWithdrawals: 0,
      currentBalance: 0,
      performance: 0
    };

    switch (reportType) {
      case 'performance':
        reportData = generatePerformanceReport(subscriptions, transactions, plans, start, end);
        break;
      case 'gains':
        reportData = generateGainsReport(transactions, start, end);
        break;
      case 'portfolio':
        reportData = generatePortfolioReport(subscriptions, transactions, plans);
        break;
      case 'monthly':
        reportData = generateMonthlyReport(subscriptions, transactions, plans, start, end);
        break;
    }

    // Calculate summary
    summary.totalInvested = subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + s.amount, 0);

    summary.totalEarnings = transactions
      .filter(t => t.type === 'earnings')
      .reduce((sum, t) => sum + t.amount, 0);

    summary.totalWithdrawals = transactions
      .filter(t => t.type === 'withdrawal')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    summary.currentBalance = subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + (s.static_balance + s.dynamic_balance), 0);

    summary.performance = summary.totalInvested > 0
      ? ((summary.currentBalance - summary.totalInvested) / summary.totalInvested) * 100
      : 0;

    const report: ReportResult = {
      id: `${reportType}-${Date.now()}`,
      title: generateReportTitle(reportType, start, end),
      type: reportType,
      generatedAt: new Date().toISOString(),
      data: reportData,
      summary
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

function generateReportTitle(type: string, start: Date, end: Date): string {
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                     'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  const startMonth = monthNames[start.getMonth()];
  const endMonth = monthNames[end.getMonth()];
  const year = end.getFullYear();

  switch (type) {
    case 'performance':
      return `Rapport de Performance - ${startMonth} à ${endMonth} ${year}`;
    case 'gains':
      return `Rapport des Gains - ${startMonth} à ${endMonth} ${year}`;
    case 'portfolio':
      return `Rapport de Portefeuille Global`;
    case 'monthly':
      return `Rapport Mensuel - ${endMonth} ${year}`;
    default:
      return 'Rapport Financier';
  }
}

function generatePerformanceReport(subscriptions: any[], transactions: any[], plans: any[], start: Date, end: Date) {
  // Group transactions by month
  const monthlyData = transactions.reduce((acc, tx) => {
    const month = new Date(tx.created_at).toISOString().slice(0, 7); // YYYY-MM
    if (!acc[month]) acc[month] = { investments: 0, earnings: 0, withdrawals: 0 };
    if (tx.type === 'subscription') acc[month].investments += tx.amount;
    if (tx.type === 'earnings') acc[month].earnings += tx.amount;
    if (tx.type === 'withdrawal') acc[month].withdrawals += Math.abs(tx.amount);
    return acc;
  }, {});

  // Calculate performance metrics
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
  const totalInvested = activeSubscriptions.reduce((sum, s) => sum + s.amount, 0);
  const currentBalance = activeSubscriptions.reduce((sum, s) => sum + s.static_balance + s.dynamic_balance, 0);

  return {
    monthlyBreakdown: monthlyData,
    activeSubscriptions: activeSubscriptions.length,
    totalInvested,
    currentBalance,
    performancePercentage: totalInvested > 0 ? ((currentBalance - totalInvested) / totalInvested) * 100 : 0,
    topPerformingPlans: activeSubscriptions
      .map(sub => {
        const plan = plans.find(p => p.id === sub.plan_id);
        const performance = sub.amount > 0 ? ((sub.static_balance + sub.dynamic_balance - sub.amount) / sub.amount) * 100 : 0;
        return { ...plan, performance };
      })
      .sort((a, b) => b.performance - a.performance)
      .slice(0, 3)
  };
}

function generateGainsReport(transactions: any[], start: Date, end: Date) {
  const earnings = transactions.filter(t => t.type === 'earnings');
  const withdrawals = transactions.filter(t => t.type === 'withdrawal');

  // Group earnings by day
  const dailyEarnings = earnings.reduce((acc, tx) => {
    const day = new Date(tx.created_at).toISOString().slice(0, 10);
    acc[day] = (acc[day] || 0) + tx.amount;
    return acc;
  }, {});

  return {
    totalEarnings: earnings.reduce((sum, tx) => sum + tx.amount, 0),
    totalWithdrawals: withdrawals.reduce((sum, tx) => sum + Math.abs(tx.amount), 0),
    earningsCount: earnings.length,
    withdrawalCount: withdrawals.length,
    dailyEarnings,
    averageDailyEarnings: earnings.length > 0
      ? earnings.reduce((sum, tx) => sum + tx.amount, 0) / earnings.length
      : 0,
    largestEarning: earnings.length > 0 ? Math.max(...earnings.map(tx => tx.amount)) : 0
  };
}

function generatePortfolioReport(subscriptions: any[], transactions: any[], plans: any[]) {
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');

  const portfolioByPlan = activeSubscriptions.reduce((acc, sub) => {
    const plan = plans.find(p => p.id === sub.plan_id);
    if (!plan) return acc;

    if (!acc[plan.name]) {
      acc[plan.name] = {
        count: 0,
        totalInvested: 0,
        currentValue: 0,
        averagePerformance: 0
      };
    }

    acc[plan.name].count += 1;
    acc[plan.name].totalInvested += sub.amount;
    acc[plan.name].currentValue += sub.static_balance + sub.dynamic_balance;
    acc[plan.name].averagePerformance += sub.amount > 0
      ? ((sub.static_balance + sub.dynamic_balance - sub.amount) / sub.amount) * 100
      : 0;

    return acc;
  }, {});

  // Calculate averages
  Object.keys(portfolioByPlan).forEach(planName => {
    const plan = portfolioByPlan[planName];
    plan.averagePerformance = plan.count > 0 ? plan.averagePerformance / plan.count : 0;
  });

  return {
    totalActiveSubscriptions: activeSubscriptions.length,
    portfolioByPlan,
    diversificationRatio: Object.keys(portfolioByPlan).length,
    totalValue: activeSubscriptions.reduce((sum, s) => sum + s.static_balance + s.dynamic_balance, 0)
  };
}

function generateMonthlyReport(subscriptions: any[], transactions: any[], plans: any[], start: Date, end: Date) {
  const month = end.toISOString().slice(0, 7); // YYYY-MM

  const monthlyTransactions = transactions.filter(tx =>
    tx.created_at.startsWith(month)
  );

  const monthlyEarnings = monthlyTransactions.filter(t => t.type === 'earnings');
  const monthlyWithdrawals = monthlyTransactions.filter(t => t.type === 'withdrawal');
  const monthlyInvestments = monthlyTransactions.filter(t => t.type === 'subscription');

  return {
    period: month,
    newInvestments: monthlyInvestments.length,
    totalNewInvestment: monthlyInvestments.reduce((sum, tx) => sum + tx.amount, 0),
    earnings: monthlyEarnings.reduce((sum, tx) => sum + tx.amount, 0),
    withdrawals: monthlyWithdrawals.reduce((sum, tx) => sum + Math.abs(tx.amount), 0),
    netGrowth: monthlyEarnings.reduce((sum, tx) => sum + tx.amount, 0) - monthlyWithdrawals.reduce((sum, tx) => sum + Math.abs(tx.amount), 0),
    transactionCount: monthlyTransactions.length,
    activeSubscriptions: subscriptions.filter(s => s.status === 'active').length
  };
}
