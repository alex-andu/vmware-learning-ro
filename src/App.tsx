import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { StoreProvider } from './lib/storage';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { ModulePage } from './pages/ModulePage';
import { LessonPage } from './pages/LessonPage';
import { GlossaryPage, SearchPage, SettingsPage } from './pages/misc';
import { NotFound } from './pages/NotFound';

export function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="module/:moduleId" element={<ModulePage />} />
            <Route path="lesson/:moduleId/:lessonId" element={<LessonPage />} />
            <Route path="glossary" element={<GlossaryPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
