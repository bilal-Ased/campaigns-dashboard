import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color = 'purple', trend = null }) => {
  const colorClasses = {
    purple: 'text-purple-400',
    green: 'text-green-400',
    red: 'text-red-400',
    yellow: 'text-yellow-400',
    blue: 'text-blue-400'
  };

  return (
    <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-purple-200 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {trend && (
            <p className={`text-sm mt-1 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </p>
          )}
        </div>
        <Icon className={`h-10 w-10 ${colorClasses[color]}`} />
      </div>
    </div>
  );
};

export default StatsCard;