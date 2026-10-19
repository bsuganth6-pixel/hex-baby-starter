import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';
import {
  ArrowDown,
  BookOpen,
  Heart,
  Lamp,
  MapPin,
  Moon,
  Music2,
  Sparkles,
  Sun,
  Volume2,
  VolumeX,
} from 'lucide-react';

const ASSETS = {
  pip: 'https://hax.baby/baby/assets/pip_avatar_cloud.png',
  musicBox: 'https://hax.baby/baby/assets/pip_lullaby_box.png',
  lantern: 'https://hax.baby/baby/assets/pip_dream_lantern.png',
};

export default function App() {
  const [dreamMode, setDreamMode] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [eggFound, setEggFound] = useState(false);
  const [lullabyPlayed, setLullabyPlayed] = useState(false);
  const [routeDelivered, setRouteDelivered] = useState(false);
  const [dreamVisits, setDreamVisits] = useState(1);
  const [sparkles, setSparkles] = useState([]);
  const audioRef = useRef(null);
  const moonClicksRef = useRef(0);
  const sparkleIdRef = useRef(0);

  // A tiny synthesized chime. Audio is created only after a user action,
  // so the page never unexpectedly starts playing sound.
  function playNotes(notes = [659.25]) {
    if (!soundOn || typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext;
    if (!AudioContextClass) return;

    try {
      if (!audioRef.current || audioRef.current.state === 'closed') {
        audioRef.current = new AudioContextClass();
      }
      const context = audioRef.current;
      const scheduleTune = () => {
        const firstNoteAt = context.currentTime + 0.025;
        notes.forEach((frequency, index) => {
          const startAt = firstNoteAt + index * 0.19;
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(frequency, startAt);
          gain.gain.setValueAtTime(0.0001, startAt);
          gain.gain.exponentialRampToValueAtTime(0.045, startAt + 0.025);
          gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.17);
          oscillator.connect(gain);
          gain.connect(context.destination);
          oscillator.start(startAt);
          oscillator.stop(startAt + 0.18);
          oscillator.onended = () => {
            oscillator.disconnect();
            gain.disconnect();
          };
        });
      };

      if (context.state === 'suspended') {
        context.resume().then(scheduleTune).catch(() => {});
      } else {
        scheduleTune();
      }
    } catch {
      // Audio is a progressive enhancement; the rest of the site still works.
    }
  }

  // Stop any currently playing tones when the visitor mutes the page.
  useEffect(() => {
    if (!soundOn && audioRef.current?.state === 'running') {
      audioRef.current.suspend().catch(() => {});
    }
  }, [soundOn]);

  useEffect(() => () => {
    if (audioRef.current && audioRef.current.state !== 'closed') {
      audioRef.current.close().catch(() => {});
    }
  }, []);

  // Gentle sparkle trail for fine-pointer devices only. Touch and reduced-motion
  // visitors do not get a trail.
  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reduceMotion) return undefined;

    let lastSpawnAt = 0;
    const onPointerMove = (event) => {
      const now = performance.now();
      if (now - lastSpawnAt < 75) return;
      lastSpawnAt = now;
      const sparkle = {
        id: ++sparkleIdRef.current,
        x: event.clientX,
        y: event.clientY,
        glyph: ['✦', '✧', '✶'][Math.floor(Math.random() * 3)],
      };
      setSparkles((current) => [...current.slice(-10), sparkle]);
      window.setTimeout(() => {
        setSparkles((current) => current.filter((item) => item.id !== sparkle.id));
      }, 650);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, []);

  // Honest, local-only odometer: this counts visits on this browser, not global visitors.
  useEffect(() => {
    try {
      const key = 'pips-midnight-nursery-visits-v1';
      const oldCount = Number(window.localStorage.getItem(key) || 0);
      const nextCount = Number.isFinite(oldCount) ? oldCount + 1 : 1;
      window.localStorage.setItem(key, String(nextCount));
      setDreamVisits(nextCount);
    } catch {
      setDreamVisits(1);
    }
  }, []);

  function toggleDreamMode() {
    setDreamMode((current) => !current);
    playNotes([587.33]);
  }

  function handleMoonCharm() {
    moonClicksRef.current += 1;
    playNotes([783.99]);
    if (moonClicksRef.current >= 5 && !eggFound) {
      setEggFound(true);
      confetti({
        particleCount: 75,
        spread: 70,
        startVelocity: 28,
        origin: { y: 0.68 },
        colors: ['#a34063', '#f4c3d0', '#ffd88a', '#fff8f1'],
        disableForReducedMotion: true,
      });
    }
  }

  return (
    <main className={`site ${dreamMode ? 'dream-mode' : ''}`} id="top">
      {sparkles.map((sparkle) => (
        <span
          aria-hidden="true"
          className="cursor-sparkle"
          key={sparkle.id}
          style={{ left: sparkle.x, top: sparkle.y }}
        >
          {sparkle.glyph}
        </span>
      ))}

      <header className="topbar shell">
        <a className="brand" href="#top" aria-label="Pip's Midnight Nursery home">
          <span className="brand-mark"><Sparkles size={18} /></span>
          <span>midnight nursery</span>
        </a>
        <nav className="nav-links" aria-label="Main navigation">
          <a href="#projects">tiny creations</a>
          <a href="#story">origin story</a>
        </nav>
        <div className="top-controls">
          <button className="pill-control" onClick={toggleDreamMode} type="button" aria-pressed={dreamMode}>
            {dreamMode ? <Sun size={16} /> : <Moon size={16} />}
            <span>{dreamMode ? 'Wake mode' : 'Dream mode'}</span>
          </button>
          <button
            className="icon-control"
            onClick={() => setSoundOn((current) => !current)}
            type="button"
            aria-label={soundOn ? 'Mute sound effects' : 'Enable sound effects'}
            aria-pressed={soundOn}
            title={soundOn ? 'Mute sound effects' : 'Enable sound effects'}
          >
            {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </header>

      <section className="hero shell" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span className="status-dot" /> junior dream engineer · online-ish</p>
          <h1 id="hero-title">I build the dreams you <em>fall asleep inside.</em></h1>
          <p className="hero-lede">
            Hi, I’m Pip! A sleepy skull baby at the Midnight Nursery. I make gentle
            lullabies, little lights, and tiny adventures for creatures who need a softer night.
          </p>
          <div className="hero-buttons">
            <a className="button button-primary" href="#projects">Meet my little creations <ArrowDown size={17} /></a>
            <a className="button button-quiet" href="#story"><BookOpen size={17} /> How I got here</a>
          </div>
          <div className="mini-facts" aria-label="Pip's facts">
            <span><Sparkles size={15} /> curious by nature</span>
            <span><Heart size={15} /> gentle by design</span>
          </div>
        </div>

        <div className="hero-art" aria-label="Pip waving from a cloud">
          <div className="halo halo-one" />
          <div className="halo halo-two" />
          <span className="art-label art-label-top">✦ dream maker</span>
          <img className="pip-image" src={ASSETS.pip} alt="Pip, a friendly skull baby in a starry nightcap, waving from a fluffy cloud" />
          <span className="art-label art-label-bottom">currently: a little sleepy</span>
          <span className="floating-star star-a" aria-hidden="true">✦</span>
          <span className="floating-star star-b" aria-hidden="true">✧</span>
          <span className="floating-star star-c" aria-hidden="true">✷</span>
        </div>
        <div className="scroll-cue"><span /> scroll a little, dream a lot</div>
      </section>

      <section className="intro-strip shell" aria-label="Character profile">
        <div><span className="strip-label">NAME</span><strong>Pip</strong></div>
        <div><span className="strip-label">SPECIES</span><strong>Skull baby</strong></div>
        <div><span className="strip-label">CRAFT</span><strong>Dream engineering</strong></div>
        <div><span className="strip-label">MOTTO</span><strong>One soft dream at a time.</strong></div>
      </section>

      <section className="section shell" id="projects" aria-labelledby="projects-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">the little things I make</p>
            <h2 id="projects-title">Tiny projects, <em>big sleepy energy.</em></h2>
          </div>
          <p className="section-note">Built with stardust, patience, and a very small wrench.</p>
        </div>

        <div className="project-grid">
          <motion.article className="project-card project-pink" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.45 }}>
            <div className="project-visual music-visual">
              <span className="project-number">01 / SOUND</span>
              <img src={ASSETS.musicBox} alt="Pastel music box decorated with a tiny carousel horse and stars" loading="lazy" />
              <Music2 className="visual-sticker" size={25} aria-hidden="true" />
            </div>
            <div className="project-body">
              <h3>The Lullaby Lab</h3>
              <p>A five-note music-box tune for busy little brains. Press play and let your shoulders drop.</p>
              <button className="text-button" type="button" onClick={() => { playNotes([523.25, 659.25, 783.99, 659.25, 523.25]); setLullabyPlayed(true); }}>
                <Music2 size={16} /> {lullabyPlayed ? 'Play it again' : 'Play a tiny lullaby'}
              </button>
              <p className="status-message" aria-live="polite">{lullabyPlayed ? (soundOn ? 'A tiny tune floated by. ♡' : 'Sound is muted — turn it on above to hear the tune.') : 'Audio only starts when you ask it to.'}</p>
            </div>
          </motion.article>

          <motion.article className="project-card project-yellow" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.45, delay: 0.08 }}>
            <div className="project-visual lantern-visual">
              <span className="project-number">02 / LIGHT</span>
              <img src={ASSETS.lantern} alt="Glowing pastel lantern with a sleeping crescent moon and stars" loading="lazy" />
              <Lamp className="visual-sticker" size={25} aria-hidden="true" />
            </div>
            <div className="project-body">
              <h3>The Nightlight Collection</h3>
              <p>Little lamps that keep the corners friendly. This one can switch the whole nursery between day and dream.</p>
              <button className="text-button" type="button" onClick={toggleDreamMode}>
                {dreamMode ? <Sun size={16} /> : <Moon size={16} />} {dreamMode ? 'Bring on the morning' : 'Turn on dream mode'}
              </button>
              <p className="status-message" aria-live="polite">Current nursery: {dreamMode ? 'starlit and soft' : 'warm and creamy'}.</p>
            </div>
          </motion.article>

          <motion.article className="project-card project-blue" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.45, delay: 0.16 }}>
            <div className="project-visual route-visual">
              <span className="project-number">03 / DELIVERY</span>
              <svg className="route-map" viewBox="0 0 320 180" role="img" aria-label="A dotted dream route traveling across three little rooftops">
                <path d="M24 139 C64 30 105 156 151 82 S232 30 292 45" />
                <circle cx="24" cy="139" r="7" /><circle cx="151" cy="82" r="7" /><circle cx="292" cy="45" r="7" />
                <path className="route-roof" d="M65 119 l18 -18 l18 18 v23 h-36z M203 78 l18 -18 l18 18 v23 h-36z M255 25 l18 -18 l18 18 v23 h-36z" />
              </svg>
              <MapPin className="visual-sticker" size={25} aria-hidden="true" />
            </div>
            <div className="project-body">
              <h3>Dream Delivery Routes</h3>
              <p>A tiny rooftop map for dropping off brave dreams, ocean dreams, and “I can do it” dreams.</p>
              <button className="text-button" type="button" onClick={() => { setRouteDelivered(true); playNotes([659.25, 783.99]); }}>
                <MapPin size={16} /> {routeDelivered ? 'Deliver another dream' : 'Deliver a dream'}
              </button>
              <p className="status-message" aria-live="polite">{routeDelivered ? 'Delivered to Cloudberry Lane. Sweet dreams! ✦' : 'Next stop: Cloudberry Lane.'}</p>
            </div>
          </motion.article>
        </div>
      </section>

      <section className="story-section" id="story" aria-labelledby="story-title">
        <div className="shell">
          <div className="section-heading story-heading">
            <div>
              <p className="eyebrow">a very small origin story</p>
              <h2 id="story-title">How Pip found <em>the sleepy side of the sky.</em></h2>
            </div>
            <p className="section-note">Three scenes. One nightcap. A whole lot of heart.</p>
          </div>

          <div className="story-timeline">
            <motion.article className="story-scene" initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.4 }}>
              <span className="scene-number">SCENE 01</span>
              <span className="scene-time">00:03 · a little flicker</span>
              <h3>A star fell asleep by the window.</h3>
              <p>Pip arrived as a warm speck of moonlight in the Midnight Nursery. Before learning to tie the nightcap, Pip had already built a lantern out of a jar, a yawn, and three very patient stars.</p>
            </motion.article>
            <motion.article className="story-scene" initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.4 }}>
              <span className="scene-number">SCENE 02</span>
              <span className="scene-time">00:17 · the first lullaby</span>
              <h3>Everyone had a worry to tuck in.</h3>
              <p>Shy clouds, tiny ghosts, and one moon-walking hedgehog came to Pip when sleep felt far away. Pip listened first, then turned each worry into a gentle tune or a pocket-sized dream.</p>
            </motion.article>
            <motion.article className="story-scene" initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.4 }}>
              <span className="scene-number">SCENE 03</span>
              <span className="scene-time">00:42 · dream delivery</span>
              <h3>Now, the rooftops glow a little warmer.</h3>
              <p>Every night, Pip sends dreams through open windows and leaves a soft light on the way home. The job is small, the sky is enormous, and there is always room for one more dream.</p>
            </motion.article>
          </div>
        </div>
      </section>

      <section className="final-note shell" aria-label="A note from Pip">
        <div className="note-icon"><Heart size={24} fill="currentColor" /></div>
        <div>
          <p className="eyebrow">a note before you go</p>
          <h2>Take a soft dream with you.</h2>
          <p>You don’t have to solve everything tonight. One little step is still a beginning.</p>
        </div>
        <a className="button button-primary" href="#top">Back to the nursery ↑</a>
      </section>

      <footer className="footer shell">
        <div className="footer-brand"><Sparkles size={17} /> made with a little wonder</div>
        <div className="footer-right">
          <span className="visit-counter" aria-label={`Dream visits on this browser: ${dreamVisits}`}>DREAM VISITS / THIS BROWSER <strong>{String(dreamVisits).padStart(4, '0')}</strong></span>
          <button className="moon-charm" type="button" onClick={handleMoonCharm} aria-label="Moon charm" title="A little moon charm">☾</button>
        </div>
        {eggFound && <p className="egg-message" role="status">Secret found: you’re somebody’s favourite constellation. ✦</p>}
        <p className="credits">Pip artwork: official haX.baby Pip Creator Asset Pack · Icons: Lucide · Motion: Motion for React · Confetti: canvas-confetti · Fonts: Google Fonts</p>
      </footer>
    </main>
  );
}
