import React from "react";

interface MetricCardProps {
  readonly title: string;
  readonly value: string | number;
  readonly subtitle?: string;
  readonly trend?: {
    value: string;
    isPositive: boolean;
  };
  readonly icon?: React.ReactNode;
  readonly bgColor?: string;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  bgColor = "bg-white",
}: MetricCardProps) {
  return (
    <div
      className={`${bgColor} rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {icon && (
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            {icon}
          </div>
        )}
      </div>
      <div className="flex flex-col">
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        {subtitle && (
          <p className="text-sm text-gray-500 mb-2">{subtitle}</p>
        )}
        {trend && (
          <div className="flex items-center">
            <svg
              className={`w-4 h-4 mr-1 ${
                trend.isPositive ? "text-green-500" : "text-red-500"
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              {trend.isPositive ? (
                <path
                  fillRule="evenodd"
                  d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              )}
            </svg>
            <span
              className={`text-sm font-medium ${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.value}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
