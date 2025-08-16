import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Trash2, Tag, Search, FolderOpen } from 'lucide-react';
import { useFilesStore } from '@/store/useFilesStore';
import { useToast } from '@/hooks/use-toast';
import type { Subject } from '@/types';

export default function Files() {
  const {
    files,
    loadFiles,
    addFile,
    deleteFile,
    updateFileTags,
    selectedSubject,
    searchTerm,
    selectedTags,
    setSelectedSubject,
    setSearchTerm,
    setSelectedTags,
    getFilteredFiles,
    getAllTags
  } = useFilesStore();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadSubject, setUploadSubject] = useState<Subject>('Physics');
  const [uploadTags, setUploadTags] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const filteredFiles = getFilteredFiles();
  const allTags = getAllTags();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid File Type",
        description: "Please upload only PDF files.",
        variant: "destructive"
      });
      return;
    }

    try {
      const tags = uploadTags.split(',').map(tag => tag.trim()).filter(Boolean);
      await addFile(file, uploadSubject, tags);
      
      toast({
        title: "File Uploaded",
        description: `${file.name} has been added to ${uploadSubject} folder.`
      });

      setIsUploadOpen(false);
      setUploadTags('');
      event.target.value = '';
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    try {
      await deleteFile(fileId);
      toast({
        title: "File Deleted",
        description: `${fileName} has been deleted.`
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete file. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSubjectColor = (subject: Subject) => {
    switch (subject) {
      case 'Physics': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300';
      case 'Chemistry': return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300';
      case 'Biology': return 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300';
    }
  };

  const subjects: Subject[] = ['Physics', 'Chemistry', 'Biology'];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Files</h1>
          <p className="text-muted-foreground mt-1">Manage your study materials and PDFs</p>
        </div>
        
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-upload-file">
              <Upload className="mr-2 h-4 w-4" />
              Upload File
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload PDF File</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Select value={uploadSubject} onValueChange={(value: Subject) => setUploadSubject(value)}>
                  <SelectTrigger data-testid="select-upload-subject">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  placeholder="notes, important, chapter1"
                  data-testid="input-upload-tags"
                />
              </div>
              
              <div>
                <Label htmlFor="file">Select PDF File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  data-testid="input-file-upload"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-files"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedSubject} onValueChange={(value: Subject | 'all') => setSelectedSubject(value)}>
                <SelectTrigger className="w-40" data-testid="select-filter-subject">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Tag Filters */}
          {allTags.length > 0 && (
            <div className="mt-4">
              <Label className="text-sm font-medium">Filter by Tags:</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {allTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      const newSelectedTags = selectedTags.includes(tag)
                        ? selectedTags.filter(t => t !== tag)
                        : [...selectedTags, tag];
                      setSelectedTags(newSelectedTags);
                    }}
                    data-testid={`tag-filter-${tag}`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subject Folders */}
      <div className="space-y-6">
        {subjects.map(subject => {
          const subjectFiles = filteredFiles.filter(file => file.subject === subject);
          
          if (subjectFiles.length === 0 && selectedSubject !== 'all' && selectedSubject !== subject) {
            return null;
          }
          
          return (
            <Card key={subject}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FolderOpen className="mr-2 h-5 w-5" />
                  <span className={getSubjectColor(subject).replace('bg-', '').replace('dark:bg-', '')}>{subject}</span>
                  <Badge variant="secondary" className="ml-2">
                    {subjectFiles.length} files
                  </Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                {subjectFiles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No files in this folder</p>
                    <p className="text-sm mt-1">Upload PDF files to get started</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjectFiles.map(file => (
                      <div
                        key={file.id}
                        className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                        data-testid={`file-${file.id}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <FileText className="h-8 w-8 text-red-500 flex-shrink-0" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteFile(file.id, file.name)}
                            data-testid={`button-delete-${file.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <h4 className="font-medium text-sm mb-1 line-clamp-2" title={file.name}>
                          {file.name}
                        </h4>
                        
                        <p className="text-xs text-muted-foreground mb-2">
                          {formatFileSize(file.size)} • {new Date(file.addedAt).toLocaleDateString()}
                        </p>
                        
                        {file.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {file.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                <Tag className="mr-1 h-3 w-3" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            // In a real app, this would open the PDF viewer
                            toast({
                              title: "PDF Viewer",
                              description: "PDF viewer functionality would open here"
                            });
                          }}
                          data-testid={`button-view-${file.id}`}
                        >
                          View PDF
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
