import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Settings as SettingsIcon, Upload, Download, Trash2, Calendar, Palette, Smartphone } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTheme } from '@/components/ThemeProvider';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const {
    targetDateISO,
    theme: settingsTheme,
    compact,
    updateSettings,
    exportData,
    importData,
    resetAllData,
    loadSettings
  } = useSettingsStore();

  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [localTargetDate, setLocalTargetDate] = useState('');
  const [localTargetTime, setLocalTargetTime] = useState('');
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importText, setImportText] = useState('');

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (targetDateISO) {
      const date = new Date(targetDateISO);
      setLocalTargetDate(date.toISOString().split('T')[0]);
      setLocalTargetTime(date.toTimeString().slice(0, 5));
    }
  }, [targetDateISO]);

  const handleUpdateTargetDate = async () => {
    if (!localTargetDate || !localTargetTime) return;

    const newTargetDate = new Date(`${localTargetDate}T${localTargetTime}:00.000+05:30`);
    await updateSettings({ targetDateISO: newTargetDate.toISOString() });
    
    toast({
      title: "Target Date Updated",
      description: "NEET exam date has been updated."
    });
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    await updateSettings({ theme: newTheme });
  };

  const handleCompactToggle = async (checked: boolean) => {
    await updateSettings({ compact: checked });
  };

  const handleExport = async () => {
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
        description: "Your data has been exported successfully."
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleImport = async () => {
    if (!importText.trim()) {
      toast({
        title: "No Data",
        description: "Please paste your backup data.",
        variant: "destructive"
      });
      return;
    }

    try {
      await importData(importText);
      setImportText('');
      setIsImportOpen(false);
      
      toast({
        title: "Import Complete",
        description: "Your data has been imported successfully."
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Invalid data format. Please check your backup file.",
        variant: "destructive"
      });
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportText(content);
    };
    reader.readAsText(file);
  };

  const handleReset = async () => {
    try {
      await resetAllData();
      
      toast({
        title: "Data Reset",
        description: "All data has been cleared successfully."
      });
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "Failed to reset data. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center">
          <SettingsIcon className="mr-2 h-6 w-6" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">Manage your app preferences and data</p>
      </div>

      {/* NEET Target Date */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            NEET Exam Date & Time
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target-date">Exam Date</Label>
              <Input
                id="target-date"
                type="date"
                value={localTargetDate}
                onChange={(e) => setLocalTargetDate(e.target.value)}
                data-testid="input-target-date"
              />
            </div>
            <div>
              <Label htmlFor="target-time">Exam Time</Label>
              <Input
                id="target-time"
                type="time"
                value={localTargetTime}
                onChange={(e) => setLocalTargetTime(e.target.value)}
                data-testid="input-target-time"
              />
            </div>
          </div>
          <Button 
            onClick={handleUpdateTargetDate}
            disabled={!localTargetDate || !localTargetTime}
            data-testid="button-update-target-date"
          >
            Update Target Date
          </Button>
          <p className="text-sm text-muted-foreground">
            Current target: {targetDateISO ? new Date(targetDateISO).toLocaleString() : 'Not set'}
          </p>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="mr-2 h-5 w-5" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
            </div>
            <Select value={theme} onValueChange={(value: 'light' | 'dark') => handleThemeChange(value)}>
              <SelectTrigger className="w-32" data-testid="select-theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Compact Mode</Label>
              <p className="text-sm text-muted-foreground">Reduce spacing for smaller screens</p>
            </div>
            <Switch
              checked={compact}
              onCheckedChange={handleCompactToggle}
              data-testid="switch-compact-mode"
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="mr-2 h-5 w-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={handleExport} variant="outline" data-testid="button-export-data">
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>

            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="button-import-data">
                  <Upload className="mr-2 h-4 w-4" />
                  Import Data
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Import Data</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="import-file">Upload File</Label>
                    <Input
                      id="import-file"
                      type="file"
                      accept=".json"
                      onChange={handleFileImport}
                      data-testid="input-import-file"
                    />
                  </div>
                  
                  <div className="text-center text-muted-foreground">or</div>
                  
                  <div>
                    <Label htmlFor="import-text">Paste JSON Data</Label>
                    <Textarea
                      id="import-text"
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                      placeholder="Paste your backup JSON data here..."
                      rows={10}
                      data-testid="textarea-import-data"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsImportOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleImport} data-testid="button-confirm-import">
                      Import Data
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Export your data for backup or import previously saved data. All study sessions, reviews, tests, and settings will be included.
          </p>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <Trash2 className="mr-2 h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-destructive">Reset All Data</Label>
              <p className="text-sm text-muted-foreground">
                This will permanently delete all your study sessions, reviews, tests, and settings. This action cannot be undone.
              </p>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" data-testid="button-reset-data">
                  Reset All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all your study data, including:
                    <ul className="list-disc list-inside mt-2">
                      <li>All study sessions and SRS reviews</li>
                      <li>Test entries and performance data</li>
                      <li>File references and settings</li>
                      <li>Progress tracking information</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset} className="bg-destructive hover:bg-destructive/90" data-testid="button-confirm-reset">
                    Yes, delete everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* App Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Smartphone className="mr-2 h-5 w-5" />
            App Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Version:</span>
            <span className="text-sm font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Last Backup:</span>
            <span className="text-sm font-medium">Never</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Storage Used:</span>
            <span className="text-sm font-medium">Calculating...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">PWA Support:</span>
            <span className="text-sm font-medium">✅ Available</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
