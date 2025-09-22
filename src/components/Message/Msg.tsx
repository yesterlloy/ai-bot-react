import React from 'react'
import type { IMessage } from '@/store/aiBotContext'
import Result from './Result'

interface MsgProps {
  message: IMessage 
}

const Msg: React.FC<MsgProps> = (props: MsgProps) => {
  const { message } = props

  return message.type === 'result' ? (
    <Result message={message} />
  ) : (
    <div className={`message ${message.sender}`}>
      <div className="message-content">{message.content}</div>
      <div className="message-time">
      </div>
    </div>
  )
}

export default Msg 
