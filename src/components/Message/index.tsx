import React from 'react'
import type { IMessage } from '@/store/aiBotContext'
import { useBot } from '@/store/aiBotContext'
import DeepThinking from './DeepThinking'
import Msg from './Msg'

import './index.css'

export interface MessageProps {
  message?: IMessage 
}

const Message: React.FC<MessageProps> = () => {
  const { state } = useBot()

  return  state.messages.map((message, idx) => {

    let cont: any = <Msg message={message} key={idx} />
    if(message.type === 'thinking' ) {
      if(state.deepThinking) {
        cont = (
          <DeepThinking
            message={message}
            key={idx}
          />
        )
      } else {
        cont = null
      }
    }

    return cont

  })
}

export default Message