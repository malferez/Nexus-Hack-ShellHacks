
import React, { useState } from 'react';
import type { User } from '../types';
import * as authService from '../services/authService';
import { getProjectIdeas } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';

interface AuthProps {
  onLoginSuccess: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    major: '',
    academicYear: 'Freshman' as User['academicYear'],
    skills: '',
    interests: '',
    projectIdea: '',
    profilePictureUrl: '',
    isOpenToTeams: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onloadend = () => {
              setFormData(prev => ({ ...prev, profilePictureUrl: reader.result as string }));
          }
          reader.readAsDataURL(file);
      }
  }

  const handleGenerateIdeas = async () => {
    if (!formData.skills && !formData.interests) {
      setError('Please enter some skills or interests to generate ideas.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const ideas = await getProjectIdeas(formData.skills, formData.interests);
      if (ideas && ideas.length > 0) {
        setFormData(prev => ({ ...prev, projectIdea: "- " + ideas.join('\n- ') }));
      }
    } catch (e) {
      setError('Failed to generate ideas. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      let user;
      if (isLoginView) {
        user = authService.login(formData.email, formData.password);
      } else {
        const { email, password, ...profileData } = formData;
        user = authService.registerUser({
            ...profileData,
            email,
            password,
            skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        });
      }
      onLoginSuccess(user);
    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unknown error occurred.');
        }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-shell-card p-8 rounded-lg shadow-2xl">
      <h2 className="text-3xl font-bold text-shell-text mb-2">{isLoginView ? 'Login' : 'Create Your Profile'}</h2>
      <p className="text-shell-text-secondary mb-6">
        {isLoginView ? 'Welcome back, hacker!' : 'Join ShellHacks to find your dream team.'}
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-shell-text-secondary mb-1">Email Address</label>
          <input type="email" name="email" id="email" required value={formData.email} onChange={handleInputChange} className="w-full bg-shell-bg border border-fiu-blue rounded-md p-2 text-shell-text focus:ring-shell-accent focus:border-shell-accent" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-shell-text-secondary mb-1">Password</label>
          <input type="password" name="password" id="password" required value={formData.password} onChange={handleInputChange} className="w-full bg-shell-bg border border-fiu-blue rounded-md p-2 text-shell-text focus:ring-shell-accent focus:border-shell-accent" />
        </div>

        {!isLoginView && (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-shell-text-secondary mb-1">Full Name</label>
                        <input type="text" name="name" id="name" required value={formData.name} onChange={handleInputChange} className="w-full bg-shell-bg border border-fiu-blue rounded-md p-2 text-shell-text focus:ring-shell-accent focus:border-shell-accent" />
                    </div>
                    <div>
                        <label htmlFor="major" className="block text-sm font-medium text-shell-text-secondary mb-1">Major / Area of Study</label>
                        <input type="text" name="major" id="major" required value={formData.major} onChange={handleInputChange} className="w-full bg-shell-bg border border-fiu-blue rounded-md p-2 text-shell-text focus:ring-shell-accent focus:border-shell-accent" />
                    </div>
                </div>
                <div>
                  <label htmlFor="academicYear" className="block text-sm font-medium text-shell-text-secondary mb-1">Academic Year</label>
                  <select name="academicYear" id="academicYear" required value={formData.academicYear} onChange={handleInputChange} className="w-full bg-shell-bg border border-fiu-blue rounded-md p-2 text-shell-text focus:ring-shell-accent focus:border-shell-accent">
                    <option>Freshman</option>
                    <option>Sophomore</option>
                    <option>Junior</option>
                    <option>Senior</option>
                    <option>Graduate</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="skills" className="block text-sm font-medium text-shell-text-secondary mb-1">Skills (comma-separated)</label>
                  <input type="text" name="skills" id="skills" required placeholder="e.g., React, Python, Figma" value={formData.skills} onChange={handleInputChange} className="w-full bg-shell-bg border border-fiu-blue rounded-md p-2 text-shell-text focus:ring-shell-accent focus:border-shell-accent" />
                </div>
                <div>
                  <label htmlFor="interests" className="block text-sm font-medium text-shell-text-secondary mb-1">Hobbies & Interests</label>
                  <textarea name="interests" id="interests" rows={3} required value={formData.interests} onChange={handleInputChange} className="w-full bg-shell-bg border border-fiu-blue rounded-md p-2 text-shell-text focus:ring-shell-accent focus:border-shell-accent"></textarea>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label htmlFor="projectIdea" className="block text-sm font-medium text-shell-text-secondary">Project Ideas</label>
                        <button type="button" onClick={handleGenerateIdeas} disabled={isLoading} className="text-sm text-shell-accent hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                           {isLoading && !error ? <><LoadingSpinner className="w-4 h-4 mr-2" /> Generating...</> : '✨ Get AI Ideas'}
                        </button>
                    </div>
                  <textarea name="projectIdea" id="projectIdea" rows={4} value={formData.projectIdea} onChange={handleInputChange} className="w-full bg-shell-bg border border-fiu-blue rounded-md p-2 text-shell-text focus:ring-shell-accent focus:border-shell-accent" placeholder="Describe a project you'd like to build, or use the AI generator!"></textarea>
                </div>
                 <div>
                    <label htmlFor="profilePicture" className="block text-sm font-medium text-shell-text-secondary mb-1">Profile Picture (Optional)</label>
                    <input type="file" name="profilePicture" id="profilePicture" onChange={handleFileChange} accept="image/*" className="w-full text-sm text-shell-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-shell-accent file:text-shell-bg hover:file:bg-opacity-80" />
                </div>
            </>
        )}
        
        {error && <p className="text-red-400 text-sm mt-1 text-center">{error}</p>}
        
        <button type="submit" disabled={isLoading} className="w-full bg-fiu-blue text-white font-bold py-3 px-4 rounded-md hover:bg-fiu-gold transition-colors duration-300 disabled:bg-gray-500 flex justify-center items-center">
            {isLoading ? <LoadingSpinner /> : (isLoginView ? 'Login' : 'Create Profile & Find Team')}
        </button>
      </form>
      <div className="mt-6 text-center">
        <button onClick={() => {setIsLoginView(!isLoginView); setError(null);}} className="text-sm text-shell-accent hover:underline">
          {isLoginView ? "Don't have an account? Sign up" : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
};

export default Auth;
