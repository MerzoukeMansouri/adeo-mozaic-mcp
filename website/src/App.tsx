import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Docs from "./pages/Docs";
import Sources from "./pages/Sources";
import Playground from "./pages/Playground";
import Skills from "./pages/Skills";
import PublicAPI from "./pages/PublicAPI";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="docs" element={<Docs />} />
        <Route path="docs/:slug" element={<Docs />} />
        <Route path="sources" element={<Sources />} />
        <Route path="skills" element={<Skills />} />
        <Route path="playground" element={<Playground />} />
        <Route path="public-api" element={<PublicAPI />} />
      </Route>
    </Routes>
  );
}

export default App;
