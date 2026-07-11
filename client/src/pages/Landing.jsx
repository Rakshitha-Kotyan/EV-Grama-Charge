import { useEffect, useState } from "react";

export default function Landing() {
  const [displayText, setDisplayText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [count, setCount] = useState({ hosts: 0, riders: 0, km: 0 });
  const [glowPulse, setGlowPulse] = useState(false);

  const fullText = "Charge Anywhere.";

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < fullText.length) {
        setDisplayText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        setGlowPulse(true);
      }
    }, 80);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const cursor = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(cursor);
  }, []);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const targets = { hosts: 120, riders: 540, km: 12000 };
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setCount({
        hosts: Math.floor((targets.hosts * step) / steps),
        riders: Math.floor((targets.riders * step) / steps),
        km: Math.floor((targets.km * step) / steps),
      });
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-dark text-white overflow-hidden relative">

      {/* Animated background grid */}
      <div className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Glow orbs */}
      <div className="fixed top-20 left-1/4 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)",
          animation: "pulse 3s ease-in-out infinite",
        }}
      />
      <div className="fixed bottom-20 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(0,255,136,0.1) 0%, transparent 70%)",
          animation: "pulse 4s ease-in-out infinite reverse",
        }}
      />

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          92% { opacity: 1; }
          93% { opacity: 0.4; }
          94% { opacity: 1; }
          96% { opacity: 0.6; }
          97% { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes electricGlow {
          0%, 100% { text-shadow: 0 0 10px #00D4FF, 0 0 20px #00D4FF, 0 0 40px #00D4FF; }
          50% { text-shadow: 0 0 20px #00FF88, 0 0 40px #00FF88, 0 0 80px #00FF88; }
        }
        .animate-slide-up { animation: slideUp 0.8s ease forwards; }
        .animate-slide-up-delay { animation: slideUp 0.8s ease 0.3s forwards; opacity: 0; }
        .animate-slide-up-delay-2 { animation: slideUp 0.8s ease 0.6s forwards; opacity: 0; }
        .electric-glow { animation: electricGlow 2s ease-in-out infinite; }
        .flicker { animation: flicker 5s linear infinite; }
        .glass-btn {
          background: rgba(0,212,255,0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0,212,255,0.3);
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .glass-btn:hover {
          background: rgba(0,212,255,0.15);
          border-color: rgba(0,212,255,0.8);
          box-shadow: 0 0 20px rgba(0,212,255,0.3);
          transform: translateY(-2px);
        }
        .glass-btn-green {
          background: rgba(0,255,136,0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0,255,136,0.3);
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .glass-btn-green:hover {
          background: rgba(0,255,136,0.15);
          border-color: rgba(0,255,136,0.8);
          box-shadow: 0 0 20px rgba(0,255,136,0.3);
          transform: translateY(-2px);
        }
        .card-glass {
          background: rgba(17,24,39,0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0,212,255,0.1);
          transition: all 0.3s ease;
        }
        .card-glass:hover {
          border-color: rgba(0,212,255,0.4);
          box-shadow: 0 0 30px rgba(0,212,255,0.1);
          transform: translateY(-4px);
        }
      `}</style>

      {/* Navbar */}
      <nav className="relative z-20 flex justify-between items-center px-8 py-5"
        style={{ borderBottom: "1px solid rgba(0,212,255,0.1)" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl flicker">⚡</span>
          <h1 className="text-lg font-bold tracking-widest text-primary hidden sm:block"
            style={{ letterSpacing: "0.15em" }}
          >
            EV-GRAMA
          </h1>
        </div>
        <div className="flex gap-3">
          {/* ☝️ onClick added with window.location.href — always works */}
          <button
            onClick={() => window.location.href = "/login"}
            className="glass-btn text-primary font-semibold px-3 py-2 rounded-lg text-xs tracking-wide sm:px-6 sm:text-sm"
          >
            LOGIN
          </button>
          <button
            onClick={() => window.location.href = "/register"}
            className="glass-btn-green text-secondary font-semibold px-3 py-2 rounded-lg text-xs tracking-wide sm:px-6 sm:text-sm"
          >
            GET STARTED
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-8 py-32">

        {/* Badge */}
        <div className="animate-slide-up mb-8"
          style={{
            background: "rgba(0,212,255,0.05)",
            border: "1px solid rgba(0,212,255,0.2)",
            borderRadius: "100px",
            padding: "6px 20px",
            fontSize: "12px",
            letterSpacing: "0.2em",
            color: "#00D4FF",
          }}
        >
          ◆ COMMUNITY EV CHARGING NETWORK ◆
        </div>

        {/* Main heading with typewriter */}
        <div className="animate-slide-up mb-4">
          <p className="text-gray-500 text-lg tracking-widest mb-4"
            style={{ letterSpacing: "0.3em" }}
          >
            RURAL INDIA'S
          </p>
          <h1 className="font-black leading-none"
            style={{
              fontSize: "clamp(3rem, 10vw, 8rem)",
              background: "linear-gradient(135deg, #00D4FF 0%, #00FF88 50%, #00D4FF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              ...(glowPulse && {
                filter: "drop-shadow(0 0 30px rgba(0,212,255,0.5))"
              })
            }}
          >
            {displayText}
            <span style={{
              opacity: showCursor ? 1 : 0,
              color: "#00D4FF",
              WebkitTextFillColor: "#00D4FF",
            }}>|</span>
          </h1>
        </div>

        <p className="animate-slide-up-delay text-gray-400 text-lg max-w-xl mx-auto mb-12 leading-relaxed">
          No charging stations? No problem. Connect with local shop owners who share their power socket — the Airbnb model for EV charging.
        </p>

        {/* CTA Buttons */}
        <div className="animate-slide-up-delay-2 flex gap-4 flex-wrap justify-center">
          <button
            onClick={() => window.location.href = "/register"}
            className="glass-btn text-primary font-bold px-8 py-4 rounded-xl text-base tracking-wide"
          >
            ⚡ FIND CHARGING POINTS
          </button>
          <button
            onClick={() => window.location.href = "/register"}
            className="glass-btn-green text-secondary font-bold px-8 py-4 rounded-xl text-base tracking-wide"
          >
            🏪 LIST MY SOCKET
          </button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          style={{ animation: "pulse 2s ease-in-out infinite" }}
        >
          <div className="w-px h-12 mx-auto"
            style={{ background: "linear-gradient(to bottom, rgba(0,212,255,0.5), transparent)" }}
          />
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 px-4 py-16"
        style={{ borderTop: "1px solid rgba(0,212,255,0.1)", borderBottom: "1px solid rgba(0,212,255,0.1)" }}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-2 text-center">
          {[
            { value: `${count.hosts}+`, label: "HOSTS", color: "#00D4FF" },
            { value: `${count.riders}+`, label: "RIDERS", color: "#00FF88" },
            { value: `${count.km.toLocaleString()}+`, label: "KM", color: "#00D4FF" },
          ].map((stat, i) => (
            <div key={i}>
              <p className="text-2xl sm:text-4xl font-black mb-2" style={{ color: stat.color }}>
                {stat.value}
              </p>
              <p className="text-xs tracking-widest text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="relative z-10 px-8 py-24 max-w-5xl mx-auto">
        <p className="text-center text-xs tracking-widest text-primary mb-3">◆ HOW IT WORKS ◆</p>
        <h2 className="text-3xl font-bold text-center mb-16">Three steps to charge anywhere</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: "🗺️", step: "01", title: "Find a Host", desc: "Open the live map and see nearby charging points with real-time availability status." },
            { icon: "📅", step: "02", title: "Book a Slot", desc: "Reserve a slot, pick your duration, and see the exact price before confirming." },
            { icon: "⚡", step: "03", title: "Charge & Go", desc: "Plug in, charge up, and continue your journey with confidence." },
          ].map((step, i) => (
            <div key={i} className="card-glass rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-3xl">{step.icon}</span>
                <span className="text-xs font-black tracking-widest"
                  style={{ color: "rgba(0,212,255,0.3)" }}
                >
                  {step.step}
                </span>
              </div>
              <h3 className="font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="relative z-10 px-8 py-20"
        style={{ background: "rgba(0,212,255,0.02)" }}
      >
        <p className="text-center text-xs tracking-widest text-primary mb-3">◆ FEATURES ◆</p>
        <h2 className="text-3xl font-bold text-center mb-12">Built for real roads</h2>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-4">
          {[
            { icon: "📍", title: "Real-time Availability", desc: "Hosts toggle ON/OFF instantly — always know who's available before heading there." },
            { icon: "🔋", title: "Range Calculator", desc: "Know exactly how many km you'll get from a 30-minute charge before booking." },
            { icon: "💰", title: "Micro Earnings", desc: "Shop owners earn extra income from their existing power — zero investment needed." },
            { icon: "🌱", title: "Green Mobility", desc: "Accelerating EV adoption in rural India without waiting for government infrastructure." },
          ].map((feature, i) => (
            <div key={i} className="card-glass rounded-xl p-5 flex gap-4">
              <span className="text-2xl">{feature.icon}</span>
              <div>
                <h3 className="font-bold mb-1 text-sm tracking-wide">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 px-8 py-24 text-center">
        <div className="max-w-2xl mx-auto"
          style={{
            background: "rgba(0,212,255,0.03)",
            border: "1px solid rgba(0,212,255,0.15)",
            borderRadius: "24px",
            padding: "60px 40px",
          }}
        >
          <p className="text-xs tracking-widest text-primary mb-4">◆ JOIN THE NETWORK ◆</p>
          <h2 className="text-4xl font-black mb-4">
            Ready to never run
            <span style={{
              background: "linear-gradient(135deg, #00D4FF, #00FF88)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}> out of charge?</span>
          </h2>
          <p className="text-gray-400 mb-8">Join thousands of riders and hosts building India's community charging network.</p>
          <button
            onClick={() => window.location.href = "/register"}
            className="glass-btn text-primary font-bold px-10 py-4 rounded-xl text-base tracking-widest"
          >
            ⚡ GET STARTED FREE
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-8 text-center"
        style={{ borderTop: "1px solid rgba(0,212,255,0.1)" }}
      >
        <p className="text-primary font-bold tracking-widest mb-1">⚡ EV-GRAMA CHARGE</p>
        <p className="text-xs text-gray-600 tracking-wide">COMMUNITY CHARGING NETWORK FOR RURAL INDIA 🇮🇳</p>
        <p className="text-xs text-gray-700 mt-3">Built with MERN Stack + Google Maps API</p>
      </footer>

    </div>
  );
}