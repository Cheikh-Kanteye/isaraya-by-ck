import { useEffect, useState } from "react";

const NotFound = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    console.error("404 Error: Page not found");

    // Fade in animation
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const messages = [
    "Page not found",
    "Lost in space",
    "Nothing here",
    "Path unknown",
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div
        className={`text-center transition-all duration-1000 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Simple Character */}
        <div className="mb-12">
          <div className="w-24 h-24 mx-auto mb-6 relative">
            {/* Minimalist character */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl animate-bounce-slow">◕_◕</div>
            </div>
          </div>
        </div>

        {/* Clean 404 */}
        <div className="mb-8">
          <h1 className="text-8xl font-light text-primary mb-2 tracking-wider">
            404
          </h1>
          <div className="w-16 h-0.5 bg-primary/80 mx-auto mb-6"></div>
        </div>

        {/* Minimal Message */}
        <div className="mb-12">
          <p className="text-lg text-foreground font-light">{randomMessage}</p>
        </div>

        {/* Clean Actions */}
        <div className="space-y-4">
          <a
            href="/"
            className="inline-block px-8 py-3 text-primary font-medium border border-primary/50 rounded hover:bg-primary transition-all duration-200 hover:border-primary/80"
          >
            Go Home
          </a>

          <div className="block">
            <button
              onClick={() => window.history.back()}
              className="text-gray-400 hover:text-gray-600 text-sm font-light transition-colors duration-200"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Subtle Animation */}
        <div className="mt-16">
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse"></div>
            <div
              className="w-2 h-2 bg-gray-200 rounded-full animate-pulse"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-2 h-2 bg-gray-200 rounded-full animate-pulse"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default NotFound;
