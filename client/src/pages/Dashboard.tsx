import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CountdownTimer } from '@/components/CountdownTimer';
import { MicroMotivation } from '@/components/MicroMotivation';
import { SrsQueue } from '@/components/SrsQueue';
import { QuickAddStudy } from '@/components/QuickAddStudy';
import { useSrsStore } from '@/store/useSrsStore';
import { useSyllabusStore } from '@/store/useSyllabusStore';
import { Flame, CheckCircle, Brain, Clock } from 'lucide-react';

export default function Dashboard() {
  const { loadData, reviewTasks, getTodaysReviews, getOverdueReviews } = useSrsStore();
  const { loadSyllabus, syllabus } = useSyllabusStore();

  useEffect(() => {
    loadData();
    loadSyllabus();
  }, [loadData, loadSyllabus]);

  const todaysReviews = getTodaysReviews();
  const overdueReviews = getOverdueReviews();
  const completedToday = todaysReviews.filter(task => task.doneAt).length;
  const totalReviews = reviewTasks.length;

  // Calculate actual streak from study sessions - starts at 0
  const streak = 0;

  const stats = [
    {
      title: 'Study Streak',
      value: `${streak} days`,
      icon: Flame,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'Today Completed',
      value: `${completedToday}/${todaysReviews.length}`,
      icon: CheckCircle,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Total Reviews',
      value: totalReviews.toLocaleString(),
      icon: Brain,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
      title: 'Overdue',
      value: overdueReviews.length,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-900/20'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header with Countdown and Motivation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CountdownTimer />
        <MicroMotivation />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-4">
              <div className="flex items-center">
                <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-xl font-semibold" data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SrsQueue />
        <QuickAddStudy />
      </div>

      {/* Test Button for Development */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Testing (Dev Only)</h3>
          <Button
            onClick={async () => {
              // Create test study sessions first
              const { syllabus } = useSyllabusStore.getState();
              if (syllabus.length === 0) {
                console.log('No syllabus data available');
                return;
              }

              const { addStudySession } = useSrsStore.getState();
              
              // Add a few test study sessions
              for (let i = 0; i < 3 && i < syllabus[0].chapters[0].topics.length; i++) {
                const topic = syllabus[0].chapters[0].topics[i];
                await addStudySession({
                  id: topic.id,
                  subject: syllabus[0].subject,
                  chapterId: syllabus[0].chapters[0].id,
                  topicId: topic.id
                }, `Test notes for ${topic.name}`);
              }
              
              console.log('Added test study sessions with review tasks');
            }}
            variant="outline"
            size="sm"
          >
            Add Test Study Sessions & Reviews
          </Button>
        </CardContent>
      </Card>

      {/* Upcoming Reviews Preview */}
      <Card>
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold">Upcoming Reviews</h3>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-4">
            {Array.from({ length: 7 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() + i + 1);
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNumber = date.getDate();

              // Get actual reviews for this date
              const reviewsForDay = reviewTasks.filter(task => {
                if (task.doneAt) return false;
                const taskDate = new Date(task.dueAt);
                return taskDate.toDateString() === date.toDateString();
              });

              // Group reviews by subject and difficulty
              const subjectGroups = reviewsForDay.reduce((groups, task) => {
                // Find topic info from syllabus
                let topicInfo = null;
                for (const subject of syllabus) {
                  for (const chapter of subject.chapters) {
                    for (const topic of chapter.topics) {
                      if (topic.id === task.sessionId) {
                        topicInfo = { subject: subject.subject, difficulty: topic.difficulty };
                        break;
                      }
                    }
                    if (topicInfo) break;
                  }
                  if (topicInfo) break;
                }

                if (topicInfo) {
                  const key = `${topicInfo.subject}-${topicInfo.difficulty}`;
                  groups[key] = (groups[key] || 0) + 1;
                }
                return groups;
              }, {} as Record<string, number>);

              const getSubjectColor = (subject: string) => {
                switch (subject) {
                  case 'Physics': return 'bg-blue-500';
                  case 'Chemistry': return 'bg-green-500';
                  case 'Biology': return 'bg-purple-500';
                  default: return 'bg-gray-500';
                }
              };

              const getDifficultySize = (difficulty: string, count: number) => {
                const baseSize = difficulty === 'Hard' ? 3 : difficulty === 'Medium' ? 2.5 : 2;
                const sizeMultiplier = Math.min(1 + (count - 1) * 0.2, 2);
                return baseSize * sizeMultiplier;
              };

              return (
                <div key={i} className="text-center" data-testid={`upcoming-day-${i}`}>
                  <div className="text-xs text-muted-foreground mb-2">{dayName}</div>
                  <div className="text-sm font-medium mb-2">{dayNumber}</div>
                  <div className="space-y-1 min-h-[60px] flex flex-col items-center justify-center">
                    {Object.entries(subjectGroups).length > 0 ? (
                      <>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {Object.entries(subjectGroups).map(([key, count]) => {
                            const [subject, difficulty] = key.split('-');
                            const size = getDifficultySize(difficulty, count);
                            return (
                              <div
                                key={key}
                                className={`${getSubjectColor(subject)} rounded-full opacity-80`}
                                style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
                                title={`${subject} (${difficulty}): ${count} reviews`}
                              />
                            );
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {reviewsForDay.length} due
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-muted-foreground">0 due</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-center space-x-4 text-xs">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
              <span className="text-muted-foreground">Physics</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              <span className="text-muted-foreground">Chemistry</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-1"></div>
              <span className="text-muted-foreground">Biology</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Larger dots = harder topics or more reviews
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}