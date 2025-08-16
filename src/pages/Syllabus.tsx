import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronRight, Plus, Search } from 'lucide-react';
import { useSyllabusStore } from '@/store/useSyllabusStore';
import { cn } from '@/lib/utils';
import type { Subject, Difficulty } from '@/types';

export default function Syllabus() {
  const {
    loadSyllabus,
    searchTerm,
    selectedSubject,
    selectedDifficulty,
    setSearchTerm,
    setSelectedSubject,
    setSelectedDifficulty,
    getFilteredSyllabus
  } = useSyllabusStore();

  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSyllabus();
  }, [loadSyllabus]);

  const filteredSyllabus = getFilteredSyllabus();

  const toggleSubject = (subjectName: string) => {
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded.has(subjectName)) {
      newExpanded.delete(subjectName);
    } else {
      newExpanded.add(subjectName);
    }
    setExpandedSubjects(newExpanded);
  };

  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const getDifficultyVariant = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'secondary';
      case 'Medium': return 'default';
      case 'Hard': return 'destructive';
    }
  };

  const getSubjectColor = (subject: Subject) => {
    switch (subject) {
      case 'Physics': return 'text-blue-600 dark:text-blue-400';
      case 'Chemistry': return 'text-green-600 dark:text-green-400';
      case 'Biology': return 'text-purple-600 dark:text-purple-400';
    }
  };

  const calculateProgress = (chapters: any[]) => {
    // Mock progress calculation - would be based on actual study sessions
    const completed = Math.floor(chapters.length * 0.3);
    return (completed / chapters.length) * 100;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Syllabus & Study Plan</h1>
        <p className="text-muted-foreground mt-1">Track your NEET syllabus coverage and add study sessions</p>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-topics"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedSubject} onValueChange={(value: Subject | 'all') => setSelectedSubject(value)}>
                <SelectTrigger className="w-40" data-testid="select-filter-subject">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="Biology">Biology</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedDifficulty} onValueChange={(value: Difficulty | 'all') => setSelectedDifficulty(value)}>
                <SelectTrigger className="w-40" data-testid="select-filter-difficulty">
                  <SelectValue placeholder="All Difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Syllabus Tree */}
      <div className="space-y-4">
        {filteredSyllabus.map((subject) => {
          const isExpanded = expandedSubjects.has(subject.subject);
          const progress = calculateProgress(subject.chapters);
          
          return (
            <Card key={subject.subject}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSubject(subject.subject)}
                      className="mr-3 p-1"
                      data-testid={`button-toggle-${subject.subject.toLowerCase()}`}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                    <div>
                      <h3 className={cn('text-lg font-semibold', getSubjectColor(subject.subject))}>
                        {subject.subject}
                      </h3>
                      <Badge variant="secondary" className="mt-1">
                        {Math.floor(subject.chapters.length * 0.3)}/{subject.chapters.length} chapters completed
                      </Badge>
                    </div>
                  </div>
                  <div className="w-32">
                    <Progress value={progress} className="h-2" />
                    <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
                  </div>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent className="space-y-3">
                  {subject.chapters.map((chapter) => {
                    const chapterExpanded = expandedChapters.has(chapter.id);
                    
                    return (
                      <div key={chapter.id} className="border border-border rounded-lg">
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleChapter(chapter.id)}
                                className="mr-3 p-1"
                                data-testid={`button-toggle-chapter-${chapter.id}`}
                              >
                                {chapterExpanded ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </Button>
                              <div>
                                <h4 className="font-medium">{chapter.name}</h4>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge variant={getDifficultyVariant(chapter.difficulty)}>
                                    {chapter.difficulty}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {chapter.topics.length} topics
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Select defaultValue="not-started">
                                <SelectTrigger className="w-32" data-testid={`select-status-${chapter.id}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="not-started">Not Started</SelectItem>
                                  <SelectItem value="in-progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                data-testid={`button-add-chapter-study-${chapter.id}`}
                              >
                                <Plus className="mr-1 h-4 w-4" />
                                Add Study
                              </Button>
                            </div>
                          </div>
                          
                          {/* Topics (Expandable) */}
                          {chapterExpanded && (
                            <div className="mt-4 ml-8 space-y-2">
                              {chapter.topics.map((topic) => (
                                <div
                                  key={topic.id}
                                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                                  data-testid={`topic-${topic.id}`}
                                >
                                  <div>
                                    <p className="font-medium text-sm">{topic.name}</p>
                                    <Badge variant={getDifficultyVariant(topic.difficulty)} className="mt-1">
                                      {topic.difficulty}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Select defaultValue="not-started">
                                      <SelectTrigger className="w-28" data-testid={`select-topic-status-${topic.id}`}>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="not-started">Not Started</SelectItem>
                                        <SelectItem value="in-progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      size="sm"
                                      data-testid={`button-add-topic-study-${topic.id}`}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
