import "./App.css";
import DefaultRouterIndex from "@/routes";
import { SidebarProvider } from "@repo/ui/src/components/sidebar.tsx";
function App() {
  return (
    <SidebarProvider>
      <DefaultRouterIndex />
    </SidebarProvider>
  );
}

export default App;
