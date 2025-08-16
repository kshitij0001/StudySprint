import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { useSrsStore } from '@/store/useSrsStore';
import { useSyllabusStore } from '@/store/useSyllabusStore';
import { getDaysOverdue, isOverdue } from '@/lib/srs';
import { SUBJECT_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Subject, ReviewTask } from '@/types';

export function SrsQueue() {
  const { reviewTasks, markReviewComplete, snoozeReview, getTodaysReviews } = useSrsStore();
  const { syllabus } = useSyllabusStore();
  const [filterSubject, setFilterSubject] = useState<Subject | 'all'>('all');

  const todaysReviews = getTodaysReviews();
  const filteredReviews = filterSubject === 'all' 
    ? todaysReviews 
    : todaysReviews.filter(task => {
        // Find the topic from syllabus to get subject
        for (const subject of syllabus) {
          for (const chapter of subject.chapters) {
            for (const topic of chapter.topics) {
              if (topic.id === task.sessionId) {
                return subject.subject === filterSubject;
              }
            }
          }
        }
        return false;
      });

  const getTopicInfo = (sessionId: string) => {
    for (const subject of syllabus) {
      for (const chapter of subject.chapters) {
        for (const topic of chapter.topics) {
          if (topic.id === sessionId) {
            return {
              subject: subject.subject,
              chapter: chapter.name,
              topic: topic.name,
              difficulty: topic.difficulty
            };
          }
        }
      }
    }
    return null;
  };

  const handleMarkComplete = async (taskId: string) => {
    await markReviewComplete(taskId);
  };

  const handleSnooze = async (taskId: string) => {
    await snoozeReview(taskId, 1); // Default 1 day snooze
  };

  const filterButtons = [
    { key: 'all' as const, label: 'All' },
    { key: 'Physics' as const, label: 'Physics' },
    { key: 'Chemistry' as const, label: 'Chemistry' },
    { key: 'Biology' as const, label: 'Biology' },
  ];

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Today's Reviews</CardTitle>
          <div className="flex items-center space-x-2">
            {filterButtons.map(({ key, label }) => (
              <Button
                key={key}
                variant={filterSubject === key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilterSubject(key)}
                data-testid={`filter-${key.toLowerCase()}`}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No reviews due today!</p>
            <p className="text-sm mt-1">Great job staying on track! 🎉</p>
          </div>
        ) : (
          filteredReviews.map((task) => {
            const topicInfo = getTopicInfo(task.sessionId);
            if (!topicInfo) return null;

            const taskIsOverdue = isOverdue(task);
            const daysOverdue = getDaysOverdue(task);

            return (
              <div
                key={task.id}
                className={cn(
                  'flex items-center p-3 rounded-lg border transition-colors',
                  taskIsOverdue 
                    ? 'bg-destructive/10 border-destructive/20' 
                    : 'border-border hover:bg-accent/50'
                )}
                data-testid={`review-task-${task.id}`}
              >
                <Checkbox
                  checked={!!task.doneAt}
                  onCheckedChange={() => handleMarkComplete(task.id)}
                  className="mr-3"
                  data-testid={`checkbox-review-${task.id}`}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge 
                      variant="secondary"
                      className={cn(
                        topicInfo.subject === 'Physics' && 'physics-color',
                        topicInfo.subject === 'Chemistry' && 'chemistry-color',
                        topicInfo.subject === 'Biology' && 'biology-color'
                      )}
                    >
                      {topicInfo.subject}
                    </Badge>
                    <Badge 
                      variant={topicInfo.difficulty === 'Hard' ? 'destructive' : topicInfo.difficulty === 'Medium' ? 'default' : 'secondary'}
                    >
                      {topicInfo.difficulty}
                    </Badge>
                    {taskIsOverdue && (
                      <Badge variant="destructive" className="text-xs">
                        {daysOverdue} day{daysOverdue > 1 ? 's' : ''} overdue
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium">
                    {topicInfo.chapter} → {topicInfo.topic}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Due: {new Date(task.dueAt).toLocaleDateString()}
                  </p>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSnooze(task.id)}
                  data-testid={`button-snooze-${task.id}`}
                >
                  <Clock className="w-4 h-4" />
                </Button>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
