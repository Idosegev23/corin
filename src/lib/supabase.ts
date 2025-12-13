import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dubdsrgoojmlznwjxyxw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1YmRzcmdvb2ptbHpud2p4eXh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMzY0MDksImV4cCI6MjA3NjYxMjQwOX0.nB6O7QXm6aSpiD8aHZUu6fHrTndrMtPe76Ih-oJUGN0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for Corrin chatbot tables
export interface ChatSession {
  id: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface SupportRequest {
  id: string;
  brand: string;
  customer_name: string;
  order_number: string | null;
  problem: string;
  phone: string;
  status: 'open' | 'resolved';
  whatsapp_sent: boolean;
  created_at: string;
  resolved_at: string | null;
}

// Helper functions for chat sessions
export async function createChatSession(): Promise<ChatSession | null> {
  const { data, error } = await supabase
    .from('corrin_chat_sessions')
    .insert({})
    .select()
    .single();
  
  if (error) {
    console.error('Error creating chat session:', error);
    return null;
  }
  return data;
}

export async function saveChatMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<ChatMessage | null> {
  const { data, error } = await supabase
    .from('corrin_chat_messages')
    .insert({ session_id: sessionId, role, content })
    .select()
    .single();
  
  if (error) {
    console.error('Error saving chat message:', error);
    return null;
  }

  return data;
}

// Helper functions for support requests
export async function createSupportRequest(
  data: Omit<SupportRequest, 'id' | 'created_at' | 'resolved_at' | 'status' | 'whatsapp_sent'>
): Promise<SupportRequest | null> {
  const { data: result, error } = await supabase
    .from('corrin_support_requests')
    .insert(data)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating support request:', error);
    return null;
  }
  return result;
}

export async function updateSupportRequestStatus(
  id: string,
  status: 'open' | 'resolved'
): Promise<boolean> {
  const { error } = await supabase
    .from('corrin_support_requests')
    .update({ 
      status, 
      resolved_at: status === 'resolved' ? new Date().toISOString() : null 
    })
    .eq('id', id);
  
  if (error) {
    console.error('Error updating support request:', error);
    return false;
  }
  return true;
}

export async function markWhatsAppSent(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('corrin_support_requests')
    .update({ whatsapp_sent: true })
    .eq('id', id);
  
  if (error) {
    console.error('Error marking WhatsApp sent:', error);
    return false;
  }
  return true;
}
