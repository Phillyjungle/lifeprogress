import { gsap } from "gsap";

export function animateScoreChange(element, oldValue, newValue) {
  gsap.fromTo(
    element,
    { textContent: oldValue, scale: 1.1 },
    { 
      textContent: newValue, 
      scale: 1, 
      duration: 0.8, 
      ease: "power4.out",
      snap: { textContent: 0.1 } 
    }
  );
}

// Glow classes for domain icons
.score-glow-high {
  box-shadow: 0 0 8px rgba(39, 174, 96, 0.6);
  animation: pulse-high 2s infinite alternate;
}

.score-glow-medium {
  box-shadow: 0 0 8px rgba(241, 196, 15, 0.5);
  animation: pulse-medium 2s infinite alternate;
}

.score-glow-low {
  box-shadow: 0 0 8px rgba(231, 76, 60, 0.4);
  animation: pulse-low 2s infinite alternate;
}

// Pulse animations
@keyframes pulse-high {
  from { box-shadow: 0 0 4px rgba(39, 174, 96, 0.4); }
  to { box-shadow: 0 0 12px rgba(39, 174, 96, 0.7); }
}

@keyframes pulse-medium {
  from { box-shadow: 0 0 4px rgba(241, 196, 15, 0.3); }
  to { box-shadow: 0 0 12px rgba(241, 196, 15, 0.6); }
}

@keyframes pulse-low {
  from { box-shadow: 0 0 4px rgba(231, 76, 60, 0.2); }
  to { box-shadow: 0 0 12px rgba(231, 76, 60, 0.5); }
}

// Animation for new items appearing
@keyframes slide-in {
  0% { transform: translateX(20px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

.animate-slide-in {
  animation: slide-in 0.5s ease-out forwards;
}

// Animation for elements that should pulse once
@keyframes pulse-once {
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
}

.animate-pulse-once {
  animation: pulse-once 0.6s ease-out;
} 