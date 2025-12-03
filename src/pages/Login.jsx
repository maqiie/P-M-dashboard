import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  AlertCircle, 
  User, 
  ArrowLeft, 
  Shield,
  CheckCircle,
  Phone
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';





function Login() {
  const { login, register, forgotPassword, verifyOtp, resendOtp } = useAuth();
  const location = useLocation();
const navigate = useNavigate();

useEffect(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('confirmed') === 'true') {
    toast.success('Email confirmed successfully! You can now log in.', {
      duration: 5000, // auto-dismiss after 5 seconds
      position: 'top-right',
    });

    // Remove query param for clean URL
    navigate(location.pathname, { replace: true });
  }
}, [location, navigate]);

  
  // Auth mode state
  const [authMode, setAuthMode] = useState('signin'); // signin, signup, forgot, otp
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    otp: ''
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [otpTimer, setOtpTimer] = useState(0);

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (authMode !== 'otp') {
      if (!formData.email) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Please enter a valid email';
      }
    }
    
    if (authMode === 'signin' || authMode === 'signup') {
      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
    }
    
    if (authMode === 'signup') {
      if (!formData.name) {
        errors.name = 'Name is required';
      }
      
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    if (authMode === 'otp') {
      if (!formData.otp) {
        errors.otp = 'OTP is required';
      } else if (formData.otp.length !== 6) {
        errors.otp = 'OTP must be 6 digits';
      }
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear messages
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      switch (authMode) {
        case 'signin':
          const loginResult = await login(formData.email, formData.password);
          if (loginResult.requiresOtp) {
            setAuthMode('otp');
            setSuccess('Please enter the OTP sent to your device');
            startOtpTimer();
          } else {
            // FIXED: Check user.role from the nested user object
            const userRole = loginResult.user?.role;
            console.log('Login Result:', loginResult);
            console.log('User role after login:', userRole);
            
            if (userRole === 'admin') {
              console.log('Redirecting to admin dashboard');
              navigate('/admin/dashboard');
            } else {
              console.log('Redirecting to user dashboard');
              navigate('/dashboard');
            }
          }
          break;
          
        case 'signup':
          await register({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            password_confirmation: formData.confirmPassword
          });
          setSuccess('Account created successfully! Please sign in.');
          setAuthMode('signin');
          setFormData(prev => ({ ...prev, password: '', confirmPassword: '', name: '' }));
          break;
          
        case 'forgot':
          await forgotPassword(formData.email);
          setSuccess('Password reset instructions sent to your email');
          setTimeout(() => setAuthMode('signin'), 3000);
          break;
          
        case 'otp':
          const otpResult = await verifyOtp(formData.otp);
          setSuccess('OTP verified successfully!');
          
          // FIXED: Check user.role from the nested user object only
          const userRole = otpResult.user?.role;
          console.log('OTP Result:', otpResult);
          console.log('User role after OTP:', userRole);
          
          if (userRole === 'admin') {
            console.log('Redirecting to admin dashboard');
            navigate('/admin/dashboard');
          } else {
            console.log('Redirecting to user dashboard');
            navigate('/dashboard');
          }
          break;
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startOtpTimer = () => {
    setOtpTimer(60);
    const timer = setInterval(() => {
      setOtpTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOtp = async () => {
    try {
      setIsLoading(true);
      await resendOtp();
      setSuccess('OTP resent successfully');
      startOtpTimer();
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const getFormConfig = () => {
    switch (authMode) {
      case 'signin':
        return {
          title: 'Welcome Back',
          subtitle: 'Sign in to your construction dashboard',
          buttonText: 'Sign In',
          icon: Lock
        };
      case 'signup':
        return {
          title: 'Join Our Team',
          subtitle: 'Create your construction management account',
          buttonText: 'Create Account',
          icon: User
        };
      case 'forgot':
        return {
          title: 'Reset Password',
          subtitle: 'Enter your email to reset your password',
          buttonText: 'Send Reset Link',
          icon: Mail
        };
      case 'otp':
        return {
          title: 'Verify Your Identity',
          subtitle: 'Enter the OTP sent to your device',
          buttonText: 'Verify OTP',
          icon: Shield
        };
      default:
        return {
          title: 'Welcome Back',
          subtitle: 'Sign in to your account',
          buttonText: 'Sign In',
          icon: Lock
        };
    }
  };

  const config = getFormConfig();
  const IconComponent = config.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-12 relative">
        <Toaster /> 

      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-purple-500/5 to-transparent"></div>
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative max-w-md w-full">
        {/* Floating Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          
          {/* Header with Gradient */}
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-8 text-center">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              {/* Back Button for non-signin modes */}
              {authMode !== 'signin' && (
                <button
                  onClick={() => {
                    setAuthMode('signin');
                    setError('');
                    setSuccess('');
                    setFormData({ email: '', password: '', confirmPassword: '', name: '', otp: '' });
                  }}
                  className="absolute left-0 top-0 p-2 text-white/80 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              
              {/* Logo/Icon */}
              <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                <IconComponent className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {config.title}
              </h2>
              <p className="text-blue-100 text-sm">
                {config.subtitle}
              </p>
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3 animate-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">Error</h4>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Success Alert */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3 animate-in slide-in-from-top-2 duration-300">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-green-800">Success</h4>
                  <p className="text-sm text-green-700 mt-1">{success}</p>
                </div>
              </div>
            )}

            {/* Name Field - Only for signup */}
            {authMode === 'signup' && (
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className={`h-5 w-5 transition-colors ${
                      fieldErrors.name ? 'text-red-400' : 'text-gray-400 group-focus-within:text-blue-500'
                    }`} />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl text-gray-900 placeholder-gray-500 
                      focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200
                      ${fieldErrors.name 
                        ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                        : 'border-gray-300 focus:ring-blue-500 focus:bg-white hover:border-gray-400'
                      }`}
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                {fieldErrors.name && (
                  <p className="text-sm text-red-600 animate-in slide-in-from-left-2 duration-200">
                    {fieldErrors.name}
                  </p>
                )}
              </div>
            )}

            {/* Email Field - Not for OTP */}
            {authMode !== 'otp' && (
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className={`h-5 w-5 transition-colors ${
                      fieldErrors.email ? 'text-red-400' : 'text-gray-400 group-focus-within:text-blue-500'
                    }`} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl text-gray-900 placeholder-gray-500 
                      focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200
                      ${fieldErrors.email 
                        ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                        : 'border-gray-300 focus:ring-blue-500 focus:bg-white hover:border-gray-400'
                      }`}
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-sm text-red-600 animate-in slide-in-from-left-2 duration-200">
                    {fieldErrors.email}
                  </p>
                )}
              </div>
            )}

            {/* OTP Field - Only for OTP mode */}
            {authMode === 'otp' && (
              <div className="space-y-2">
                <label htmlFor="otp" className="block text-sm font-semibold text-gray-700">
                  Verification Code
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className={`h-5 w-5 transition-colors ${
                      fieldErrors.otp ? 'text-red-400' : 'text-gray-400 group-focus-within:text-blue-500'
                    }`} />
                  </div>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="6"
                    required
                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl text-gray-900 placeholder-gray-500 text-center text-lg tracking-widest
                      focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200
                      ${fieldErrors.otp 
                        ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                        : 'border-gray-300 focus:ring-blue-500 focus:bg-white hover:border-gray-400'
                      }`}
                    placeholder="000000"
                    value={formData.otp}
                    onChange={(e) => handleInputChange('otp', e.target.value.replace(/\D/g, ''))}
                    disabled={isLoading}
                  />
                </div>
                {fieldErrors.otp && (
                  <p className="text-sm text-red-600 animate-in slide-in-from-left-2 duration-200">
                    {fieldErrors.otp}
                  </p>
                )}
                
                {/* Resend OTP */}
                <div className="text-center">
                  {otpTimer > 0 ? (
                    <p className="text-sm text-gray-600">
                      Resend OTP in {otpTimer} seconds
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Password Field - For signin and signup */}
            {(authMode === 'signin' || authMode === 'signup') && (
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 transition-colors ${
                      fieldErrors.password ? 'text-red-400' : 'text-gray-400 group-focus-within:text-blue-500'
                    }`} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'}
                    required
                    className={`block w-full pl-10 pr-12 py-3 border rounded-xl text-gray-900 placeholder-gray-500 
                      focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200
                      ${fieldErrors.password 
                        ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                        : 'border-gray-300 focus:ring-blue-500 focus:bg-white hover:border-gray-400'
                      }`}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-sm text-red-600 animate-in slide-in-from-left-2 duration-200">
                    {fieldErrors.password}
                  </p>
                )}
              </div>
            )}

            {/* Confirm Password Field - Only for signup */}
            {authMode === 'signup' && (
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 transition-colors ${
                      fieldErrors.confirmPassword ? 'text-red-400' : 'text-gray-400 group-focus-within:text-blue-500'
                    }`} />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className={`block w-full pl-10 pr-12 py-3 border rounded-xl text-gray-900 placeholder-gray-500 
                      focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200
                      ${fieldErrors.confirmPassword 
                        ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                        : 'border-gray-300 focus:ring-blue-500 focus:bg-white hover:border-gray-400'
                      }`}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-sm text-red-600 animate-in slide-in-from-left-2 duration-200">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Remember Me & Forgot Password - Only for signin */}
            {authMode === 'signin' && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 font-medium">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <button 
                    type="button"
                    onClick={() => setAuthMode('forgot')}
                    className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white 
                transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                ${isLoading
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                }`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                <>
                  <span>{config.buttonText}</span>
                  <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
                </>
              )}
            </button>

            {/* Mode Switching Links */}
            <div className="space-y-3">
              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    {authMode === 'signin' ? 'New to our platform?' : authMode === 'signup' ? 'Already have an account?' : 'Back to'}
                  </span>
                </div>
              </div>

              {/* Auth Mode Links */}
              <div className="text-center space-y-2">
                {authMode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setAuthMode('signup')}
                    className="w-full text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200"
                  >
                    Create New Account
                  </button>
                )}
                
                {authMode === 'signup' && (
                  <button
                    type="button"
                    onClick={() => setAuthMode('signin')}
                    className="w-full text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200"
                  >
                    Sign In Instead
                  </button>
                )}

                {(authMode === 'forgot' || authMode === 'otp') && (
                  <button
                    type="button"
                    onClick={() => setAuthMode('signin')}
                    className="w-full text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200"
                  >
                    Back to Sign In
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer Text */}
        <div className="text-center mt-8">
          <p className="text-sm text-white/60">
            Secure construction project management platform
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;