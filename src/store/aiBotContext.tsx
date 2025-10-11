import React, { createContext, useReducer, useContext } from 'react';
import type { ReactNode } from 'react';
import { createSSEWithPost } from '@/services/sseService1';
import { parseChunk } from '@/utils';
import { DEFAULT_NAME } from '@/config'


interface ISqlMessage {
  role: 'user' | 'assistant';
  content: string;
}

// 定义消息类型
export interface IMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'thinking' | 'result' | 'operator';

  operation?: ReactNode;

  //sql相关
  dynamic_params?: DynamicParams[];
  explanation?: string
  sql?: string;
  messages?: ISqlMessage[];
  status?: 'success' | 'error';
}
interface DynamicParams {
  param_name: string;
  param_type: string;
  remark: string;
  default_value: string
}
export interface ResultMessage {
  status: 'success' | 'error';
  message: string;
  generated_sql: string;
  dynamic_params: DynamicParams[];
  explanation: string
  error_detail?: string
}

// 定义状态类型
export interface BotState {
  deepThinking: boolean;
  isOpen: boolean;
  messages: IMessage[];
  inputValue: string;
  isTyping: boolean;
  isFullScreen: boolean;
}

// 定义action类型
type BotAction =
  | { type: 'TOGGLE_OPEN' }
  | { type: 'SET_INPUT_VALUE'; payload: string }
  | { type: 'SEND_MESSAGE' }
  | { type: 'ADD_MESSAGE'; payload: IMessage }
  | { type: 'UPDATE_MESSAGE'; payload: IMessage }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'TOGGLE_DEEP_THINKING' }
  | { type: 'TOGGLE_FULL_SCREEN' };

// 初始状态
const initialState: BotState = {
  deepThinking: false,
  isOpen: false,
  messages: [],
  inputValue: '',
  isTyping: false,
  isFullScreen: false
};


// Reducer函数
function botReducer(state: BotState, action: BotAction): BotState {
  switch (action.type) {
    case 'TOGGLE_OPEN':
      return { ...state, isOpen: !state.isOpen };

    case 'TOGGLE_DEEP_THINKING':
      return { ...state, deepThinking: !state.deepThinking };

    case 'TOGGLE_FULL_SCREEN':
      return { ...state, isFullScreen: !state.isFullScreen };

    case 'SET_INPUT_VALUE':
      return { ...state, inputValue: action.payload };

    case 'SEND_MESSAGE':
      if (!state.inputValue.trim()) return state;

      const userMessage: IMessage = {
        id: Date.now().toString() + '_user',
        content: state.inputValue,
        sender: 'user',
        timestamp: new Date()
      };


      return {
        ...state,
        messages: [...state.messages, userMessage],
        inputValue: '',
        isTyping: true
      };

    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        // isTyping: false
      };

    case 'UPDATE_MESSAGE':
      // 替换已存在的消息
      let msgs = [...state.messages]
      let newMsg = action.payload
      let oldMsg = msgs.find(msg => msg.id === newMsg.id)
      msgs.splice(oldMsg ? msgs.indexOf(oldMsg) : -1, 1, {
        ...oldMsg || {},
        ...newMsg
      })

      return {
        ...state,
        messages: msgs
      };

    case 'SET_TYPING':
      return { ...state, isTyping: action.payload };

    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] };

    default:
      return state;
  }
}

// 创建Context
interface BotContextType {
  state: BotState;
  dispatch: React.Dispatch<BotAction>;
  toggleOpen: () => void;
  setInputValue: (value: string) => void;
  sendMessage: () => void;
  clearMessages: () => void;
  toggleDeepThinking: () => void;
  toggleFullScreen: () => void;
  config: IConfig;
}

export interface IBaseInfo {
  nl_query: string;
  table_structure: {
    table_name: string;
    field_name: string;
    field_type: string;
    remark: string;
  }[];
  dynamic_params: {
    param_name: string;
    param_type: string;
    remark: string;
    default_value: string;
  }[];
  builtin_params: {
    param_name: string;
    param_type: string;
    remark: string;
    default_value: number;
  }[];
  sql: string;
  error_msg: string;
}

export interface IConfig {
  baseInfo: IBaseInfo;
  sseUrl: string;
  name?: string
  hideDeepThinking?: boolean;
  slot?: {
    // 输入框上部
    inputTop?: ReactNode | [string | React.FunctionComponent<any> | React.ComponentClass<any>, any];

    // 结果下部
    resultBottom?: ReactNode | [string | React.FunctionComponent<any> | React.ComponentClass<any>, any];
  },
  hook?: {
    beforeSendMessage?: (body: IBaseInfo, config: IConfig) => Boolean;
    afterReceivedMessage?: (msg: IMessage | null, config: IConfig) => IMessage;
    afterClose?: (config: IConfig) => void;
  }
}

const BotContext = createContext<BotContextType | undefined>(undefined);

interface ProviderProps {
  config: IConfig;
  children: ReactNode;
}

// 创建Provider组件
export function BotProvider({ children, config }: ProviderProps) {
  const [state, dispatch] = useReducer(botReducer, initialState);
  // 使用useRef保存最新状态的引用
  const stateRef = React.useRef(state);

  // 每次状态更新时，更新ref
  React.useEffect(() => {
    stateRef.current = state;
    if (!state.isOpen) {
      config.hook?.afterClose?.(config)
    }
  }, [state]);

  if (!config.name) {
    config.name = DEFAULT_NAME
  }

  // 自定义Hook方法
  const toggleOpen = () => dispatch({ type: 'TOGGLE_OPEN' });

  const toggleDeepThinking = () => dispatch({ type: 'TOGGLE_DEEP_THINKING' });
  const toggleFullScreen = () => dispatch({ type: 'TOGGLE_FULL_SCREEN' });

  const setInputValue = (value: string) =>
    dispatch({ type: 'SET_INPUT_VALUE', payload: value });

  const sendMessage = (msgStr?: string) => {
    console.log('sendMessage config', config)
    let bd = config?.baseInfo || {}
    if (state.deepThinking) {
      bd.nl_query = msgStr || state.inputValue
    } else {
      bd.nl_query = (msgStr || state.inputValue) + ' no_think'
    }

    if (msgStr) {
      dispatch({ type: 'SET_INPUT_VALUE', payload: msgStr })
    }

    // 自定义hook 发送前处理
    if (config.hook?.beforeSendMessage) {
      let res = config.hook.beforeSendMessage(bd, config)
      if (!res) {
        return
      }
    }

    dispatch({ type: 'SEND_MESSAGE' });

    //用于合并思考过程
    let lastMessage: IMessage | null = null

    createSSEWithPost(config.sseUrl, bd, {
      onChunk: (chunk: string) => {
        // 使用stateRef.current获取最新状态
        const latestState = stateRef.current;
        let data: IMessage | null = parseChunk(chunk)
        console.log('chunk', latestState.isTyping, data);

        // 自定义hook 接收后处理
        if (config.hook?.afterReceivedMessage) {
          data = config.hook.afterReceivedMessage(data, config)
        }

        // 停止状态不输出信息
        if (!latestState.isTyping || data === null) {
          return
        }

        // 不开思考模式也会返回thingk类型
        if (!latestState.deepThinking && data.type === 'thinking') {
          return
        }

        if (data.type !== 'thinking') {
          lastMessage = null
        }

        // 初始化思考消息
        if (data.type === 'thinking' && lastMessage === null) {
          lastMessage = data
          dispatch({ type: 'ADD_MESSAGE', payload: data });
          return
        }

        // 追加思考内容
        if (data.type === 'thinking' && lastMessage !== null) {
          lastMessage.content = lastMessage.content + '\n' + data.content
          dispatch({ type: 'UPDATE_MESSAGE', payload: lastMessage });
          return
        }

        dispatch({ type: 'ADD_MESSAGE', payload: data });
      },
      onComplete: (result: string) => {
        console.log('result', result);
        dispatch({ type: 'SET_TYPING', payload: false });
      },
      onError: (error: Error) => {
        console.log('error', error);
        dispatch({
          type: 'ADD_MESSAGE', payload: {
            id: Date.now() + '',
            timestamp: new Date(),
            sender: 'bot',
            content: JSON.stringify(error.message || '网络错误'),
          }
        });
        dispatch({ type: 'SET_TYPING', payload: false });
      },
    });

  };

  const clearMessages = () => dispatch({ type: 'CLEAR_MESSAGES' });

  const contextValue = {
    state,
    dispatch,
    toggleOpen,
    toggleDeepThinking,
    toggleFullScreen,
    setInputValue,
    sendMessage,
    clearMessages,
    config,
  };

  return (
    <BotContext.Provider value={contextValue}>
      {children}
    </BotContext.Provider>
  );
}

// 自定义Hook
export function useBot() {
  const context = useContext(BotContext);
  if (context === undefined) {
    throw new Error('useBot must be used within a BotProvider');
  }
  return context;
}