import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, PasswordInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Lock, 
  Fingerprint, 
  Download, 
  Upload, 
  Users, 
  Moon, 
  Sun,
  Smartphone,
  Shield,
  Bell,
  Plus,
  Trash2,
  Phone
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { exportVault, readVault, writeVault, getVaultKey } from '@/lib/storage';
import { deleteUserByEmail, updateEmergencyContacts } from '@/lib/auth';
import { updateFlags, webauthnRegisterOptions, webauthnRegisterVerify } from '@/lib/auth';
import { useNotifications } from '@/contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [emergencyContacts, setEmergencyContacts] = useState<{ name: string; phone: string }[]>([]);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const auth = useAuth();
  const notifications = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    loadEmergencyContacts();
  }, []);

  const loadEmergencyContacts = async () => {
    if (!auth.user) return;
    try {
      const session = localStorage.getItem('session');
      const token = session ? (JSON.parse(session).token || null) : null;
      if (!token) return;
      const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const res = await fetch(`${API}/auth/user`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setEmergencyContacts(data.emergencyContacts || []);
      }
    } catch (e) {
      // ignore
    }
  };

  const handleExport = async () => {
    const u = auth.user;
    if (!u) return toast({ title: 'Not signed in', description: 'Please login to export data', variant: 'destructive' });
    try {
      const session = localStorage.getItem('session');
      const token = session ? (JSON.parse(session).token || null) : null;
      if (!token) return toast({ title: 'Not signed in', description: 'Missing session token', variant: 'destructive' });
      const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const res = await fetch(`${API}/import/export/csv`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return toast({ title: 'Export failed', description: err.error || 'Unable to export', variant: 'destructive' });
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${u.email}-vault.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Passwords Exported Successfully', description: 'Downloaded encrypted CSV. Please securely delete it when finished.' });
    } catch (e) {
      toast({ title: 'Export failed', description: 'An error occurred while exporting', variant: 'destructive' });
    }
  };

  const handleImport = () => {
    // trigger file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,text/csv';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const u = auth.user;
      if (!u) return toast({ title: 'Not signed in', description: 'Please login to import data', variant: 'destructive' });
      try {
        const session = localStorage.getItem('session');
        const token = session ? (JSON.parse(session).token || null) : null;
        if (!token) return toast({ title: 'Not signed in', description: 'Missing session token', variant: 'destructive' });
        const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
        const form = new FormData();
        form.append('file', file);
        const res = await fetch(`${API}/import/import/csv`, { method: 'POST', body: form, headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return toast({ title: 'Import Failed', description: data.error || 'Unable to import file', variant: 'destructive' });
        toast({ title: 'Import Complete', description: `Imported ${data.imported || 0} rows, skipped ${data.skipped || 0}` });
        notifications.add('Import Complete', `Imported ${data.imported || 0} passwords`);
      } catch (err) {
        toast({ title: 'Import Failed', description: 'Upload failed', variant: 'destructive' });
      }
    };
    input.click();
  };

  const handleDeleteAccount = () => {
    const u = auth.user;
    if (!u) return;
    const confirmed = window.confirm('Are you sure you want to delete your account and all data? This action cannot be undone.');
    if (!confirmed) return;
    // remove vault and user
    localStorage.removeItem(getVaultKey(u.id));
    (async () => {
      await deleteUserByEmail(u.email);
    })();
    auth.logout();
    notifications.add('Account deleted', 'Your account and data have been removed');
    toast({ title: 'Account deleted', description: 'Your account and data were removed.' });
    navigate('/');
  };

  const handleAddEmergencyContact = async () => {
    if (!contactName.trim() || !contactPhone.trim()) {
      toast({ title: 'Invalid input', description: 'Please enter both name and phone number', variant: 'destructive' });
      return;
    }
    if (!auth.user) return;
    const newContacts = [...emergencyContacts, { name: contactName.trim(), phone: contactPhone.trim() }];
    const result = await updateEmergencyContacts(auth.user.email, newContacts);
    if (result) {
      setEmergencyContacts(newContacts);
      setContactName('');
      setContactPhone('');
      setIsAddContactOpen(false);
      toast({ title: 'Contact added', description: 'Emergency contact has been added' });
    } else {
      toast({ title: 'Failed to add contact', description: 'Please try again', variant: 'destructive' });
    }
  };

  const handleRemoveEmergencyContact = async (index: number) => {
    if (!auth.user) return;
    const newContacts = emergencyContacts.filter((_, i) => i !== index);
    const result = await updateEmergencyContacts(auth.user.email, newContacts);
    if (result) {
      setEmergencyContacts(newContacts);
      toast({ title: 'Contact removed', description: 'Emergency contact has been removed' });
    } else {
      toast({ title: 'Failed to remove contact', description: 'Please try again', variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-display">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and security preferences.</p>
        </div>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Security
            </CardTitle>
            <CardDescription>Manage your security settings and authentication methods.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Change Master Password */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Change Master Password
              </h4>
              <div className="grid gap-4 max-w-md">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <PasswordInput placeholder="Enter current password" value={currentPwd} onChange={(e) => setCurrentPwd((e.target as HTMLInputElement).value)} />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <PasswordInput placeholder="Enter new password" value={newPwd} onChange={(e) => setNewPwd((e.target as HTMLInputElement).value)} />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <PasswordInput placeholder="Confirm new password" value={confirmPwd} onChange={(e) => setConfirmPwd((e.target as HTMLInputElement).value)} />
                </div>
                <Button className="w-fit" onClick={async () => {
                  if (newPwd !== confirmPwd) return toast({ title: "Passwords don't match", description: 'Please confirm your new password', variant: 'destructive' });
                  if (!auth.user) return toast({ title: 'Not signed in', variant: 'destructive' });
                  const ok = await auth.updatePassword?.(auth.user.email, currentPwd, newPwd);
                  if (ok) {
                    toast({ title: 'Password updated', description: 'Your master password was updated' });
                    notifications.add('Password updated', 'Master password changed');
                    setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
                  } else {
                    toast({ title: 'Update failed', description: 'Current password is incorrect', variant: 'destructive' });
                  }
                }}>Update Password</Button>
              </div>
            </div>

            <Separator />

            {/* MFA */}
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Multi-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security with TOTP or hardware keys.</p>
                </div>
              </div>
              <Switch
                  checked={mfaEnabled}
                  onCheckedChange={async (val) => {
                    setMfaEnabled(val as boolean);
                    if (!auth.user) return;
                    await updateFlags(auth.user.email, { mfaEnabled: !!val });
                    toast({ title: 'MFA Updated', description: `Multi-factor authentication ${val ? 'enabled' : 'disabled'}` });
                  }}
                />
            </div>

            <Separator />

            {/* Biometric */}
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Fingerprint className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Biometric Login</h4>
                  <p className="text-sm text-muted-foreground">Use Face ID, Touch ID, or Windows Hello to unlock your vault.</p>
                </div>
              </div>
              <Switch
                  checked={biometricEnabled}
                  onCheckedChange={async (val) => {
                    setBiometricEnabled(val as boolean);
                    if (!auth.user) return;
                    if (val) {
                      try {
                        const opts = await webauthnRegisterOptions(auth.user.email);
                        if (!opts) throw new Error('Unable to get options');
                        // convert challenge to ArrayBuffer
                        const decode = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
                        const publicKey: any = {
                          ...opts,
                          challenge: decode(opts.challenge),
                          user: { ...opts.user, id: decode(opts.user.id) }
                        };
                        const cred: any = await (navigator.credentials as any).create({ publicKey });
                        const id = btoa(String.fromCharCode(...new Uint8Array(cred.rawId))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
                        await webauthnRegisterVerify(auth.user.email, id);
                        await updateFlags(auth.user.email, { biometricEnabled: true });
                        localStorage.setItem('webauthn_email', auth.user.email);
                        toast({ title: 'Biometric Enabled', description: 'Biometric login registered' });
                      } catch (err) {
                        setBiometricEnabled(false);
                        toast({ title: 'Biometric Failed', description: 'Unable to register biometric', variant: 'destructive' });
                      }
                    } else {
                      await updateFlags(auth.user.email, { biometricEnabled: false });
                      localStorage.removeItem('webauthn_email');
                      toast({ title: 'Biometric Disabled', description: 'Biometric login disabled' });
                    }
                  }}
                />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Data Management
            </CardTitle>
            <CardDescription>Export or import your password data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <Download className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <h4 className="font-medium">Export Passwords</h4>
                    <p className="text-xs text-muted-foreground">Download encrypted backup</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={handleExport}>
                  Export Data
                </Button>
              </div>
              <div className="p-4 rounded-xl border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Upload className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Import Passwords</h4>
                    <p className="text-xs text-muted-foreground">From CSV or other managers</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={handleImport}>
                  Import Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Access */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Emergency Access
            </CardTitle>
            <CardDescription>Grant trusted contacts access to your vault in emergencies.</CardDescription>
          </CardHeader>
          <CardContent>
            {emergencyContacts.length === 0 ? (
              <div className="p-6 rounded-xl bg-muted/50 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h4 className="font-medium mb-2">No emergency contacts</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Add trusted contacts who can request access to your vault in case of emergency.
                </p>
                <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Emergency Contact
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Emergency Contact</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact-name">Name</Label>
                        <Input
                          id="contact-name"
                          placeholder="Contact name"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-phone">Phone Number</Label>
                        <Input
                          id="contact-phone"
                          placeholder="Phone number"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddContactOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddEmergencyContact}>
                          Add Contact
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Emergency Contacts</h4>
                  <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Contact
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Emergency Contact</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="contact-name">Name</Label>
                          <Input
                            id="contact-name"
                            placeholder="Contact name"
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contact-phone">Phone Number</Label>
                          <Input
                            id="contact-phone"
                            placeholder="Phone number"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsAddContactOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAddEmergencyContact}>
                            Add Contact
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="space-y-2">
                  {emergencyContacts.map((contact, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Phone className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-sm text-muted-foreground">{contact.phone}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveEmergencyContact(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">Preferences</CardTitle>
            <CardDescription>Customize your SecurePass experience.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Theme */}
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  {theme === 'dark' ? (
                    <Moon className="h-5 w-5 text-primary" />
                  ) : (
                    <Sun className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium">Theme</h4>
                  <p className="text-sm text-muted-foreground">
                    Currently using {theme} mode
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={toggleTheme}>
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </Button>
            </div>

            <Separator />

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts for security issues and breaches
                  </p>
                </div>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-lg font-display text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions. Proceed with caution.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-xl bg-destructive/5 border border-destructive/20">
              <div>
                <h4 className="font-medium">Delete Account</h4>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all data.</p>
              </div>
              <Button variant="destructive" onClick={handleDeleteAccount}>Delete Account</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
