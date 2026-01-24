export interface Password {
  id: string;
  website: string;
  url: string;
  username: string;
  password: string;
  icon: string;
  category: string;
  createdAt: string;
  lastModified: string;
  strength: 'weak' | 'medium' | 'strong';
}

export interface SecureNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export const mockPasswords: Password[] = [
  {
    id: '1',
    website: 'Google',
    url: 'https://google.com',
    username: 'john.doe@gmail.com',
    password: 'G00gl3P@ss!2024',
    icon: '🔍',
    category: 'Social',
    createdAt: '2024-01-15',
    lastModified: '2024-03-20',
    strength: 'strong',
  },
  {
    id: '2',
    website: 'Instagram',
    url: 'https://instagram.com',
    username: 'johndoe_official',
    password: 'Insta#Secure99',
    icon: '📸',
    category: 'Social',
    createdAt: '2024-02-10',
    lastModified: '2024-03-15',
    strength: 'strong',
  },
  {
    id: '3',
    website: 'LinkedIn',
    url: 'https://linkedin.com',
    username: 'john.doe@work.com',
    password: 'Link3dIn!Pro',
    icon: '💼',
    category: 'Work',
    createdAt: '2024-01-20',
    lastModified: '2024-02-28',
    strength: 'strong',
  },
  {
    id: '4',
    website: 'LeetCode',
    url: 'https://leetcode.com',
    username: 'coder_john',
    password: 'L33tC0d3!',
    icon: '💻',
    category: 'Development',
    createdAt: '2024-03-01',
    lastModified: '2024-03-10',
    strength: 'medium',
  },
  {
    id: '5',
    website: 'GitHub',
    url: 'https://github.com',
    username: 'john-developer',
    password: 'GitH@b2024!Sec',
    icon: '🐙',
    category: 'Development',
    createdAt: '2024-01-05',
    lastModified: '2024-03-18',
    strength: 'strong',
  },
  {
    id: '6',
    website: 'Netflix',
    url: 'https://netflix.com',
    username: 'johndoe@email.com',
    password: 'netflix123',
    icon: '🎬',
    category: 'Entertainment',
    createdAt: '2023-12-15',
    lastModified: '2024-01-10',
    strength: 'weak',
  },
  {
    id: '7',
    website: 'Amazon',
    url: 'https://amazon.com',
    username: 'john.shopper@gmail.com',
    password: 'Am@zon$hop2024',
    icon: '🛒',
    category: 'Shopping',
    createdAt: '2024-02-20',
    lastModified: '2024-03-12',
    strength: 'strong',
  },
  {
    id: '8',
    website: 'Twitter/X',
    url: 'https://x.com',
    username: '@johndoe',
    password: 'Tw1tt3r!',
    icon: '🐦',
    category: 'Social',
    createdAt: '2024-01-25',
    lastModified: '2024-02-15',
    strength: 'medium',
  },
];

export const mockSecureNotes: SecureNote[] = [
  {
    id: '1',
    title: 'WiFi Password - Home',
    content: 'Network: HomeWiFi_5G\nPassword: MySecureWiFi2024!',
    createdAt: '2024-01-10',
  },
  {
    id: '2',
    title: 'Recovery Codes - Google',
    content: '1234-5678-9012\n3456-7890-1234\n5678-9012-3456',
    createdAt: '2024-02-15',
  },
  {
    id: '3',
    title: 'API Keys',
    content: 'OpenAI: sk-proj-xxxxx\nStripe: sk_test_xxxxx',
    createdAt: '2024-03-01',
  },
];

export const securityStats = {
  totalPasswords: 8,
  strongPasswords: 5,
  mediumPasswords: 2,
  weakPasswords: 1,
  reusedPasswords: 0,
  oldPasswords: 2,
  breachedPasswords: 0,
  healthScore: 85,
};

export const generatePassword = (options: {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}): string => {
  let chars = '';
  if (options.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (options.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (options.numbers) chars += '0123456789';
  if (options.symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';
  
  let password = '';
  for (let i = 0; i < options.length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export const calculatePasswordStrength = (password: string): { strength: 'weak' | 'medium' | 'strong'; score: number } => {
  let score = 0;
  
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  
  if (score <= 3) return { strength: 'weak', score: Math.round((score / 7) * 100) };
  if (score <= 5) return { strength: 'medium', score: Math.round((score / 7) * 100) };
  return { strength: 'strong', score: Math.round((score / 7) * 100) };
};
