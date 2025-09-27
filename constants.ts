
import type { User } from './types';

export const TEAM_SIZE_LIMIT = 4;

export const MOCK_USERS: User[] = [
  {
    id: 1,
    name: 'Elena Rodriguez',
    major: 'Computer Science',
    skills: ['Python', 'Machine Learning', 'Data Analysis', 'Flask'],
    interests: 'AI for social good, hiking, indie music.',
    projectIdea: 'An app that uses ML to identify plant diseases from photos.'
  },
  {
    id: 2,
    name: 'Ben Carter',
    major: 'Electrical Engineering',
    skills: ['Arduino', 'C++', 'IoT', 'Circuit Design'],
    interests: 'Building custom hardware, robotics, playing guitar.',
    projectIdea: 'A smart home device that monitors energy consumption and suggests savings.'
  },
  {
    id: 3,
    name: 'Aisha Khan',
    major: 'UX/UI Design',
    skills: ['Figma', 'User Research', 'Prototyping', 'HTML/CSS'],
    interests: 'Creating accessible designs, digital art, learning new languages.',
    projectIdea: 'Redesigning a local non-profit\'s website to improve user engagement.'
  },
  {
    id: 4,
    name: 'Carlos Gomez',
    major: 'Computer Science',
    skills: ['JavaScript', 'React', 'Node.js', 'Firebase'],
    interests: 'Web3, video games, watching soccer.',
    projectIdea: 'A decentralized application for tracking personal carbon footprint.'
  },
  {
    id: 5,
    name: 'Samantha Lee',
    major: 'Data Science',
    skills: ['R', 'Tableau', 'SQL', 'Statistics'],
    interests: 'Data visualization, cooking, running marathons.',
    projectIdea: 'An interactive dashboard visualizing city crime data to find patterns.'
  },
  {
    id: 6,
    name: 'David Chen',
    major: 'Cybersecurity',
    skills: ['Network Security', 'Penetration Testing', 'Python', 'Linux'],
    interests: 'Ethical hacking, CTF competitions, sci-fi movies.',
    projectIdea: 'A tool to scan smart contracts for common vulnerabilities.'
  },
  {
      id: 7,
      name: 'Maria Garcia',
      major: 'Software Engineering',
      skills: ['Java', 'Spring Boot', 'AWS', 'Docker'],
      interests: 'Backend systems, cloud architecture, salsa dancing.',
      projectIdea: 'A scalable microservice backend for a food delivery startup.'
  },
  {
      id: 8,
      name: 'Leo Petrov',
      major: 'Computer Graphics',
      skills: ['Unity', 'C#', 'Blender', 'Shader Programming'],
      interests: 'Game development, 3D modeling, virtual reality.',
      projectIdea: 'An educational VR experience that takes users on a tour of ancient Rome.'
  }
];
