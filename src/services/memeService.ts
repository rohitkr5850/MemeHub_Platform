import axios from 'axios';
import { API_URL } from '../config/constants';

// Types
export interface Meme {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  creator: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  tags: string[];
  upvotes: number;
  downvotes: number;
  comments: Comment[];
  views: number;
  createdAt: string;
}

export interface Comment {
  _id: string;
  text: string;
  user: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  createdAt: string;
}

interface MemeCreateData {
  title: string;
  description?: string;
  imageData: string;
  tags: string[];
}

interface TimeFrame {
  value: '24h' | 'week' | 'month' | 'all';
  label: string;
}

export const TIME_FRAMES: TimeFrame[] = [
  { value: '24h', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' },
];

export const getMemes = async (
  page: number = 1,
  limit: number = 10,
  sort: string = 'new',
  timeFrame: '24h' | 'week' | 'month' | 'all' = 'all',
  tag?: string
) => {
  try {
    const response = await axios.get(`${API_URL}/api/memes`, {
      params: { page, limit, sort, timeFrame, tag },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching memes', error);
    throw error;
  }
};

export const getMemeById = async (id: string) => {
  try {
    const response = await axios.get(`${API_URL}/api/memes/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching meme', error);
    throw error;
  }
};

export const createMeme = async (memeData: MemeCreateData) => {
  try {
    const response = await axios.post(`${API_URL}/api/memes`, memeData);
    return response.data;
  } catch (error) {
    console.error('Error creating meme', error);
    throw error;
  }
};

export const upvoteMeme = async (id: string) => {
  try {
    const response = await axios.post(`${API_URL}/api/memes/${id}/upvote`);
    return response.data;
  } catch (error) {
    console.error('Error upvoting meme', error);
    throw error;
  }
};

export const downvoteMeme = async (id: string) => {
  try {
    const response = await axios.post(`${API_URL}/api/memes/${id}/downvote`);
    return response.data;
  } catch (error) {
    console.error('Error downvoting meme', error);
    throw error;
  }
};

export const addComment = async (id: string, text: string) => {
  try {
    const response = await axios.post(`${API_URL}/api/memes/${id}/comments`, { text });
    return response.data;
  } catch (error) {
    console.error('Error adding comment', error);
    throw error;
  }
};

export const getUserMemes = async (userId: string, page: number = 1, limit: number = 10, sort: string = 'new') => {
  try {
    const response = await axios.get(`${API_URL}/api/users/${userId}/memes`, {
      params: { page, limit, sort },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user memes', error);
    throw error;
  }
};

export const getUserStats = async (userId: string) => {
  try {
    const response = await axios.get(`${API_URL}/api/users/${userId}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user stats', error);
    throw error;
  }
};

export const deleteMeme = async (id: string) => {
  try {
    const response = await axios.delete(`${API_URL}/api/memes/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting meme', error);
    throw error;
  }
};

export const getTrendingTags = async (limit: number = 10) => {
  try {
    const response = await axios.get(`${API_URL}/api/memes/trending-tags`, {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching trending tags', error);
    throw error;
  }
};

export const getAICaption = async (imageData: string) => {
  try {
    const response = await axios.post(`${API_URL}/api/ai/generate-caption`, { imageData });
    return response.data;
  } catch (error) {
    console.error('Error generating AI caption', error);
    throw error;
  }
};

export const getLeaderboard = async (timeFrame: '24h' | 'week' | 'month' | 'all' = 'week') => {
  try {
    const response = await axios.get(`${API_URL}/api/users/leaderboard`, {
      params: { timeFrame },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching leaderboard', error);
    throw error;
  }
};