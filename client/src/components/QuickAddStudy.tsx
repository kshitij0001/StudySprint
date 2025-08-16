import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Info, X } from 'lucide-react';
import { useSrsStore } from '@/store/useSrsStore';
import { useSyllabusStore } from '@/store/useSyllabusStore';
import { useToast } from '@/hooks/use-toast';
import type { Subject, Difficulty } from '@/types';

export function QuickAddStudy() {
  const [selectedSubject, setSelectedSubject] = useState<Subject>('Physics');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('Medium');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingCustomTopic, setIsAddingCustomTopic] = useState<boolean>(false);
  const [customTopicName, setCustomTopicName] = useState<string>('');
  const [customTopicDifficulty, setCustomTopicDifficulty] = useState<Difficulty>('Easy');
  const [isAddingCustomChapter, setIsAddingCustomChapter] = useState<boolean>(false);
  const [customChapterName, setCustomChapterName] = useState<string>('');
  const [customChapterDifficulty, setCustomChapterDifficulty] = useState<Difficulty>('Easy');

  const { syllabus, addTopic, addChapter } = useSyllabusStore();
  const { addStudySession } = useSrsStore();
  const { toast } = useToast();

  const handleAddCustomTopic = () => {
    if (customTopicName.trim() && selectedChapter) {
      const newTopicId = addTopic(selectedChapter, customTopicName.trim(), customTopicDifficulty);
      setSelectedTopic(newTopicId);
      setCustomTopicName('');
      setCustomTopicDifficulty('Easy');
      setIsAddingCustomTopic(false);
    }
  };

  const handleAddCustomChapter = () => {
    if (customChapterName.trim() && selectedSubject) {
      const newChapterId = addChapter(selectedSubject, customChapterName.trim(), customChapterDifficulty);
      setSelectedChapter(newChapterId);
      setCustomChapterName('');
      setCustomChapterDifficulty('Easy');
      setIsAddingCustomChapter(false);
    }
  };

  const selectedSubjectData = syllabus.find(s => s.subject === selectedSubject);
  const selectedChapterData = selectedSubjectData?.chapters.find(c => c.id === selectedChapter);
  const selectedTopicData = selectedChapterData?.topics.find(t => t.id === selectedTopic);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSubject || !selectedChapter || !selectedTopic) {
      toast({
        title: "Missing Information",
        description: "Please select subject, chapter, and topic.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await addStudySession(
        {
          id: selectedTopic,
          subject: selectedSubject,
          chapterId: selectedChapter,
          topicId: selectedTopic,
          difficulty: selectedDifficulty
        },
        notes || undefined
      );

      toast({
        title: "Study Session Added!",
        description: "Reviews scheduled for +4, +7, +14, +28, +40 days"
      });

      // Reset form
      setSelectedSubject('Physics');
      setSelectedChapter('');
      setSelectedTopic('');
      setSelectedDifficulty('Medium');
      setNotes('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add study session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const difficultyButtons = [
    { value: 'Easy' as Difficulty, color: '#16a34a' },
    { value: 'Medium' as Difficulty, color: '#f59e0b' },
    { value: 'Hard' as Difficulty, color: '#dc2626' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Add Study</CardTitle>
        <p className="text-sm text-muted-foreground">Schedule spaced reviews</p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Select value={selectedSubject} onValueChange={(value: Subject) => {
              setSelectedSubject(value);
              setSelectedChapter('');
              setSelectedTopic('');
            }}>
              <SelectTrigger data-testid="select-subject">
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {syllabus.map(subject => (
                  <SelectItem key={subject.subject} value={subject.subject}>
                    {subject.subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSubject && (
            <div>
              <Label htmlFor="chapter">Chapter</Label>
              <Select value={selectedChapter} onValueChange={(value) => {
                setSelectedChapter(value);
                setSelectedTopic('');
              }}>
                <SelectTrigger data-testid="select-chapter">
                  <SelectValue placeholder="Select Chapter" />
                </SelectTrigger>
                <SelectContent>
                  {selectedSubjectData?.chapters.map(chapter => (
                    <SelectItem key={chapter.id} value={chapter.id}>
                      {chapter.name}
                    </SelectItem>
                  ))}
                  <SelectItem 
                    value="add_new_chapter"
                    onSelect={() => {
                      setSelectedChapter('add_new_chapter');
                      setIsAddingCustomChapter(true);
                    }}
                  >
                    + Add New Chapter
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedChapter && selectedChapter !== "add_new_chapter" && (
            <div>
              <Label htmlFor="topic">Topic</Label>
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger data-testid="select-topic">
                  <SelectValue placeholder="Select Topic" />
                </SelectTrigger>
                <SelectContent>
                  {selectedChapterData?.topics.map(topic => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.name}
                    </SelectItem>
                  ))}
                  <SelectItem 
                    value="add_new_topic" 
                    onSelect={() => {
                      setSelectedTopic('add_new_topic');
                      setIsAddingCustomTopic(true);
                    }}
                  >
                    + Add New Topic
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {isAddingCustomChapter && (
            <div>
              <Label htmlFor="customChapterName">New Chapter Name</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="customChapterName"
                  value={customChapterName}
                  onChange={(e) => setCustomChapterName(e.target.value)}
                  placeholder="Enter new chapter name"
                  className="flex-grow"
                />
                <Select value={customChapterDifficulty} onValueChange={(value: Difficulty) => setCustomChapterDifficulty(value)}>
                  <SelectTrigger className="w-[100px]" data-testid="select-custom-chapter-difficulty">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficultyButtons.map(({ value }) => (
                      <SelectItem key={value} value={value}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="sm" onClick={handleAddCustomChapter} data-testid="button-add-custom-chapter">
                  <Plus className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => setIsAddingCustomChapter(false)} data-testid="button-cancel-add-custom-chapter">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {isAddingCustomTopic && (
            <div>
              <Label htmlFor="customTopicName">New Topic Name</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="customTopicName"
                  value={customTopicName}
                  onChange={(e) => setCustomTopicName(e.target.value)}
                  placeholder="Enter new topic name"
                  className="flex-grow"
                />
                <Select value={customTopicDifficulty} onValueChange={(value: Difficulty) => setCustomTopicDifficulty(value)}>
                  <SelectTrigger className="w-[100px]" data-testid="select-custom-topic-difficulty">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficultyButtons.map(({ value }) => (
                      <SelectItem key={value} value={value}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="sm" onClick={handleAddCustomTopic} data-testid="button-add-custom-topic">
                  <Plus className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => setIsAddingCustomTopic(false)} data-testid="button-cancel-add-custom-topic">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {selectedChapter && selectedChapter !== "add_new_chapter" && selectedTopic && selectedTopic !== "add_new_topic" && !isAddingCustomTopic && (
            <div>
              <Label>Difficulty</Label>
              <div className="flex space-x-2 mt-2">
                {difficultyButtons.map(({ value, color }) => (
                  <Button
                    key={value}
                    type="button"
                    style={{ 
                      backgroundColor: selectedDifficulty === value ? color : 'transparent', 
                      color: selectedDifficulty === value ? 'white' : color,
                      borderColor: color
                    }}
                    size="sm"
                    onClick={() => setSelectedDifficulty(value)}
                    className="flex-1 border-2 hover:opacity-80 transition-all"
                    data-testid={`button-difficulty-${value.toLowerCase()}`}
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </div>
          )}


          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about this study session..."
              rows={3}
              data-testid="textarea-notes"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !selectedTopic || selectedTopic === "add_new_topic" || isAddingCustomTopic || isAddingCustomChapter}
            data-testid="button-add-study-session"
          >
            <Plus className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Adding...' : 'Add Study Session'}
          </Button>

          <div className="text-xs text-muted-foreground bg-muted rounded-lg p-3 flex items-start">
            <Info className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
            Reviews will be scheduled for: +4, +7, +14, +28, +40 days
          </div>
        </form>
      </CardContent>
    </Card>
  );
}