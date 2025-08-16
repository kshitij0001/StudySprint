import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CountdownTimer } from '@/components/CountdownTimer';
import { MicroMotivation } from '@/components/MicroMotivation';
import { SrsQueue } from '@/components/SrsQueue';
import { QuickAddStudy } from '@/components/QuickAddStudy';
import { useSrsStore } from '@/store/useSrsStore';
import { useSyllabusStore } from '@/store/useSyllabusStore';
import { Flame, CheckCircle, Brain, Clock, BookOpen, Calendar, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const { loadData, reviewTasks, getTodaysReviews, getOverdueReviews, getUpcomingReviews, studySessions } = useSrsStore();
  const { loadSyllabus, syllabus } = useSyllabusStore();

  useEffect(() => {
    loadData();
    loadSyllabus();
  }, [loadData, loadSyllabus]);

  const overdueReviews = getOverdueReviews();
  const todaysReviews = getTodaysReviews();

  // Calculate total topics from syllabus
  const totalTopics = syllabus.reduce((total, subject) => 
    total + subject.chapters.reduce((chapterTotal, chapter) => 
      chapterTotal + chapter.topics.length, 0), 0);

  // Calculate this week's sessions
  const thisWeekSessions = studySessions.filter(session => {
    const sessionDate = new Date(session.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return sessionDate >= weekAgo;
  });

  const streak = 12; // Mock streak for now - would be calculated from actual study sessions

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
      value: `${todaysReviews.filter(task => task.doneAt).length}/${todaysReviews.length}`,
      icon: CheckCircle,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Total Reviews',
      value: reviewTasks.length.toLocaleString(),
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

      {/* Upcoming Reviews Preview */}
      <Card>
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold">Upcoming Reviews (Next 7 Days)</h3>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-4">
            {Array.from({ length: 7 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() + i + 1);
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNumber = date.getDate();

              // Mock data for upcoming reviews
              const mockCount = Math.floor(Math.random() * 10);

              return (
                <div key={i} className="text-center" data-testid={`upcoming-day-${i}`}>
                  <div className="text-xs text-muted-foreground mb-2">{dayName}</div>
                  <div className="text-sm font-medium mb-2">{dayNumber}</div>
                  <div className="space-y-1">
                    {mockCount > 0 && (
                      <>
                        <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto"></div>
                        <div className="text-xs text-muted-foreground">{mockCount} due</div>
                      </>
                    )}
                    {mockCount === 0 && (
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}