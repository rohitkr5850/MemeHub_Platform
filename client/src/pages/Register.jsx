import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Laugh, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { GoogleLogin } from "@react-oauth/google";

const Register = () => {
  const { register: registerUser, googleLogin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const password = watch("password");

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      await registerUser(data.username, data.email, data.password);
      showToast("Account created successfully!", "success");
      navigate("/");
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "Registration failed. Please try again.";
      showToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-base-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden"
      >
        {/* Animate */}
        <div className="absolute inset-0 rounded-2xl border border-transparent bg-gradient-to-r from-primary/40 via-secondary/40 to-primary/40 opacity-20 pointer-events-none"></div>

        {/* Logo + Heading */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ rotate: -10, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center mb-2"
          >
            <Laugh className="h-8 w-8 mr-2 text-primary-500 animate-bounce" />
            <h1 className="text-2xl font-display font-bold">MemeHub</h1>
          </motion.div>
          <h2 className="text-xl font-semibold">Create an account</h2>
          <p className="text-sm text-gray-600 mt-1">
            Join the ultimate meme community
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* USERNAME */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1">
              Username
            </label>
            <div className="relative group">
              <User size={18} className="absolute left-3 top-2.5 text-gray-400 group-hover:text-primary transition-colors" />
              <input
                id="username"
                type="text"
                {...register("username", {
                  required: "Username is required",
                  minLength: { value: 3, message: "Username must be at least 3 characters" },
                  maxLength: { value: 20, message: "Username must be less than 20 characters" },
                  pattern: { value: /^[a-zA-Z0-9_]+$/, message: "Only letters, numbers, and underscores allowed" }
                })}
                className={`w-full pl-10 pr-3 py-2 rounded-lg border shadow-sm text-black focus:ring-2 focus:outline-none transition-all duration-200 ${
                  errors.username ? "border-error-500 focus:ring-error-300" : "border-gray-300 focus:ring-primary-300 focus:border-primary-500"
                }`}
                placeholder="memeMaster42"
              />
            </div>
            {errors.username && <p className="mt-1 text-sm text-error-500">{errors.username.message}</p>}
          </div>

          {/* EMAIL */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email Address
            </label>
            <div className="relative group">
              <Mail size={18} className="absolute left-3 top-2.5 text-gray-400 group-hover:text-primary transition-colors" />
              <input
                id="email"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email address" }
                })}
                className={`w-full pl-10 pr-3 py-2 rounded-lg border shadow-sm text-black focus:ring-2 focus:outline-none transition-all duration-200 ${
                  errors.email ? "border-error-500 focus:ring-error-300" : "border-gray-300 focus:ring-primary-300 focus:border-primary-500"
                }`}
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-error-500">{errors.email.message}</p>}
          </div>

          {/* PASSWORD */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <div className="relative group">
              <Lock size={18} className="absolute left-3 top-2.5 text-gray-400 group-hover:text-primary transition-colors" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" }
                })}
                className={`w-full pl-10 pr-10 py-2 rounded-lg border shadow-sm text-black focus:ring-2 focus:outline-none transition-all duration-200 ${
                  errors.password ? "border-error-500 focus:ring-error-300" : "border-gray-300 focus:ring-primary-300 focus:border-primary-500"
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-primary focus:outline-none transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-error-500">{errors.password.message}</p>}
          </div>

          {/* CONFIRM PASSWORD */}

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
              Confirm Password
            </label>
            <div className="relative group">
              <Lock size={18} className="absolute left-3 top-2.5 text-gray-400 group-hover:text-primary transition-colors" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) => value === password || "Passwords do not match"
                })}
                className={`w-full pl-10 pr-10 py-2 rounded-lg border shadow-sm text-black focus:ring-2 focus:outline-none transition-all duration-200 ${
                  errors.confirmPassword ? "border-error-500 focus:ring-error-300" : "border-gray-300 focus:ring-primary-300 focus:border-primary-500"
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-primary focus:outline-none transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-sm text-error-500">{errors.confirmPassword.message}</p>}
          </div>

          {/* SUBMIT BUTTON */}



          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            type="submit"
                        className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" color="text-white" />
                <span className="ml-2">Creating account...</span>
              </div>
            ) : (
              "Create Account"
            )}
          </motion.button>

          <div className="relative my-6 flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="px-3 text-gray-500 text-sm font-medium">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* GOOGLE SIGNUP */}
          <motion.div whileHover={{ scale: 1.03 }} className="w-full flex justify-center mt-2">
            <GoogleLogin
              onSuccess={async (response) => {
                try {
                  if (!response.credential) {
                    showToast("Google signup failed", "error");
                    return;
                  }
                  await googleLogin(response.credential);
                  showToast("Signed up with Google!", "success");
                  navigate("/");
                } catch (err) {
                  showToast("Google signup failed", "error");
                }
              }}
              onError={() => showToast("Google signup failed", "error")}
            />
          </motion.div>

          {/* FOOTER */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary-500 hover:text-primary-600 font-semibold underline-offset-2 hover:underline transition-colors"
              >
                Login
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
