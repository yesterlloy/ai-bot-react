import React, { useEffect, useRef } from 'react'
import { useBot,  } from '@/store/aiBotContext'
import type { IMessage } from '@/store/aiBotContext'
import Message from '../Message'

type ChatMessageProps = {
  message?: IMessage
}

const ChatMessage: React.FC<ChatMessageProps> = () => {

    const { state, config } = useBot()


  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (chatContainerRef.current && state.isOpen) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [state.messages, state.isOpen]);

    return (
        <div className="chat-messages" ref={chatContainerRef}>
            {state.messages.length === 0 ? (
                <div className="empty-state">
                    <p>你好！我是{config.name}，有什么可以帮助你的吗？</p>
                </div>
            ) : (
                <Message />
            )
            }
            {state.isTyping && (
                <div className="message bot typing">
                    <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ChatMessage