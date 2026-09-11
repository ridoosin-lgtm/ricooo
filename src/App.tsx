import React, { useState, useEffect } from 'react';
import { db } from './services/dbService';
import { User, Ship, Port, Route, CargoCategoryMaster, VoyageSchedule, PassengerTicket, CargoItem, DatabaseConfig } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';
import { ShipMaster } from './components/master/ShipMaster';
import { PortRouteMaster } from './components/master/PortRouteMaster';
import { CargoMaster } from './components/master/CargoMaster';
import { ScheduleManager } from './components/transactions/ScheduleManager';
import { PassengerTickets } from './components/transactions/PassengerTickets';
import { CargoManifestManager } from './components/transactions/CargoManifestManager';
import { ManifestReport } from './components/reports/ManifestReport';
import { DatabaseConnectionModal } from './components/database/DatabaseConnectionModal';
import { Menu, X } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => db.getCurrentUser());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDbModalOpen, setIsDbModalOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Core Data synced from dbService
  const [ships, setShips] = useState<Ship[]>(() => db.getShips());
  const [ports, setPorts] = useState<Port[]>(() => db.getPorts());
  const [routes, setRoutes] = useState<Route[]>(() => db.getRoutes());
  const [cargoCategories, setCargoCategories] = useState<CargoCategoryMaster[]>(() => db.getCargoCategories());
  const [schedules, setSchedules] = useState<VoyageSchedule[]>(() => db.getSchedules());
  const [passengers, setPassengers] = useState<PassengerTicket[]>(() => db.getPassengers());
  const [cargoItems, setCargoItems] = useState<CargoItem[]>(() => db.getCargoItems());
  const [dbConfig, setDbConfig] = useState<DatabaseConfig>(() => db.getConfig());

  // Subscribe to changes from dbService
  useEffect(() => {
    const unsubscribe = db.subscribe(() => {
      setShips(db.getShips());
      setPorts(db.getPorts());
      setRoutes(db.getRoutes());
      setCargoCategories(db.getCargoCategories());
      setSchedules(db.getSchedules());
      setPassengers(db.getPassengers());
      setCargoItems(db.getCargoItems());
      setDbConfig(db.getConfig());
      setCurrentUser(db.getCurrentUser());
    });

    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (user: User) => {
    db.setCurrentUser(user);
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    db.logout();
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  const activeVoyages = schedules.filter(s => s.status === 'Berlayar' || s.status === 'Boarding').length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-blue-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        user={currentUser}
        onLogout={handleLogout}
        dbConfig={dbConfig}
        onOpenDatabaseManager={() => setIsDbModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Mobile Navigation Toggle */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between no-print">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Menu Operasional</span>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab('database')}
          className="text-xs font-bold text-blue-600 hover:underline"
        >
          {dbConfig.activeEngine || 'Local DB'}
        </button>
      </div>

      {/* Main Layout Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            shipCount={ships.length}
            activeVoyageCount={activeVoyages}
          />
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs flex">
            <div className="w-72 bg-white h-full shadow-2xl overflow-y-auto">
              <div className="p-4 flex items-center justify-between border-b border-slate-200">
                <span className="font-bold text-slate-900 text-sm">Navigasi Utama</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <Sidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {
                  setActiveTab(tab);
                  setMobileMenuOpen(false);
                }}
                shipCount={ships.length}
                activeVoyageCount={activeVoyages}
              />
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <Dashboard
              ships={ships}
              schedules={schedules}
              passengers={passengers}
              cargoItems={cargoItems}
              routes={routes}
              ports={ports}
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenDatabaseManager={() => setIsDbModalOpen(true)}
            />
          )}

          {activeTab === 'schedules' && (
            <ScheduleManager
              schedules={schedules}
              ships={ships}
              routes={routes}
              passengers={passengers}
              cargoItems={cargoItems}
            />
          )}

          {activeTab === 'passengers' && (
            <PassengerTickets
              passengers={passengers}
              schedules={schedules}
              ships={ships}
              routes={routes}
            />
          )}

          {activeTab === 'cargo' && (
            <CargoManifestManager
              cargoItems={cargoItems}
              schedules={schedules}
              ships={ships}
              categories={cargoCategories}
            />
          )}

          {activeTab === 'master-ships' && (
            <ShipMaster ships={ships} />
          )}

          {activeTab === 'master-ports-routes' && (
            <PortRouteMaster ports={ports} routes={routes} />
          )}

          {activeTab === 'master-cargo-rates' && (
            <CargoMaster categories={cargoCategories} />
          )}

          {activeTab === 'reports' && (
            <ManifestReport
              schedules={schedules}
              ships={ships}
              routes={routes}
              ports={ports}
              passengers={passengers}
              cargoItems={cargoItems}
            />
          )}

          {activeTab === 'database' && (
            <DatabaseConnectionModal isStandaloneTab={true} />
          )}
        </main>
      </div>

      {/* Standalone Database Manager Modal */}
      {isDbModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-lg font-black text-slate-900">Kelola Koneksi Database Real-Time</h2>
              <button
                type="button"
                onClick={() => setIsDbModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <DatabaseConnectionModal onClose={() => setIsDbModalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
