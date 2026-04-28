import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// --- Types ---
type Limb = { x: number; y: number };
type Pose = { la: Limb; ra: Limb; ll: Limb; rl: Limb; expr?: string };
type RollPose = { roll: number };
type MotionPose = Pose | RollPose;
interface Particle { x: number; y: number; vx: number; vy: number; life: number; decay: number; r: number; c: string }

// --- Constants ---
const W = 800, H = 450, GY = 400, BL = 120, HX = 380, HY = 200, BR = 620;
const k = (GY - HY) / Math.pow(HX - BL, 2);
const hillY = (x: number) => HY + k * Math.pow(x - HX, 2);
const hillA = (x: number) => Math.atan(2 * k * (x - HX));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const eio = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
const eoe = (t: number) => {
  const c = (2 * Math.PI) / 3;
  return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c) + 1;
};

// --- Poses ---
const poses = {
  walk: (T: number): Pose => {
    const s = Math.sin(T * 10);
    return { la: { x: -12 - s * 5, y: -14 + s * 4 }, ra: { x: 12 + s * 5, y: -14 - s * 4 }, ll: { x: -8 + s * 12, y: 0 }, rl: { x: 8 - s * 12, y: 0 }, expr: 'neutral' };
  },
  climb: (T: number): Pose => {
    const s = Math.sin(T * 6);
    return { la: { x: -10 + s * 6, y: -38 }, ra: { x: 16, y: -16 - s * 4 }, ll: { x: -14 + s * 8, y: -2 }, rl: { x: 10 - s * 8, y: 0 }, expr: 'frown' };
  },
  search: (_T: number): Pose => ({ la: { x: -4, y: -20 }, ra: { x: 16, y: -12 }, ll: { x: -10, y: 0 }, rl: { x: 10, y: 0 }, expr: 'o' }),
  reach: (_T: number): Pose => ({ la: { x: -20, y: -25 }, ra: { x: -15, y: -15 }, ll: { x: -8, y: 0 }, rl: { x: 8, y: 0 }, expr: 'neutral' }),
  hit: (): Pose => ({ la: { x: -20, y: -40 }, ra: { x: 20, y: -40 }, ll: { x: -15, y: -5 }, rl: { x: 15, y: -5 }, expr: 'frown' }),
  land: (): Pose => ({ la: { x: -24, y: -8 }, ra: { x: 24, y: -8 }, ll: { x: -18, y: 0 }, rl: { x: 18, y: 0 }, expr: 'frown' }),
};

const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);
  
  // --- Canvas Animation ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;

    // FIX: track font readiness so canvas text never falls back to wrong font
    let fontReady = false;
    document.fonts.load('700 12px Poppins').then(() => { fontReady = true; });

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);
    };
    window.addEventListener('resize', resize);
    resize();

    const trees = [
      { x: 160, s: 0.8 }, { x: 220, s: 1.1 }, { x: 280, s: 0.9 },
      { x: 480, s: 1.2 }, { x: 550, s: 0.85 },
    ];

    let particles: Particle[] = [];
    let prevT = 99;
    const LOOP = 21000;
    let start: number | null = null;

    const spawnDust = (x: number, y: number, count = 20, isRoll = false) => {
      for (let i = 0; i < count; i++) {
        particles.push({
          x, y,
          vx: (Math.random() - 0.5) * (isRoll ? 8 : 4) - (isRoll ? 3 : 0),
          vy: -Math.random() * 4 - 1,
          life: 1, decay: Math.random() * 0.02 + 0.02,
          r: Math.random() * 2 + 1,
          c: Math.random() < 0.5 ? '#0ea5e9' : '#555555',
        });
      }
    };

    const drawEnv = (T: number) => {
      ctx.fillStyle = '#121212'; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(255,255,255,0.02)'; ctx.lineWidth = 1;
      const ox = (T * 60) % 40;
      for (let x = -40; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x + ox, 0); ctx.lineTo(x + ox, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      trees.forEach(t => {
        const ty = hillY(t.x);
        ctx.save(); ctx.translate(t.x, ty); ctx.scale(t.s, t.s);
        ctx.fillStyle = '#0a0a0a'; ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2;
        ctx.fillRect(-2, -10, 4, 10);
        ctx.beginPath(); ctx.moveTo(0, -35); ctx.lineTo(-12, -10); ctx.lineTo(12, -10); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -50); ctx.lineTo(-10, -20); ctx.lineTo(10, -20); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.restore();
      });

      ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, GY); ctx.lineTo(BL, GY);
      for (let x = BL; x <= BR; x += 3) ctx.lineTo(x, hillY(x));
      ctx.lineTo(BR, GY); ctx.lineTo(W, GY); ctx.lineTo(W, H); ctx.closePath();
      const grad = ctx.createLinearGradient(HX, HY, HX, GY);
      grad.addColorStop(0, '#1c1c1c'); grad.addColorStop(1, '#121212');
      ctx.fillStyle = grad; ctx.fill();
      ctx.strokeStyle = '#333333'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-10, GY); ctx.lineTo(BL, GY);
      for (let x = BL; x <= BR; x += 3) ctx.lineTo(x, hillY(x));
      ctx.lineTo(BR, GY); ctx.lineTo(W + 10, GY); ctx.stroke();
    };

    // FIX: warehouse X adjusted to match corrected BR=620 so it sits at the bottom of the hill
    const drawWarehouse = (T: number) => {
      const alpha = T >= 11 ? Math.min(1, (T - 11) / 1.5) : 0;
      if (alpha <= 0) return;
      ctx.save(); ctx.globalAlpha = alpha;
      const sc = 0.6;
      ctx.translate(W - 90, GY - 160 * sc);
      ctx.scale(sc, sc);
      ctx.fillStyle = '#0a0a0a'; ctx.strokeStyle = '#f97316'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.rect(0, 0, 170, 160); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(180, 0); ctx.lineTo(160, -20); ctx.lineTo(10, -20); ctx.closePath();
      ctx.fillStyle = '#111111'; ctx.fill(); ctx.stroke();
      if (fontReady) {
        // FIX: use 'bold' instead of '800' for broader canvas support
        ctx.fillStyle = '#f97316'; ctx.font = 'bold 16px Poppins, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('DOWNHILL', 85, 35);
        ctx.font = '600 11px Poppins, sans-serif';
        ctx.fillText('DATA WAREHOUSE', 85, 55);
      }
      ctx.fillStyle = '#1f2937'; ctx.fillRect(15, 80, 30, 80); ctx.fillRect(125, 80, 30, 80);
      const t = Date.now() / 200;
      ctx.fillStyle = Math.sin(t) > 0 ? '#f97316' : '#1f2937';
      ctx.fillRect(20, 90, 8, 8); ctx.fillRect(130, 110, 8, 8);
      ctx.fillStyle = Math.cos(t) > 0 ? '#38bdf8' : '#1f2937';
      ctx.fillRect(30, 120, 8, 8); ctx.fillRect(140, 90, 8, 8);
      ctx.fillStyle = '#000'; ctx.fillRect(60, 90, 50, 70);
      ctx.restore();
    };

    // FIX: removed unused T parameter — renamed to _burrahPose for clarity
    const drawBurrah = (burrahPose: string) => {
      const bx = HX + 25, by = HY - 2;
      ctx.save(); ctx.translate(bx, by);
      ctx.strokeStyle = '#cccccc'; ctx.fillStyle = '#cccccc';
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, -44, 11, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -33); ctx.lineTo(0, -10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(-8, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(8, 0); ctx.stroke();
      if (burrahPose === 'push') {
        ctx.rotate(-0.1);
        ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(-26, -24); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(15, -10); ctx.stroke();
      } else if (burrahPose === 'talk') {
        ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(-15, -35); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(12, -14); ctx.stroke();
      } else {
        ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(-12, -14); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(12, -14); ctx.stroke();
      }
      ctx.fillStyle = '#121212';
      ctx.beginPath(); ctx.arc(-3, -46, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(3, -46, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#0ea5e9'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(-3, -46, 4.5, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(3, -46, 4.5, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-1, -46); ctx.lineTo(1, -46); ctx.stroke();
      ctx.fillStyle = '#444444';
      ctx.beginPath(); ctx.moveTo(-9, -40); ctx.lineTo(9, -40); ctx.lineTo(6, -30); ctx.lineTo(0, -25); ctx.lineTo(-6, -30); ctx.fill();
      if (fontReady) {
        ctx.font = '600 10px Poppins, sans-serif'; ctx.fillStyle = '#666666'; ctx.textAlign = 'center';
        ctx.fillText('Burrah', 0, -62);
      }
      ctx.restore();
    };

    const drawStudent = (x: number, y: number, angle: number, pose: MotionPose) => {
      ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
      ctx.strokeStyle = '#ffffff'; ctx.fillStyle = '#ffffff';
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 3;

      if ('roll' in pose) {
        // FIX: nametag NOT drawn in roll state — it looked wrong on a tumbling circle
        ctx.rotate(pose.roll);
        ctx.beginPath(); ctx.arc(0, -22, 14, 0, Math.PI * 2); ctx.stroke();
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-6, -22); ctx.lineTo(6, -22); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -28); ctx.lineTo(0, -16); ctx.stroke();
      } else {
        const { la, ra, ll, rl, expr } = pose;
        ctx.beginPath(); ctx.arc(0, -44, 11, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -33); ctx.lineTo(0, -10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(la.x, la.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(ra.x, ra.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(ll.x, ll.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(rl.x, rl.y); ctx.stroke();
        ctx.fillStyle = '#121212';
        ctx.beginPath(); ctx.arc(-3, -46, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(3, -46, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#0ea5e9'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(-3, -46, 3, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(3, -46, 3, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-1, -46); ctx.lineTo(1, -46); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-6, -46); ctx.lineTo(-10, -48); ctx.stroke();
        ctx.lineWidth = 1.5; ctx.strokeStyle = '#121212';
        ctx.beginPath();
        if (expr === 'smile') ctx.arc(0, -40, 4, 0.2, Math.PI - 0.2);
        else if (expr === 'frown') ctx.arc(0, -37, 4, Math.PI + 0.2, -0.2);
        else if (expr === 'o') ctx.arc(0, -39, 3, 0, Math.PI * 2);
        else { ctx.moveTo(-3, -39); ctx.lineTo(3, -39); }
        ctx.stroke();
        if (fontReady) {
          ctx.font = '600 10px Poppins, sans-serif'; ctx.fillStyle = '#0ea5e9'; ctx.textAlign = 'center';
          ctx.fillText('Student', 0, -62);
        }
      }
      ctx.restore();
    };

    const drawUzumaki = (x: number, y: number, pose: Pose) => {
      ctx.save(); ctx.translate(x, y);
      ctx.strokeStyle = '#f97316'; ctx.fillStyle = '#f97316';
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 3;
      const { la, ra, ll, rl } = pose;
      ctx.beginPath(); ctx.arc(0, -44, 11, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -33); ctx.lineTo(0, -10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(la.x, la.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(ra.x, ra.y); ctx.stroke();
      ctx.strokeStyle = '#4b5563';
      ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(ll.x, ll.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(rl.x, rl.y); ctx.stroke();
      ctx.strokeStyle = '#1f2937'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(-11, -48); ctx.lineTo(11, -48); ctx.stroke();
      if (fontReady) {
        ctx.font = 'bold 10px Poppins, sans-serif'; ctx.fillStyle = '#f97316'; ctx.textAlign = 'center';
        ctx.fillText('Uzumaki', 0, -62);
      }
      ctx.restore();
    };

    const drawOverlays = (dialState: number, T: number, uzumakiX: number) => {
      if (!fontReady) return;
      ctx.save();
      const b1 = Math.sin(T * 6) * 3;
      ctx.font = '600 15px Poppins, sans-serif';
      if (dialState === 1) {
        ctx.textAlign = 'right'; ctx.fillStyle = '#0ea5e9';
        ctx.fillText('Sir, can I have stats? 🥺', HX - 15, HY - 75 + b1);
      } else if (dialState === 2) {
        ctx.textAlign = 'left'; ctx.fillStyle = '#aaaaaa';
        ctx.fillText('> Of course! Data is for everyone!', HX + 25, HY - 95 + b1);
        ctx.fillText('> But why do you want it?', HX + 25, HY - 75 + b1);
      } else if (dialState === 3) {
        ctx.textAlign = 'right'; ctx.fillStyle = '#0ea5e9';
        ctx.fillText('For my prep...', HX - 15, HY - 75 + b1);
      } else if (dialState === 4) {
        ctx.textAlign = 'left'; ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 17px Poppins, sans-serif';
        ctx.fillText("SIKE! I WON'T GIVE YOU!", HX + 25, HY - 95 + b1);
        ctx.fillText('LMAO YEET! 🦶', HX + 25, HY - 70 + b1);
      } else if (dialState === 5) {
        ctx.textAlign = 'center'; ctx.fillStyle = '#f97316';
        const ts = Math.max(0, T - 14);
        ctx.fillText(ts < 3 ? 'Stop begging.' : 'Come with me to Downhill.', uzumakiX, GY - 90 + b1);
      }
      ctx.restore();
    };

    const drawTrails = (x: number, y: number, roll: number) => {
      ctx.save(); ctx.globalAlpha = 0.25; ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 1.5; ctx.lineCap = 'round';
      for (let i = 0; i < 4; i++) {
        const a = roll + i * (Math.PI / 2);
        const d = 18;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
        ctx.lineTo(x + Math.cos(a) * (d + 14), y + Math.sin(a) * (d + 14));
        ctx.stroke();
      }
      ctx.restore();
    };

    const frame = (ts: number) => {
      if (!start) start = ts;
      const lt = (ts - start) % LOOP;
      const T = lt / 1000;
      if (T < prevT) particles = [];
      prevT = T;

      drawEnv(T);
      drawWarehouse(T);

      let fx = 40, fy = GY, fa = 0;
      let pose: MotionPose = poses.walk(0);
      let dialState = 0, rolling = false, rollAng = 0;
      let burrahPose = 'idle';
      let uzumakiX = W + 100;
      let uzumakiPose: Pose = poses.walk(T);

      if (T < 0.8) {
        fx = 40; fy = GY; pose = poses.walk(0);
      } else if (T < 2.8) {
        const p = (T - 0.8) / 2; fx = lerp(40, BL, eio(p)); fy = GY; pose = poses.walk(T);
      } else if (T < 5.8) {
        const p = (T - 2.8) / 3; fx = lerp(BL, HX - 15, eio(p)); fy = hillY(fx); fa = hillA(fx) - 0.1; pose = poses.climb(T);
      } else if (T < 7.0) {
        fx = HX - 15; fy = HY; pose = poses.search(T); dialState = 1;
      } else if (T < 8.5) {
        fx = HX - 15; fy = HY; pose = poses.search(T); dialState = 2; burrahPose = 'talk';
      } else if (T < 9.5) {
        fx = HX - 15; fy = HY; pose = poses.search(T); dialState = 3;
      } else if (T < 10.5) {
        fx = HX - 15; fy = HY; dialState = 4; burrahPose = 'push';
        fa = Math.sin(T * 40) * 0.15; pose = poses.hit();
      } else if (T < 11.0) {
        const p = (T - 10.5) / 0.5; fx = HX - 15 + p * 40; fy = hillY(fx) + p * 15; fa = p * 1.5; pose = poses.land();
      } else if (T < 13.0) {
        const p = (T - 11) / 2; fx = lerp(HX + 25, BR - 80, eio(p)); fy = hillY(fx) - 10;
        rollAng = (T - 11) * 12; rolling = true; pose = { roll: rollAng };
        if (Math.random() < 0.5) spawnDust(fx, fy + 10, 2, true);
      } else if (T < 14.0) {
        const p = (T - 13) / 1; fx = BR - 80; fy = GY - eoe(1 - p) * 15; pose = poses.land();
        if (p < 0.05 && particles.length < 30) spawnDust(fx, GY, 35);
      } else if (T < 15.5) {
        fx = BR - 80; fy = GY; pose = poses.land();
        const p = (T - 14) / 1.5;
        uzumakiX = lerp(W + 50, BR - 30, eio(p)); uzumakiPose = poses.walk(T); dialState = 5;
      } else if (T < 16.5) {
        fx = BR - 80; fy = GY; pose = poses.search(T);
        uzumakiX = BR - 30; uzumakiPose = poses.reach(T); dialState = 5;
      } else {
        const p = Math.min(1, (T - 16.5) / 4.5);
        fx = lerp(BR - 80, W + 90, eio(p)); fy = GY; pose = poses.walk(T);
        uzumakiX = lerp(BR - 30, W + 130, eio(p)); uzumakiPose = poses.walk(T); dialState = 5;
      }

      drawBurrah(burrahPose);
      if (dialState > 0) drawOverlays(dialState, T, uzumakiX);
      if (rolling) drawTrails(fx, fy, rollAng);
      drawStudent(fx, fy, fa, pose);
      if (uzumakiX < W + 120) drawUzumaki(uzumakiX, GY, uzumakiPose);

      particles = particles.filter(p => p.life > 0);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.vx *= 0.96; p.life -= p.decay;
        ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;

      animId = requestAnimationFrame(frame);
    };

    animId = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  const tx = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';

  return (
    <div className="min-h-screen bg-[#121212] text-white font-[Poppins] flex flex-col lg:flex-row items-center justify-center p-8 gap-12 overflow-hidden">

      {/* Canvas */}
      <div
        style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'scale(1)' : 'scale(0.95)', transition: tx }}
        className="relative w-full lg:w-[55%] max-w-[800px] aspect-video bg-[#121212] rounded-xl overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.5),_0_0_0_1px_rgba(255,255,255,0.05)]"
      >
        <canvas ref={canvasRef} className="block w-full h-full" />
      </div>

      {/* Content */}
      <div className="flex flex-col items-center lg:items-start text-center lg:text-left w-full lg:w-[40%] max-w-lg">

        <div
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: `${tx} 0.2s` }}
          className="inline-block mb-4 px-4 py-1.5 rounded-full bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 text-[#38bdf8] text-xs font-semibold uppercase tracking-widest"
        >
          Experiences &amp; Discussions
        </div>

        <h1
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: `${tx} 0.35s` }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-transparent bg-clip-text"
        >
          Welcome to Downhill
        </h1>

        <p
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: `${tx} 0.5s` }}
          className="text-lg md:text-xl text-[#888888] leading-relaxed mb-8"
        >
          Stop climbing. We bring the placement stats directly to you.
        </p>

        <div
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: `${tx} 0.65s` }}
        >
          <button
            type="button"
            onClick={() => navigate('/placement-stats')} // ✅ useNavigate instead of window.location.href
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] hover:from-[#0284c7] hover:to-[#0ea5e9] text-white font-semibold text-lg transition-all hover:scale-105 shadow-[0_0_20px_rgba(14,165,233,0.3)]"
          >
            View Placement Stats
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
};

export default App;