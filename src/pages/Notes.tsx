import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, FileText, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { mockSecureNotes, SecureNote } from '@/lib/mockData';
import { toast } from '@/hooks/use-toast';

const Notes = () => {
  const [notes, setNotes] = useState<SecureNote[]>(mockSecureNotes);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<SecureNote | null>(null);
  const [viewingNote, setViewingNote] = useState<SecureNote | null>(null);
  const [showContent, setShowContent] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingNote) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === editingNote.id
            ? { ...n, ...formData }
            : n
        )
      );
      toast({ title: "Note updated", description: "Your secure note has been updated." });
    } else {
      const newNote: SecureNote = {
        id: Date.now().toString(),
        title: formData.title,
        content: formData.content,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setNotes((prev) => [newNote, ...prev]);
      toast({ title: "Note saved", description: "Your secure note has been created." });
    }

    setFormData({ title: '', content: '' });
    setEditingNote(null);
    setIsAddModalOpen(false);
  };

  const handleEdit = (note: SecureNote) => {
    setFormData({
      title: note.title,
      content: note.content,
    });
    setEditingNote(note);
    setIsAddModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    toast({ title: "Note deleted", description: "The note has been removed." });
  };

  const toggleShowContent = (id: string) => {
    setShowContent((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display">Secure Notes</h1>
            <p className="text-muted-foreground mt-1">Store sensitive information securely.</p>
          </div>
          
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" onClick={() => {
                setFormData({ title: '', content: '' });
                setEditingNote(null);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editingNote ? 'Edit Note' : 'Add Secure Note'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., WiFi Password, API Keys"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Enter your secure note..."
                    value={formData.content}
                    onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                    rows={6}
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="hero" className="flex-1">
                    {editingNote ? 'Update' : 'Save'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Notes Grid */}
        {notes.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No secure notes yet. Add your first note to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <Card key={note.id} className="hover-lift">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <CardTitle className="text-base font-display">{note.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleShowContent(note.id)}>
                        {showContent[note.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    {showContent[note.id] ? (
                      <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono bg-muted/50 p-3 rounded-lg">
                        {note.content}
                      </pre>
                    ) : (
                      <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                        ••••••••••••••••••••
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Created {note.createdAt}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(note)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(note.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notes;
