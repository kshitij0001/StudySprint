import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Info } from 'lucide-react';
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

  const { addStudySession } = useSrsStore();
  const { syllabus } = useSyllabusStore();
  const { toast } = useToast();

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

  const difficultyButtons: { value: Difficulty; variant: 'default' | 'secondary' | 'destructive' }[] = [
    { value: 'Easy', variant: 'secondary' },
    { value: 'Medium', variant: 'default' },
    { value: 'Hard', variant: 'destructive' }
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
                </SelectContent>
              </Select>
            </div>
          )}
          
          {selectedChapter && (
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
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div>
            <Label>Difficulty</Label>
            <div className="flex space-x-2 mt-2">
              {difficultyButtons.map(({ value, variant }) => (
                <Button
                  key={value}
                  type="button"
                  variant={selectedDifficulty === value ? variant : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDifficulty(value)}
                  className="flex-1"
                  data-testid={`button-difficulty-${value.toLowerCase()}`}
                >
                  {value}
                </Button>
              ))}
            </div>
          </div>
          
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
            disabled={isSubmitting || !selectedTopic}
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
