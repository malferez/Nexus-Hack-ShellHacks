
import React from 'react';
import type { User } from '../types';
import { Avatar } from './Avatar';

interface HeaderProps {
  currentUser: User | null;
  setView: (view: 'dashboard' | 'profile' | 'teamChat' | 'projectIdeaGenerator') => void;
}


const Header: React.FC<HeaderProps> = ({ currentUser, setView }) => {
  return (
    <header className="bg-shell-card shadow-lg">
      <div className="container mx-auto px-4 sm:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => currentUser && setView('dashboard')}>
          <svg className="w-8 h-8 text-shell-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          <h1 className="text-xl md:text-2xl font-bold text-shell-text">
            ShellHacks Team Finder
          </h1>
        </div>
        
        {currentUser && (
          <nav className="flex items-center space-x-4">
            <button onClick={() => setView('dashboard')} className="text-shell-text-secondary hover:text-shell-accent transition-colors">Home</button>
            <button onClick={() => setView('projectIdeaGenerator')} className="text-shell-text-secondary hover:text-shell-accent transition-colors">Idea Generator</button>
            <button onClick={() => setView('teamChat')} className="text-shell-text-secondary hover:text-shell-accent transition-colors">My Team</button>
            <button onClick={() => setView('profile')} className="flex items-center space-x-2 text-shell-text-secondary hover:text-shell-accent transition-colors">
              <Avatar src={currentUser.profilePictureUrl} name={currentUser.name} size="sm" />
              <span className="hidden sm:inline">My Profile</span>
            </button>
          </nav>
        )}

        {!currentUser && (
             <div className="text-right">
                <p className="font-semibold text-fiu-gold hidden sm:block">Florida International University</p>
                <p className="text-sm text-shell-text-secondary hidden sm:block">Official Hackathon</p>
            </div>
        )}
      </div>
    </header>
  );
};

export default Header;
