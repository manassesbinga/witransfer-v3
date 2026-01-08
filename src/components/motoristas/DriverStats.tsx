/** @format */

"use client";

import React from "react";
import { Users, UserCheck, UserPlus, TrendingUp, TrendingDown } from "lucide-react";

const DriverStats = () => {
  const stats = [
    {
      label: "Total de Motoristas",
      value: "127",
      change: "+8%",
      trend: "up",
      icon: Users,
      color: "blue",
    },
    {
      label: "Motoristas Online",
      value: "45",
      change: "+15%",
      trend: "up",
      icon: UserCheck,
      color: "green",
    },
    {
      label: "Novos este Mês",
      value: "12",
      change: "+20%",
      trend: "up",
      icon: UserPlus,
      color: "purple",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;

        return (
          <div
            key={index}
            className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">{stat.label}</h3>
              <div
                className={`p-3 rounded-lg ${
                  stat.color === "blue"
                    ? "bg-blue-50"
                    : stat.color === "green"
                      ? "bg-green-50"
                      : "bg-purple-50"
                }`}>
                <Icon
                  size={20}
                  className={
                    stat.color === "blue"
                      ? "text-blue-600"
                      : stat.color === "green"
                        ? "text-green-600"
                        : "text-purple-600"
                  }
                />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendIcon
                    size={14}
                    className={stat.trend === "up" ? "text-green-600" : "text-red-600"}
                  />
                  <span
                    className={`text-xs font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-500">vs mês anterior</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DriverStats;
