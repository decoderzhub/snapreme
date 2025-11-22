import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, Settings, Shield, LayoutDashboard, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [isStripeConnected, setIsStripeConnected] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setIsCreator(false);
      setIsStripeConnected(false);
      setNeedsOnboarding(false);
      return;
    }

    async function checkCreatorStatus() {
      const { data } = await supabase
        .from('creators')
        .select('id, is_stripe_connected, onboarding_complete')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setIsCreator(true);
        setIsStripeConnected(!!data.is_stripe_connected);
        setNeedsOnboarding(!data.onboarding_complete);
      } else {
        setNeedsOnboarding(false);
      }
    }

    checkCreatorStatus();
  }, [user]);

  const isHomePage = location.pathname === '/';

  const scrollToSection = (id: string) => {
    if (isHomePage) {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
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
    { label: 'Home', type: 'link' as const, path: '/', requiresAuth: false },
    { label: 'Explore creators', type: 'link' as const, path: '/network', requiresAuth: true },
    { label: 'For creators', type: 'link' as const, path: '/creators', requiresAuth: false },
    { label: 'Pricing', type: 'link' as const, path: '/pricing', requiresAuth: false },
  ].filter(link => !link.requiresAuth || user);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex-shrink-0 flex items-center gap-2">
            <img
              src="/assets/snapreme_icon.png"
              alt="Snapreme"
              className="w-8 h-8 object-contain"
            />
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Snapreme
            </h1>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) =>
              link.type === 'link' ? (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'text-blue-600'
                      : 'text-slate-600 hover:text-blue-600'
                  }`}
                >
                  {link.label}
                </Link>
              ) : null
            )}

            {!user ? (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 text-white text-sm font-medium shadow-md hover:shadow-lg hover:brightness-110 transition-all"
                >
                  Create account
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen((v) => !v)}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-900 text-white hover:bg-slate-800"
                >
                  <User className="w-4 h-4" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-100 py-2 text-sm">
                    {isCreator && (
                      <div className="px-3 py-2 border-b border-slate-100">
                        {isStripeConnected ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                            <DollarSign className="w-3 h-3" />
                            Premium Creator
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              navigate('/dashboard/monetization');
                              setIsUserMenuOpen(false);
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-colors"
                          >
                            <DollarSign className="w-3 h-3" />
                            Free • Set up payouts
                          </button>
                        )}
                      </div>
                    )}
                    <button
                      onClick={() => {
                        navigate('/dashboard');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </button>
                    {isCreator && (
                      <button
                        onClick={() => {
                          navigate('/dashboard/monetization');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
                      >
                        <DollarSign className="w-4 h-4" />
                        <span>Monetization</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        navigate('/account/settings');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Account settings</span>
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          navigate('/admin');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin</span>
                      </button>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-700 hover:text-blue-600 hover:bg-slate-100"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {user && isCreator && needsOnboarding && (
        <div className="bg-amber-50 border-t border-amber-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-amber-800 font-semibold">
              <Shield className="w-4 h-4" />
              <span>Complete your setup to activate your Snapreme profile.</span>
            </div>
            <Link
              to="/onboarding"
              className="inline-flex items-center px-3 py-1.5 rounded-full bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700"
            >
              Finish onboarding
            </Link>
          </div>
        </div>
      )}

      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white">
          <div className="px-4 pt-2 pb-4 space-y-2">
            {navLinks.map((link) =>
              link.type === 'link' ? (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === link.path
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              ) : null
            )}

            {!user ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center px-3 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 text-white text-sm font-medium"
                >
                  Create account
                </Link>
              </>
            ) : (
              <>
                {isCreator && (
                  <div className="px-3 py-2">
                    {isStripeConnected ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                        <DollarSign className="w-3 h-3" />
                        Premium Creator
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          navigate('/dashboard/monetization');
                          setIsMenuOpen(false);
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-colors"
                      >
                        <DollarSign className="w-3 h-3" />
                        Free • Set up payouts
                      </button>
                    )}
                  </div>
                )}
                <button
                  onClick={() => {
                    navigate('/dashboard');
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-50"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>
                {isCreator && (
                  <button
                    onClick={() => {
                      navigate('/dashboard/monetization');
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Monetization</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    navigate('/account/settings');
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Settings className="w-4 h-4" />
                  <span>Account settings</span>
                </button>
                {isAdmin && (
                  <button
                    onClick={() => {
                      navigate('/admin');
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin</span>
                  </button>
                )}
                <button
                  onClick={async () => {
                    await handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
