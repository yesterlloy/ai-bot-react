import React, { useRef } from 'react';
import { useBot } from '@/store/aiBotContext';

import './index.css';

interface ChatInputAreaProps {
}

const ChatInputArea: React.FC<ChatInputAreaProps> = () => {
  const { 
    sendMessage, 
    setInputValue, 
    state, 
    toggleDeepThinking, 
    config,
    dispatch
  } = useBot(); 
  const { inputValue, isTyping, isOpen, } = state;

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 处理发送消息
  const handleSendMessage = (e: React.MouseEvent | React.KeyboardEvent) => {
    // 对于键盘事件，只在按下Enter且没有按下Shift时发送消息
    if (e instanceof KeyboardEvent) {
      if (e.key !== 'Enter' || e.shiftKey) return;
      e.preventDefault(); // 阻止默认的换行行为
    }
    
    if(isTyping) {
      dispatch({ type: 'SET_TYPING', payload: false });
    } else {
      sendMessage();
      textareaRef.current?.focus();
    }
  };
  

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    adjustTextareaHeight();
  };

  // 自动调整textarea高度
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // 重置高度以获取真实内容高度
    textarea.style.height = 'auto';
    
    // 获取单行高度（以计算8行的最大高度）
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight, 10) || 24;
    const maxHeight = lineHeight * 8; // 8行的最大高度
    
    // 设置textarea高度，但不超过最大高度
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = Math.min(scrollHeight, maxHeight) + 'px';
  };
  
  // 组件挂载后初始化textarea高度
  React.useEffect(() => {
    if (textareaRef.current) {
      adjustTextareaHeight();
    }
  }, []);
  
  // 当inputValue变化时调整高度（例如外部设置值时）
  React.useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);


  return (
    <div className="chat-input-container">
      {config.slot?.inputTop && (
        <div className='chat-slot-input-top'>
          {config.slot.inputTop}
        </div>
      )}
      <div className='chat-input-cont-body'>
      {/* 输入区域 */}
      <div className="chat-textarea-wrapper">
        <textarea
          ref={textareaRef}
          className="chat-textarea"
          placeholder="输入你的问题..."
          value={inputValue}
          onChange={handleInputChange}
          disabled={isTyping}
          autoFocus={isOpen}
          onKeyUp={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              handleSendMessage(e);
            }
          }}
          rows={2}
          style={{ resize: 'none' }}
        />
      </div>
      
      {/* 按钮区域 */}
      <div className="chat-buttons-area">
        <button 
          className={`deep-thinking-button ${state.deepThinking ? 'active' : ''}`}
          onClick={toggleDeepThinking}
          aria-label="深度思索"
        >
          深度思索
        </button>
        <button 
          className={`send-button ${isTyping ? 'sending' : ''}`}
          onClick={handleSendMessage}
          disabled={!state.inputValue && !isTyping}
          aria-label={isTyping ? "停止" : "发送"}
        >
          {isTyping ? (
            // 停止图标
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            </svg>
          ) : (
            // 向上箭头图标
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5"></line>
              <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
          )}
        </button>
      </div>
      </div>
    </div>
  );
};

export default ChatInputArea;