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
import type { Subject, Difficulty, Chapter, Topic } from '@/types';

export default function Syllabus() {
  const {
    loadSyllabus,
    searchTerm,
    selectedSubject,
    selectedDifficulty,
    setSearchTerm,
    setSelectedSubject,
    setSelectedDifficulty,
    getFilteredSyllabus,
    addChapter,
    addTopic
  } = useSyllabusStore();

  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [newChapterName, setNewChapterName] = useState('');
  const [newChapterDifficulty, setNewChapterDifficulty] = useState<Difficulty>('Easy');
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDifficulty, setNewTopicDifficulty] = useState<Difficulty>('Easy');
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [isAddingTopicToChapter, setIsAddingTopicToChapter] = useState<string | null>(null);

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

  const getDifficultyColorClass = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500 text-white';
      case 'Medium': return 'bg-yellow-500 text-black';
      case 'Hard': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getSubjectColorClass = (subject: Subject) => {
    switch (subject) {
      case 'Physics': return 'text-blue-600 dark:text-blue-400';
      case 'Chemistry': return 'text-green-600 dark:text-green-400';
      case 'Biology': return 'text-purple-600 dark:text-purple-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const calculateProgress = (chapters: Chapter[]) => {
    if (chapters.length === 0) return 0;
    const completedChapters = chapters.filter(chapter =>
      chapter.topics.every(topic => topic.status === 'completed')
    ).length;
    return (completedChapters / chapters.length) * 100;
  };

  const handleAddChapter = (subjectName: Subject) => {
    if (newChapterName.trim()) {
      addChapter(subjectName, newChapterName, newChapterDifficulty);
      setNewChapterName('');
      setNewChapterDifficulty('Easy');
      setIsAddingChapter(false);
    }
  };

  const handleAddTopic = (chapterId: string) => {
    if (newTopicName.trim()) {
      addTopic(chapterId, newTopicName, newTopicDifficulty);
      setNewTopicName('');
      setNewTopicDifficulty('Easy');
      setIsAddingTopicToChapter(null);
    }
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
              <Select value={selectedSubject} onValueChange={(value: Subject | 'all') => setSelectedSubject(value as Subject | 'all')}>
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

              <Select value={selectedDifficulty} onValueChange={(value: Difficulty | 'all') => setSelectedDifficulty(value as Difficulty | 'all')}>
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
                      <h3 className={cn('text-lg font-semibold', getSubjectColorClass(subject.subject))}>
                        {subject.subject}
                      </h3>
                      <Badge variant="secondary" className="mt-1">
                        {subject.chapters.filter(ch => ch.topics.every(t => t.status === 'completed')).length}/{subject.chapters.length} chapters completed
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
                                  <Badge
                                    variant="outline"
                                    className="text-white border-0"
                                    style={{
                                      backgroundColor: chapter.difficulty === 'Easy' ? '#16a34a' :
                                                     chapter.difficulty === 'Medium' ? '#f59e0b' :
                                                     chapter.difficulty === 'Hard' ? '#dc2626' : '#6b7280',
                                      color: 'white'
                                    }}
                                  >
                                    {chapter.difficulty}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {chapter.topics.length} topics
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Select defaultValue={chapter.status || "not-started"}>
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
                                onClick={() => setIsAddingTopicToChapter(chapter.id)}
                                data-testid={`button-add-topic-${chapter.id}`}
                              >
                                <Plus className="mr-1 h-4 w-4" />
                                Add Topic
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
                                    <Badge
                                      variant="secondary"
                                      className="text-white border-0"
                                      style={{
                                        backgroundColor: topic.difficulty === 'Easy' ? '#16a34a' :
                                                       topic.difficulty === 'Medium' ? '#f59e0b' :
                                                       topic.difficulty === 'Hard' ? '#dc2626' : '#6b7280',
                                        color: 'white'
                                      }}
                                    >
                                      {topic.difficulty}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Select defaultValue={topic.status || "not-started"}>
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
                              {isAddingTopicToChapter === chapter.id && (
                                <div className="p-3 bg-muted rounded-lg">
                                  <div className="flex items-center space-x-2">
                                    <Input
                                      placeholder="New Topic Name"
                                      value={newTopicName}
                                      onChange={(e) => setNewTopicName(e.target.value)}
                                      className="flex-1"
                                    />
                                    <Select value={newTopicDifficulty} onValueChange={(value: Difficulty) => setNewTopicDifficulty(value)}>
                                      <SelectTrigger className="w-32">
                                        <SelectValue placeholder="Difficulty" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Easy">Easy</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Hard">Hard</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Button size="sm" onClick={() => handleAddTopic(chapter.id)}>Add Topic</Button>
                                    <Button size="sm" variant="outline" onClick={() => setIsAddingTopicToChapter(null)}>Cancel</Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {isAddingChapter && (
                    <div className="p-4 border border-border rounded-lg mt-4">
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="New Chapter Name"
                          value={newChapterName}
                          onChange={(e) => setNewChapterName(e.target.value)}
                          className="flex-1"
                        />
                        <Select value={newChapterDifficulty} onValueChange={(value: Difficulty) => setNewChapterDifficulty(value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Easy">Easy</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" onClick={() => handleAddChapter(subject.subject)}>Add Chapter</Button>
                        <Button size="sm" variant="outline" onClick={() => setIsAddingChapter(false)}>Cancel</Button>
                      </div>
                    </div>
                  )}
                  {!isAddingChapter && (
                    <Button variant="outline" className="mt-2 w-full" onClick={() => setIsAddingChapter(true)}>
                      <Plus className="mr-1 h-4 w-4" /> Add New Chapter
                    </Button>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}