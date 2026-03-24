"use client"

import { useEffect, useState } from 'react'

export default function ProfileCosmetics({ equipped }) {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setMounted(true)
    const timer = setTimeout(() => {
      setVisible(false)
    }, 5000) // Hide after 5 seconds
    return () => clearTimeout(timer)
  }, [])

  if (!mounted || !equipped) return null

  const profileTheme = equipped.profileTheme?.slug
  const effect = equipped.effect?.slug

  // Only render if a theme or effect is equipped and we are in the visible window
  if (!profileTheme && !effect) return null
  
  return (
    <div 
      className={`pointer-events-none fixed inset-0 overflow-hidden transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`} 
      style={{ zIndex: 10 }}
    >
        
        {/* Profile Themes */}
        {profileTheme === 'cosmic-profile' && (
          <div className="absolute inset-0 cosmic-bg">
            <div className="cosmic-stars opacity-40"></div>
            <div className="cosmic-stars-large opacity-20"></div>
          </div>
        )}

        {profileTheme === 'retro-arcade-theme' && (
          <div className="absolute inset-0 arcade-grid-container">
            <div className="arcade-grid"></div>
            <div className="retro-scanlines"></div>
          </div>
        )}

        {/* Effects */}
        {effect === 'floating-bubbles' && (
          <div className="absolute inset-0">
            {Array.from({ length: 15 }).map((_, i) => (
              <div 
                key={i} 
                className="bubble-particle" 
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${5 + Math.random() * 5}s`,
                  width: `${10 + Math.random() * 30}px`,
                  height: `${10 + Math.random() * 30}px`,
                }}
              />
            ))}
          </div>
        )}

      <style>{`
        /* Cosmic Profile css */
        .cosmic-bg {
          background: radial-gradient(circle at center, rgba(76, 29, 149, 0.2) 0%, transparent 70%);
          mix-blend-mode: screen;
        }

        .cosmic-stars {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: 
            radial-gradient(1px 1px at 20px 30px, #eee, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 40px 70px, #fff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 50px 160px, #ddd, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 90px 40px, #fff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 130px 80px, #fff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 160px 120px, #ddd, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 200px 200px;
          animation: move-twink-back 100s linear infinite;
          opacity: 0.8;
        }

        @keyframes move-twink-back {
            from {background-position: 0 0, 0 0;}
            to {background-position: -10000px 5000px, -5000px 2500px;}
        }

        .cosmic-stars-large {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: 
            radial-gradient(2px 2px at 150px 200px, #fff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 450px 400px, #fff, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 600px 600px;
          animation: move-twink-back 150s linear infinite;
          opacity: 0.5;
        }

        /* Retro Arcade grid */
        .arcade-grid-container {
          background: radial-gradient(circle at bottom, rgba(139, 92, 246, 0.15) 0%, transparent 80%);
          perspective: 500px;
          overflow: hidden;
          mix-blend-mode: plus-lighter;
        }

        .arcade-grid {
          position: absolute;
          bottom: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background-image: 
            linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px);
          background-size: 40px 40px;
          transform: rotateX(60deg);
          animation: grid-move 5s linear infinite;
        }

        @keyframes grid-move {
          0% { transform: rotateX(60deg) translateY(0); }
          100% { transform: rotateX(60deg) translateY(40px); }
        }

        .retro-scanlines {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(
            to bottom,
            rgba(255,255,255,0),
            rgba(255,255,255,0) 50%,
            rgba(0,0,0,0.1) 50%,
            rgba(0,0,0,0.1)
          );
          background-size: 100% 4px;
          z-index: 2;
        }

        /* Floating Bubbles effect */
        .bubble-particle {
          position: absolute;
          bottom: -50px;
          background-color: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          animation: float-up linear infinite;
        }

        @keyframes float-up {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
