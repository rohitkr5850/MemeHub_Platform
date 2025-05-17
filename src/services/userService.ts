import axios from 'axios';
import { API_URL } from '../config/constants';

interface UpdateProfileData {
  username?: string;
  bio?: string;
  profilePicture?: string;
}

export const updateUserProfile = async (data: UpdateProfileData) => {
  try {
    const response = await axios.put(`${API_URL}/api/users/me`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};