import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";

import { orderStatus, type StatusTone } from "@/lib/customer-account/format";

const TONE_CLASSES: Record<StatusTone, string> = {
  positive:
    "border-transparent bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  progress:
    "border-transparent bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  neutral: "border-transparent bg-secondary text-secondary-foreground",
  negative:
    "border-transparent bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200",
};

export function OrderStatusBadge({
  order,
}: Readonly<{
  order: { cancelledAt: string | null; fulfillmentStatus: string };
}>) {
  const { label, tone } = orderStatus(order);
  return <Badge className={cn(TONE_CLASSES[tone])}>{label}</Badge>;
}
