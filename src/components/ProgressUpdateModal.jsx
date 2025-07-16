// components/ProgressUpdateModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  X, 
  TrendingUp, 
  Clock, 
  Target, 
  AlertCircle, 
  CheckCircle, 
  Save,
  History,
  Calendar,
  BarChart3
} from 'lucide-react';
import { progressAPI } from '../services/progressAPI';

const ProgressUpdateModal = ({ 
  project, 
  isOpen, 
  onClose, 
  onProgressUpdated 
}) => {
  const [progress, setProgress] = useState(project?.progress_percentage || 0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [progressDetails, setProgressDetails] = useState(null);
  const [progressHistory, setProgressHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && project) {
      loadProgressDetails();
      loadProgressHistory();
      setProgress(project.progress_percentage || 0);
    }
  }, [isOpen, project]);

  const loadProgressDetails = async () => {
    try {
      const details = await progressAPI.getProgress(project.id);
      setProgressDetails(details);
    } catch (error) {
      console.error('Failed to load progress details:', error);
    }
  };

  const loadProgressHistory = async () => {
    try {
      const history = await progressAPI.getProgressHistory(project.id);
      setProgressHistory(history.updates || []);
    } catch (error) {
      console.error('Failed to load progress history:', error);
    }
  };

  const handleUpdateProgress = async () => {
    if (progress < 0 || progress > 100) {
      setError('Progress must be between 0 and 100');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await progressAPI.updateProgress(project.id, {
        progress_percentage: progress,
        notes: notes
      });

      if (result.success) {
        onProgressUpdated(result.project);
        onClose();
      } else {
        setError(result.message || 'Failed to update progress');
      }
    } catch (error) {
      setError('Failed to update progress. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getProgressStatusColor = (variance) => {
    if (variance < -10) return 'text-red-600 bg-red-100';
    if (variance < -5) return 'text-orange-600 bg-orange-100';
    if (variance > 10) return 'text-green-600 bg-green-100';
    if (variance > 5) return 'text-blue-600 bg-blue-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getProgressStatusText = (variance) => {
    if (variance < -10) return 'Significantly Behind';
    if (variance < -5) return 'Behind Schedule';
    if (variance > 10) return 'Significantly Ahead';
    if (variance > 5) return 'Ahead of Schedule';
    return 'On Track';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Update Progress</h2>
              <p className="text-sm text-gray-600">{project.title}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="View Progress History"
            >
              <History className="h-5 w-5" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Progress Overview */}
          {progressDetails && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Current Progress</span>
                  <Target className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {progressDetails.current_progress}%
                </p>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-blue-600">Timeline Progress</span>
                  <Clock className="h-4 w-4 text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-blue-900">
                  {progressDetails.timeline_progress}%
                </p>
              </div>

              <div className={`rounded-xl p-4 ${getProgressStatusColor(progressDetails.progress_variance)}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Status</span>
                  {progressDetails.progress_variance >= 0 ? 
                    <CheckCircle className="h-4 w-4" /> : 
                    <AlertCircle className="h-4 w-4" />
                  }
                </div>
                <p className="text-sm font-semibold">
                  {getProgressStatusText(progressDetails.progress_variance)}
                </p>
                <p className="text-xs opacity-75">
                  {progressDetails.progress_variance > 0 ? '+' : ''}
                  {progressDetails.progress_variance.toFixed(1)}% variance
                </p>
              </div>
            </div>
          )}

          {/* Progress Update Form */}
          {!showHistory ? (
            <div className="space-y-6">
              {/* Progress Slider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Update Progress Percentage
                </label>
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={(e) => setProgress(Number(e.target.value))}
                      className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${progress}%, #E5E7EB ${progress}%, #E5E7EB 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <div className="bg-blue-100 rounded-full px-6 py-3">
                      <span className="text-2xl font-bold text-blue-900">{progress}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[25, 50, 75, 100].map((value) => (
                      <button
                        key={value}
                        onClick={() => setProgress(value)}
                        className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        {value}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Progress Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Progress Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this progress update..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Timeline Information */}
              {progressDetails && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Timeline Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Days Remaining:</span>
                      <span className="ml-2 font-medium">{progressDetails.days_remaining} days</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Estimated Completion:</span>
                      <span className="ml-2 font-medium">
                        {new Date(progressDetails.estimated_completion).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProgress}
                  disabled={loading}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Progress
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Progress History View */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Progress History</h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Back to Update
                </button>
              </div>

              {progressHistory.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {progressHistory.map((update, index) => (
                    <div 
                      key={update.id} 
                      className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-gray-900">
                              {update.old_progress}% → {update.new_progress}%
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              update.new_progress > update.old_progress 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {update.change}
                            </span>
                          </div>
                          {update.notes && (
                            <p className="text-sm text-gray-600 mb-2">{update.notes}</p>
                          )}
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{update.updated_at}</span>
                            {update.updated_by && (
                              <>
                                <span className="mx-2">•</span>
                                <span>by {update.updated_by}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p>No progress updates yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressUpdateModal;