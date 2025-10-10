import React from 'react'
import type { IMessage } from '@/store/aiBotContext'
import botAvatar from '@/assets/bot-avatar.png'

interface OperationProps {
  message: IMessage
}


const Operation: React.FC<OperationProps> = (props: OperationProps) => {
  const { message } = props

  return (
    <div className={`message ${message.sender}`}>
      <div className='message-content-avatar '>

        <div className={`message-avatar result`}>
          {/* {!state.deepThinking && ( */}
          <img src={botAvatar} alt="BOT" />
          {/* )} */}
        </div>
        <div className="message-content">


          <div className="rslt-msg-box">
            <div className='rslt-tit'>{message.content}</div>
          </div>



          <div className="message-opt">
            {message.operation || null}

          </div>
        </div>
      </div>

    </div>
  )
}

export default Operation
