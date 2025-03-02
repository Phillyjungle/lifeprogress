import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const RatingGuide = ({ initialTab = "physical_health", onClose }: { initialTab?: string, onClose?: () => void }) => {
  const ratingLevels = {
    health: [
      {
        range: "0-2",
        description: "Struggling significantly with health. Little to no exercise, poor diet, irregular sleep.",
        indicators: [
          "No regular exercise routine",
          "Unhealthy eating habits",
          "Poor sleep patterns",
          "Frequent illness",
          "Low energy levels"
        ]
      },
      {
        range: "3-4",
        description: "Below average health. Occasional exercise, inconsistent diet and sleep patterns.",
        indicators: [
          "Exercise 1-2 times per month",
          "Irregular meal times",
          "Inconsistent sleep schedule",
          "Some energy fluctuations",
          "Occasional health issues"
        ]
      },
      {
        range: "5-6",
        description: "Average health. Regular but moderate exercise, generally healthy diet, adequate sleep.",
        indicators: [
          "Exercise 1-2 times per week",
          "Balanced meals most days",
          "6-7 hours sleep regularly",
          "Stable energy levels",
          "Generally good health"
        ]
      },
      {
        range: "7-8",
        description: "Above average health. Consistent exercise routine, healthy diet, good sleep habits.",
        indicators: [
          "Exercise 3-4 times per week",
          "Consistently healthy diet",
          "7-8 hours quality sleep",
          "High energy levels",
          "Rarely ill"
        ]
      },
      {
        range: "9-10",
        description: "Excellent health. Regular intense exercise, optimal diet, excellent sleep quality.",
        indicators: [
          "Exercise 5+ times per week",
          "Optimal nutrition",
          "8+ hours quality sleep",
          "Peak energy levels",
          "Robust immune system"
        ]
      }
    ],
    mental: [
      {
        range: "0-2",
        description: "Significant mental health challenges. Frequent anxiety/depression, difficulty coping.",
        indicators: [
          "Overwhelming stress",
          "Constant worry/anxiety",
          "Difficulty concentrating",
          "Unable to relax",
          "Emotional instability"
        ]
      },
      {
        range: "3-4",
        description: "Below average mental health. Regular stress, some anxiety/mood issues.",
        indicators: [
          "Regular stress",
          "Occasional anxiety",
          "Mood fluctuations",
          "Some negative thoughts",
          "Irregular coping strategies"
        ]
      },
      {
        range: "5-6",
        description: "Average mental wellbeing. Manageable stress, generally stable mood.",
        indicators: [
          "Moderate stress levels",
          "Generally stable mood",
          "Basic coping strategies",
          "Some self-awareness",
          "Occasional relaxation practice"
        ]
      },
      {
        range: "7-8",
        description: "Above average mental health. Good stress management, positive outlook.",
        indicators: [
          "Effective stress management",
          "Regular meditation/mindfulness",
          "Positive thinking patterns",
          "Good emotional regulation",
          "Strong coping mechanisms"
        ]
      },
      {
        range: "9-10",
        description: "Excellent mental health. High resilience, strong emotional intelligence.",
        indicators: [
          "Minimal stress impact",
          "Daily mindfulness practice",
          "Excellent emotional control",
          "Strong mental resilience",
          "Optimal psychological wellbeing"
        ]
      }
    ],
    social: [
      {
        range: "0-2",
        description: "Very limited social interaction. Isolation, few or no close relationships.",
        indicators: [
          "Minimal social contact",
          "No close friendships",
          "Avoids social situations",
          "Communication difficulties",
          "Social anxiety"
        ]
      },
      {
        range: "3-4",
        description: "Below average social life. Limited friend circle, infrequent social activities.",
        indicators: [
          "Few close friends",
          "Monthly social activities",
          "Limited communication",
          "Some social discomfort",
          "Basic social network"
        ]
      },
      {
        range: "5-6",
        description: "Average social life. Regular friend contact, occasional social activities.",
        indicators: [
          "Regular friend contact",
          "Weekly social activities",
          "Comfortable in groups",
          "Basic networking",
          "Some close relationships"
        ]
      },
      {
        range: "7-8",
        description: "Active social life. Strong friendships, regular social engagement.",
        indicators: [
          "Multiple close friendships",
          "Regular social events",
          "Strong communication skills",
          "Active networking",
          "Healthy relationships"
        ]
      },
      {
        range: "9-10",
        description: "Excellent social life. Deep relationships, leadership in social groups.",
        indicators: [
          "Strong support network",
          "Frequent social leadership",
          "Deep meaningful relationships",
          "Excellent communication",
          "Thriving social calendar"
        ]
      }
    ],
    career: [
      {
        range: "0-2",
        description: "Significant career challenges. Unemployment or job dissatisfaction.",
        indicators: [
          "No clear career direction",
          "Job dissatisfaction",
          "Limited skills",
          "No professional growth",
          "Poor work relationships"
        ]
      },
      {
        range: "3-4",
        description: "Below average career progress. Limited growth, some job stability.",
        indicators: [
          "Basic job stability",
          "Minimal skill development",
          "Limited advancement",
          "Some work stress",
          "Basic professional network"
        ]
      },
      {
        range: "5-6",
        description: "Average career development. Stable job, some growth opportunities.",
        indicators: [
          "Steady employment",
          "Regular skill updates",
          "Some career progress",
          "Decent work relationships",
          "Clear career goals"
        ]
      },
      {
        range: "7-8",
        description: "Strong career trajectory. Regular advancement, high job satisfaction.",
        indicators: [
          "Regular promotions",
          "Active skill development",
          "Leadership opportunities",
          "Strong professional network",
          "Clear career path"
        ]
      },
      {
        range: "9-10",
        description: "Exceptional career success. Leadership role, continuous growth.",
        indicators: [
          "Industry leadership",
          "Continuous advancement",
          "Expert skill level",
          "Mentoring others",
          "High achievement"
        ]
      }
    ],
    growth: [
      {
        range: "0-2",
        description: "Limited personal development. No clear goals or self-improvement efforts.",
        indicators: [
          "No personal goals",
          "Limited self-awareness",
          "No learning activities",
          "Resistance to change",
          "Stagnant habits"
        ]
      },
      {
        range: "3-4",
        description: "Basic personal growth. Some goals, irregular development efforts.",
        indicators: [
          "Basic goal setting",
          "Occasional learning",
          "Some self-reflection",
          "Irregular habits",
          "Basic self-awareness"
        ]
      },
      {
        range: "5-6",
        description: "Steady personal development. Regular learning, clear goals.",
        indicators: [
          "Regular goal review",
          "Weekly learning",
          "Good self-awareness",
          "Healthy habits",
          "Open to feedback"
        ]
      },
      {
        range: "7-8",
        description: "Active personal growth. Continuous learning, challenging goals.",
        indicators: [
          "Ambitious goals",
          "Daily learning habits",
          "High self-awareness",
          "Strong personal vision",
          "Regular challenges"
        ]
      },
      {
        range: "9-10",
        description: "Exceptional personal development. Mastery pursuit, inspiring others.",
        indicators: [
          "Mastery mindset",
          "Teaching others",
          "Deep self-knowledge",
          "Transformative goals",
          "Continuous innovation"
        ]
      }
    ]
  };

  // Define color classes for different rating levels
  const getRatingColorClasses = (range: string) => {
    switch (range) {
      case "9-10":
        return "bg-green-50 border-green-200";
      case "7-8":
        return "bg-blue-50 border-blue-200";
      case "5-6":
        return "bg-yellow-50 border-yellow-200";
      case "3-4":
        return "bg-orange-50 border-orange-200";
      case "0-2":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  // Define text color classes for different rating levels
  const getRatingTextClasses = (range: string) => {
    switch (range) {
      case "9-10":
        return "text-green-800";
      case "7-8":
        return "text-blue-800";
      case "5-6":
        return "text-yellow-800";
      case "3-4":
        return "text-orange-800";
      case "0-2":
        return "text-red-800";
      default:
        return "text-gray-800";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Life Areas Rating Guide</CardTitle>
            {onClose && (
              <button 
                onClick={onClose}
                className="text-slate-500 hover:text-slate-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        </CardHeader>
      </Card>
      
      <Tabs defaultValue={initialTab}>
        <TabsList className="w-full">
          <TabsTrigger value="health">Physical Health</TabsTrigger>
          <TabsTrigger value="mental">Mental Wellbeing</TabsTrigger>
          <TabsTrigger value="social">Social Life</TabsTrigger>
          <TabsTrigger value="career">Career Growth</TabsTrigger>
          <TabsTrigger value="growth">Personal Growth</TabsTrigger>
        </TabsList>
        
        {Object.entries(ratingLevels).map(([area, levels]) => (
          <TabsContent key={area} value={area}>
            <div className="space-y-4">
              {levels.map((level, index) => (
                <Card 
                  key={index} 
                  className={`border ${getRatingColorClasses(level.range)}`}
                >
                  <CardHeader className={`border-b ${getRatingColorClasses(level.range)}`}>
                    <CardTitle className={`text-lg font-bold ${getRatingTextClasses(level.range)}`}>
                      {level.range} - {level.range === "9-10" ? "Exceptional" : 
                                      level.range === "7-8" ? "Very Good" : 
                                      level.range === "5-6" ? "Average" : 
                                      level.range === "3-4" ? "Below Average" : 
                                      "Struggling"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="mb-4 font-medium text-gray-800">{level.description}</p>
                    <div className="space-y-2">
                      {level.indicators.map((indicator, i) => (
                        <div key={i} className="flex items-center">
                          <span className={`w-2 h-2 rounded-full mr-2 ${
                            level.range === "9-10" ? "bg-green-500" : 
                            level.range === "7-8" ? "bg-blue-500" : 
                            level.range === "5-6" ? "bg-yellow-500" : 
                            level.range === "3-4" ? "bg-orange-500" : 
                            "bg-red-500"
                          }`}></span>
                          <span className="text-gray-800">{indicator}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default RatingGuide; 