import { AuthContextProvider } from "./context/authContext";
import SocketContextProvider from "./context/socketContext";
import { AppRouter } from "./router/AppRouter";
import ConversationProvider from "./context/conversationContext";

function App() {
  return (
    <SocketContextProvider>
      <AuthContextProvider>
        <ConversationProvider>
          <AppRouter />
        </ConversationProvider>
      </AuthContextProvider>
    </SocketContextProvider>
  );
}

export default App;
