import React, { useState } from 'react';
import type { User } from '../types';
import * as authService from '../services/authService';
import { Avatar } from './Avatar';
import { LoadingSpinner } from './LoadingSpinner';

interface ProfileProps {
    user: User;
    onUserUpdate: (user: User) => void;
    onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUserUpdate, onLogout }) => {
    const [formData, setFormData] = useState(user);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setSuccessMessage(null);
        try {
            const updatedUser = authService.updateUser({
                ...formData,
                // Fix: `formData.skills` can be a string at runtime after editing, but TypeScript
                // infers it as `string[]` from the initial state, causing a `never` type in the else branch.
                // `String(formData.skills)` handles both cases correctly.
                skills: Array.isArray(formData.skills) ? formData.skills : String(formData.skills).split(',').map(s => s.trim()).filter(Boolean),
            });
            onUserUpdate(updatedUser);
            setSuccessMessage("Profile updated successfully!");
        } catch (error) {
            console.error("Failed to update profile", error);
        } finally {
            setIsLoading(false);
            setTimeout(() => setSuccessMessage(null), 3000);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-shell-card p-8 rounded-lg shadow-2xl">
            <h2 className="text-3xl font-bold text-shell-text mb-6">My Profile</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="flex items-center space-x-6">
                    <Avatar src={formData.profilePictureUrl} name={formData.name} size="lg" />
                    <div>
                        <label htmlFor="profilePicture" className="block text-sm font-medium text-shell-text-secondary mb-1">Update Profile Picture</label>
                        <input type="file" name="profilePicture" id="profilePicture" onChange={handleFileChange} accept="image/*" className="w-full text-sm text-shell-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-shell-accent file:text-shell-bg hover:file:bg-opacity-80" />
                    </div>
                </div>

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
                    <label htmlFor="email" className="block text-sm font-medium text-shell-text-secondary mb-1">Email Address</label>
                    <input type="email" name="email" id="email" required value={formData.email} disabled className="w-full bg-gray-700 border border-fiu-blue rounded-md p-2 text-gray-400 cursor-not-allowed" />
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
                  <input type="text" name="skills" id="skills" required placeholder="e.g., React, Python, Figma" value={Array.isArray(formData.skills) ? formData.skills.join(', ') : formData.skills} onChange={handleInputChange} className="w-full bg-shell-bg border border-fiu-blue rounded-md p-2 text-shell-text focus:ring-shell-accent focus:border-shell-accent" />
                </div>
                 <div>
                  <label htmlFor="interests" className="block text-sm font-medium text-shell-text-secondary mb-1">Hobbies & Interests</label>
                  <textarea name="interests" id="interests" rows={3} required value={formData.interests} onChange={handleInputChange} className="w-full bg-shell-bg border border-fiu-blue rounded-md p-2 text-shell-text focus:ring-shell-accent focus:border-shell-accent"></textarea>
                </div>
                 <div>
                  <label htmlFor="projectIdea" className="block text-sm font-medium text-shell-text-secondary mb-1">Project Idea</label>
                  <textarea name="projectIdea" id="projectIdea" rows={4} value={formData.projectIdea} onChange={handleInputChange} className="w-full bg-shell-bg border border-fiu-blue rounded-md p-2 text-shell-text focus:ring-shell-accent focus:border-shell-accent"></textarea>
                </div>
                
                 <div className="flex items-center space-x-3 bg-shell-bg p-3 rounded-md">
                    <input type="checkbox" name="isOpenToTeams" id="isOpenToTeams" checked={formData.isOpenToTeams} onChange={handleInputChange} className="h-5 w-5 rounded bg-shell-bg border-fiu-blue text-shell-accent focus:ring-shell-accent" />
                    <label htmlFor="isOpenToTeams" className="font-medium text-shell-text">Open to new teams</label>
                </div>

                <div className="flex items-center justify-between mt-6">
                    <button type="button" onClick={onLogout} className="text-sm text-red-400 hover:underline">Sign Out</button>
                    <div className="flex items-center space-x-4">
                        {successMessage && <p className="text-green-400">{successMessage}</p>}
                        <button type="submit" disabled={isLoading} className="bg-fiu-blue text-white font-bold py-2 px-6 rounded-md hover:bg-fiu-gold transition-colors duration-300 disabled:bg-gray-500 flex items-center justify-center">
                            {isLoading ? <LoadingSpinner className="w-5 h-5"/> : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Profile;
