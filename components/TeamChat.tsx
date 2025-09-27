
import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { User, ChatMessage } from '../types';
import * as chatService from '../services/chatService';
import { Avatar } from './Avatar';

interface TeamChatProps {
    myTeam: User[];
    currentUser: User;
}

const TeamChat: React.FC<TeamChatProps> = ({ myTeam, currentUser }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const teamId = useMemo(() => {
        if (!myTeam || myTeam.length === 0) return null;
        // Create a stable, unique ID for the team chat room
        return myTeam.map(u => u.id).sort().join('-');
    }, [myTeam]);
    
    useEffect(() => {
        if (teamId) {
            const history = chatService.getMessages(teamId);
            setMessages(history);
        }
    }, [teamId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !teamId) return;

        const messageData = {
            sender: {
                id: currentUser.id,
                name: currentUser.name,
                profilePictureUrl: currentUser.profilePictureUrl,
            },
            text: newMessage,
        };

        const savedMessage = chatService.sendMessage(teamId, messageData);
        setMessages(prevMessages => [...prevMessages, savedMessage]);
        setNewMessage('');
    };

    return (
        <div className="max-w-4xl mx-auto bg-shell-card shadow-2xl rounded-lg flex flex-col h-[75vh]">
            <div className="p-4 border-b border-fiu-blue">
                <h2 className="text-2xl font-bold text-shell-text">Team Chat</h2>
                <p className="text-shell-text-secondary">
                    {myTeam.map(m => m.name).join(', ')}
                </p>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg) => {
                    const isCurrentUser = msg.sender.id === currentUser.id;
                    return (
                        <div key={msg.id} className={`flex items-end gap-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                            {!isCurrentUser && (
                                <Avatar src={msg.sender.profilePictureUrl} name={msg.sender.name} size="sm" />
                            )}
                            <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${isCurrentUser ? 'bg-fiu-blue' : 'bg-shell-bg'}`}>
                                {!isCurrentUser && <p className="text-xs font-bold text-shell-accent mb-1">{msg.sender.name}</p>}
                                <p className="text-shell-text text-sm">{msg.text}</p>
                                <p className="text-xs text-shell-text-secondary mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            {isCurrentUser && (
                                <Avatar src={msg.sender.profilePictureUrl} name={msg.sender.name} size="sm" />
                            )}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-fiu-blue">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-shell-bg border border-fiu-blue rounded-full py-2 px-4 text-shell-text focus:ring-shell-accent focus:border-shell-accent"
                        autoComplete="off"
                    />
                    <button type="submit" className="bg-shell-accent text-shell-bg font-bold rounded-full p-3 hover:bg-opacity-80 transition-colors duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TeamChat;
