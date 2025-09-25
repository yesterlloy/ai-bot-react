import React from 'react'
import type { IMessage, ResultMessage } from '@/store/aiBotContext'
import { useBot } from '@/store/aiBotContext'
import { isComponentType } from '@/utils';
import botAvatar from '@/assets/bot-avatar.png'

interface ResultProps {
  message: IMessage
}


const Result: React.FC<ResultProps> = (props: ResultProps) => {
  const { message } = props
  let cont: ResultMessage = JSON.parse(message.content)
  console.log('Result', cont)
  const { config } = useBot()

  return (
    <div className={`message ${message.sender}`}>
      <div className='message-content-avatar '>

        <div className={`message-avatar result`}>
          {/* {!state.deepThinking && ( */}
          <img src={botAvatar} alt="BOT" />
          {/* )} */}
        </div>
        <div className="message-content">

          {cont.status === 'error' ? (
            <div>
              <div>{cont.message}</div>
              <pre className='rslt-msg-error'>{cont.error_detail}</pre>
            </div>
          ) : (
            <div className="rslt-msg-box">
              <div className='rslt-tit'>{cont.message}</div>
            </div>
          )}

          {cont.generated_sql && (
            <div className="rslt-msg-box">
              <div className='rslt-tit'>SQL：</div>
              <pre className='rslt-msg-code'>
                <code>
                  {cont.generated_sql}
                </code>
              </pre>
            </div>
          )}

          {cont.explanation && (
            <div className="rslt-msg-box">
              <div className='rslt-tit'>解释：</div>
              <pre className='rslt-msg-table'>{`${cont.explanation}`}</pre>
            </div>
          )}

          {cont.dynamic_params?.length > 0 && (
            <div className="rslt-msg-box">
              <div className='rslt-tit'>参数：</div>
              <div className='rslt-msg-table'>
                <div className='rslt-msg-tbl-row th'>
                  <span>参数名</span>
                  <span>说明</span>
                  <span>默认值</span>
                </div>
                {cont.dynamic_params?.map((item) => (
                  <div key={item.param_name} className='rslt-msg-tbl-row'>
                    <span>{item.param_name}</span>
                    <span>{item.remark}</span>
                    <span>{item.default_value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="message-opt">
            {config.slot?.resultBottom ?
              isComponentType(config.slot.resultBottom) ?
                React.createElement(config.slot.resultBottom as any, { message }) :
                config.slot?.resultBottom :
              null}
            {/* <button className="opt-button apply-sql" title="应用SQL">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 8L7 12M7 12L13 6M7 12H3M7 12H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="opt-button regenerate" title="重新生成">
           <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M12.5 3.5C12.22 3.5 12 3.72 12 4V6C10.89 6 10 6.89 10 8C10 9.11 10.89 10 12 10V12C12 12.28 12.22 12.5 12.5 12.5C12.78 12.5 13 12.28 13 12V10C14.11 10 15 9.11 15 8C15 6.89 14.11 6 13 6V4C13 3.72 12.78 3.5 12.5 3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
             <path d="M7.5 12.5C7.22 12.5 7 12.28 7 12V10C5.89 10 5 9.11 5 8C5 6.89 5.89 6 7 6V4C7 3.72 7.22 3.5 7.5 3.5C7.78 3.5 8 3.72 8 4V6C9.11 6 10 6.89 10 8C10 9.11 9.11 10 8 10V12C8 12.28 7.78 12.5 7.5 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
             <path d="M13 8L9 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
             <path d="M7 8L3 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
           </svg>
         </button>
        <button className="opt-button like" title="喜欢">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 8.5L8 14M8 14L14 8.5M8 14V4M8 4L11 7M8 4L5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="opt-button dislike" title="不喜欢">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 8.5L8 14M8 14L2 8.5M8 14V4M8 4L5 7M8 4L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button> */}
          </div>
        </div>
      </div>

    </div>
  )
}

export default Result
