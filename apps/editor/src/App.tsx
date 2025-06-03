import "./App.css";
import DefaultRouterIndex from "@/routes";
import { SidebarProvider } from "@/components/ui/sidebar";

function App() {
  return (
    <SidebarProvider>
      <DefaultRouterIndex />
    </SidebarProvider>
  );
}

export default App;
