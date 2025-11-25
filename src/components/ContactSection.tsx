import { useState, FormEvent, useEffect } from 'react';
import { Send, Mail, MessageSquare, Clock, CheckCircle2, User, Building2, Users, HelpCircle, Zap } from 'lucide-react';

// Floating peak.boo icons like feathers
function FloatingIcons() {
  const [icons, setIcons] = useState<Array<{
    id: number;
    x: number;
    y: number;
    rotation: number;
    rotationSpeed: number;
    opacity: number;
    speed: number;
    swayOffset: number;
    swaySpeed: number;
  }>>([]);

  useEffect(() => {
    const initialIcons = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 2,
      opacity: 0.15 + Math.random() * 0.25,
      speed: 0.15 + Math.random() * 0.3,
      swayOffset: Math.random() * Math.PI * 2,
      swaySpeed: 0.02 + Math.random() * 0.03,
    }));
    setIcons(initialIcons);

    const interval = setInterval(() => {
      setIcons(prev => prev.map(icon => {
        let newY = icon.y - icon.speed;
        let newOpacity = icon.opacity;

        // Reset when going off top
        if (newY < -10) {
          return {
            ...icon,
            y: 110,
            x: Math.random() * 100,
            opacity: 0.15 + Math.random() * 0.25,
            rotation: Math.random() * 360,
          };
        }

        // Fade out as it goes up
        if (newY < 20) {
          newOpacity = icon.opacity * 0.98;
        }

        return {
          ...icon,
          y: newY,
          x: icon.x + Math.sin(icon.y * icon.swaySpeed + icon.swayOffset) * 0.15,
          rotation: icon.rotation + icon.rotationSpeed,
          opacity: newOpacity,
        };
      }));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {icons.map(icon => (
        <img
          key={icon.id}
          src="/assets/snapreme_icon.png"
          alt=""
          className="absolute w-6 h-6 object-contain"
          style={{
            left: `${icon.x}%`,
            top: `${icon.y}%`,
            transform: `translate(-50%, -50%) rotate(${icon.rotation}deg)`,
            opacity: icon.opacity,
          }}
        />
      ))}
    </div>
  );
}

const roleOptions = [
  { value: 'creator', label: 'Creator', icon: User, description: 'I create content' },
  { value: 'brand', label: 'Brand', icon: Building2, description: 'I represent a brand' },
  { value: 'agency', label: 'Agency', icon: Users, description: 'I work with creators' },
  { value: 'other', label: 'Other', icon: HelpCircle, description: 'Something else' },
];

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', role: '', message: '' });
    }, 3000);
  };

  return (
    <section id="contact" className="relative py-24 md:py-32 bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 overflow-hidden">
      {/* Animated Background - Floating peak.boo icons */}
      <FloatingIcons />

      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-purple-600/10 to-blue-600/10 rounded-full blur-3xl" />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium mb-6 border border-purple-500/30">
              <MessageSquare className="w-4 h-4" />
              Get in Touch
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
              Let's{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Build Together
              </span>
            </h2>

            <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
              Whether you're a creator looking to monetize, a brand seeking partnerships,
              or just curious about peak.boo — we'd love to hear from you.
            </p>

            {/* Feature highlights */}
            <div className="space-y-4 max-w-md mx-auto lg:mx-0">
              {[
                { icon: Clock, text: 'Response within 24 hours', color: 'from-blue-500 to-cyan-500' },
                { icon: Zap, text: 'Direct line to our team', color: 'from-purple-500 to-pink-500' },
                { icon: CheckCircle2, text: 'No spam, ever', color: 'from-emerald-500 to-green-500' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Form */}
          <div className="relative">
            {/* Glow behind form */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-2xl" />

            <div className="relative bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl p-8">
              {isSubmitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4 border border-green-500/30">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Message Sent!</h3>
                  <p className="text-slate-400">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name Field */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                      Your Name
                    </label>
                    <div className={`relative rounded-xl overflow-hidden transition-all duration-300 ${focusedField === 'name' ? 'ring-2 ring-purple-500/50' : ''}`}>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                      Email Address
                    </label>
                    <div className={`relative rounded-xl overflow-hidden transition-all duration-300 ${focusedField === 'email' ? 'ring-2 ring-purple-500/50' : ''}`}>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 transition-all"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  {/* Role Selection - Modern Cards */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      I am a...
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {roleOptions.map((role) => {
                        const isSelected = formData.role === role.value;
                        return (
                          <button
                            key={role.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, role: role.value })}
                            className={`relative p-3 rounded-xl border transition-all duration-300 text-left ${
                              isSelected
                                ? 'bg-purple-500/20 border-purple-500/50 text-white'
                                : 'bg-slate-900/30 border-slate-600/30 text-slate-400 hover:border-slate-500/50 hover:text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <role.icon className={`w-4 h-4 ${isSelected ? 'text-purple-400' : ''}`} />
                              <span className="text-sm font-medium">{role.label}</span>
                            </div>
                            {isSelected && (
                              <div className="absolute top-2 right-2">
                                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Message Field */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                      Your Message
                    </label>
                    <div className={`relative rounded-xl overflow-hidden transition-all duration-300 ${focusedField === 'message' ? 'ring-2 ring-purple-500/50' : ''}`}>
                      <textarea
                        id="message"
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        onFocus={() => setFocusedField('message')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 transition-all resize-none"
                        placeholder="Tell us about your project or how we can help..."
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-semibold rounded-xl hover:brightness-110 transition-all duration-300 shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 group"
                  >
                    <span>Send Message</span>
                    <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <p className="text-xs text-center text-slate-500">
                    By submitting, you agree to our privacy policy. We'll never share your info.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
