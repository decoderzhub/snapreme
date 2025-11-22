export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const links = [
    { label: 'About', id: 'about' },
    { label: 'Influencers', id: 'influencers' },
    { label: 'For Brands', id: 'for-brands' },
    { label: 'For Creators', id: 'for-creators' },
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img
                src="/assets/snapreme_icon.png"
                alt="Snapreme"
                className="w-8 h-8 object-contain"
              />
              <h3 className="text-2xl font-bold text-white">Snapreme</h3>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Premium Snapchat creator platform.
            </p>
          </div>

          <div className="md:text-right">
            <div className="flex flex-wrap gap-4 md:justify-end">
              {links.map((link) => (
                <button
                  key={link.label}
                  onClick={() => link.id ? scrollToSection(link.id) : null}
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center">
          <p className="text-sm text-slate-500">
            © {currentYear} Snapreme.app – All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
