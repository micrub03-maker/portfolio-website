import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Board center sits at y=-8.5 in skater-local coords (midpoint of wheel+board stack)
const BOARD_CENTER_Y = -8.5;

function getKickflipTransforms(t) {
  if (t === null) return { boardDy: 0, boardFlipAngle: 0, boardTilt: 0, bodyDy: 0 };

  const POP = 0.12; // end of tail-pop phase
  const AIR = 0.75; // end of air/flip phase

  // Tail pop tilt (0 → POP): board briefly tilts as tail taps
  const boardTilt = t < POP ? 12 * Math.sin(Math.PI * (t / POP)) : 0;

  // Board arc + kickflip rotation (POP → AIR)
  let boardDy = 0;
  let boardFlipAngle = 0;
  if (t >= POP && t < AIR) {
    const p = (t - POP) / (AIR - POP);
    boardDy = -28 * Math.sin(Math.PI * p); // reduced arc height
    boardFlipAngle = 360 * p;              // full rotation — wheels orbit with board
  }

  // Body: quick crouch → jump arc → land compression
  let bodyDy;
  if (t < 0.08) {
    bodyDy = 4 * (t / 0.08);                          // crouch down
  } else if (t < POP) {
    bodyDy = 4 * (1 - (t - 0.08) / (POP - 0.08));     // pop up from crouch
  } else if (t < AIR) {
    bodyDy = -28 * Math.sin(Math.PI * (t - POP) / (AIR - POP)); // jump arc
  } else {
    bodyDy = 5 * Math.sin(Math.PI * (t - AIR) / (1 - AIR));     // land compression
  }

  return { boardDy, boardFlipAngle, boardTilt, bodyDy };
}

export const Loader = ({ setIsLoaded, onBeginEnter, onEnterComplete }) => {
  const navigate = useNavigate();
  const rampRef = useRef(null);
  const svgRef = useRef(null);
  const isExitingRef = useRef(false);
  const skaterRef = useRef({ x: 140, y: 78, angle: 0 });
  const [isExiting, setIsExiting] = useState(false);
  const [skater, setSkater] = useState({ x: 140, y: 78, angle: 0 });
  const [kickflipT, setKickflipT] = useState(null);
  const positionTRef = useRef(0.5);
  const keysRef = useRef({ left: false, right: false });
  const kickflipActiveRef = useRef(false);
  const kbAnimFrameRef = useRef(null);
  const lastFrameTimeRef = useRef(null);

  const updateSkater = (val) => {
    skaterRef.current = val;
    setSkater(val);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isExitingRef.current) return;
      const path = rampRef.current;
      const svg = svgRef.current;
      if (!path || !svg) return;

      const rect = svg.getBoundingClientRect();
      const vbX = ((e.clientX - rect.left) * 280) / rect.width;
      const clamped = Math.max(12, Math.min(268, vbX));
      const t = (clamped - 10) / 260;

      const totalLen = path.getTotalLength();
      const len = t * totalLen;
      const pt = path.getPointAtLength(len);
      const pt2 = path.getPointAtLength(Math.min(len + 2, totalLen));
      const angle = (Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180) / Math.PI;

      updateSkater({ x: pt.x, y: pt.y, angle });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const updateSkaterFromT = (t) => {
    const path = rampRef.current;
    if (!path) return;
    const totalLen = path.getTotalLength();
    const pt = path.getPointAtLength(t * totalLen);
    const pt2 = path.getPointAtLength(Math.min(t * totalLen + 2, totalLen));
    const angle = (Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180) / Math.PI;
    updateSkater({ x: pt.x, y: pt.y, angle });
  };

  const kbLoop = (now) => {
    const keys = keysRef.current;
    if (!keys.left && !keys.right) {
      lastFrameTimeRef.current = null;
      kbAnimFrameRef.current = null;
      return;
    }
    const dt = lastFrameTimeRef.current !== null ? (now - lastFrameTimeRef.current) / 1000 : 0;
    lastFrameTimeRef.current = now;
    let t = positionTRef.current;
    if (keys.left) t = Math.max(0, t - 0.5 * dt);
    if (keys.right) t = Math.min(1, t + 0.5 * dt);
    positionTRef.current = t;
    updateSkaterFromT(t);
    kbAnimFrameRef.current = requestAnimationFrame(kbLoop);
  };

  const playKickflipOnly = () => {
    if (kickflipActiveRef.current) return;
    kickflipActiveRef.current = true;
    const flipDuration = 1100;
    const start = performance.now();
    const animateFlip = (now) => {
      const t = Math.min((now - start) / flipDuration, 1);
      setKickflipT(t);
      if (t < 1) {
        requestAnimationFrame(animateFlip);
      } else {
        setKickflipT(null);
        kickflipActiveRef.current = false;
      }
    };
    requestAnimationFrame(animateFlip);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isExitingRef.current) return;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const dir = e.key === "ArrowLeft" ? "left" : "right";
        if (!keysRef.current[dir]) {
          keysRef.current[dir] = true;
          if (!kbAnimFrameRef.current) {
            lastFrameTimeRef.current = null;
            kbAnimFrameRef.current = requestAnimationFrame(kbLoop);
          }
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        playKickflipOnly();
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === "ArrowLeft") keysRef.current.left = false;
      if (e.key === "ArrowRight") keysRef.current.right = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (kbAnimFrameRef.current) cancelAnimationFrame(kbAnimFrameRef.current);
    };
  }, []);

  const handleClick = () => {
    if (isExitingRef.current) return;
    isExitingRef.current = true;

    // start fade out
    setIsExiting(true); // fade starts immediately, same moment as the kickflip

    // tell parent to start fading the About "home" page in underneath
    if (onBeginEnter) {
      onBeginEnter();
    }

    const flipDuration = 1100;
    const start = performance.now();

    const animateFlip = (now) => {
      const t = Math.min((now - start) / flipDuration, 1);
      setKickflipT(t);
      if (t < 1) requestAnimationFrame(animateFlip);
    };

    requestAnimationFrame(animateFlip);

    setTimeout(() => {
      if (setIsLoaded) {
        setIsLoaded(true);
      } else if (onEnterComplete) {
        // let parent unmount Loader
        onEnterComplete();
      } else {
        // fallback: navigate to new home = About at /home
        navigate("/home");
      }
    }, 1300);
  };

  const kf = getKickflipTransforms(kickflipT);

  return (
    <div
      className="fixed inset-0 z-50 bg-[url('/nightsky.jpg')] bg-cover bg-center flex items-start justify-center cursor-pointer"
      style={{
        opacity: isExiting ? 0 : 1,
        transition: "opacity 1.3s ease-in-out",
        pointerEvents: isExiting ? "none" : "auto",
      }}
      onClick={handleClick}
    >
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center text-white px-6 max-w-2xl md:max-w-4xl mx-auto pt-12 md:pt-16">
        {/* HUD / terminal card */}
        <div className="relative px-8 md:px-12 py-7 bg-black/70 border border-cyan-400/35 rounded-sm shadow-[0_0_40px_rgba(34,211,238,0.08),inset_0_0_40px_rgba(34,211,238,0.03)]">

          {/* Corner brackets */}
          <span className="absolute top-0 left-0 w-5 h-5 border-l-2 border-t-2 border-cyan-400/70" />
          <span className="absolute top-0 right-0 w-5 h-5 border-r-2 border-t-2 border-cyan-400/70" />
          <span className="absolute bottom-0 left-0 w-5 h-5 border-l-2 border-b-2 border-cyan-400/70" />
          <span className="absolute bottom-0 right-0 w-5 h-5 border-r-2 border-b-2 border-cyan-400/70" />

          {/* Header label */}
          <div className="absolute -top-3 left-5 bg-[#050a10] px-2 font-mono text-xs tracking-widest text-cyan-400/70 select-none">
            // PROFILE.init()
          </div>

          {/* Status indicator */}
          <div className="absolute -top-[7px] right-5 bg-[#050a10] px-2 flex items-center gap-1.5 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono text-[10px] text-cyan-400/60 tracking-widest">ONLINE</span>
          </div>

          <div className="flex flex-col items-center gap-3">
            <h1 className="text-4xl md:text-6xl font-light tracking-wide">
              Hey there! I&apos;m Michael
            </h1>
            <p className="text-lg md:text-2xl font-light tracking-wide text-white/90">
              Mechanical/Controls Engineer @ MPC lab Berkeley
            </p>
            <p className="text-base md:text-lg font-light text-white/80 tracking-wide">
              UC Berkeley MEng &apos;26 · TU Delft BSc &apos;24
            </p>
            <p className="text-sm md:text-base font-light text-white/60 leading-relaxed max-w-xl mx-auto mt-2">
              Welcome to my portfolio website, glad you stopped by :)<br />
              My goal is to give you a clear sense of what drives me, how I learn and solve problems, and the kind of energy I bring to a team.
            </p>
            <p className="text-sm md:text-base font-light text-white/60 leading-relaxed">
              Have fun browsing!
            </p>
          </div>
        </div>
      </div>

      {/* Mini-ramp + click prompt — pinned at 1/3 from the bottom */}
      <div className="absolute left-1/2 bottom-12 -translate-x-1/2 flex flex-col items-center gap-3">
        <svg
          ref={svgRef}
          width="140"
          height="70"
          viewBox="0 -50 280 140"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle ramp surface fill */}
          <path
            d="M 10,10 L 50,10 Q 50,78 90,78 L 190,78 Q 230,78 230,10 L 270,10 L 270,90 L 10,90 Z"
            fill="rgba(255,255,255,0.04)"
          />
          {/* Ramp outline */}
          <path
            ref={rampRef}
            d="M 10,10 L 50,10 Q 50,78 90,78 L 190,78 Q 230,78 230,10 L 270,10"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />

          {/* Base group: follows mouse along ramp */}
          <g transform={`translate(${skater.x},${skater.y}) rotate(${skater.angle})`}>
            {/* Board + Wheels */}
            <g transform={`translate(0,${kf.boardDy})`}>
              <g
                transform={`translate(0,${BOARD_CENTER_Y}) rotate(${
                  kf.boardTilt + kf.boardFlipAngle
                }) translate(0,${-BOARD_CENTER_Y})`}
              >
                <circle cx="-9" cy="-3" r="3" fill="white" opacity="0.85" />
                <circle cx="9" cy="-3" r="3" fill="white" opacity="0.85" />
                <rect
                  x="-18"
                  y="-11"
                  width="36"
                  height="5"
                  rx="2"
                  fill="white"
                  opacity="0.85"
                />
              </g>
            </g>

            {/* Body + Head */}
            <g transform={`translate(0,${kf.bodyDy})`}>
              <rect
                x="-6"
                y="-31"
                width="12"
                height="20"
                rx="2"
                fill="white"
                opacity="0.85"
              />
              <circle cx="0" cy="-39" r="7" fill="white" opacity="0.85" />
            </g>
          </g>
        </svg>

        <p className="text-sm md:text-base text-white/60 tracking-widest uppercase animate-pulse">
          Click anywhere to continue
        </p>
      </div>
    </div>
  );
};