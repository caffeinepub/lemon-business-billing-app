import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Citrus, IndianRupee, Users } from "lucide-react";
import React, { memo } from "react";
import type { LemonSummary } from "../backend";

interface SummaryBannerProps {
  customerCount: number;
  summary: LemonSummary;
}

function SummaryBanner({ customerCount, summary }: SummaryBannerProps) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-3 gap-3 mb-5">
      {/* Total Customers */}
      <Card className="bg-lemon-yellow border-lemon-yellow-dark/30 shadow-sm">
        <CardContent className="p-3 text-center">
          <div className="flex items-center justify-center gap-0.5 mb-1">
            <Users className="w-3 h-3 text-lemon-dark/60" />
            <p className="text-xs text-lemon-dark/60 font-medium">
              {t("customersLabel")}
            </p>
          </div>
          <p className="text-2xl font-extrabold text-lemon-dark">
            {customerCount}
          </p>
        </CardContent>
      </Card>

      {/* Total Lemons Sold */}
      <Card className="bg-lemon-green/20 border-lemon-green/40 shadow-sm">
        <CardContent className="p-3 text-center">
          <div className="flex items-center justify-center gap-0.5 mb-1">
            <Citrus className="w-3 h-3 text-lemon-green-dark" />
            <p className="text-xs text-lemon-dark/60 font-medium">
              {t("lemonsLabel")}
            </p>
          </div>
          <p className="text-lg font-extrabold text-lemon-green-dark">
            {Number(summary.totalLemonsSold).toLocaleString("en-IN")}
          </p>
        </CardContent>
      </Card>

      {/* Total Credit Due */}
      <Card className="bg-orange-50 border-orange-200 shadow-sm">
        <CardContent className="p-3 text-center">
          <div className="flex items-center justify-center gap-0.5 mb-1">
            <IndianRupee className="w-3 h-3 text-orange-600" />
            <p className="text-xs text-lemon-dark/60 font-medium">
              {t("creditDueLabel")}
            </p>
          </div>
          <p className="text-lg font-extrabold text-orange-600">
            ₹{Number(summary.totalCreditDue).toFixed(2)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default memo(SummaryBanner);
