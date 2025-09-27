
import type { ChatMessage } from '../types';

const CHAT_PREFIX = 'shellhacks_chat_';

export function getMessages(teamId: string): ChatMessage[] {
  const messagesJSON = localStorage.getItem(`${CHAT_PREFIX}${teamId}`);
  return messagesJSON ? JSON.parse(messagesJSON) : [];
}

export function sendMessage(teamId: string, messageData: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
  const existingMessages = getMessages(teamId);
  
  const newMessage: ChatMessage = {
    ...messageData,
    id: Date.now(),
    timestamp: new Date().toISOString(),
  };

  const updatedMessages = [...existingMessages, newMessage];
  localStorage.setItem(`${CHAT_PREFIX}${teamId}`, JSON.stringify(updatedMessages));

  return newMessage;
}