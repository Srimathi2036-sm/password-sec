import type { Password } from './mockData';

const VAULT_PREFIX = 'sp_vault_';

export function getVaultKey(userId: string) {
  return `${VAULT_PREFIX}${userId}`;
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function getSessionToken() {
  try {
    const s = localStorage.getItem('session');
    if (!s) return null;
    const parsed = JSON.parse(s);
    return parsed.token || null;
  } catch {
    return null;
  }
}

export function readVault(userId: string): Password[] {
  try {
    const raw = localStorage.getItem(getVaultKey(userId));
    const local = raw ? JSON.parse(raw) : [];
    // async refresh from server
    (async () => {
      const token = getSessionToken();
      if (!token) return;
      try {
        const res = await fetch(`${API}/vault`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const data = await res.json();
        const entries = data.entries || [];
        // map server entries into local Password shape minimally
        const mapped = entries.map((e: any) => ({ id: e._id, website: e.websiteName, url: '', username: e.siteUsername, password: '', icon: '', category: '', createdAt: '', lastModified: '', strength: 'medium', tokenId: e.tokenId }));
        localStorage.setItem(getVaultKey(userId), JSON.stringify(mapped));
        window.dispatchEvent(new Event('vault:updated'));
      } catch (e) {
        // ignore
      }
    })();
    return local;
  } catch {
    return [];
  }
}

export function writeVault(userId: string, passwords: Password[]) {
  try {
    localStorage.setItem(getVaultKey(userId), JSON.stringify(passwords));
  } catch {
    // ignore
  }
  // try to sync new entries to server
  (async () => {
    const token = getSessionToken();
    if (!token) return;
    for (const p of passwords) {
      try {
        // if tokenId missing, create server entry
        if (!(p as any).tokenId) {
          await fetch(`${API}/vault`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ websiteName: p.website, siteUsername: p.username, sitePassword: p.password }) });
        }
      } catch (e) {
        // continue
      }
    }
  })();
}

export function exportVault(userId: string): string {
  // prefer server export when available
  const token = getSessionToken();
  if (!token) return JSON.stringify(readVault(userId), null, 2);
  // fallback: return local cached and trigger async download via fetch
  (async () => {
    try {
      const res = await fetch(`${API}/import/export/json`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      // server will send JSON; store it in localStorage
      const json = await res.json();
      localStorage.setItem(getVaultKey(userId), JSON.stringify(json));
    } catch (e) {
      // ignore
    }
  })();
  return JSON.stringify(readVault(userId), null, 2);
}
