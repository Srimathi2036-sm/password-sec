import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, PasswordInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Eye, 
  EyeOff, 
  Copy, 
  Edit2, 
  Trash2,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { mockPasswords, Password, generatePassword, calculatePasswordStrength } from '@/lib/mockData';
import { readVault, writeVault } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const Vault = () => {
  const { user } = useAuth();
  const { add: notify } = useNotifications();
  const [passwords, setPasswords] = useState<Password[]>(() => {
    try {
      return user ? readVault(user.id) : mockPasswords;
    } catch {
      return mockPasswords;
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPassword, setEditingPassword] = useState<Password | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    website: '',
    url: '',
    username: '',
    password: '',
  });

  const filteredPasswords = passwords.filter(
    (p) =>
      p.website.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleShowPassword = (id: string) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`,
    });
  };

  const handleGeneratePassword = () => {
    const newPassword = generatePassword({
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    });
    setFormData((prev) => ({ ...prev, password: newPassword }));
    notify('Your password is ready', 'A new password was generated');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const strength = calculatePasswordStrength(formData.password).strength;
    
    if (editingPassword) {
      // Update existing
      setPasswords((prev) =>
        prev.map((p) =>
          p.id === editingPassword.id
            ? { ...p, ...formData, strength, lastModified: new Date().toISOString().split('T')[0] }
            : p
        )
      );
      if (user) writeVault(user.id, passwords.map((p) => (p.id === editingPassword.id ? { ...p, ...formData, strength, lastModified: new Date().toISOString().split('T')[0] } : p)));
      toast({ title: "Password updated", description: "Your password has been updated successfully." });
    } else {
      // Add new
      const newPassword: Password = {
        id: Date.now().toString(),
        website: formData.website,
        url: formData.url,
        username: formData.username,
        password: formData.password,
        icon: '🔐',
        category: 'Other',
        createdAt: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
        strength,
      };
      setPasswords((prev) => [newPassword, ...prev]);
      if (user) writeVault(user.id, [newPassword, ...passwords]);
      toast({ title: "Password saved", description: "Your password has been added to the vault." });
      if (user) notify('Password saved', `Password for ${newPassword.website} saved to vault`);
    }

    setFormData({ website: '', url: '', username: '', password: '' });
    setEditingPassword(null);
    setIsAddModalOpen(false);
  };

  const handleEdit = (password: Password) => {
    setFormData({
      website: password.website,
      url: password.url,
      username: password.username,
      password: password.password,
    });
    setEditingPassword(password);
    setIsAddModalOpen(true);
  };

  // Open modal based on query params (openAdd or editId)
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('openAdd') === 'true') {
      setEditingPassword(null);
      setFormData({ website: '', url: '', username: '', password: '' });
      setIsAddModalOpen(true);
    }
    const editId = params.get('editId');
    if (editId) {
      const p = passwords.find((x) => x.id === editId);
      if (p) handleEdit(p);
    }
  }, [location.search]);

  const handleDelete = (id: string) => {
    const next = passwords.filter((p) => p.id !== id);
    setPasswords(next);
    if (user) writeVault(user.id, next);
    toast({ title: "Password deleted", description: "The password has been removed from your vault." });
  };

  return (
    <DashboardLayout searchQuery={searchQuery} onSearchChange={setSearchQuery}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display">Password Vault</h1>
            <p className="text-muted-foreground mt-1">Manage all your saved passwords securely.</p>
          </div>
          
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" onClick={() => {
                setFormData({ website: '', url: '', username: '', password: '' });
                setEditingPassword(null);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Password
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editingPassword ? 'Edit Password' : 'Add New Password'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website Name</Label>
                  <Input
                    id="website"
                    placeholder="e.g., Google, Instagram"
                    value={formData.website}
                    onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">Website URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com"
                    value={formData.url}
                    onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username / Email</Label>
                  <Input
                    id="username"
                    placeholder="john@example.com"
                    value={formData.username}
                    onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="formPassword">Password</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <PasswordInput
                        id="formPassword"
                        placeholder="Enter or generate password"
                        value={formData.password}
                        onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>
                    <Button type="button" variant="outline" onClick={handleGeneratePassword}>
                      <Sparkles className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.password && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all",
                            calculatePasswordStrength(formData.password).strength === 'weak' && "w-1/3 bg-destructive",
                            calculatePasswordStrength(formData.password).strength === 'medium' && "w-2/3 bg-warning",
                            calculatePasswordStrength(formData.password).strength === 'strong' && "w-full bg-success"
                          )}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground capitalize">
                        {calculatePasswordStrength(formData.password).strength}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="hero" className="flex-1">
                    {editingPassword ? 'Update' : 'Save'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Password List */}
        <div className="grid gap-4">
          {filteredPasswords.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No passwords found. Add your first password to get started.</p>
              </CardContent>
            </Card>
          ) : (
            filteredPasswords.map((password) => (
              <Card key={password.id} className="hover-lift">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                        {password.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{password.website}</h3>
                          <a 
                            href={password.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                        <p className="text-sm text-muted-foreground">{password.username}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Password Display */}
                      <div className="flex items-center gap-2 min-w-[200px]">
                        <code className="text-sm font-mono bg-muted px-3 py-1.5 rounded-lg">
                          {showPasswords[password.id] ? password.password : '••••••••••••'}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleShowPassword(password.id)}
                        >
                          {showPasswords[password.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(password.password, 'Password')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Strength Badge */}
                      <span className={cn(
                        "px-3 py-1 text-xs rounded-full font-medium capitalize",
                        password.strength === 'strong' && "bg-success/10 text-success",
                        password.strength === 'medium' && "bg-warning/10 text-warning",
                        password.strength === 'weak' && "bg-destructive/10 text-destructive"
                      )}>
                        {password.strength}
                      </span>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(password)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(password.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Vault;
