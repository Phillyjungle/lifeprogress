import React from 'react';
import { X } from 'lucide-react';

interface RatingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RatingGuideModal({ isOpen, onClose }: RatingGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold">Rating Guide</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">How to Rate Your Progress</h3>
            <p className="mb-4 text-gray-700">
              Rate your progress in each life domain on a scale from 0-10. Consider both your effort and results when rating.
            </p>
            
            <div className="grid gap-4">
              <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-l-4 border-green-500">
                <div className="font-medium text-green-800 mb-2">10 - Exceptional</div>
                <p className="text-gray-700">Breakthrough achievements, transformative results, consistent excellence</p>
                <p className="text-sm text-gray-600 mt-2 italic">Example: Ran a marathon, received a major promotion, mastered a new skill</p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-l-4 border-blue-500">
                <div className="font-medium text-blue-800 mb-2">7-9 - Very Good</div>
                <p className="text-gray-700">Significant progress, exceeding expectations, consistent effort</p>
                <p className="text-sm text-gray-600 mt-2 italic">Example: Regular exercise 4-5 times weekly, meaningful social connections, learning new skills</p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border-l-4 border-yellow-500">
                <div className="font-medium text-yellow-800 mb-2">4-6 - Average</div>
                <p className="text-gray-700">Meeting basic expectations, moderate effort, some progress</p>
                <p className="text-sm text-gray-600 mt-2 italic">Example: Occasional exercise, maintaining relationships, keeping up with work demands</p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border-l-4 border-orange-500">
                <div className="font-medium text-orange-800 mb-2">1-3 - Needs Improvement</div>
                <p className="text-gray-700">Below expectations, minimal effort, little progress</p>
                <p className="text-sm text-gray-600 mt-2 italic">Example: Skipping workouts, neglecting relationships, falling behind on goals</p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border-l-4 border-red-500">
                <div className="font-medium text-red-800 mb-2">0 - No Progress</div>
                <p className="text-gray-700">No effort made, regression, or complete neglect</p>
                <p className="text-sm text-gray-600 mt-2 italic">Example: Abandoned goals entirely, harmful behaviors, significant setbacks</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Domain-Specific Guidelines</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Physical Health</h4>
                <p className="text-gray-700 mb-2">Consider: Exercise, nutrition, sleep, energy levels, physical wellness</p>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>10: Optimal fitness, nutrition, and wellness routines</li>
                  <li>7-9: Regular exercise, healthy eating, good sleep habits</li>
                  <li>4-6: Occasional exercise, mixed diet, adequate sleep</li>
                  <li>1-3: Rare exercise, poor diet, insufficient sleep</li>
                  <li>0: No physical activity, unhealthy habits</li>
                </ul>
              </div>
              
              {/* Add similar sections for other domains */}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Tips for Accurate Rating</h3>
            <ul className="space-y-3">
              <li className="flex gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>Be honest with yourself - accurate ratings lead to meaningful insights</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>Consider both your effort and results</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>Compare to your own potential, not to others</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>Rate based on the current period, not past achievements</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>Use the full range of the scale (0-10)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RatingGuideModal; 