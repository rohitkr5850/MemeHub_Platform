import express from 'express';
import auth from '../middleware/auth.js';

const router = express.Router();

// Mock AI caption generator (simulated for demo purposes)
router.post('/generate-caption', auth, async (req, res) => {
  try {
    const { imageData } = req.body;
    
    if (!imageData) {
      return res.status(400).json({ message: 'Image data is required' });
    }
    
    // Here you would normally call an AI API for caption generation
    // For demo purposes, we'll return mock captions
    const mockCaptions = [
      'When you realize it\'s only Tuesday',
      'That moment when your code finally works',
      'Nobody: \nAbsolutely nobody: \nMe at 3am:',
      'When the weekend is finally here',
      'How I think I look vs. how I actually look',
      'My brain during an important meeting',
      'Me explaining my job to my parents',
      'When someone asks if I\'m okay',
      'My last brain cell trying to function',
      'Internet explorer trying to keep up with other browsers',
    ];
    
    // Randomly select 3 captions
    const shuffled = mockCaptions.sort(() => 0.5 - Math.random());
    const selectedCaptions = shuffled.slice(0, 3);
    
    // Simulate API delay
    setTimeout(() => {
      res.status(200).json({
        captions: selectedCaptions,
      });
    }, 1000);
  } catch (error) {
    console.error('Error generating caption:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mock AI tag generator
router.post('/generate-tags', auth, async (req, res) => {
  try {
    const { imageData, caption } = req.body;
    
    if (!imageData && !caption) {
      return res.status(400).json({ message: 'Image data or caption is required' });
    }
    
    // Mock tags based on common meme categories
    const mockTags = [
      'funny', 'relatable', 'tech', 'programming', 'work', 
      'school', 'monday', 'weekend', 'gaming', 'food',
      'animals', 'cats', 'dogs', 'reaction', 'fail',
      'success', 'movies', 'tv', 'anime', 'sports'
    ];
    
    // Randomly select 3-5 tags
    const tagCount = Math.floor(Math.random() * 3) + 3; // 3 to 5 tags
    const shuffled = mockTags.sort(() => 0.5 - Math.random());
    const selectedTags = shuffled.slice(0, tagCount);
    
    // Simulate API delay
    setTimeout(() => {
      res.status(200).json({
        tags: selectedTags,
      });
    }, 800);
  } catch (error) {
    console.error('Error generating tags:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;