import { BotProvider } from './store/aiBotContext';
import App from './App';

import type { IConfig } from './store/aiBotContext';

interface AIBotProps {
    config: IConfig;
}

const AIBot = (props: AIBotProps) => {
    return (
        <BotProvider config={props.config}>
            <App />
        </BotProvider>
    )
}

export default AIBot;