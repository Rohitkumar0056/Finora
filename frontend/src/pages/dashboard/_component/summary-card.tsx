import { FC } from "react";
import CountUp from "react-countup";
import { TrendingDownIcon, TrendingUpIcon, LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format-currency";
import { formatPercentage } from "@/lib/format-percentage";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { DateRangeEnum, DateRangeType } from "@/components/date-range-select";

type CardType = "balance" | "income" | "expenses" | "savings";
type CardStatus = {
  label: string;
  color: string;
  Icon: LucideIcon;
  description?: string;
};
interface SummaryCardProps {
  title: string;
  value?: number;
  dateRange?: DateRangeType;
  percentageChange?: number;
  isPercentageValue?: boolean;
  isLoading?: boolean;
  expenseRatio?: number;
  cardType: CardType;
}

const getCardStatus = (
  value: number,
  cardType: CardType,
  expenseRatio?: number,
  percentageChange?: number
): CardStatus => {
  if (cardType === "savings") {
    if (value === 0) {
      return {
        label: "No Savings Record",
        color: "text-gray-400",
        Icon: TrendingDownIcon,
      };
    }

    if (value < 10) {
      return {
        label: "Low Savings",
        color: "text-red-400",
        Icon: TrendingDownIcon,
        description: `Only ${value.toFixed(1)}% saved`,
      };
    }

    if (value < 20) {
      return {
        label: "Moderate",
        color: "text-yellow-400",
        Icon: TrendingDownIcon,
        description: `${expenseRatio?.toFixed(0)}% spent`,
      };
    }

    if (expenseRatio && expenseRatio > 75) {
      return {
        label: "High Spend",
        color: "text-red-400",
        Icon: TrendingDownIcon,
        description: `${expenseRatio.toFixed(0)}% spent`,
      };
    }

    if (expenseRatio && expenseRatio > 60) {
      return {
        label: "Warning: High Spend",
        color: "text-orange-400",
        Icon: TrendingDownIcon,
        description: `${expenseRatio.toFixed(0)}% spent`,
      };
    }

    return {
      label: "Good Savings",
      color: "text-green-400",
      Icon: TrendingUpIcon,
    };
  }

  // Handle balance card
  if (cardType === "balance") {
    if (value === 0) {
      return {
        label: "No Balance",
        color: "text-gray-400",
        Icon: TrendingDownIcon,
      };
    }

    if (value < 0) {
      return {
        label: "Overdrawn",
        color: "text-red-400",
        Icon: TrendingDownIcon,
        description: "Balance is negative",
      };
    }

    // Check percentage change for positive balance
    if (percentageChange !== undefined && percentageChange !== null) {
      if (percentageChange > 5) {
        return {
          label: "Growth",
          color: "text-green-400",
          Icon: TrendingUpIcon,
        };
      }
      if (percentageChange > 0) {
        return {
          label: "Growing",
          color: "text-green-400",
          Icon: TrendingUpIcon,
        };
      }
      if (percentageChange < -5) {
        return {
          label: "Declining",
          color: "text-red-400",
          Icon: TrendingDownIcon,
        };
      }
      if (percentageChange < 0) {
        return {
          label: "Decreased",
          color: "text-orange-400",
          Icon: TrendingDownIcon,
        };
      }
      // percentageChange === 0
      return {
        label: "Stable",
        color: "text-gray-400",
        Icon: TrendingDownIcon,
      };
    }
  }

  // Handle income card
  if (cardType === "income") {
    if (value === 0) {
      return {
        label: "No Income",
        color: "text-gray-400",
        Icon: TrendingDownIcon,
      };
    }

    if (percentageChange !== undefined && percentageChange !== null) {
      if (percentageChange > 10) {
        return {
          label: "Growth",
          color: "text-green-400",
          Icon: TrendingUpIcon,
        };
      }
      if (percentageChange > 0) {
        return {
          label: "Increasing",
          color: "text-green-400",
          Icon: TrendingUpIcon,
        };
      }
      if (percentageChange < 0) {
        return {
          label: "Decreased",
          color: "text-orange-400",
          Icon: TrendingDownIcon,
        };
      }
      // percentageChange === 0
      return {
        label: "Stable",
        color: "text-gray-400",
        Icon: TrendingDownIcon,
      };
    }
  }

  // Handle expenses card
  if (cardType === "expenses") {
    if (value === 0) {
      return {
        label: "Expenses",
        color: "text-gray-400",
        Icon: TrendingDownIcon,
      };
    }

    if (percentageChange !== undefined && percentageChange !== null) {
      if (percentageChange < -5) {
        return {
          label: "Reduction",
          color: "text-green-400",
          Icon: TrendingDownIcon,
        };
      }
      if (percentageChange < 0) {
        return {
          label: "Decreased",
          color: "text-green-400",
          Icon: TrendingDownIcon,
        };
      }
      if (percentageChange > 10) {
        return {
          label: "Increase",
          color: "text-red-400",
          Icon: TrendingUpIcon,
        };
      }
      if (percentageChange > 0) {
        return {
          label: "Increased",
          color: "text-orange-400",
          Icon: TrendingUpIcon,
        };
      }
      // percentageChange === 0
      return {
        label: "Stable",
        color: "text-gray-400",
        Icon: TrendingDownIcon,
      };
    }
  }

  return {
    label: "",
    color: "",
    Icon: TrendingDownIcon,
  };
};

const getTrendDirection = (value: number, cardType: CardType) => {
  if (cardType === "expenses") {
    return value <= 0 ? "positive" : "negative";
  }
  return value >= 0 ? "positive" : "negative";
};

const SummaryCard: FC<SummaryCardProps> = ({
  title,
  value = 0,
  dateRange,
  percentageChange,
  isPercentageValue,
  isLoading,
  expenseRatio,
  cardType = "balance",
}) => {
  const status = getCardStatus(value, cardType, expenseRatio, percentageChange);
  const showTrend =
    percentageChange !== undefined &&
    percentageChange !== null &&
    cardType !== "savings";

  const trendDirection =
    showTrend && percentageChange !== 0
      ? getTrendDirection(percentageChange, cardType)
      : null;

  if (isLoading) {
    return (
      <Card className="!border-none !border-0 !gap-0 !bg-white/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 !pb-5">
          <Skeleton className="h-4 w-24 bg-white/30" />
        </CardHeader>
        <CardContent className="space-y-8">
          <Skeleton className="h-10.5 w-full bg-white/30" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-12 bg-white/30" />
            <Skeleton className="h-3 w-16 bg-white/30" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCountupValue = (val: number) => {
    return isPercentageValue
      ? formatPercentage(val, { decimalPlaces: 1 })
      : formatCurrency(val, {
          isExpense: cardType === "expenses",
          showSign: cardType === "balance" && val < 0,
        });
  };

  return (
    <Card className="!border-none !border-0 !gap-0 !bg-white/5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 !pb-5">
        <CardTitle className="text-[15px] text-gray-300 font-medium">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div
          className={cn(
            "text-4xl font-bold",
            cardType === "balance" && value < 0 ? "text-red-400" : "text-white"
          )}
        >
          <CountUp
            start={0}
            end={value}
            preserveValue
            decimals={2}
            decimalPlaces={2}
            formattingFn={formatCountupValue}
          />
        </div>

        <div className="text-sm text-muted-foreground mt-2">
          {cardType === "savings" ? (
            <div className="flex items-center gap-1.5">
              <status.Icon className={cn("size-3.5", status.color)} />
              <span className={status.color}>
                {status.label} {value !== 0 && `(${formatPercentage(value)})`}
              </span>
              {status.description && (
                <span className="text-gray-400 ml-1">
                  • {status.description}
                </span>
              )}
            </div>
          ) : dateRange?.value === DateRangeEnum.ALL_TIME ? (
            <span className="text-gray-400">Showing {dateRange?.label}</span>
          ) : status.label ? (
            <div className="flex items-center gap-1.5">
              <status.Icon className={cn("size-3.5", status.color)} />
              <span className={status.color}>{status.label}</span>
              <span className="text-gray-400">• {dateRange?.label}</span>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;