import { TrendingUp, Zap } from "lucide-react";
import { Quote } from "./QuotesSection";

export const MOCK_QUOTES: Quote[] = [
  {
    name: "Titan",
    price: "1.00",
    badge: "Best Price",
    icon: <Zap className="w-4 h-4 text-primary" />,
  },
  {
    name: "OKX",
    price: "1.00",
    icon: (
      <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
        <div className="bg-white rounded-sm"></div>
        <div className="bg-white rounded-sm"></div>
        <div className="bg-white rounded-sm"></div>
        <div className="bg-white rounded-sm"></div>
      </div>
    ),
  },
  {
    name: "Métis Binary",
    price: "1.00",
    icon: <TrendingUp className="w-4 h-4 text-primary" />,
  },
];

export const DEFAULT_ROUTE_INFO = {
  hopCount: 2,
  protocols: "Phoenix, Whirlpool",
};
