
const LoadingSpinner = ({ message = "Cargando...", size = "medium" }) => {
  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-16 h-16",
    large: "w-24 h-24"
  };

  const textSizes = {
    small: "text-sm",
    medium: "text-lg",
    large: "text-xl"
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
      {/* Animated Background */}
      <div className="relative">
        {/* Outer Ring */}
        <div className={`${sizeClasses[size]} rounded-full border-4 border-gray-200 animate-pulse`}></div>

        {/* Spinning Gradient Ring */}
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-4 border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-spin`}
          style={{
            background: 'conic-gradient(from 0deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)',
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), white 0)',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), white 0)'
          }}>
        </div>

        {/* Center Dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse shadow-lg"></div>
        </div>
      </div>

      {/* Loading Text */}
      <div className="mt-6 text-center">
        <p className={`${textSizes[size]} font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2`}>
          {message}
        </p>
        <div className="flex items-center justify-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-blue-400 rounded-full animate-ping opacity-75"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-3/4 w-1 h-1 bg-pink-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;