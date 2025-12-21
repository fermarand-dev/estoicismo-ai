
export interface StoicMessage {
  id: string;
  title: string;
  message: string;
  reflection: string;
  exercise: string;
  date: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  title: string;
}

export interface AuthUser {
  email: string;
  uid: string;
  name?: string;
}

export interface UserState {
  authUser: AuthUser | null;
  isPremium: boolean;
  messageCount: number;
  history: StoicMessage[];
  journal: JournalEntry[];
}

export type AppView = 'today' | 'history' | 'journal' | 'premium';
