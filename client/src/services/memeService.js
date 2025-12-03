import axios from "axios";
import { API_URL } from "../config/constants";

//TIME FRAeMES
export const TIME_FRAMES = [
  { value: "24h", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All Time" },
];

//GET MEMES
export const getMemes = async (
  page = 1,
  limit = 10,
  sort = "new",
  timeFrame = "all",
  tag
) => {
  try {
    const response = await axios.get(`${API_URL}/api/memes`, {
      params: { page, limit, sort, timeFrame, tag },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching memes", error);
    throw error;
  }
};

//GET MEME BY IDD
export const getMemeById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/api/memes/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching meme", error);
    throw error;
  }
};

//CREATE MEME
export const createMeme = async (memeData) => {
  try {
    const response = await axios.post(`${API_URL}/api/memes`, memeData);
    return response.data;
  } catch (error) {
    console.error("Error creating meme", error);
    throw error;
  }
};

//UPVOTE MEME
export const upvoteMeme = async (id) => {
  try {
    const response = await axios.post(`${API_URL}/api/memes/${id}/upvote`);
    return response.data;
  } catch (error) {
    console.error("Error upvoting meme", error);
    throw error;
  }
};

//DOWNVOTE MEME
export const downvoteMeme = async (id) => {
  try {
    const response = await axios.post(`${API_URL}/api/memes/${id}/downvote`);
    return response.data;
  } catch (error) {
    console.error("Error downvoting meme", error);
    throw error;
  }
};

//ADD COMMENT
export const addComment = async (id, text) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/memes/${id}/comments`,
      { text }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding comment", error);
    throw error;
  }
};

//USER MEMES
export const getUserMemes = async (
  userId,
  page = 1,
  limit = 10,
  sort = "new"
) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/users/${userId}/memes`,
      {
        params: { page, limit, sort },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user memes", error);
    throw error;
  }
};

//USER STATS
export const getUserStats = async (userId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/users/${userId}/stats`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user stats", error);
    throw error;
  }
};

//DELETE MEME
export const deleteMeme = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/api/memes/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting meme", error);
    throw error;
  }
};

//GET TRENDING TAGS
export const getTrendingTags = async (limit = 10) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/memes/trending-tags`,
      {
        params: { limit },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching trending tags", error);
    throw error;
  }
};

//AI CAPTION
export const getAICaption = async (imageData) => {
  try {
    const cleanedBase64 = imageData.replace(
      /^data:image\/\w+;base64,/,
      ""
    );

    const response = await axios.post(
      `${API_URL}/api/ai/generate-caption`,
      { imageData: cleanedBase64 }
    );

    return response.data;
  } catch (error) {
    console.error("Error generating AI caption", error);
    throw error;
  }
};

//LEADERBOARD
export const getLeaderboard = async (timeFrame = "week") => {
  try {
    const response = await axios.get(
      `${API_URL}/api/users/leaderboard`,
      {
        params: { timeFrame },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching leaderboard", error);
    throw error;
  }
};
