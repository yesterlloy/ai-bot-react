
// 导出组件
export { default as BotButton } from './components/BotButton/index';
export { default as ChatModal } from './components/ChatModal/index';

export { BotProvider, useBot } from './store/aiBotContext';

export type { IMessage, BotState } from './store/aiBotContext';

// export { apiService } from './services/apiService';
// export { createSSE, createSSEWithPost } from './services/sseService1';

export { default as AIBot } from './AIBot';