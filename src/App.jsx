import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { UnitProvider } from './context/UnitContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import WeatherPage from './pages/WeatherPage';

export default function App() {
  return (
    <UnitProvider>
      <div className="app-root">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/weather" element={<WeatherPage />} />
        </Routes>
      </div>
    </UnitProvider>
  );
}
