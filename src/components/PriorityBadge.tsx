
import React from "react";
import { cn } from "@/lib/utils";

export type PriorityType = "normal" | "high" | "urgent";

interface PriorityBadgeProps {
  priority: PriorityType;
  className?: string;
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className }) => {
  const getPriorityStyles = () => {
    switch (priority) {
      case "normal":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "high":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "urgent":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getPriorityLabel = () => {
    switch (priority) {
      case "normal":
        return "Normal";
      case "high":
        return "High";
      case "urgent":
        return "Urgent";
      default:
        return "Unknown";
    }
  };

  return (
    <span
      className={cn(
        "px-3 py-1 text-xs font-medium rounded-full border",
        getPriorityStyles(),
        className
      )}
    >
      {getPriorityLabel()}
    </span>
  );
};

export default PriorityBadge;
