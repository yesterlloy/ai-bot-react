import React, { useState, useRef, useEffect } from 'react';

import './index.css';

interface BotButtonProps {
  isOpen: boolean;
  toggleOpen: () => void;
}

const BUTTON_WIDTH = 64;

const BotButton: React.FC<BotButtonProps> = ({ isOpen, toggleOpen }) => {
  const botButtonRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({
    x: null as number | null,
    y: null as number | null
  });

  const startPosRef = useRef({
    hasSet: false,
    x: 0,
    y: 0
  })

  // 处理拖拽开始
  const handleDragStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.button !== 0) return; // 只允许左键拖拽
    setIsDragging(true);
    document.body.style.userSelect = 'none'; // 防止拖拽时选中文本
    
    // 记录初始位置：鼠标位置和按钮位置
    if (botButtonRef.current && !startPosRef.current.hasSet) {
      const buttonRect = botButtonRef.current.getBoundingClientRect();
      startPosRef.current = {
        hasSet: true,
        x:  buttonRect.left,
        y: buttonRect.top
      };
    }
  };

  // 处理拖拽移动
  const handleDragMove = (e: MouseEvent) => {
    e.stopPropagation();
    if (!isDragging || !botButtonRef.current) return;

    // 计算鼠标移动距离
    const deltaX = e.clientX - startPosRef.current.x - BUTTON_WIDTH;
    const deltaY = e.clientY - startPosRef.current.y - BUTTON_WIDTH;
    
    // 根据初始位置和移动距离计算新位置
    let newX = deltaX;
    let newY = deltaY;
    
    
    setButtonPosition({ x: newX, y: newY });
  };

  // 处理拖拽结束
  const handleDragEnd = () => {
    setIsDragging(false);
    document.body.style.userSelect = '';
  };

  // 添加全局鼠标事件监听
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging]);


  return (
    <div 
      className="bot-button-container"
      ref={botButtonRef}
      style={{
        // 当有位置信息时，完全使用transform定位，覆盖CSS中的fixed定位
        // 当没有位置信息时，使用CSS中的默认fixed定位
        ...(buttonPosition.x !== null && buttonPosition.y !== null ? {
          bottom: 'auto',
          right: 'auto',
          transform: `translate(${buttonPosition.x}px, ${buttonPosition.y}px)`
        } : {}),
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleDragStart}
    >
      <button 
        className={`bot-button ${isOpen ? 'active' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          toggleOpen();
        }}
        aria-label={isOpen ? '关闭AI助手' : '打开AI助手'}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {isOpen ? (
            <path d="M18 6 6 18" />
          ) : (
            <>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <path d="M13 8h4l-1 3h-3z" />
              <path d="M9 11h2v5" />
              <path d="M12 11h2v5" />
            </>
          )}
        </svg>
      </button>
    </div>
  );
};

export default BotButton;