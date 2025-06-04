import { ScreenRecorder } from './components/ScreenRecorder/ScreenRecorder';
import { Toaster } from 'sonner';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />
      <ScreenRecorder />
    </div>
  );
}

export default App;
