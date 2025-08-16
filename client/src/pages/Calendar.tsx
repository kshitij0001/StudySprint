import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { useSrsStore } from '@/store/useSrsStore';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const { studySessions, reviewTasks } = useSrsStore();

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
  const events = [
    ...studySessions.map(session => ({
      date: new Date(session.createdAt),
      type: 'study',
      subject: session.subject,
      title: `Study: ${session.topicName || 'Topic'}`,
      difficulty: session.difficulty
    })),
    ...reviewTasks.map(task => ({
      date: new Date(task.dueDate),
      type: task.isOverdue ? 'overdue' : 'review',
      subject: task.subject,
      title: `Review: ${task.topicName || 'Topic'}`,
      difficulty: task.difficulty
    }))
  ];

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.date, day));
  };

  const getEventColor = (event: any) => {
    if (event.type === 'overdue') {
      return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-l-2 border-red-500';
    }
    
    switch (event.subject) {
      case 'Physics': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-l-2 border-blue-500';
      case 'Chemistry': return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-l-2 border-green-500';
      case 'Biology': return 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-l-2 border-purple-500';
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

      {/* Legend */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Legend</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span className="text-sm">Physics Reviews</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span className="text-sm">Chemistry Reviews</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
              <span className="text-sm">Biology Reviews</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
              <span className="text-sm">Overdue Reviews</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
