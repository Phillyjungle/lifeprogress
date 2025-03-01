export function typewriterEffect(element, text, speed = 30) {
  let i = 0;
  element.textContent = '';
  element.style.opacity = '0.4';
  
  const typing = setInterval(() => {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      
      if (i === text.length) {
        clearInterval(typing);
        element.style.opacity = '1';
      }
    }
  }, speed);
  
  return () => clearInterval(typing);
} 