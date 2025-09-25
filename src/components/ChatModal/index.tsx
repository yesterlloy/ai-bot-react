import React from 'react';
import type { BotState } from '@/store/aiBotContext';
import { useBot } from '@/store/aiBotContext';
import ChatMessage from '@/components/ChatMessage';

import ChatInputArea from '@/components/ChatInputArea';
import './index.css';
import chatTop from '@/assets/chat-top.png';

interface ChatModalProps {
  state: BotState;
  toggleOpen: () => void;
  setInputValue: (value: string) => void;
  sendMessage: () => void;
}

const ChatModal: React.FC<ChatModalProps> = () => {
  const { state, toggleOpen, config } = useBot()
  console.log('messages', state.messages)

  return (
    <div className={`chat-wrapper ${state.isOpen ? 'open' : ''}`}>
      <div className='chat-wrapper-mask'></div>

      <div className="chat-header-image">
        <img src={chatTop} alt={config.name} />
      </div>

      <div className={`chat-container`}>

        {/* 聊天头部 */}
        <div className="chat-header">
          <h3>{config.name}</h3>
          {/* <span> */}
          <button
            className="close-button"
            onClick={toggleOpen}
            aria-label="关闭"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>

          {/* 全屏按钮 */}
          {/*state.isFullScreen ? (
              <button
                className="fullscreen-button"
                onClick={toggleFullScreen}
                aria-label="退出全屏"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3v3M13 3v3M3 8h3M18 8h3M3 13h3M18 13h3M8 21v-3M13 21v-3" />
                </svg>
              </button>
            ) : (
              <button
                className="fullscreen-button"
                onClick={toggleFullScreen}
                aria-label="全屏"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 8v8M12 12v0M8 4h8M20 8v8M12 12h0M8 20h8" />
                </svg>
              </button>
            )*/}
          {/* </span> */}
        </div>

        {/* 聊天内容 */}
        <ChatMessage />

        {/* 输入区域 */}
        <ChatInputArea />
      </div>
    </div>
  );
};

export default ChatModal;