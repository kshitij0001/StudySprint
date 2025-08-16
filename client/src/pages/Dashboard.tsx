import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CountdownTimer } from '@/components/CountdownTimer';
import { MicroMotivation } from '@/components/MicroMotivation';
import { SrsQueue } from '@/components/SrsQueue';
import { QuickAddStudy } from '@/components/QuickAddStudy';
import { useSrsStore } from '@/store/useSrsStore';
import { useSyllabusStore } from '@/store/useSyllabusStore';
import { Flame, CheckCircle, Brain, Clock } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { loadData, reviewTasks, getTodaysReviews, getOverdueReviews, getUpcomingReviews } = useSrsStore();
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

  const getSubjectCounts = (reviews) => {
    const subjectGroups = reviews.reduce((groups, task) => {
      let topicInfo = null;
      for (const subjectData of syllabus) {
        for (const chapter of subjectData.chapters) {
          for (const topic of chapter.topics) {
            if (topic.id === task.sessionId) {
              topicInfo = { subject: subjectData.subject, difficulty: topic.difficulty };
              break;
            }
          }
          if (topicInfo) break;
        }
        if (topicInfo) break;
      }

      if (topicInfo) {
        const key = `${topicInfo.subject}-${topicInfo.difficulty}`;
        groups[key] = (groups[key] || { subject: topicInfo.subject, count: 0, difficulty: topicInfo.difficulty });
        groups[key].count++;
      }
      return groups;
    }, {} as Record<string, { subject: string, count: number, difficulty: string }>);

    return Object.values(subjectGroups);
  };

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
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Upcoming Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 7 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() + i + 1);
              const dayReviews = getUpcomingReviews(7).filter(task => 
                isSameDay(new Date(task.dueAt), date)
              );

              return (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{format(date, 'EEE, MMM d')}</p>
                    <p className="text-sm text-muted-foreground">
                      {dayReviews.length} review{dayReviews.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    {getSubjectCounts(dayReviews).map(({ subject, count, difficulty }) => (
                      <div
                        key={subject}
                        className={cn(
                          'w-3 h-3 rounded-full',
                          subject === 'Physics' && 'bg-blue-500',
                          subject === 'Chemistry' && 'bg-green-500',
                          subject === 'Biology' && 'bg-purple-500'
                        )}
                        style={{
                          transform: `scale(${Math.min(1 + (count - 1) * 0.3, 2)})`
                        }}
                        title={`${subject}: ${count} review${count !== 1 ? 's' : ''} (${difficulty})`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}