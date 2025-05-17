import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { User, Camera, Mail, Save } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { updateUserProfile } from '../services/userService';

interface ProfileFormData {
  username: string;
  bio: string;
  profilePicture?: FileList;
}

const Profile = () => {
  const { user, checkAuth } = useAuth();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(user?.profilePicture || null);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ProfileFormData>({
    defaultValues: {
      username: user?.username || '',
      bio: user?.bio || '',
    },
  });
  
  const profilePicture = watch('profilePicture');
  
  // Handle image preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSubmitting(true);
      
      let imageData = undefined;
      if (data.profilePicture?.[0]) {
        const reader = new FileReader();
        imageData = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(data.profilePicture[0]);
        });
      }
      
      await updateUserProfile({
        username: data.username,
        bio: data.bio,
        profilePicture: imageData as string | undefined,
      });
      
      await checkAuth();
      showToast('Profile updated successfully!', 'success');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-base-100 rounded-lg shadow-lg p-6"
      >
        <div className="flex items-center mb-6">
          <User className="w-6 h-6 mr-2 text-primary-500" />
          <h1 className="text-2xl font-bold">Edit Profile</h1>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-base-300 overflow-hidden">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <label
                htmlFor="profilePicture"
                className="absolute bottom-0 right-0 p-2 bg-primary-500 rounded-full text-white cursor-pointer hover:bg-primary-600 transition-colors"
              >
                <Camera size={20} />
              </label>
              <input
                id="profilePicture"
                type="file"
                {...register('profilePicture')}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Click the camera icon to upload a new profile picture
            </p>
          </div>
          
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-gray-400" />
              </div>
              <input
                id="username"
                type="text"
                {...register('username', {
                  required: 'Username is required',
                  minLength: {
                    value: 3,
                    message: 'Username must be at least 3 characters'
                  },
                  maxLength: {
                    value: 20,
                    message: 'Username must be less than 20 characters'
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: 'Username can only contain letters, numbers, and underscores'
                  }
                })}
                className={`w-full pl-10 pr-3 py-2 rounded-md border focus:ring focus:ring-opacity-50 focus:outline-none ${
                  errors.username ? 'border-error-500 focus:ring-error-200' : 'border-gray-300 focus:ring-primary-200 focus:border-primary-500'
                }`}
              />
            </div>
            {errors.username && (
              <p className="mt-1 text-sm text-error-500">{errors.username.message}</p>
            )}
          </div>
          
          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              {...register('bio', {
                maxLength: {
                  value: 160,
                  message: 'Bio must be less than 160 characters'
                }
              })}
              rows={4}
              className={`w-full px-3 py-2 rounded-md border focus:ring focus:ring-opacity-50 focus:outline-none ${
                errors.bio ? 'border-error-500 focus:ring-error-200' : 'border-gray-300 focus:ring-primary-200 focus:border-primary-500'
              }`}
              placeholder="Tell us about yourself..."
            />
            {errors.bio && (
              <p className="mt-1 text-sm text-error-500">{errors.bio.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {160 - (watch('bio')?.length || 0)} characters remaining
            </p>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary-500 text-white py-2 rounded-md hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <LoadingSpinner size="sm" color="text-white" />
                <span className="ml-2">Updating...</span>
              </div>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                Save Changes
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Profile;