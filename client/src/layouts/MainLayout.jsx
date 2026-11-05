import Sidebar from '../components/Layout/Sidebar';
import Header from '../components/Layout/Header';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="md:ml-64">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
