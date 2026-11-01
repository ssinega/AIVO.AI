import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { NewInvestigationPage } from './pages/NewInvestigationPage';
import { InvestigationDetailPage } from './pages/InvestigationDetailPage';
import { InvestigationsListPage } from './pages/InvestigationsListPage';
import { CapaManagementPage } from './pages/CapaManagementPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
          {/* Persistent Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Top Bar Navigation */}
            <Header />

            {/* Viewport Content */}
            <main className="flex-1 p-6 overflow-y-auto">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/investigations" element={<InvestigationsListPage />} />
                <Route path="/investigations/new" element={<NewInvestigationPage />} />
                <Route path="/investigations/:id" element={<InvestigationDetailPage />} />
                <Route path="/capa" element={<CapaManagementPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </Provider>
  );
}
