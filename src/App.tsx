import { useBot } from '@/store/aiBotContext';
import BotButton from '@/components/BotButton';
import ChatModal from '@/components/ChatModal';
import './App.css';

const App = () => {
  const { state, toggleOpen, setInputValue, sendMessage } = useBot();

  return (
    <div className="app-container">
      {/* 可拖拽圆形按钮组件 */}
      <BotButton isOpen={state.isOpen} toggleOpen={toggleOpen} />

      {/* 聊天弹窗组件 */}
      <ChatModal 
        state={state} 
        toggleOpen={toggleOpen} 
        setInputValue={setInputValue} 
        sendMessage={sendMessage} 
      />
    </div>
  );
};

export default App;
