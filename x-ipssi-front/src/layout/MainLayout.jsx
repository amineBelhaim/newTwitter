import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4">
        <Outlet />
      </main>
    </div>
  );
}
