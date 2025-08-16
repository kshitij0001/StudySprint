import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, Calendar, Clock, Target, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useTestsStore } from '@/store/useTestsStore';
import { useToast } from '@/hooks/use-toast';
import type { TestEntry } from '@/types';

export default function Tests() {
  const {
    tests,
    loadTests,
    addTest,
    deleteTest,
    getRecentTests,
    getAverageScore,
    getSubjectPerformance
  } = useTestsStore();

  const [isAddTestOpen, setIsAddTestOpen] = useState(false);
  const [newTest, setNewTest] = useState({
    date: new Date().toISOString().split('T')[0],
    source: '',
    durationMin: '',
    scoreOverall: '',
    maxOverall: '',
    scorePhysics: '',
    scoreChemistry: '',
    scoreBiology: ''
  });

  const { toast } = useToast();

  useEffect(() => {
    loadTests();
  }, [loadTests]);

  const handleAddTest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const testEntry: Omit<TestEntry, 'id'> = {
        date: newTest.date,
        source: newTest.source || undefined,
        durationMin: newTest.durationMin ? parseInt(newTest.durationMin) : undefined,
        scoreOverall: parseInt(newTest.scoreOverall),
        maxOverall: parseInt(newTest.maxOverall),
        scorePhysics: newTest.scorePhysics ? parseInt(newTest.scorePhysics) : undefined,
        scoreChemistry: newTest.scoreChemistry ? parseInt(newTest.scoreChemistry) : undefined,
        scoreBiology: newTest.scoreBiology ? parseInt(newTest.scoreBiology) : undefined
      };

      await addTest(testEntry);
      
      toast({
        title: "Test Added",
        description: "Test entry has been saved successfully."
      });

      setNewTest({
        date: new Date().toISOString().split('T')[0],
        source: '',
        durationMin: '',
        scoreOverall: '',
        maxOverall: '',
        scorePhysics: '',
        scoreChemistry: '',
        scoreBiology: ''
      });
      setIsAddTestOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add test entry. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTest = async (testId: string) => {
    try {
      await deleteTest(testId);
      toast({
        title: "Test Deleted",
        description: "Test entry has been deleted."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete test. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Chart data
  const recentTests = getRecentTests(30);
  const trendData = recentTests.map(test => ({
    date: new Date(test.date).toLocaleDateString(),
    score: Math.round((test.scoreOverall / test.maxOverall) * 100),
    physics: test.scorePhysics ? Math.round((test.scorePhysics / (test.maxOverall / 3)) * 100) : null,
    chemistry: test.scoreChemistry ? Math.round((test.scoreChemistry / (test.maxOverall / 3)) * 100) : null,
    biology: test.scoreBiology ? Math.round((test.scoreBiology / (test.maxOverall / 3)) * 100) : null
  })).reverse();

  const subjectPerformance = getSubjectPerformance();
  const pieData = subjectPerformance.map(subject => ({
    name: subject.subject,
    value: subject.average,
    count: subject.count
  }));

  const averageScore7Days = getAverageScore(7);
  const averageScore30Days = getAverageScore(30);

  const COLORS = ['#2563eb', '#16a34a', '#9333ea'];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tests & Analytics</h1>
          <p className="text-muted-foreground mt-1">Track your test performance and analyze trends</p>
        </div>
        
        <Dialog open={isAddTestOpen} onOpenChange={setIsAddTestOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-test">
              <Plus className="mr-2 h-4 w-4" />
              Add Test
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Test Entry</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddTest} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newTest.date}
                    onChange={(e) => setNewTest({ ...newTest, date: e.target.value })}
                    required
                    data-testid="input-test-date"
                  />
                </div>
                <div>
                  <Label htmlFor="source">Source (Optional)</Label>
                  <Input
                    id="source"
                    value={newTest.source}
                    onChange={(e) => setNewTest({ ...newTest, source: e.target.value })}
                    placeholder="e.g., NEET Mock Test Series"
                    data-testid="input-test-source"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={newTest.durationMin}
                  onChange={(e) => setNewTest({ ...newTest, durationMin: e.target.value })}
                  placeholder="180"
                  data-testid="input-test-duration"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scoreOverall">Overall Score</Label>
                  <Input
                    id="scoreOverall"
                    type="number"
                    value={newTest.scoreOverall}
                    onChange={(e) => setNewTest({ ...newTest, scoreOverall: e.target.value })}
                    required
                    data-testid="input-overall-score"
                  />
                </div>
                <div>
                  <Label htmlFor="maxOverall">Maximum Score</Label>
                  <Input
                    id="maxOverall"
                    type="number"
                    value={newTest.maxOverall}
                    onChange={(e) => setNewTest({ ...newTest, maxOverall: e.target.value })}
                    required
                    data-testid="input-max-score"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="scorePhysics">Physics Score</Label>
                  <Input
                    id="scorePhysics"
                    type="number"
                    value={newTest.scorePhysics}
                    onChange={(e) => setNewTest({ ...newTest, scorePhysics: e.target.value })}
                    data-testid="input-physics-score"
                  />
                </div>
                <div>
                  <Label htmlFor="scoreChemistry">Chemistry Score</Label>
                  <Input
                    id="scoreChemistry"
                    type="number"
                    value={newTest.scoreChemistry}
                    onChange={(e) => setNewTest({ ...newTest, scoreChemistry: e.target.value })}
                    data-testid="input-chemistry-score"
                  />
                </div>
                <div>
                  <Label htmlFor="scoreBiology">Biology Score</Label>
                  <Input
                    id="scoreBiology"
                    type="number"
                    value={newTest.scoreBiology}
                    onChange={(e) => setNewTest({ ...newTest, scoreBiology: e.target.value })}
                    data-testid="input-biology-score"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddTestOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="button-save-test">
                  Save Test
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Tests</p>
                <p className="text-2xl font-bold" data-testid="stat-total-tests">{tests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">7-Day Average</p>
                <p className="text-2xl font-bold" data-testid="stat-7-day-average">
                  {averageScore7Days.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">30-Day Average</p>
                <p className="text-2xl font-bold" data-testid="stat-30-day-average">
                  {averageScore30Days.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Last Test</p>
                <p className="text-2xl font-bold" data-testid="stat-last-test">
                  {tests.length > 0 ? new Date(tests[0].date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Score Trends (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} name="Overall" />
                  <Line type="monotone" dataKey="physics" stroke="#2563eb" strokeWidth={1} strokeDasharray="5 5" name="Physics" />
                  <Line type="monotone" dataKey="chemistry" stroke="#16a34a" strokeWidth={1} strokeDasharray="5 5" name="Chemistry" />
                  <Line type="monotone" dataKey="biology" stroke="#9333ea" strokeWidth={1} strokeDasharray="5 5" name="Biology" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No test data available</p>
                  <p className="text-sm mt-1">Add your first test to see trends</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 && pieData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <Target className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No subject data available</p>
                  <p className="text-sm mt-1">Add tests with subject scores to see performance</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Tests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tests</CardTitle>
        </CardHeader>
        <CardContent>
          {tests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Overall Score</TableHead>
                  <TableHead>Physics</TableHead>
                  <TableHead>Chemistry</TableHead>
                  <TableHead>Biology</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.slice(0, 10).map((test) => (
                  <TableRow key={test.id} data-testid={`test-row-${test.id}`}>
                    <TableCell>{new Date(test.date).toLocaleDateString()}</TableCell>
                    <TableCell>{test.source || '-'}</TableCell>
                    <TableCell>{test.durationMin ? `${test.durationMin} min` : '-'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {test.scoreOverall}/{test.maxOverall} ({Math.round((test.scoreOverall / test.maxOverall) * 100)}%)
                      </Badge>
                    </TableCell>
                    <TableCell>{test.scorePhysics ? test.scorePhysics : '-'}</TableCell>
                    <TableCell>{test.scoreChemistry ? test.scoreChemistry : '-'}</TableCell>
                    <TableCell>{test.scoreBiology ? test.scoreBiology : '-'}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTest(test.id)}
                        data-testid={`button-delete-test-${test.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No tests recorded yet</p>
              <p className="text-sm mt-1">Start tracking your test performance</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
