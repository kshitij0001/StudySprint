import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Database } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useSrsStore } from '@/store/useSrsStore';
import { useSyllabusStore } from '@/store/useSyllabusStore';
import { useTestsStore } from '@/store/useTestsStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useToast } from '@/hooks/use-toast';
import { isOverdue, isDueToday } from '@/lib/srs';
import JSZip from 'jszip';

export default function Progress() {
  const { reviewTasks, studySessions, loadData } = useSrsStore();
  const { syllabus, loadSyllabus } = useSyllabusStore();
  const { tests, loadTests } = useTestsStore();
  const { exportData } = useSettingsStore();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
    loadSyllabus();
    loadTests();
  }, [loadData, loadSyllabus, loadTests]);

  // Calculate coverage statistics
  const getCoverageStats = () => {
    const stats = {
      Physics: { total: 0, studied: 0, easy: 0, medium: 0, hard: 0 },
      Chemistry: { total: 0, studied: 0, easy: 0, medium: 0, hard: 0 },
      Biology: { total: 0, studied: 0, easy: 0, medium: 0, hard: 0 }
    };

    syllabus.forEach(subject => {
      subject.chapters.forEach(chapter => {
        chapter.topics.forEach(topic => {
          stats[subject.subject].total++;
          const diffKey = topic.difficulty.toLowerCase() as keyof typeof stats.Physics;
          stats[subject.subject][diffKey]++;
          
          // Check if topic has been studied
          const hasStudySession = studySessions.some(session => 
            session.topic.subject === subject.subject &&
            session.topic.chapterId === chapter.id &&
            session.topic.topicId === topic.id
          );
          
          if (hasStudySession) {
            stats[subject.subject].studied++;
          }
        });
      });
    });

    return stats;
  };

  // Calculate SRS health statistics
  const getSrsHealth = () => {
    const total = reviewTasks.length;
    const completed = reviewTasks.filter(task => task.doneAt).length;
    const overdue = reviewTasks.filter(task => !task.doneAt && isOverdue(task)).length;
    const dueToday = reviewTasks.filter(task => !task.doneAt && isDueToday(task)).length;
    const onTime = completed - overdue;

    return { total, completed, overdue, dueToday, onTime };
  };

  // Get upcoming load forecast
  const getUpcomingLoad = () => {
    const forecast = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      const dueCount = reviewTasks.filter(task => {
        if (task.doneAt) return false;
        const taskDate = new Date(task.dueAt);
        return taskDate.toDateString() === date.toDateString();
      }).length;
      
      forecast.push({
        day: i,
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: dueCount
      });
    }
    
    return forecast;
  };

  const coverageStats = getCoverageStats();
  const srsHealth = getSrsHealth();
  const upcomingLoad = getUpcomingLoad();

  // Data for charts
  const coverageData = Object.entries(coverageStats).map(([subject, stats]) => ({
    subject,
    coverage: stats.total > 0 ? Math.round((stats.studied / stats.total) * 100) : 0,
    total: stats.total,
    studied: stats.studied
  }));

  const difficultyData = Object.entries(coverageStats).map(([subject, stats]) => ({
    subject,
    Easy: stats.easy,
    Medium: stats.medium,
    Hard: stats.hard
  }));

  const srsHealthData = [
    { name: 'On Time', value: srsHealth.onTime, color: '#16a34a' },
    { name: 'Overdue', value: srsHealth.overdue, color: '#dc2626' },
    { name: 'Due Today', value: srsHealth.dueToday, color: '#d97706' }
  ];

  // Export functions
  const handleExportJSON = async () => {
    try {
      const data = await exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `neet-2026-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: "Your data has been exported as JSON."
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleExportZIP = async () => {
    try {
      const zip = new JSZip();
      const data = await exportData();
      
      zip.file('neet-2026-data.json', data);
      
      // Add test data as CSV
      if (tests.length > 0) {
        const csvHeader = 'Date,Source,Duration,Overall Score,Max Score,Physics,Chemistry,Biology\n';
        const csvData = tests.map(test => [
          test.date,
          test.source || '',
          test.durationMin || '',
          test.scoreOverall,
          test.maxOverall,
          test.scorePhysics || '',
          test.scoreChemistry || '',
          test.scoreBiology || ''
        ].join(',')).join('\n');
        
        zip.file('tests.csv', csvHeader + csvData);
      }
      
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `neet-2026-backup-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: "Your data has been exported as ZIP archive."
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to create ZIP export. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Progress & Analytics</h1>
          <p className="text-muted-foreground mt-1">Track your study progress and performance metrics</p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportJSON} data-testid="button-export-json">
            <FileText className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
          <Button onClick={handleExportZIP} data-testid="button-export-zip">
            <Download className="mr-2 h-4 w-4" />
            Export ZIP
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary" data-testid="stat-total-sessions">
                {studySessions.length}
              </p>
              <p className="text-sm text-muted-foreground">Study Sessions</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600" data-testid="stat-completed-reviews">
                {srsHealth.completed}
              </p>
              <p className="text-sm text-muted-foreground">Completed Reviews</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600" data-testid="stat-overdue-reviews">
                {srsHealth.overdue}
              </p>
              <p className="text-sm text-muted-foreground">Overdue Reviews</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600" data-testid="stat-total-tests">
                {tests.length}
              </p>
              <p className="text-sm text-muted-foreground">Tests Taken</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coverage Heatmaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Syllabus Coverage by Subject</CardTitle>
          </CardHeader>
          <CardContent>
            {coverageData.length > 0 ? (
              <div className="space-y-4">
                {coverageData.map(subject => (
                  <div key={subject.subject} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{subject.subject}</span>
                      <span className="text-sm text-muted-foreground">
                        {subject.studied}/{subject.total} ({subject.coverage}%)
                      </span>
                    </div>
                    <ProgressBar value={subject.coverage} className="h-2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No coverage data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SRS Review Health</CardTitle>
          </CardHeader>
          <CardContent>
            {srsHealthData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={srsHealthData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {srsHealthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No review data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Difficulty Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Topics by Difficulty Level</CardTitle>
        </CardHeader>
        <CardContent>
          {difficultyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={difficultyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="Easy" stackId="a" fill="#16a34a" />
                <Bar dataKey="Medium" stackId="a" fill="#d97706" />
                <Bar dataKey="Hard" stackId="a" fill="#dc2626" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No difficulty data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Load Forecast */}
      <Card>
        <CardHeader>
          <CardTitle>14-Day Review Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingLoad.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={upcomingLoad}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No upcoming reviews</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(coverageStats).map(([subject, stats]) => (
          <Card key={subject}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {subject}
                <Badge variant="outline">
                  {stats.total > 0 ? Math.round((stats.studied / stats.total) * 100) : 0}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Total Topics:</span>
                <span className="font-medium">{stats.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Studied:</span>
                <span className="font-medium text-green-600">{stats.studied}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Remaining:</span>
                <span className="font-medium text-amber-600">{stats.total - stats.studied}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span>Easy:</span>
                  <span className="text-green-600">{stats.easy}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Medium:</span>
                  <span className="text-amber-600">{stats.medium}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Hard:</span>
                  <span className="text-red-600">{stats.hard}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
