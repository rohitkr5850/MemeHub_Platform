import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { User, Camera, Save } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { updateUserProfile } from '../services/userService';

const Profile = () => {
  const { user, checkAuth } = useAuth();
  const { showToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(user?.profilePicture || null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      username: user?.username || '',
      bio: user?.bio || ''
    }
  });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      let imageData = undefined;

      if (data.profilePicture && data.profilePicture[0]) {
        const file = data.profilePicture[0];
        const reader = new FileReader();
        imageData = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      }

      await updateUserProfile({
        username: data.username,
        bio: data.bio,
        profilePicture: imageData
      });

      await checkAuth();
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to update profile';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="bg-base-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden"
      >
        {/* Animated*/}
        <div className="absolute inset-0 rounded-2xl border border-transparent bg-gradient-to-r from-primary/40 via-secondary/40 to-primary/40 opacity-20 pointer-events-none"></div>

        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ rotate: -10, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center mb-2"
          >
            <User className="w-8 h-8 mr-2 text-primary-500" />
            <h1 className="text-2xl font-display font-bold">Edit Profile</h1>
          </motion.div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 italic">
            Update your profile details below
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Profile Picture */}
          <div className="flex flex-col items-center">
            <div className="relative group cursor-pointer transition-transform duration-300 hover:scale-105">
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-primary-500/10 to-primary-300/20 flex items-center justify-center overflow-hidden shadow-inner ring-4 ring-primary-100/20">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Profile preview"
                    className="w-full h-full object-cover transition-opacity duration-300"
                  />
                ) : (
                  <div className="text-4xl font-semibold text-primary-400">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <label
                htmlFor="profilePicture"
                className="absolute bottom-0 right-0 p-2 bg-primary-500 rounded-full text-white shadow-lg hover:bg-primary-600 transition-colors"
                title="Upload a new profile picture"
              >
                <Camera size={18} />
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
            <p className="mt-2 text-sm text-base-content/70 italic">
              Click the camera icon to change your profile picture
            </p>
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1">
              Username
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                id="username"
                type="text"
                {...register('username', {
                  required: 'Username is required',
                  minLength: { value: 3, message: 'Minimum 3 characters' },
                  maxLength: { value: 20, message: 'Maximum 20 characters' },
                  pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Only letters, numbers, and underscores' },
                })}
                aria-invalid={errors.username ? 'true' : 'false'}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border shadow-sm transition-colors text-black focus:outline-none focus:ring-2 ${
                  errors.username
                    ? 'border-error-500 focus:ring-error-300'
                    : 'border-gray-300 focus:ring-primary-300'
                }`}
                placeholder="Your username"
              />
            </div>
            {errors.username && (
              <p className="text-xs text-error-500">{errors.username.message}</p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              {...register('bio', { maxLength: { value: 160, message: 'Max 160 characters' } })}
              rows={4}
              className={`w-full px-4 py-2 rounded-lg border shadow-sm transition-colors text-black focus:outline-none focus:ring-2 ${
                errors.bio
                  ? 'border-error-500 focus:ring-error-300'
                  : 'border-gray-300 focus:ring-primary-300'
              }`}
              placeholder="Tell us about yourself..."
            />
            {errors.bio && (
              <p className="text-xs text-error-500">{errors.bio.message}</p>
            )}
            <p className="text-xs text-base-content/70">
              {160 - (watch('bio')?.length || 0)} characters remaining
            </p>
          </div>

          {/* Submit Button */}
          <motion.button
  whileTap={{ scale: 0.97 }}
  whileHover={{ scale: 1.02 }}
  type="submit"
  disabled={isSubmitting}
  className="w-full flex items-center justify-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
>
  {isSubmitting ? (
    <div className="flex items-center justify-center">
      <LoadingSpinner size="sm" color="text-white" />
      <span className="ml-2">Updating...</span>
    </div>
  ) : (
    <div className="flex items-center justify-center">
      {/* Swap Save for CheckCircle or SaveAll */}
      <Save className="w-5 h-5 mr-2" />
      <span>Save Changes</span>
    </div>
  )}
</motion.button>

        </form>
      </motion.div>
    </div>
  );
};

export default Profile;
