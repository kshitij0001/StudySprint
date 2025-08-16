import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Plus, Clock, Trash2, Check } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { useSrsStore } from '@/store/useSrsStore';
import { useSyllabusStore } from '@/store/useSyllabusStore';
import { isOverdue } from '@/lib/srs';
import { cn } from '@/lib/utils';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const { studySessions, reviewTasks, markReviewComplete, snoozeReview, removeReviewTask } = useSrsStore();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get events from study sessions and review tasks
  const { syllabus } = useSyllabusStore();
  
  const getSubjectPrefix = (subject: string) => {
    switch (subject) {
      case 'Physics': return 'Phy.';
      case 'Chemistry': return 'Chem.';
      case 'Biology': return 'Bio.';
      default: return subject.slice(0, 3) + '.';
    }
  };

  const getTopicInfo = (topicRef: any) => {
    // If it's a session, use the topic reference
    if (topicRef.topic) {
      const { subject, chapterId, topicId } = topicRef.topic;
      for (const subjectData of syllabus) {
        if (subjectData.subject === subject) {
          for (const chapter of subjectData.chapters) {
            if (chapter.id === chapterId) {
              for (const topic of chapter.topics) {
                if (topic.id === topicId) {
                  return {
                    subject: subject,
                    chapter: chapter.name,
                    topic: topic.name,
                    difficulty: topic.difficulty
                  };
                }
              }
            }
          }
        }
      }
    }
    // If it's a sessionId (for review tasks), find the session first
    else {
      const session = studySessions.find(s => s.id === topicRef);
      if (session) {
        return getTopicInfo(session);
      }
    }
    return null;
  };

  const events = [
    ...studySessions.map(session => {
      const topicInfo = getTopicInfo(session);
      if (!topicInfo) return null;
      
      return {
        date: new Date(session.createdAt),
        type: 'study',
        subject: topicInfo.subject,
        title: `${getSubjectPrefix(topicInfo.subject)} ${topicInfo.topic}`,
        difficulty: topicInfo.difficulty
      };
    }).filter(Boolean),
    ...reviewTasks.map(task => {
      const topicInfo = getTopicInfo(task.sessionId);
      if (!topicInfo) return null;
      
      return {
        date: new Date(task.dueAt),
        type: isOverdue(task) ? 'overdue' : 'review',
        subject: topicInfo.subject,
        title: `${getSubjectPrefix(topicInfo.subject)} ${topicInfo.topic}`,
        difficulty: topicInfo.difficulty
      };
    }).filter(Boolean)
  ];

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.date, day));
  };

  const getEventColor = (event: any) => {
    if (event.type === 'overdue') {
      return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-l-2 border-red-500';
    }
    
    // Color based on difficulty
    switch (event.difficulty) {
      case 'Easy': return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-l-2 border-green-500';
      case 'Medium': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-l-2 border-yellow-500';
      case 'Hard': return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-l-2 border-red-500';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-l-2 border-gray-500';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-muted-foreground mt-1">View and manage your study schedule</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={view === 'month' ? 'default' : 'ghost'}
            onClick={() => setView('month')}
            data-testid="button-view-month"
          >
            Month
          </Button>
          <Button
            variant={view === 'week' ? 'default' : 'ghost'}
            onClick={() => setView('week')}
            data-testid="button-view-week"
          >
            Week
          </Button>
          <Button
            variant={view === 'day' ? 'default' : 'ghost'}
            onClick={() => setView('day')}
            data-testid="button-view-day"
          >
            Day
          </Button>
        </div>
      </div>

      {/* Calendar Header */}
      <Card className="mb-6">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('prev')}
                data-testid="button-previous-month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('next')}
                data-testid="button-next-month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button data-testid="button-add-event">
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <CardContent className="p-6">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isDayToday = isToday(day);
              
              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border rounded-lg cursor-pointer transition-colors ${
                    isDayToday 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:bg-accent/50'
                  } ${!isCurrentMonth ? 'opacity-30' : ''}`}
                  data-testid={`calendar-day-${format(day, 'yyyy-MM-dd')}`}
                  onClick={() => setSelectedDay(day)}
                >
                  <div className={`text-sm mb-1 ${
                    isDayToday 
                      ? 'font-bold text-primary' 
                      : isCurrentMonth 
                        ? 'font-medium' 
                        : 'text-muted-foreground'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className={`text-xs p-1 rounded truncate ${getEventColor(event)}`}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Day View Modal */}
      <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDay && format(selectedDay, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {selectedDay && (() => {
              const dayTasks = getEventsForDay(selectedDay);
              const reviewTasksForDay = reviewTasks.filter(task => 
                !task.doneAt && isSameDay(new Date(task.dueAt), selectedDay)
              );
              
              if (dayTasks.length === 0) {
                return (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No tasks for this day</p>
                  </div>
                );
              }

              return reviewTasksForDay.map((task) => {
                const topicInfo = getTopicInfo(task.sessionId);
                if (!topicInfo) return null;

                const taskIsOverdue = isOverdue(task);

                return (
                  <SwipeableTaskCard
                    key={task.id}
                    task={task}
                    topicInfo={topicInfo}
                    isOverdue={taskIsOverdue}
                    onComplete={() => markReviewComplete(task.id)}
                    onSnooze={() => snoozeReview(task.id, 1)}
                    onRemove={() => removeReviewTask(task.id)}
                  />
                );
              });
            })()}
          </div>
        </DialogContent>
      </Dialog>

      {/* Legend */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Legend</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span className="text-sm">Easy Topics</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
              <span className="text-sm">Medium Topics</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
              <span className="text-sm">Hard Topics</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-600 rounded mr-2"></div>
              <span className="text-sm">Overdue Reviews</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              <strong>Swipe gestures:</strong> ← Remove | → Complete | ↑ Snooze
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Swipeable Task Card Component
interface SwipeableTaskCardProps {
  task: any;
  topicInfo: any;
  isOverdue: boolean;
  onComplete: () => void;
  onSnooze: () => void;
  onRemove: () => void;
}

function SwipeableTaskCard({ task, topicInfo, isOverdue, onComplete, onSnooze, onRemove }: SwipeableTaskCardProps) {
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [startPos, setStartPos] = React.useState({ x: 0, y: 0 });

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setStartPos({ x: touch.clientX, y: touch.clientY });
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPos.x;
    const deltaY = touch.clientY - startPos.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const threshold = 100;
    
    // Left swipe - Remove
    if (dragOffset.x < -threshold) {
      onRemove();
    }
    // Right swipe - Complete
    else if (dragOffset.x > threshold) {
      onComplete();
    }
    // Up swipe - Snooze
    else if (dragOffset.y < -threshold) {
      onSnooze();
    }
    
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setStartPos({ x: e.clientX, y: e.clientY });
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    const threshold = 100;
    
    if (dragOffset.x < -threshold) {
      onRemove();
    } else if (dragOffset.x > threshold) {
      onComplete();
    } else if (dragOffset.y < -threshold) {
      onSnooze();
    }
    
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const getSwipeIndicator = () => {
    const threshold = 50;
    if (Math.abs(dragOffset.x) > threshold || Math.abs(dragOffset.y) > threshold) {
      if (dragOffset.x < -threshold) return { icon: Trash2, color: 'text-red-500', bg: 'bg-red-100' };
      if (dragOffset.x > threshold) return { icon: Check, color: 'text-green-500', bg: 'bg-green-100' };
      if (dragOffset.y < -threshold) return { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-100' };
    }
    return null;
  };

  const indicator = getSwipeIndicator();

  return (
    <div
      className={cn(
        'relative flex items-center p-3 rounded-lg border transition-all duration-200 select-none touch-none',
        isOverdue 
          ? 'bg-destructive/10 border-destructive/20' 
          : 'border-border hover:bg-accent/50',
        isDragging && 'shadow-lg scale-105'
      )}
      style={{
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Swipe Indicator */}
      {indicator && (
        <div className={cn(
          'absolute inset-0 flex items-center justify-center rounded-lg opacity-70',
          indicator.bg
        )}>
          <indicator.icon className={cn('w-8 h-8', indicator.color)} />
        </div>
      )}
      
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
          {isOverdue && (
            <Badge variant="destructive" className="text-xs">
              Overdue
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
      
      {/* Action buttons for non-touch devices */}
      <div className="flex space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSnooze}
          className="hidden md:flex"
        >
          <Clock className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onComplete}
          className="hidden md:flex"
        >
          <Check className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="hidden md:flex"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
