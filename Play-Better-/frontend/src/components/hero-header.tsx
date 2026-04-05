// For now using text logo until asset path is configured
// import logoPath from "@assets/play better_1753894425809.png";

export function HeroHeader() {
  return (
    <section className="relative overflow-hidden py-20 px-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-primary/20 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-r from-primary/10 to-transparent rounded-full blur-2xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-gradient-to-r from-primary/15 to-transparent rounded-full blur-xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative max-w-6xl mx-auto text-center">
        {/* Logo - Styled Text Version */}
        <div className="mb-8 animate-scale-in">
          <div className="relative inline-block">
            <div className="font-space font-black text-5xl md:text-7xl lg:text-8xl tracking-tight transform -rotate-1 hover:rotate-0 transition-transform duration-500">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent drop-shadow-2xl">
                Play
              </span>
              <span className="ml-4 bg-gradient-to-r from-primary via-red-400 to-primary bg-clip-text text-transparent animate-glow">
                Better
              </span>
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-transparent rounded-full blur-xl opacity-50"></div>
          </div>
        </div>

        {/* Main Headline */}
        <div className="mb-8 animate-slide-up">
          <h1 className="font-space font-bold text-2xl md:text-4xl lg:text-5xl mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent leading-tight">
            Connect With Local Players
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Challenge nearby pool players in Idaho Falls, play real-time 8-ball games, and track your billiards progress.
          </p>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-4 mb-12 animate-fade-in" style={{animationDelay: '0.3s'}}>
          <div className="glass-morphism px-6 py-3 rounded-full flex items-center space-x-2 hover:glow-red transition-all duration-300">
            <i className="fas fa-location-dot text-primary"></i>
            <span className="font-medium">Location-Based Matching</span>
          </div>
          <div className="glass-morphism px-6 py-3 rounded-full flex items-center space-x-2 hover:glow-red transition-all duration-300">
            <i className="fas fa-gamepad text-primary"></i>
            <span className="font-medium">Real-Time Gameplay</span>
          </div>
          <div className="glass-morphism px-6 py-3 rounded-full flex items-center space-x-2 hover:glow-red transition-all duration-300">
            <i className="fas fa-chart-line text-primary"></i>
            <span className="font-medium">Skill Tracking</span>
          </div>
          <div className="glass-morphism px-6 py-3 rounded-full flex items-center space-x-2 hover:glow-red transition-all duration-300">
            <i className="fas fa-comments text-primary"></i>
            <span className="font-medium">In-Game Chat</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto animate-fade-in" style={{animationDelay: '0.6s'}}>
          <div className="text-center">
            <div className="font-space font-bold text-3xl md:text-4xl text-primary mb-2">100+</div>
            <div className="text-gray-400 text-sm font-medium">Miles Range</div>
          </div>
          <div className="text-center">
            <div className="font-space font-bold text-3xl md:text-4xl text-primary mb-2">24/7</div>
            <div className="text-gray-400 text-sm font-medium">Online Play</div>
          </div>
          <div className="text-center">
            <div className="font-space font-bold text-3xl md:text-4xl text-primary mb-2">4</div>
            <div className="text-gray-400 text-sm font-medium">Skill Levels</div>
          </div>
          <div className="text-center">
            <div className="font-space font-bold text-3xl md:text-4xl text-primary mb-2">∞</div>
            <div className="text-gray-400 text-sm font-medium">Challenges</div>
          </div>
        </div>
      </div>
    </section>
  );
}