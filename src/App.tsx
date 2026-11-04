import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Overview } from './pages/Overview';
import { Workspace } from './pages/Workspace';
import { Methodology } from './pages/Methodology';
import { Evaluation } from './pages/Evaluation';
import { About } from './pages/About';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/methodology" element={<Methodology />} />
          <Route path="/evaluation" element={<Evaluation />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
