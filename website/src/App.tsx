import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Docs from "./pages/Docs";
import Sources from "./pages/Sources";
import Playground from "./pages/Playground";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="docs" element={<Docs />} />
        <Route path="docs/:slug" element={<Docs />} />
        <Route path="sources" element={<Sources />} />
        <Route path="playground" element={<Playground />} />
      </Route>
    </Routes>
  );
}

export default App;
