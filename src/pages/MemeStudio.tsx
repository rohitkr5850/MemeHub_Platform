import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Image, Upload, Wand2, Tag, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { createMeme, getAICaption } from '../services/memeService';
import { DEFAULT_TEMPLATES, MEME_CATEGORIES } from '../config/constants';

interface MemeFormData {
  title: string;
  description?: string;
  tags: string[];
}

const MemeStudio = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<MemeFormData>({
    defaultValues: {
      tags: [],
    },
  });
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setSelectedTemplate(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
    maxSize: 5242880, // 5MB
    multiple: false,
  });
  
  const handleTemplateSelect = (templateUrl: string) => {
    setSelectedTemplate(templateUrl);
    setSelectedImage(null);
  };
  
  const handleGenerateCaption = async () => {
    if (!selectedImage && !selectedTemplate) {
      showToast('Please select or upload an image first', 'warning');
      return;
    }
    
    try {
      setIsGeneratingCaption(true);
      const imageData = selectedImage || selectedTemplate;
      const response = await getAICaption(imageData!);
      
      if (response.captions && response.captions.length > 0) {
        setValue('title', response.captions[0]);
        if (response.captions[1]) {
          setValue('description', response.captions[1]);
        }
      }
    } catch (error) {
      showToast('Failed to generate caption', 'error');
    } finally {
      setIsGeneratingCaption(false);
    }
  };
  
  const onSubmit = async (data: MemeFormData) => {
    if (!selectedImage && !selectedTemplate) {
      showToast('Please select or upload an image', 'warning');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const imageData = selectedImage || selectedTemplate;
      await createMeme({
        ...data,
        imageData: imageData!,
      });
      
      showToast('Meme created successfully!', 'success');
      navigate('/');
    } catch (error) {
      showToast('Failed to create meme', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const selectedTags = watch('tags');
  
  const toggleTag = (tag: string) => {
    const currentTags = selectedTags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    setValue('tags', newTags);
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-base-100 rounded-lg shadow-lg p-6"
      >
        <h1 className="text-2xl font-bold mb-6">Create Your Meme</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image Upload Section */}
          <div>
            <h2 className="text-lg font-medium mb-4">Choose Your Image</h2>
            
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-500'
              }`}
            >
              <input {...getInputProps()} />
              <Image className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-sm mb-2">
                {isDragActive
                  ? 'Drop your image here'
                  : 'Drag & drop an image, or click to select'}
              </p>
              <p className="text-xs text-gray-500">
                Supports: JPG, PNG, GIF (max 5MB)
              </p>
            </div>
            
            {/* Template Selection */}
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Or choose a template:</h3>
              <div className="grid grid-cols-2 gap-2">
                {DEFAULT_TEMPLATES.map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.url)}
                    className={`p-2 rounded-lg border transition-all ${
                      selectedTemplate === template.url
                        ? 'border-primary-500 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-primary-500'
                    }`}
                  >
                    <img
                      src={template.url}
                      alt={template.name}
                      className="w-full h-24 object-cover rounded"
                    />
                    <p className="text-xs mt-1 truncate">{template.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Meme Details Form */}
          <div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="title" className="block text-sm font-medium">
                    Title
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateCaption}
                    disabled={isGeneratingCaption || (!selectedImage && !selectedTemplate)}
                    className="inline-flex items-center text-xs text-primary-500 hover:text-primary-600 disabled:opacity-50"
                  >
                    <Wand2 size={12} className="mr-1" />
                    Generate with AI
                  </button>
                </div>
                <input
                  id="title"
                  type="text"
                  {...register('title', { required: 'Title is required' })}
                  className={`w-full rounded-md border focus:ring focus:ring-opacity-50 ${
                    errors.title
                      ? 'border-error-500 focus:ring-error-200'
                      : 'border-gray-300 focus:ring-primary-200 focus:border-primary-500'
                  }`}
                  placeholder="Give your meme a catchy title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-error-500">{errors.title.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  {...register('description')}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 focus:ring focus:ring-primary-200 focus:border-primary-500 focus:ring-opacity-50"
                  placeholder="Add some context to your meme..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  <div className="flex items-center">
                    <Tag size={14} className="mr-1" />
                    Tags
                  </div>
                </label>
                <div className="flex flex-wrap gap-2">
                  {MEME_CATEGORIES.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedTags?.includes(tag)
                          ? 'bg-primary-500 text-white'
                          : 'bg-base-300 hover:bg-base-200'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting || (!selectedImage && !selectedTemplate)}
                className="w-full mt-6 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" color="text-white" />
                    <span className="ml-2">Creating...</span>
                  </div>
                ) : (
                  <>
                    <Send size={18} className="mr-2" />
                    Publish Meme
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
        
        {/* Preview Section */}
        {(selectedImage || selectedTemplate) && (
          <div className="mt-8">
            <h2 className="text-lg font-medium mb-4">Preview</h2>
            <div className="max-w-2xl mx-auto">
              <img
                src={selectedImage || selectedTemplate!}
                alt="Meme preview"
                className="w-full rounded-lg shadow-md"
              />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MemeStudio;