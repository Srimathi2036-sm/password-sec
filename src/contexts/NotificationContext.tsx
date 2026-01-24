import React, { createContext, useContext, useEffect, useState } from 'react';

export type NotificationItem = {
  id: string;
  title: string;
  body?: string;
  createdAt: string;
  read?: boolean;
};

const KEY = 'sp_notifications_v1';

function readAll(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(items: NotificationItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

const NotificationContext = createContext<{
  notifications: NotificationItem[];
  add: (title: string, body?: string) => void;
  markRead: (id: string) => void;
  clear: () => void;
} | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => readAll());

  useEffect(() => {
    writeAll(notifications);
  }, [notifications]);

  useEffect(() => {
    const onStorage = () => setNotifications(readAll());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const add = (title: string, body?: string) => {
    const n: NotificationItem = {
      id: Date.now().toString(),
      title,
      body,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [n, ...prev]);
  };

  const markRead = (id: string) => setNotifications(prev => prev.map(p => p.id === id ? { ...p, read: true } : p));

  const clear = () => setNotifications([]);

  return (
    <NotificationContext.Provider value={{ notifications, add, markRead, clear }}>
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
