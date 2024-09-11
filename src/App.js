import logo from './logo.svg';
import './App.css';
import ChatApp from './components/ChatApp';
import Chat from './components/Chat';
import UserAuthPopup from './components/UserAuthPopup';

function App() {
  return (
    <div className="App">
     <>
      <ChatApp />
      <UserAuthPopup />
    </>
     {/* <Chat /> */}
    </div>
  );
}

export default App;
