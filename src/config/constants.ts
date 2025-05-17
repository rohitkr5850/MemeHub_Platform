// API URL - Change this when deploying
export const API_URL = 'http://localhost:5000';

// Meme Categories
export const MEME_CATEGORIES = [
  'funny',
  'gaming',
  'animals',
  'reaction',
  'technology',
  'sports',
  'movies',
  'music',
  'politics',
  'relatable',
];

// Default Meme Templates
export const DEFAULT_TEMPLATES = [
  { 
    id: 'drake',
    name: 'Drake Hotline Bling', 
    url: 'https://imgflip.com/s/meme/Drake-Hotline-Bling.jpg'
  },
  { 
    id: 'distracted',
    name: 'Distracted Boyfriend', 
    url: 'https://imgflip.com/s/meme/Distracted-Boyfriend.jpg'
  },
  { 
    id: 'button',
    name: 'Two Buttons', 
    url: 'https://imgflip.com/s/meme/Two-Buttons.jpg'
  },
  { 
    id: 'change',
    name: 'Change My Mind', 
    url: 'https://imgflip.com/s/meme/Change-My-Mind.jpg'
  },
  { 
    id: 'doge',
    name: 'Doge', 
    url: 'https://imgflip.com/s/meme/Doge.jpg'
  },
];

// Badge definitions
export const BADGES = {
  FIRST_UPLOAD: {
    name: 'First Upload',
    description: 'Successfully uploaded your first meme',
    icon: 'upload-cloud'
  },
  VIRAL_POST: {
    name: 'Viral Sensation',
    description: 'One of your memes got over a hundred upvotes',
    icon: 'trending-up'
  },
  COMMENT_KING: {
    name: 'Comment King',
    description: 'Received 50 comments on your memes',
    icon: 'message-square'
  },
  PROLIFIC_CREATOR: {
    name: 'Prolific Creator',
    description: 'Created 10 or more memes',
    icon: 'image'
  },
  WEEKLY_WINNER: {
    name: 'Weekly Winner',
    description: 'Had the top meme of the week',
    icon: 'award'
  }
};