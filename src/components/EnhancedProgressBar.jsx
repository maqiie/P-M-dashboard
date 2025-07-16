// 3. Enhanced Progress Bar Component
// components/EnhancedProgressBar.jsx
import React from "react";
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react";

const EnhancedProgressBar = ({
  project,
  showTimeline = false,
  showVariance = false,
  className = "",
}) => {
  const currentProgress = project.progress_percentage || 0;
  const timelineProgress = project.timeline_progress || 0;
  const variance = project.progress_variance || 0;

  const getVarianceColor = (variance) => {
    if (variance < -10) return "text-red-600";
    if (variance < -5) return "text-orange-600";
    if (variance > 10) return "text-green-600";
    if (variance > 5) return "text-blue-600";
    return "text-gray-600";
  };

  const getVarianceIcon = (variance) => {
    if (variance < -5) return AlertTriangle;
    if (variance > 5) return TrendingUp;
    return CheckCircle;
  };

  const VarianceIcon = getVarianceIcon(variance);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Progress Label */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 font-medium">Progress</span>
        <div className="flex items-center space-x-2">
          <span className="font-bold text-gray-900">{currentProgress}%</span>
          {showVariance && (
            <div className={`flex items-center ${getVarianceColor(variance)}`}>
              <VarianceIcon className="h-3 w-3 mr-1" />
              <span className="text-xs font-medium">
                {variance > 0 ? "+" : ""}
                {variance.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bars Container */}
      <div className="relative">
        {/* Main Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full transition-all duration-700 relative bg-gradient-to-r from-blue-500 to-purple-600"
            style={{ width: `${Math.min(currentProgress, 100)}%` }}
          >
            <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Timeline Progress Overlay (if enabled) */}
        {showTimeline && (
          <div className="absolute top-0 w-full h-3">
            <div
              className="h-1 bg-orange-400 rounded-full mt-1 opacity-70"
              style={{ width: `${Math.min(timelineProgress, 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Timeline Legend */}
      {showTimeline && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded mr-1"></div>
              <span>Actual ({currentProgress}%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-1 bg-orange-400 rounded mr-1"></div>
              <span>Expected ({timelineProgress}%)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedProgressBar;
