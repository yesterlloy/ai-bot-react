import React, { useState } from 'react'
import type { IMessage } from '@/store/aiBotContext'

interface DeepThinkingProps {
  message: IMessage 
}

const DeepThinking: React.FC<DeepThinkingProps> = (props: DeepThinkingProps) => {
  const { message } = props
  const [openToggle, setOpenToggle] = useState(true)

    return (
        <div className={`message msg-thinking ${openToggle ? '' : 'hidden'}`}>
            <div className="msg-thinking-title">
                <span>思考过程</span>
                <span onClick={() => setOpenToggle(!openToggle)} className="toggle-icon">
                    {openToggle ? (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    ) : (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 10L8 6L12 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    )}
                </span>
            </div>
            <div className="message-content">
                <pre>
                    {message.content}
                </pre>
            </div>
        </div>
    )
}

export default DeepThinking
