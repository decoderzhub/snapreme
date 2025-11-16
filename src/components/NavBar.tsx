import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, Settings, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  console.log('NavBar - user:', user?.email, 'isAdmin:', isAdmin);

  const isHomePage = location.pathname === '/';

  const scrollToSection = (id: string) => {
    if (isHomePage) {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setIsMenuOpen(false);
      }
    } else {
      navigate('/', { state: { scrollTo: id } });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const navLinks = [
    { label: 'Home', path: '/', type: 'link' },
    { label: 'Network', path: '/network', type: 'link' },
    { label: 'For Brands', path: '/brands', type: 'link' },
    { label: 'For Creators', path: '/creators', type: 'link' },
    { label: 'Pricing', path: '/pricing', type: 'link' },
    { label: 'Case Studies', path: '/case-studies', type: 'link' },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Snapreme
            </h1>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) =>
              link.type === 'link' ? (
                <Link
                  key={link.path}
                  to={link.path!}
                  className={`text-slate-600 hover:text-blue-600 transition-colors duration-200 font-medium ${
                    location.pathname === link.path ? 'text-blue-600' : ''
                  }`}
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id!)}
                  className="text-slate-600 hover:text-blue-600 transition-colors duration-200 font-medium"
                >
                  {link.label}
                </button>
              )
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-medium hover:from-blue-700 hover:to-indigo-600 transition-all"
                >
                  <User size={18} />
                  <span>Account</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-100 py-2">
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2 font-medium"
                      >
                        <Shield size={16} />
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/account/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Settings size={16} />
                      My Profile
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-blue-600 transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-medium hover:from-blue-700 hover:to-indigo-600 transition-all shadow-sm"
                >
                  Join Network
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white">
          <div className="px-4 py-3 space-y-2">
            {navLinks.map((link) =>
              link.type === 'link' ? (
                <Link
                  key={link.path}
                  to={link.path!}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors font-medium ${
                    location.pathname === link.path ? 'text-blue-600 bg-blue-50' : ''
                  }`}
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id!)}
                  className="block w-full text-left px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors font-medium"
                >
                  {link.label}
                </button>
              )
            )}

            {user ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-left px-3 py-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  to="/account/settings"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-left px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors font-medium"
                >
                  My Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-left px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-medium"
                >
                  Join Network
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
