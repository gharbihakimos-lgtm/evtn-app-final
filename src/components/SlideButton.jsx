import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

const SlideButton = ({ onConfirm, text, icon: Icon, active }) => {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const containerRef = useRef(null);

  const handleDragStart = (clientX) => {
    setIsDragging(true);
    startXRef.current = clientX - dragX;
  };

  const handleDragMove = (clientX) => {
    if (!isDragging || !containerRef.current) return;
    const maxDrag = containerRef.current.offsetWidth - 60; // 56px thumb + 4px margin
    let newX = clientX - startXRef.current;
    
    if (newX < 0) newX = 0;
    if (newX > maxDrag) newX = maxDrag;
    
    setDragX(newX);
    
    // Trigger confirm when reached the end (95% threshold to make it easier)
    if (newX >= maxDrag * 0.95) {
      setIsDragging(false);
      setDragX(0); // Reset position immediately
      onConfirm();
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragX(0); // Snap back if didn't reach the end
  };

  useEffect(() => {
    const handleMouseMove = (e) => handleDragMove(e.clientX);
    const handleTouchMove = (e) => handleDragMove(e.touches[0].clientX);
    const handleMouseUp = handleDragEnd;

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div 
      className={`slide-btn-container ${active ? 'active' : ''}`} 
      ref={containerRef}
    >
      <div className="slide-btn-text">{text}</div>
      <div 
        className="slide-btn-thumb"
        style={{ transform: `translateX(${dragX}px)`, transition: isDragging ? 'none' : 'transform 0.3s ease' }}
        onMouseDown={(e) => handleDragStart(e.clientX)}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
      >
        {Icon ? <Icon size={20} /> : <ChevronRight size={20} />}
      </div>
    </div>
  );
};

export default SlideButton;
