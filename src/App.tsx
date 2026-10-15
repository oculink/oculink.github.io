import { useState, useEffect, useMemo } from 'react';

function App() {
  const [zIndex, setZIndex] = useState<Record<string, number>>({});
  const [highestZ, setHighestZ] = useState(10);
  const [timestamp, setTimestamp] = useState('00:00:00');
  const [webcamOpacity, setWebcamOpacity] = useState(0.7);

  const [windowOpacities, setWindowOpacities] = useState<Record<string, number>>({
    header: 1,
    about: 1,
    fastfetch: 1,
  });

  // VHS timestamp counter
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const hours = Math.floor(elapsed / 3600).toString().padStart(2, '0');
      const minutes = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
      const seconds = (elapsed % 60).toString().padStart(2, '0');
      setTimestamp(`${hours}:${minutes}:${seconds}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const setWindowOpacity = (id: string, value: number) => {
    setWindowOpacities(prev => ({ ...prev, [id]: value }));
  };

  const bringToFront = (id: string) => {
    const newZ = highestZ + 1;
    setHighestZ(newZ);
    setZIndex(prev => ({ ...prev, [id]: newZ }));
  };

  // Window layout - side by side with inconsistent heights
  const windowLayout = useMemo(() => ({
    header: { width: 'min(700px, 94vw)', margin: '0 auto' },
    about: { width: '45%', height: '500px' },
    fastfetch: { width: '50%', height: '600px' },
  }), []);

  // Mobile layout - stacked
  const mobileLayout = useMemo(() => ({
    header: { width: '100%', transform: 'none', margin: '0' },
    about: { width: '100%', height: 'auto', minHeight: '500px', transform: 'none', margin: '0' },
    fastfetch: { width: '100%', height: 'auto', minHeight: '600px', transform: 'none', margin: '0' },
  }), []);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentLayout = isMobile ? mobileLayout : windowLayout;

  return (
    <div className="main-bg scanlines">
      {/* VHS Overlays */}
      <div className="vhs-rec">REC</div>
      <div className="vhs-timestamp">
        PLAY ▶ {timestamp}
      </div>
      <div className="noise-overlay"></div>
      <div className="vhs-intense-overlay"></div>

      {/* Main Content Area */}
      <div className="desktop-area" style={{ display: 'flex', flexDirection: 'column', gap: '40px', padding: '60px 20px' }}>
        {/* Header - wrapper with slider outside opacity */}
        <div className="window-wrapper" style={{ ...currentLayout.header, position: 'relative' }}>
          <div className="window-opacity-slider">
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={windowOpacities.header}
              onChange={(e) => setWindowOpacity('header', parseFloat(e.target.value))}
              className="window-slider slider-header"
            />
          </div>
          <div 
            id="header"
            className="error-dialog"
            style={{ zIndex: zIndex['header'] || 5, opacity: windowOpacities.header, width: '100%' }}
            onClick={() => bringToFront('header')}
          >
            <HeaderContent />
          </div>
        </div>

        {/* Windows Row - Side by Side */}
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', alignItems: 'flex-start' }}>
          {/* About Me - Dark Terminal */}
          <div className="window-wrapper" style={{ ...currentLayout.about, position: 'relative' }}>
            <div className="window-opacity-slider">
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={windowOpacities.about}
                onChange={(e) => setWindowOpacity('about', parseFloat(e.target.value))}
                className="window-slider slider-about"
              />
            </div>
            <Win95Window
              id="about"
              title="~/about_me.txt"
              theme="terminal"
              style={{ opacity: windowOpacities.about, width: '100%', height: '100%' }}
              zIndex={zIndex['about'] || 6}
              onFocus={() => bringToFront('about')}
            >
              <AboutMeContent />
            </Win95Window>
          </div>

          {/* Fastfetch - Dracula */}
          <div className="window-wrapper" style={{ ...currentLayout.fastfetch, position: 'relative' }}>
            <div className="window-opacity-slider">
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={windowOpacities.fastfetch}
                onChange={(e) => setWindowOpacity('fastfetch', parseFloat(e.target.value))}
                className="window-slider slider-fastfetch"
              />
            </div>
            <Win95Window
              id="fastfetch"
              title="oculink@archlinux: ~"
              theme="dracula"
              style={{ opacity: windowOpacities.fastfetch, width: '100%', height: '100%' }}
              zIndex={zIndex['fastfetch'] || 8}
              onFocus={() => bringToFront('fastfetch')}
            >
              <FastfetchContent />
            </Win95Window>
          </div>
        </div>

      </div>

      {/* Floating Webcam Overlay - Qtie */}
      <div className="webcam-overlay-fixed" style={{ opacity: webcamOpacity }}>
        <div className="webcam-slider-container">
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={webcamOpacity}
            onChange={(e) => setWebcamOpacity(parseFloat(e.target.value))}
            className="webcam-slider"
          />
        </div>
        <div className="webcam-rgb-frame">
          <div className="webcam-inner">
            <img 
              src="https://media1.tenor.com/m/DTD6MHUBbdQAAAAC/yunyun-yunyun-syndrome-rythm-psychosis.gif"
              alt="Qtie"
              className="webcam-gif"
            />
            <div className="webcam-overlay-effects">
              <div className="webcam-rec">● REC</div>
              <div className="webcam-timestamp">CAM 01</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== COMPONENTS =====

function Win95Window({ 
  id,
  title, 
  children, 
  theme = 'pink',
  style,
  zIndex = 1,
  onFocus
}: { 
  id: string;
  title: string; 
  children: React.ReactNode; 
  theme?: 'pink' | 'terminal' | 'dracula' | 'amber' | 'blood' | 'webcam';
  style?: React.CSSProperties;
  zIndex?: number;
  onFocus?: () => void;
}) {
  return (
    <div 
      id={id}
      className={`win95-window theme-${theme}`}
      style={{ ...style, zIndex }}
      onClick={onFocus}
    >
      <div className={`title-bar theme-${theme}`}>
        <span className="title-bar-text">
          {title}
        </span>
        <div className="title-bar-buttons">
          <button className="title-btn">_</button>
          <button className="title-btn">□</button>
          <button className="title-btn">×</button>
        </div>
      </div>
      <div className={`window-content theme-${theme}`}>
        {children}
      </div>
    </div>
  );
}

function HeaderContent() {
  const [emailCopied, setEmailCopied] = useState(false);

  const handleEmailClick = () => {
    navigator.clipboard.writeText('oculink@proton.me');
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  return (
    <div className="vhs-header">
      {/* Title bar */}
      <div className="error-title-bar">
        <span className="error-title-text">oculink.exe</span>
        <div className="error-title-buttons">
          <button className="error-title-btn">_</button>
          <button className="error-title-btn">□</button>
          <button className="error-title-btn">×</button>
        </div>
      </div>

      {/* Main content - minimal with VHS glitch */}
      <div className="vhs-content">
        <div className="vhs-glitch-container">
          <h1 className="vhs-name">oculink</h1>
        </div>

        {/* Email copied notification */}
        {emailCopied && (
          <div className="email-copied-notification">
            Email copied!
          </div>
        )}

        {/* Social buttons */}
        <div className="social-buttons">
          <a href="https://github.com/oculink" target="_blank" rel="noopener noreferrer" className="social-btn">
            <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/github.svg" alt="GitHub" className="social-icon" />
            <span>GitHub</span>
          </a>
          <a href="https://steamcommunity.com/id/oculink/" target="_blank" rel="noopener noreferrer" className="social-btn">
            <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/steam.svg" alt="Steam" className="social-icon" />
            <span>Steam</span>
          </a>
          <a href="https://www.tiktok.com/@oculink" target="_blank" rel="noopener noreferrer" className="social-btn">
            <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/tiktok.svg" alt="TikTok" className="social-icon" />
            <span>TikTok</span>
          </a>
          <a href="https://www.youtube.com/@ocu-link" target="_blank" rel="noopener noreferrer" className="social-btn">
            <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/youtube.svg" alt="YouTube" className="social-icon" />
            <span>YouTube</span>
          </a>
          <a href="https://www.twitch.tv/oculink" target="_blank" rel="noopener noreferrer" className="social-btn">
            <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/twitch.svg" alt="Twitch" className="social-icon" />
            <span>Twitch</span>
          </a>
          <button onClick={handleEmailClick} className="social-btn">
            <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/protonmail.svg" alt="Email" className="social-icon" />
            <span>Email</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function AboutMeContent() {
  return (
    <div className="space-y-4">
      {/* Profile section */}
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-20 h-20 border-2 border-cyan-400/50 flex items-center justify-center bg-black/50 flex-shrink-0 overflow-hidden shadow-[0_0_15px_rgba(0,255,255,0.3)]">
          <img 
            src="https://github.com/oculink.png" 
            alt="oculink" 
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).parentElement!.innerHTML = '<span style="font-size:2rem;color:#00ffff;">⚡</span>';
            }}
          />
        </div>
        <div className="flex-1">
          <div className="border-2 border-cyan-400/30 bg-black/40 p-4 text-lg font-[VT323] backdrop-blur-sm">
            <p className="text-cyan-400">
              <span className="text-green-400 font-bold">~ $</span> cat about.txt
            </p>
            <p className="text-cyan-200 mt-3">
              Hey, I'm oculink. I happen to have social anxiety, ADHD, bipolar, and BPD. 
              I'm a boyfailure who spends most of my time coding, developing, and sometimes debugging.
            </p>
            <p className="text-cyan-200 mt-3">
              When I'm not programming, I'm probably bedrotting or doomscrolling. I love cute cats 
              and moon jellyfish. My favorite things to consume are fruit jellies, vitamin C orange 
              flavored stuff, and juice smoothies.
            </p>
            <p className="text-cyan-200 mt-3">
              For games, I play Minecraft, Roblox, Portal 2, Geometry Dash, and Needy Streamer Overload.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

function FastfetchContent() {
  return (
    <div className="overflow-x-auto" style={{ background: '#282a36' }}>
      <pre className="text-lg leading-relaxed whitespace-pre p-4" style={{ fontFamily: "'VT323', monospace" }}>
        {'\n'}
        {'  '}<span className="terminal-user">oculink</span><span className="terminal-at">@</span><span className="terminal-host">archlinux</span>
        {'\n  '}<span style={{color:'#6272a4'}}>-----------------</span>
        {'\n  '}<span style={{color:'#ff79c6'}}>OS:</span><span className="ff-value"> Arch Linux x86_64</span>
        {'\n  '}<span style={{color:'#ff79c6'}}>Host:</span><span className="ff-value"> oculink</span>
        {'\n  '}<span style={{color:'#ff79c6'}}>Kernel:</span><span className="ff-value"> 6.12.1-arch1-1</span>
        {'\n  '}<span style={{color:'#ff79c6'}}>Uptime:</span><span className="ff-value"> since the last reboot</span>
        {'\n  '}<span style={{color:'#ff79c6'}}>Shell:</span><span className="ff-value"> bash 5.2.37</span>
        {'\n  '}<span style={{color:'#ff79c6'}}>CPU:</span><span className="ff-value"> AMD Ryzen 7 8845HS (16) @ 5.1GHz</span>
        {'\n  '}<span style={{color:'#ff79c6'}}>GPU:</span><span className="ff-value"> AMD Radeon RX 7900 XTX [Discrete]</span>
        {'\n       '}<span className="ff-value"> AMD Radeon 780M Graphics [Integrated]</span>
        {'\n  '}<span style={{color:'#ff79c6'}}>Memory:</span><span className="ff-value"> 64GB DDR5 5600MHz</span>
        {'\n  '}<span style={{color:'#ff79c6'}}>Disk:</span><span className="ff-value"> too much SSD</span>
        {'\n  '}<span style={{color:'#ff79c6'}}>Locale:</span><span className="ff-value"> en_US.UTF-8</span>
        {'\n'}
        {'\n  '}<span style={{color:'#ff79c6'}}>███</span><span style={{color:'#ff5555'}}>███</span><span style={{color:'#50fa7b'}}>███</span><span style={{color:'#f1fa8c'}}>███</span><span style={{color:'#6272a4'}}>███</span><span style={{color:'#8be9fd'}}>███</span><span style={{color:'#f8f8f2'}}>███</span>
        {'\n'}
        {'\n  '}<span style={{color:'#bd93f9'}}>❯</span> <span className="cursor-blink" style={{ color: '#bd93f9' }}> </span>
      </pre>
    </div>
  );
}



export default App;
