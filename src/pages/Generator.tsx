import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Copy, RefreshCw, Save, Check } from 'lucide-react';
import { generatePassword, calculatePasswordStrength } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { readVault, writeVault } from '@/lib/storage';
import { useNotifications } from '@/contexts/NotificationContext';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const Generator = () => {
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });

  const passwordStrength = calculatePasswordStrength(password);
  const auth = useAuth();
  const notifications = useNotifications();

  useEffect(() => {
    handleGenerate();
  }, []);

  const handleGenerate = () => {
    const newPassword = generatePassword(options);
    setPassword(newPassword);
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Password copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToVault = () => {
    const u = auth.user;
    if (!u) {
      toast({ title: 'Not signed in', description: 'Please login to save to your vault', variant: 'destructive' });
      return;
    }
    const existing = readVault(u.id);
    const newEntry = {
      id: Date.now().toString(),
      website: 'Generated Password',
      url: '',
      username: '',
      password,
      icon: '🔐',
      category: 'Generated',
      createdAt: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      strength: calculatePasswordStrength(password).strength,
    };
    writeVault(u.id, [newEntry, ...existing]);
    toast({ title: "Saved!", description: "Password has been saved to your vault." });
    notifications.add('Password saved', 'Generated password saved to vault');
  };

  const updateOption = (key: keyof typeof options, value: boolean | number) => {
    const newOptions = { ...options, [key]: value };
    setOptions(newOptions);
    
    // Auto-regenerate when options change
    if (typeof value === 'boolean') {
      const newPassword = generatePassword(newOptions);
      setPassword(newPassword);
      setCopied(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold font-display">Password Generator</h1>
          <p className="text-muted-foreground mt-1">Create strong, unique passwords instantly.</p>
        </div>

        {/* Generated Password Display */}
        <Card className="overflow-hidden">
          <div className="p-6 gradient-primary">
            <div className="flex items-center justify-between gap-4 bg-background/10 backdrop-blur-sm rounded-xl p-4">
              <code className="text-lg md:text-2xl font-mono text-primary-foreground break-all flex-1">
                {password}
              </code>
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="glass"
                  size="icon"
                  onClick={handleCopy}
                  className="bg-background/20 hover:bg-background/30 text-primary-foreground"
                >
                  {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                </Button>
                <Button
                  variant="glass"
                  size="icon"
                  onClick={handleGenerate}
                  className="bg-background/20 hover:bg-background/30 text-primary-foreground"
                >
                  <RefreshCw className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
          
          <CardContent className="p-6">
            {/* Strength Meter */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Password Strength</span>
                <span className={cn(
                  "text-sm font-bold capitalize",
                  passwordStrength.strength === 'weak' && "text-destructive",
                  passwordStrength.strength === 'medium' && "text-warning",
                  passwordStrength.strength === 'strong' && "text-success"
                )}>
                  {passwordStrength.strength}
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-500 rounded-full",
                    passwordStrength.strength === 'weak' && "w-1/3 bg-destructive",
                    passwordStrength.strength === 'medium' && "w-2/3 bg-warning",
                    passwordStrength.strength === 'strong' && "w-full bg-success"
                  )}
                />
              </div>
            </div>

            {/* Length Slider */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base">Password Length</Label>
                <span className="text-2xl font-bold font-display text-primary">{options.length}</span>
              </div>
              <Slider
                value={[options.length]}
                onValueChange={([value]) => {
                  updateOption('length', value);
                  const newPassword = generatePassword({ ...options, length: value });
                  setPassword(newPassword);
                  setCopied(false);
                }}
                min={8}
                max={64}
                step={1}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>8</span>
                <span>64</span>
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <Label htmlFor="uppercase" className="cursor-pointer">Uppercase (A-Z)</Label>
                <Switch
                  id="uppercase"
                  checked={options.uppercase}
                  onCheckedChange={(checked) => updateOption('uppercase', checked)}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <Label htmlFor="lowercase" className="cursor-pointer">Lowercase (a-z)</Label>
                <Switch
                  id="lowercase"
                  checked={options.lowercase}
                  onCheckedChange={(checked) => updateOption('lowercase', checked)}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <Label htmlFor="numbers" className="cursor-pointer">Numbers (0-9)</Label>
                <Switch
                  id="numbers"
                  checked={options.numbers}
                  onCheckedChange={(checked) => updateOption('numbers', checked)}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <Label htmlFor="symbols" className="cursor-pointer">Symbols (!@#$)</Label>
                <Switch
                  id="symbols"
                  checked={options.symbols}
                  onCheckedChange={(checked) => updateOption('symbols', checked)}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-8">
              <Button variant="outline" className="flex-1" onClick={handleGenerate}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
              <Button variant="hero" className="flex-1" onClick={handleSaveToVault}>
                <Save className="h-4 w-4 mr-2" />
                Save to Vault
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">Password Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                Use at least 16 characters for maximum security
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                Include a mix of uppercase, lowercase, numbers, and symbols
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                Never reuse passwords across different accounts
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                Store your passwords securely in SecurePass vault
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Generator;
