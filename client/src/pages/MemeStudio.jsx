import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Image, Wand2, Tag, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { createMeme, getAICaption } from '../services/memeService';
import { DEFAULT_TEMPLATES, MEME_CATEGORIES } from '../config/constants';

/* Convert URL*/
async function urlToBase64(url) {
  const res = await fetch(url);
  const blob = await res.blob();

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

const MemeStudio = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: { tags: [] }
  });

  /*Image Uploader Handler*/
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result);
      setSelectedTemplate(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    maxSize: 5 * 1024 * 1024,
    multiple: false
  });

  /* template-select*/
  const handleTemplateSelect = (templateUrl) => {
    setSelectedTemplate(templateUrl);
    setSelectedImage(null);
  };

  /*AI Caption Generator*/
  const handleGenerateCaption = async () => {
    if (!selectedImage && !selectedTemplate) {
      showToast('Please select or upload an image first', 'warning');
      return;
    }

    try {
      setIsGeneratingCaption(true);

      let imageData = selectedImage
        ? selectedImage
        : await urlToBase64(selectedTemplate);

      const response = await getAICaption(imageData);

      if (response.captions?.length > 0) {
        setValue('title', response.captions[0]);
        if (response.captions[1]) setValue('description', response.captions[1]);
      }
    } catch (error) {
      showToast('Failed to generate caption', 'error');
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  //SUBMIT MEME
  const onSubmit = async (data) => {
    if (!selectedImage && !selectedTemplate) {
      showToast('Please select or upload an image', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);

      const imageData = selectedImage
        ? selectedImage
        : await urlToBase64(selectedTemplate);

      await createMeme({ ...data, imageData });

      showToast('Meme created successfully!', 'success');
      navigate('/');
    } catch (error) {
      showToast('Failed to create meme', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTags = watch('tags') || [];

  const toggleTag = (tag) => {
    setValue(
      'tags',
      selectedTags.includes(tag)
        ? selectedTags.filter((t) => t !== tag)
        : [...selectedTags, tag]
    );
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
          {/* Upload / Templates Section */}
          <div>
            <h2 className="text-lg font-medium mb-4">Choose Your Image</h2>

            {/* Upload Box */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-500'
              }`}
            >
              <input {...getInputProps()} />

              <Image className="w-12 h-12 mx-auto mb-4 text-gray-400" />

              <p className="text-sm mb-2">
                {isDragActive ? 'Drop your image here' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-xs text-gray-500">JPG, PNG, GIF, WEBP · Max 5MB</p>
            </div>

            {/* Templates */}
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Or choose a template:</h3>

              <div className="grid grid-cols-2 gap-2">
                {DEFAULT_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTemplateSelect(t.url)}
                    className={`p-2 rounded-lg border transition-all ${
                      selectedTemplate === t.url
                        ? 'border-primary-500 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-primary-500'
                    }`}
                  >
                    <img
                      src={t.url}
                      alt={t.name}
                      className="w-full h-24 object-cover rounded"
                    />
                    <p className="text-xs mt-1 truncate">{t.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Title */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Title</label>
                  <button
                    type="button"
                    onClick={handleGenerateCaption}
                    disabled={isGeneratingCaption || (!selectedImage && !selectedTemplate)}
                    className="text-xs text-primary-500 hover:text-primary-600 disabled:opacity-50 flex items-center"
                  >
                    <Wand2 size={12} className="mr-1" />
                    Generate with AI
                  </button>
                </div>

                <input
                  {...register('title', { required: 'Title is required' })}
                  className={`w-full rounded-md border text-black ${
                    errors.title ? 'border-error-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter a funny title"
                />
                {errors.title && (
                  <p className="text-sm text-error-500">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium mb-2">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 text-black"
                  placeholder="Add some context..."
                />
              </div>

              {/* Tags */}
              <div>
                <label className="text-sm font-medium mb-2 flex items-center">
                  <Tag size={14} className="mr-1" /> Tags
                </label>

                <div className="flex flex-wrap gap-2">
                  {MEME_CATEGORIES.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedTags.includes(tag)
                          ? 'bg-primary-500 text-white'
                          : 'bg-base-300 hover:bg-base-200'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              {/* Submit */}
<button
  type="submit"
  disabled={isSubmitting || (!selectedImage && !selectedTemplate)}
  className="w-full mt-6 flex items-center justify-center px-4 py-2 rounded-md text-white 
             bg-gradient-to-r from-primary-500 to-secondary-500 
             hover:shadow-lg active:scale-[0.98] transition-all duration-200 
             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 
             disabled:opacity-50"
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

        {/* Preview */}
        {(selectedImage || selectedTemplate) && (
          <div className="mt-8">
            <h2 className="text-lg font-medium mb-4">Preview</h2>
            <div className="max-w-2xl mx-auto">
              <img
                src={selectedImage || selectedTemplate}
                alt="Preview"
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
