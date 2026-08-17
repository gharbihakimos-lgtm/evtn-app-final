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
    const thumbWidth = 44;
    const padding = 6;
    const maxDrag = containerRef.current.offsetWidth - thumbWidth - (padding * 2);
    let newX = clientX - startXRef.current;
    
    if (newX < 0) newX = 0;
    if (newX > maxDrag) newX = maxDrag;
    
    setDragX(newX);
    
    // Trigger confirm when reaching 85% of slider
    if (newX >= maxDrag * 0.85) {
      setIsDragging(false);
      setDragX(0); // Reset position
      onConfirm?.();
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragX(0); // Snap back
  };

  useEffect(() => {
    const handleMove = (e) => {
      let clientX;
      if (e.type.includes('touch')) {
        clientX = e.touches?.[0]?.clientX || 0;
      } else {
        clientX = e.clientX;
      }
      handleDragMove(clientX);
    };

    const handleTouchMoveObj = (e) => {
      // Prevent browser / system gestures while dragging the slider
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
      handleMove(e);
    };

    const handleUp = () => handleDragEnd();

    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('touchmove', handleTouchMoveObj, { passive: false });
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchend', handleUp);
      window.addEventListener('touchcancel', handleUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleTouchMoveObj);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
      window.removeEventListener('touchcancel', handleUp);
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
        style={{ 
          transform: `translateX(${dragX}px)`, 
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' 
        }}
        onMouseDown={(e) => handleDragStart(e.clientX)}
        onTouchStart={(e) => {
          e.stopPropagation();
          if (e.touches?.[0]) handleDragStart(e.touches[0].clientX);
        }}
      >
        {Icon ? <Icon size={18} /> : <ChevronRight size={18} />}
      </div>
    </div>
  );
};

export default SlideButton;
