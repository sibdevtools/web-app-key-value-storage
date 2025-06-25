import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'hugeicons-react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import SpacesListPage from './pages/space/SpacesListPage';
import { contextPath } from './const/common.const';
import SpaceKeysListPage from './pages/space/keys/SpaceKeysListPage';


const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={contextPath}>
          <Route index element={<SpacesListPage />} />
          <Route path={'space'}>
            <Route path={':space'}>
              <Route index element={<SpaceKeysListPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
