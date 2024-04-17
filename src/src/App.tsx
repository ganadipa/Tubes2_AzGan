import { Toaster } from "react-hot-toast";
import PageRoute from "./routes/pageroute";

function App() {
  return (
    <div className="App h-[100vh] w-[100vw] bg-[#0B1F36] flex flex-col  font-poppins">
      <Toaster />
      <div>
        <PageRoute />
      </div>
    </div>
  );
}

export default App;