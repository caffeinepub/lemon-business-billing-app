import { useGetLemonSummary, useGetAllCustomers } from '@/hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { IndianRupee, Citrus, TrendingUp, TrendingDown, Users, Wallet } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

function MetricCard({
  label,
  value,
  icon,
  colorClass,
  bgClass,
  borderClass,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}) {
  return (
    <Card className={`${bgClass} ${borderClass} shadow-sm`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bgClass} border ${borderClass}`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-lemon-dark/60 font-medium">{label}</p>
            <p className={`text-xl font-extrabold ${colorClass} leading-tight`}>{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MySummaryPage() {
  const { data: summary, isLoading: summaryLoading } = useGetLemonSummary();
  const { data: customers = [], isLoading: customersLoading } = useGetAllCustomers();
  const { t } = useLanguage();

  const isLoading = summaryLoading || customersLoading;

  const totalCreditDue = summary?.totalCreditDue ?? BigInt(0);
  const totalLemonsSold = summary?.totalLemonsSold ?? BigInt(0);
  const totalRupeesCollected = summary?.totalRupeesCollected ?? BigInt(0);
  const totalProfitOrLoss = summary?.totalProfitOrLoss ?? BigInt(0);

  const isProfit = totalProfitOrLoss >= BigInt(0);

  return (
    <div>
      {/* Page Header */}
      <div className="mb-5">
        <h2 className="text-xl font-extrabold text-lemon-dark">{t('myLemonSummaryTitle')}</h2>
        <p className="text-sm text-muted-foreground">{t('completeOverview')}</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Total Customers */}
          <MetricCard
            label={t('totalCustomers')}
            value={customers.length.toString()}
            icon={<Users className="w-5 h-5 text-lemon-dark" />}
            colorClass="text-lemon-dark"
            bgClass="bg-lemon-yellow/50"
            borderClass="border-lemon-yellow-dark/30"
          />

          {/* Total Lemons Sold */}
          <MetricCard
            label={t('totalLemonBaskets')}
            value={Number(totalLemonsSold).toLocaleString('en-IN') + ' pcs'}
            icon={<Citrus className="w-5 h-5 text-lemon-green-dark" />}
            colorClass="text-lemon-green-dark"
            bgClass="bg-lemon-green/10"
            borderClass="border-lemon-green/30"
          />

          {/* Total Rupees Collected */}
          <MetricCard
            label={t('totalRupeesCollected')}
            value={'₹' + Number(totalRupeesCollected).toFixed(2)}
            icon={<Wallet className="w-5 h-5 text-blue-600" />}
            colorClass="text-blue-600"
            bgClass="bg-blue-50"
            borderClass="border-blue-200"
          />

          {/* Total Credit Due */}
          <MetricCard
            label={t('totalCreditDue')}
            value={'₹' + Number(totalCreditDue).toFixed(2)}
            icon={<IndianRupee className="w-5 h-5 text-orange-600" />}
            colorClass="text-orange-600"
            bgClass="bg-orange-50"
            borderClass="border-orange-200"
          />

          {/* Profit / Loss */}
          <Card className={`shadow-sm ${isProfit ? 'bg-lemon-green/15 border-lemon-green/40' : 'bg-red-50 border-red-200'}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isProfit ? 'bg-lemon-green/20 border border-lemon-green/40' : 'bg-red-100 border border-red-200'}`}>
                  {isProfit ? (
                    <TrendingUp className="w-5 h-5 text-lemon-green-dark" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-lemon-dark/60 font-medium">
                    {isProfit ? t('totalProfit') : t('totalLoss')}
                  </p>
                  <p className={`text-xl font-extrabold leading-tight ${isProfit ? 'text-lemon-green-dark' : 'text-red-600'}`}>
                    {isProfit ? '+' : '-'}₹{Math.abs(Number(totalProfitOrLoss)).toFixed(2)}
                  </p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${isProfit ? 'bg-lemon-green/20 text-lemon-green-dark' : 'bg-red-100 text-red-600'}`}>
                  {isProfit ? t('profit') : t('loss')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Summary Note */}
          <div className="mt-4 p-3 bg-muted/40 rounded-xl border border-border text-xs text-muted-foreground text-center">
            {t('summaryNote')}
          </div>
        </div>
      )}
    </div>
  );
}
