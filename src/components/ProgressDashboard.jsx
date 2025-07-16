// 4. Progress Dashboard Summary Component
// components/ProgressDashboard.jsx
import React, { useState, useEffect } from "react";
import { progressAPI } from "../services/progressAPI";

const ProgressDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgressSummary();
  }, []);

  const loadProgressSummary = async () => {
    try {
      const data = await progressAPI.getProgressSummary();
      setSummary(data);
    } catch (error) {
      console.error("Failed to load progress summary:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Progress Overview
      </h3>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {summary.total_projects}
          </div>
          <div className="text-sm text-blue-600">Total Projects</div>
        </div>

        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {summary.on_track}
          </div>
          <div className="text-sm text-green-600">On Track</div>
        </div>

        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {summary.behind_schedule}
          </div>
          <div className="text-sm text-orange-600">Behind Schedule</div>
        </div>

        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {summary.average_progress}%
          </div>
          <div className="text-sm text-purple-600">Avg Progress</div>
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;
