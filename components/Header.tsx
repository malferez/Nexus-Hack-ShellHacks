
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-shell-card shadow-lg">
      <div className="container mx-auto px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <svg className="w-8 h-8 text-shell-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          <h1 className="text-2xl font-bold text-shell-text">
            ShellHacks Team Finder
          </h1>
        </div>
        <div className="text-right">
          <p className="font-semibold text-fiu-gold">Florida International University</p>
          <p className="text-sm text-shell-text-secondary">Official Hackathon</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
