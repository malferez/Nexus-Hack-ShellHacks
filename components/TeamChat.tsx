
import React from 'react';
import type { User } from '../types';
import { Avatar } from './Avatar';

interface TeamChatProps {
    myTeam: User[];
}

const TeamChat: React.FC<TeamChatProps> = ({ myTeam }) => {
    return (
        <div className="max-w-4xl mx-auto bg-shell-card p-8 rounded-lg shadow-2xl">
            <h2 className="text-3xl font-bold text-shell-text mb-2">Team Chat & Collaboration</h2>
            <p className="text-shell-text-secondary mb-6">Coordinate with your teammates here. Full chat functionality coming soon!</p>
            
            <div className="bg-shell-bg p-4 rounded-lg">
                 <h3 className="text-xl font-semibold text-shell-accent mb-4">Your Current Team</h3>
                 <div className="space-y-3">
                     {myTeam.map(member => (
                         <div key={member.id} className="flex items-center space-x-4 p-2">
                             <Avatar src={member.profilePictureUrl} name={member.name} />
                             <div>
                                 <p className="font-bold text-shell-text">{member.name}</p>
                                 <p className="text-sm text-shell-text-secondary">{member.email}</p>
                             </div>
                         </div>
                     ))}
                 </div>
            </div>

            <div className="mt-8 text-center border-2 border-dashed border-gray-600 p-12 rounded-lg">
                <p className="text-shell-text-secondary">Imagine a beautiful, real-time chat interface here...</p>
                 <svg className="w-16 h-16 text-fiu-blue mx-auto mt-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            </div>
        </div>
    );
};

export default TeamChat;
