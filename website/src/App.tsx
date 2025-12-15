import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Architecture from "./pages/Architecture";
import Development from "./pages/Development";
import TestDocs from "./pages/TestDocs";
import Sources from "./pages/Sources";
import Playground from "./pages/Playground";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="architecture" element={<Architecture />} />
        <Route path="development" element={<Development />} />
        <Route path="test" element={<TestDocs />} />
        <Route path="sources" element={<Sources />} />
        <Route path="playground" element={<Playground />} />
      </Route>
    </Routes>
  );
}

export default App;
