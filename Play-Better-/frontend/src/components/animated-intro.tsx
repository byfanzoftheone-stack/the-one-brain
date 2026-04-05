import { useState, useEffect, useRef } from "react";
import poolBreakAudioFile from "@assets/tinywow_1000000208_82901193_1753903830580.mp3";

interface AnimatedIntroProps {
  onComplete: () => void;
}

export function AnimatedIntro({ onComplete }: AnimatedIntroProps) {
  const [currentWord, setCurrentWord] = useState(0);
  const [showExplosion, setShowExplosion] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const poolBreakAudioRef = useRef<HTMLAudioElement | null>(null);
  const words = ["Play", "Better"];

  // Initialize audio context and load pool break audio
  useEffect(() => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported');
    }

    // Load the uploaded pool break audio file
    try {
      poolBreakAudioRef.current = new Audio(poolBreakAudioFile);
      poolBreakAudioRef.current.preload = 'auto';
      poolBreakAudioRef.current.volume = 0.8; // Adjust volume as needed
      poolBreakAudioRef.current.crossOrigin = 'anonymous';
    } catch (error) {
      console.warn('Could not load pool break audio file');
    }
  }, []);

  // Create swooshing sound effect (air whoosh, not laser)
  const createSwooshSound = (frequency: number = 200, duration: number = 0.8) => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    
    // Create noise buffer for air/wind texture
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    
    // Generate filtered white noise for air whoosh
    for (let i = 0; i < bufferSize; i++) {
      const envelope = Math.sin((i / bufferSize) * Math.PI); // Bell curve
      output[i] = (Math.random() * 2 - 1) * envelope * 0.3;
    }
    
    const noise = ctx.createBufferSource();
    const filterNode = ctx.createBiquadFilter();
    const gainNode = ctx.createGain();
    
    noise.buffer = buffer;
    noise.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Bandpass filter for wind-like sound
    filterNode.type = 'bandpass';
    filterNode.frequency.setValueAtTime(300, ctx.currentTime);
    filterNode.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + duration * 0.3);
    filterNode.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + duration);
    filterNode.Q.setValueAtTime(2, ctx.currentTime);
    
    // Smooth volume envelope for natural whoosh
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.4, ctx.currentTime + duration * 0.2);
    gainNode.gain.linearRampToValueAtTime(0.6, ctx.currentTime + duration * 0.5);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    noise.start(ctx.currentTime);
    noise.stop(ctx.currentTime + duration);
  };

  // Create pool break sound effect (ball collision and scatter)
  const createExplosionSound = () => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    
    // Initial cue ball impact - sharp crack
    const impactOsc = ctx.createOscillator();
    const impactGain = ctx.createGain();
    const impactFilter = ctx.createBiquadFilter();
    
    impactOsc.connect(impactFilter);
    impactFilter.connect(impactGain);
    impactGain.connect(ctx.destination);
    
    // Sharp crack sound with quick frequency drop
    impactOsc.frequency.setValueAtTime(2000, ctx.currentTime);
    impactOsc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
    impactFilter.type = 'highpass';
    impactFilter.frequency.setValueAtTime(800, ctx.currentTime);
    
    impactGain.gain.setValueAtTime(0, ctx.currentTime);
    impactGain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.005);
    impactGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    impactOsc.type = 'square';
    impactOsc.start(ctx.currentTime);
    impactOsc.stop(ctx.currentTime + 0.15);
    
    // Multiple ball collision sounds (scattered timing)
    const collisionTimes = [0.05, 0.08, 0.12, 0.15, 0.18, 0.22, 0.25];
    collisionTimes.forEach((time, index) => {
      const collisionOsc = ctx.createOscillator();
      const collisionGain = ctx.createGain();
      const collisionFilter = ctx.createBiquadFilter();
      
      collisionOsc.connect(collisionFilter);
      collisionFilter.connect(collisionGain);
      collisionGain.connect(ctx.destination);
      
      // Varying frequencies for different ball collisions
      const freq = 300 + (index * 50) + (Math.random() * 100);
      collisionOsc.frequency.setValueAtTime(freq, ctx.currentTime + time);
      collisionOsc.frequency.exponentialRampToValueAtTime(freq * 0.3, ctx.currentTime + time + 0.08);
      
      collisionFilter.type = 'bandpass';
      collisionFilter.frequency.setValueAtTime(freq, ctx.currentTime + time);
      collisionFilter.Q.setValueAtTime(3, ctx.currentTime + time);
      
      const volume = 0.15 * (1 - index * 0.1); // Decreasing volume
      collisionGain.gain.setValueAtTime(0, ctx.currentTime + time);
      collisionGain.gain.linearRampToValueAtTime(volume, ctx.currentTime + time + 0.01);
      collisionGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + time + 0.08);
      
      collisionOsc.type = 'triangle';
      collisionOsc.start(ctx.currentTime + time);
      collisionOsc.stop(ctx.currentTime + time + 0.08);
    });
    
    // Rolling and scattering noise
    const rollBufferSize = ctx.sampleRate * 1.0;
    const rollBuffer = ctx.createBuffer(1, rollBufferSize, ctx.sampleRate);
    const rollOutput = rollBuffer.getChannelData(0);
    
    for (let i = 0; i < rollBufferSize; i++) {
      const t = i / rollBufferSize;
      const envelope = Math.exp(-t * 3); // Quick fade
      rollOutput[i] = (Math.random() * 2 - 1) * envelope * 0.1;
    }
    
    const rollNoise = ctx.createBufferSource();
    const rollGain = ctx.createGain();
    const rollFilter = ctx.createBiquadFilter();
    
    rollNoise.buffer = rollBuffer;
    rollNoise.connect(rollFilter);
    rollFilter.connect(rollGain);
    rollGain.connect(ctx.destination);
    
    // Filter for rolling ball texture
    rollFilter.type = 'lowpass';
    rollFilter.frequency.setValueAtTime(400, ctx.currentTime + 0.1);
    rollFilter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 1.0);
    
    rollGain.gain.setValueAtTime(0, ctx.currentTime + 0.1);
    rollGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.2);
    rollGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.0);
    
    rollNoise.start(ctx.currentTime + 0.1);
    rollNoise.stop(ctx.currentTime + 1.0);
  };

  // Animation sequence
  useEffect(() => {
    const sequence = async () => {
      // Start your uploaded audio immediately at 0 seconds
      if (poolBreakAudioRef.current) {
        poolBreakAudioRef.current.currentTime = 0;
        poolBreakAudioRef.current.play().catch(error => {
          console.warn('Could not play pool break audio:', error);
        });
      }

      // "Play" starts with dramatic zoom and swoosh sound
      setTimeout(() => {
        createSwooshSound(200, 1.5);
        setCurrentWord(0);
      }, 300);

      // "Better" starts zooming
      setTimeout(() => {
        setCurrentWord(1);
      }, 1000);

      // Pool break visual effect at exactly 2 seconds to sync with audio
      setTimeout(() => {
        setShowExplosion(true);
      }, 2000);

      // Complete intro
      setTimeout(() => {
        onComplete();
      }, 5500);
    };

    sequence();
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes cueBallFlyIn {
          0% { 
            transform: translate(calc(-50% - 300px), calc(-50% - 20px)) scale(0.8);
            opacity: 0;
          }
          50% { 
            transform: translate(calc(-50% - 150px), calc(-50% - 10px)) scale(1);
            opacity: 1;
          }
          100% { 
            transform: translate(calc(-50% - 70px), -50%) scale(1);
            opacity: 0;
          }
        }
        
        ${[...Array(15)].map((_, i) => {
          const rackPositions = [
            [0, 0], [-12, 20], [12, 20], [-24, 40], [0, 40], [24, 40],
            [-36, 60], [-12, 60], [12, 60], [36, 60],
            [-48, 80], [-24, 80], [0, 80], [24, 80], [48, 80]
          ];
          const rackPos = rackPositions[i] || [0, 0];
          const scatterAngle = Math.atan2(rackPos[1], rackPos[0]) + (Math.random() - 0.5) * 0.5;
          const scatterDistance = 80 + Math.random() * 100;
          const scatterX = Math.cos(scatterAngle) * scatterDistance;
          const scatterY = Math.sin(scatterAngle) * scatterDistance;
          
          return `
            @keyframes poolBallScatter-${i} {
              0% { 
                transform: translate(calc(-50% + ${rackPos[0]}px), calc(-50% + ${rackPos[1]}px)) scale(1); 
                opacity: 1; 
              }
              15% { 
                transform: translate(calc(-50% + ${rackPos[0]}px), calc(-50% + ${rackPos[1]}px)) scale(1.1); 
                opacity: 1; 
              }
              100% { 
                transform: translate(calc(-50% + ${scatterX}px), calc(-50% + ${scatterY}px)) scale(0.6) rotate(${Math.random() * 360}deg); 
                opacity: 0; 
              }
            }
          `;
        }).join('')}
      `}</style>
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main content container */}
      <div className="relative text-center">
        {/* Play Better text */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 mb-8 px-4">
          {words.map((word, index) => (
            <div
              key={word}
              className={`font-space font-black text-6xl sm:text-7xl md:text-8xl lg:text-9xl transition-all duration-[2s] cubic-bezier(0.175, 0.885, 0.32, 1.275) transform ${
                currentWord >= index
                  ? 'scale-100 opacity-100 translate-x-0 translate-y-0 blur-0'
                  : 'scale-[0.05] opacity-0 translate-x-0 translate-y-32 blur-lg'
              }`}
              style={{
                color: currentWord >= index ? '#ffffff' : 'transparent',
                textShadow: currentWord >= index 
                  ? `0 0 10px rgba(255, 255, 255, 0.9),
                     0 0 20px rgba(255, 255, 255, 0.7),
                     0 0 30px rgba(255, 0, 0, 0.8),
                     0 0 40px rgba(255, 0, 0, 0.6),
                     0 0 60px rgba(220, 38, 38, 0.5),
                     0 0 80px rgba(220, 38, 38, 0.4),
                     0 0 100px rgba(220, 38, 38, 0.3),
                     4px 4px 0px rgba(255, 0, 0, 0.8),
                     8px 8px 0px rgba(220, 38, 38, 0.6),
                     12px 12px 0px rgba(185, 28, 28, 0.4)`
                  : 'none',
                filter: currentWord >= index 
                  ? `drop-shadow(0 0 20px rgba(255, 255, 255, 0.8))
                     drop-shadow(0 0 40px rgba(255, 0, 0, 0.7))
                     drop-shadow(0 0 60px rgba(220, 38, 38, 0.6))`
                  : 'none',
                transform: currentWord >= index 
                  ? 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px)' 
                  : `perspective(1000px) rotateY(180deg) rotateX(45deg) translateZ(-200px) ${index === 0 ? 'translateX(-300px)' : 'translateX(300px)'}`,
                transformOrigin: 'center center',
                animation: currentWord >= index ? 'neonPulse 2s ease-in-out infinite alternate, flyIn 1s ease-out' : 'none',
                animationDelay: currentWord >= index ? `${index * 0.2}s` : '0s'
              }}
            >
              {word}
            </div>
          ))}
        </div>

        {/* Pool ball rack breaking effect */}
        {showExplosion && (
          <div className="absolute top-16 left-1/2 transform -translate-x-[85%] w-32 h-32 flex items-center justify-center">
            {/* Cue ball flying in from left */}
            <div
              className="absolute w-14 h-14 bg-gradient-radial from-white via-gray-100 to-gray-300 border-2 border-white shadow-2xl flex items-center justify-center relative overflow-hidden"
              style={{
                left: '50%',
                top: '50%',
                borderRadius: '50%',
                width: '56px',
                height: '56px',
                boxShadow: `
                  inset -3px -3px 12px rgba(0,0,0,0.6),
                  inset 3px 3px 12px rgba(255,255,255,0.8),
                  0 6px 20px rgba(0,0,0,0.7),
                  0 0 30px rgba(255,255,255,0.5)
                `,
                animation: 'cueBallFlyIn 0.5s ease-in forwards',
                zIndex: 20
              }}
            >
              {/* Sphere highlights */}
              <div 
                className="absolute top-1 left-1 w-4 h-4 rounded-full opacity-90"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,1), rgba(255,255,255,0.4) 40%, transparent 70%)',
                  borderRadius: '50%'
                }}
              />
              <div 
                className="absolute top-2 left-2 w-2 h-2 rounded-full opacity-70"
                style={{
                  background: 'radial-gradient(circle, rgba(255,255,255,0.9), transparent 60%)',
                  borderRadius: '50%'
                }}
              />
              <div 
                className="absolute inset-0 rounded-full opacity-30"
                style={{
                  background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(255,255,255,0.4) 90deg, transparent 180deg, rgba(255,255,255,0.2) 270deg, transparent 360deg)',
                  borderRadius: '50%'
                }}
              />
            </div>

            {/* Pool balls in triangular rack formation then scattering */}
            {[...Array(15)].map((_, i) => {
              // Create triangular rack formation
              const rackPositions = [
                [0, 0], // 1 ball (front)
                [-12, 20], [12, 20], // 2 balls (second row)
                [-24, 40], [0, 40], [24, 40], // 3 balls (third row)
                [-36, 60], [-12, 60], [12, 60], [36, 60], // 4 balls (fourth row)
                [-48, 80], [-24, 80], [0, 80], [24, 80], [48, 80] // 5 balls (back row)
              ];
              
              const rackPos = rackPositions[i] || [0, 0];
              const scatterAngle = Math.atan2(rackPos[1], rackPos[0]) + (Math.random() - 0.5) * 0.5;
              const scatterDistance = 80 + Math.random() * 100;
              const scatterX = Math.cos(scatterAngle) * scatterDistance;
              const scatterY = Math.sin(scatterAngle) * scatterDistance;
              const ballColors = [
                'bg-gradient-radial from-white via-gray-100 to-gray-300', // 1 - White/Cue ball
                'bg-gradient-radial from-yellow-200 via-yellow-400 to-yellow-600', // 2 - Yellow
                'bg-gradient-radial from-blue-300 via-blue-500 to-blue-700', // 3 - Blue  
                'bg-gradient-radial from-red-300 via-red-500 to-red-700', // 4 - Red
                'bg-gradient-radial from-purple-300 via-purple-500 to-purple-700', // 5 - Purple
                'bg-gradient-radial from-orange-300 via-orange-500 to-orange-700', // 6 - Orange
                'bg-gradient-radial from-green-300 via-green-500 to-green-700', // 7 - Green
                'bg-gradient-radial from-pink-300 via-pink-500 to-pink-700', // 8 - Pink/Magenta
                'bg-gradient-radial from-gray-600 via-gray-800 to-black', // 8 Ball - Black
                'bg-gradient-radial from-yellow-100 via-yellow-300 to-yellow-500', // 9 - Light Yellow
                'bg-gradient-radial from-blue-200 via-blue-400 to-blue-600', // 10 - Light Blue
                'bg-gradient-radial from-red-200 via-red-400 to-red-600', // 11 - Light Red
                'bg-gradient-radial from-purple-200 via-purple-400 to-purple-600', // 12 - Light Purple
                'bg-gradient-radial from-orange-200 via-orange-400 to-orange-600', // 13 - Light Orange
                'bg-gradient-radial from-green-200 via-green-400 to-green-600' // 14 - Light Green
              ];
              
              return (
                <div
                  key={i}
                  className={`absolute w-14 h-14 ${ballColors[i]} border-2 border-white shadow-2xl flex items-center justify-center relative overflow-hidden`}
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%)`,
                    animationDelay: `${i * 0.05}s`,
                    animation: `poolBallScatter-${i} 3.0s ease-out forwards`,
                    borderRadius: '50%',
                    width: '56px',
                    height: '56px',
                    boxShadow: `
                      inset -3px -3px 12px rgba(0,0,0,0.6),
                      inset 3px 3px 12px rgba(255,255,255,0.8),
                      0 6px 20px rgba(0,0,0,0.7),
                      0 0 30px rgba(255,255,255,0.3)
                    `
                  }}
                >
                  {/* Primary highlight for sphere effect */}
                  <div 
                    className="absolute top-1 left-1 w-4 h-4 rounded-full opacity-90"
                    style={{
                      background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,1), rgba(255,255,255,0.4) 40%, transparent 70%)',
                      borderRadius: '50%'
                    }}
                  />
                  
                  {/* Secondary highlight */}
                  <div 
                    className="absolute top-2 left-2 w-2 h-2 rounded-full opacity-70"
                    style={{
                      background: 'radial-gradient(circle, rgba(255,255,255,0.9), transparent 60%)',
                      borderRadius: '50%'
                    }}
                  />
                  
                  {/* Rim light effect */}
                  <div 
                    className="absolute inset-0 rounded-full opacity-30"
                    style={{
                      background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(255,255,255,0.4) 90deg, transparent 180deg, rgba(255,255,255,0.2) 270deg, transparent 360deg)',
                      borderRadius: '50%'
                    }}
                  />
                  
                  {/* Ball number */}
                  <span className={`text-sm font-bold relative z-10 ${
                    i === 8 ? 'text-white' : 'text-black'
                  } drop-shadow-lg`}>
                    {i === 0 ? '' : i + 1}
                  </span>
                </div>
              );
            })}
            
            {/* Rack triangle outline breaking */}
            <div 
              className="absolute border-2 border-white opacity-60 animate-ping"
              style={{
                width: '40px',
                height: '35px',
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                animationDuration: '0.6s',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            />
            
            {/* Cue ball impact flash */}
            <div className="absolute w-12 h-12 bg-white rounded-full animate-ping opacity-50" 
                 style={{ 
                   animationDuration: '0.4s',
                   left: '50%',
                   top: '50%',
                   transform: 'translate(-50%, -50%)'
                 }} />
          </div>
        )}

        {/* Loading indicator */}
        <div className="mt-8 sm:mt-16 px-4">
          <div className="w-48 sm:w-64 h-1 bg-gray-700 rounded-full mx-auto overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-4000 ease-out"
              style={{ 
                width: currentWord === 0 ? '50%' : currentWord === 1 ? '100%' : '0%',
                transitionDuration: '1500ms'
              }}
            />
          </div>
          <p className="text-gray-400 text-xs sm:text-sm mt-4 font-space text-center">
            {currentWord === 0 ? 'Connecting players...' : 
             currentWord === 1 ? 'Loading game tables...' : 
             'Initializing...'}
          </p>
        </div>
      </div>

      {/* Zoom effect overlay */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-1000 ${
          currentWord >= 2 ? 'opacity-0 pointer-events-none' : 'opacity-30'
        }`}
      />
    </div>
  );
}