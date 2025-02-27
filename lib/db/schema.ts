export interface User {
  id: string;  // Stytch user ID (text format)
  email: string;
  created_at?: string;
}

export interface Chat {
  id: string;  // UUID
  title: string;
  userId: string;  // Stytch user ID (text format)
  model: string;
  visibility: 'public' | 'private';
  created_at?: string;
}

export interface Message {
  id: string;  // UUID
  chatId: string;  // UUID
  content: string;
  role: 'user' | 'agent';
  created_at?: string;
}
