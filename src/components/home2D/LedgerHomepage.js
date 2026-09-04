'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, animate, useInView } from 'framer-motion';
import Link from 'next/link';

/* -------------------------------------------------------------------------- */
/*                                 COMPONENTS                                 */
/* -------------------------------------------------------------------------- */

const CinematicBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent ? parent.clientWidth : window.innerWidth;
      canvas.height = parent ? parent.clientHeight : window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const hLines = Array.from({ length: 15 }, () => ({
      y: Math.random() * canvas.height,
      speed: (Math.random() - 0.5) * 0.5,
    }));
    
    const vLines = Array.from({ length: 20 }, () => ({
      x: Math.random() * canvas.width,
      speed: (Math.random() - 0.5) * 0.5,
    }));

    const nodes = [];
    for (let i = 0; i < 30; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        pulse: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.03
      });
    }

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      
      // Grid
      ctx.strokeStyle = 'rgba(216, 210, 194, 0.15)'; // #D8D2C2 with opacity
      ctx.lineWidth = 1;
      
      const gridSize = 60;
      ctx.beginPath();
      for (let x = 0; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Traversing Lines
      ctx.strokeStyle = 'rgba(138, 109, 59, 0.4)'; // #8A6D3B with opacity
      ctx.beginPath();
      
      hLines.forEach(line => {
        line.y += line.speed;
        if (line.y > height) line.y = 0;
        if (line.y < 0) line.y = height;
        ctx.moveTo(0, line.y);
        ctx.lineTo(width, line.y);
      });

      vLines.forEach(line => {
        line.x += line.speed;
        if (line.x > width) line.x = 0;
        if (line.x < 0) line.x = width;
        ctx.moveTo(line.x, 0);
        ctx.lineTo(line.x, height);
      });
      ctx.stroke();

      // Nodes
      nodes.forEach(node => {
        node.pulse += node.speed;
        const radius = 2 + Math.sin(node.pulse) * 1.5;
        const opacity = 0.2 + Math.sin(node.pulse) * 0.4;
        
        ctx.fillStyle = `rgba(138, 109, 59, ${opacity})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 z-0 pointer-events-none opacity-30"
    />
  );
};

const Counter = ({ from, to, inView, duration = 2 }) => {
  const nodeRef = useRef(null);

  useEffect(() => {
    if (inView) {
      const controls = animate(from, to, {
        duration,
        ease: 'easeOut',
        onUpdate(value) {
          if (nodeRef.current) {
            nodeRef.current.textContent = Math.floor(value);
          }
        },
      });
      return () => controls.stop();
    }
  }, [from, to, inView, duration]);

  return <span ref={nodeRef}>{from}</span>;
};

const LedgerLine = () => {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div 
      className="fixed top-[65px] left-0 h-[2px] bg-[#8A6D3B] z-[60] origin-left"
      style={{ scaleX: scrollYProgress }}
    />
  );
};

const Nav = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#F6F3EC] border-b border-[#D8D2C2]">
    <div className="flex items-center gap-4">
      <img src="/assets/logo.png" alt="Logo" className="w-8 h-8 grayscale object-contain" />
      <span className="font-serif text-sm tracking-widest text-[#1E2A24] font-bold uppercase">THE WORKING LEDGER</span>
    </div>
    <div className="flex items-center gap-6">
      <Link href="/login" className="text-[10px] font-bold uppercase tracking-widest text-[#1E2A24] hover:text-[#8A6D3B] transition-colors">
        Log in
      </Link>
      <Link href="/signup" className="bg-[#1E2A24] text-[#F6F3EC] px-6 py-2 text-[10px] uppercase font-bold tracking-widest hover:bg-[#3F5A48] transition-colors rounded-none">
        BUILD YOUR SYSTEM →
      </Link>
    </div>
  </nav>
);

const Hero = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 }
    }
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const diagramNodes = ["GOAL", "YEAR", "QUARTER", "ROCK", "MILESTONES", "DAILY INPUTS", "RESULTS"];

  return (
    <section className="relative min-h-screen pt-32 pb-20 px-6 flex flex-col justify-center bg-[#F6F3EC] overflow-hidden">
      <CinematicBackground />
      <div className="relative z-10 max-w-5xl mx-auto w-full">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-[#8A6D3B] font-mono text-[10px] tracking-widest uppercase mb-8">
          A PERSONAL OPERATING SYSTEM
        </motion.p>
        <motion.h1 
          variants={container} 
          initial="hidden" 
          animate="show"
          className="text-5xl md:text-7xl font-serif text-[#1E2A24] leading-tight mb-8 uppercase"
        >
          {["BUILD THE SYSTEM.", "THEN LET REALITY", "IMPROVE IT."].map((line, i) => (
            <motion.div key={i} variants={item} className="overflow-hidden">
              <span>{line}</span>
            </motion.div>
          ))}
        </motion.h1>
        <motion.p variants={item} initial="hidden" animate="show" className="text-xl font-serif text-[#3F5A48] mb-20 max-w-2xl">
          Turn goals into structure. Then turn structure into execution.
        </motion.p>
        
        {/* Living architectural diagram */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }}
          className="flex flex-col md:flex-row items-start md:items-center w-full font-mono text-[10px] uppercase tracking-widest border border-[#D8D2C2] p-6 relative bg-white"
        >
          {diagramNodes.map((node, i) => (
            <React.Fragment key={node}>
              <div className="flex-shrink-0 text-[#1E2A24] py-2 md:py-0">{node}</div>
              {i < diagramNodes.length - 1 && (
                <div className="hidden md:block flex-grow h-[1px] bg-[#D8D2C2] mx-4 overflow-hidden relative">
                   <motion.div 
                     initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ repeat: Infinity, duration: 2, delay: i * 0.2, ease: 'linear' }}
                     className="absolute inset-0 bg-[#8A6D3B] w-1/4"
                   />
                </div>
              )}
              {i < diagramNodes.length - 1 && (
                 <div className="md:hidden h-6 w-[1px] bg-[#D8D2C2] ml-4" />
              )}
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const OneSystem = () => {
  const words = ["Goals", "Tasks", "Metrics", "Notes", "Habits", "Plans"];
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.5 });

  return (
    <section ref={ref} className="py-32 px-6 bg-[#F6F3EC]">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-serif text-[#1E2A24] mb-24 text-center uppercase">ONE SYSTEM. NOT TEN DISCONNECTED HABITS.</h2>
        <div className="relative h-72 border border-[#D8D2C2] overflow-hidden flex items-center justify-center p-8 bg-white">
          <div className="flex gap-6 flex-wrap justify-center relative w-full z-10">
            {words.map((word, i) => {
              const randomX = (i % 2 === 0 ? 1 : -1) * (50 + i * 20);
              const randomY = (i % 3 === 0 ? 1 : -1) * (40 + i * 15);
              
              return (
                <motion.div
                  key={word}
                  initial={{ x: randomX, y: randomY, opacity: 0, rotate: (i-3)*10 }}
                  animate={isInView ? { x: 0, y: 0, opacity: 1, rotate: 0 } : { x: randomX, y: randomY, opacity: 0, rotate: (i-3)*10 }}
                  transition={{ duration: 0.8, type: "spring", bounce: 0.4, delay: i * 0.1 }}
                  className="border border-[#1E2A24] px-6 py-3 text-sm font-mono uppercase tracking-widest text-[#1E2A24] bg-[#F6F3EC] rounded-none"
                >
                  {word}
                </motion.div>
              );
            })}
          </div>
          {/* Alignment line */}
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#8A6D3B] origin-left z-0 opacity-50"
          />
        </div>
      </div>
    </section>
  );
};

const Structure = () => {
  const steps = ["GOAL", "YEAR", "QUARTER", "ROCK", "MILESTONE", "DAILY INPUT"];
  
  return (
    <section className="py-32 px-6 bg-[#F6F3EC]">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-16">
        <div className="md:w-1/2">
          <h2 className="text-4xl font-serif text-[#1E2A24] leading-tight sticky top-32 uppercase">
            A GOAL IS ONLY USEFUL WHEN IT CHANGES WHAT YOU DO.
          </h2>
        </div>
        <div className="md:w-1/2 relative py-8">
          <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-[#D8D2C2]" />
          {steps.map((step, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              key={step} 
              className="mb-16 relative pl-16"
            >
              <div className="absolute left-[21px] top-2 w-2 h-2 bg-[#1E2A24] rounded-none" />
              <h3 className="font-mono text-sm tracking-widest uppercase text-[#8A6D3B] mb-2">{step}</h3>
              <p className="font-serif text-[#3F5A48] text-lg">Define the specific outcome. Then break it down further into executable units.</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const DailyInputs = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const inputs = [
    { name: "Cold Calling", current: 18, target: 25 },
    { name: "Prospecting", current: 45, target: 60 },
    { name: "Study", current: 60, target: 60 },
    { name: "Marketing", current: 2, target: 5 },
  ];

  return (
    <section ref={ref} className="py-32 px-6 bg-[#F6F3EC]">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-serif text-[#1E2A24] mb-16 uppercase">STOP MEASURING INTENTION. MEASURE EXECUTION.</h2>
        
        <div className="border border-[#1E2A24] bg-white">
          <div className="grid grid-cols-12 border-b border-[#1E2A24] bg-[#1E2A24] text-[#F6F3EC] p-4 font-mono text-[10px] tracking-widest uppercase">
            <div className="col-span-4">Input</div>
            <div className="col-span-2 text-right">Progress</div>
            <div className="col-span-6 pl-8">Execution Status</div>
          </div>
          {inputs.map((input, i) => (
            <div key={input.name} className="grid grid-cols-12 border-b border-[#D8D2C2] last:border-b-0 p-4 items-center text-sm">
              <div className="col-span-4 font-serif text-[#1E2A24] text-lg">{input.name}</div>
              <div className="col-span-2 text-right font-mono text-[#8A6D3B]">
                <Counter from={0} to={input.current} inView={isInView} /> / {input.target}
              </div>
              <div className="col-span-6 pl-8">
                <div className="h-3 w-full bg-[#D8D2C2] overflow-hidden rounded-none">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${(input.current / input.target) * 100}%` } : { width: 0 }}
                    transition={{ duration: 1.5, delay: 0.5 + (i * 0.2), ease: "easeOut" }}
                    className={`h-full ${input.current >= input.target ? 'bg-[#3F5A48]' : 'bg-[#1E2A24]'}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ResultsAndReality = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-32 px-6 bg-[#F6F3EC]">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-serif text-[#1E2A24] mb-16 uppercase max-w-3xl">
          INPUTS TELL YOU WHAT YOU DID. RESULTS TELL YOU WHAT HAPPENED.
        </h2>
        
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Mini table */}
          <div className="lg:w-1/3">
            <div className="border border-[#1E2A24] bg-white">
              <div className="grid grid-cols-3 border-b border-[#1E2A24] bg-[#1E2A24] text-[#F6F3EC] p-3 font-mono text-[10px] tracking-widest uppercase">
                <div>RESULT</div>
                <div className="text-right">CURRENT</div>
                <div className="text-right">TARGET</div>
              </div>
              {[
                { r: "Revenue", c: 45000, t: 50000, prefix: "$" },
                { r: "Meetings", c: 12, t: 15, prefix: "" },
                { r: "Conversion", c: 2.4, t: 3.0, prefix: "%" },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-3 border-b border-[#D8D2C2] last:border-b-0 p-4 font-mono items-center">
                  <div className="text-[#3F5A48] text-xs uppercase">{row.r}</div>
                  <div className="text-right text-sm">
                    {row.prefix === "$" ? "$" : ""}<Counter from={0} to={row.c} inView={isInView} />{row.prefix === "%" ? "%" : ""}
                  </div>
                  <div className="text-right text-[#8A6D3B] text-sm">
                    {row.prefix === "$" ? "$" : ""}{row.t}{row.prefix === "%" ? "%" : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Reality vs Plan Gap Visualization */}
          <div className="lg:w-2/3 border border-[#D8D2C2] p-8 relative flex flex-col justify-between min-h-[250px] bg-white">
            <div className="absolute top-6 left-8 font-mono text-[10px] uppercase text-[#8A6D3B] tracking-widest">REALITY VS PLAN</div>
            
            <div className="relative h-full w-full mt-12 flex-grow">
              <div className="absolute inset-0 flex flex-col justify-between opacity-30">
                <hr className="border-[#D8D2C2] border-dashed" />
                <hr className="border-[#D8D2C2] border-dashed" />
                <hr className="border-[#D8D2C2] border-dashed" />
                <hr className="border-[#D8D2C2] border-dashed" />
              </div>
              
              <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                {/* PLANNED line */}
                <motion.polyline 
                  initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : { pathLength: 0 }} transition={{ duration: 1.5, ease: "easeInOut" }}
                  points="0,100 25,75 50,50 75,25 100,0" fill="none" stroke="#D8D2C2" strokeWidth="1.5" strokeDasharray="4 4"
                />
                {/* ACTUAL line */}
                <motion.polyline 
                  initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : { pathLength: 0 }} transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                  points="0,100 25,85 50,65 75,55 100,45" fill="none" stroke="#1E2A24" strokeWidth="2"
                />
              </svg>

              {/* GAP Highlight */}
              <motion.div 
                initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : { opacity: 0 }} transition={{ delay: 2, duration: 1 }}
                className="absolute right-0 top-[20%] bottom-[45%] w-[2px] bg-[#8A6D3B]"
              >
                <div className="absolute -left-12 top-1/2 -translate-y-1/2 font-mono text-[10px] text-[#8A6D3B] tracking-widest">GAP</div>
                <div className="absolute top-0 -left-1 w-2.5 h-[1px] bg-[#8A6D3B]" />
                <div className="absolute bottom-0 -left-1 w-2.5 h-[1px] bg-[#8A6D3B]" />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Review = () => {
  const questions = [
    "WHAT HAPPENED?", 
    "WHAT CHANGED?", 
    "WHERE IS THE GAP?", 
    "WHAT EVIDENCE EXISTS?", 
    "WHAT SHOULD WE TEST?"
  ];

  return (
    <section className="py-32 px-6 bg-[#1E2A24] text-[#F6F3EC]">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-serif mb-20 uppercase text-[#8A6D3B]">REALITY IS FEEDBACK.</h2>
        <div className="flex flex-col gap-0 border-l border-[#3F5A48] ml-2">
          {questions.map((q, i) => (
            <motion.div 
              key={q}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              className="pl-10 py-8 border-b border-[#3F5A48] last:border-b-0 relative"
            >
              <div className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-[9px] h-[9px] bg-[#8A6D3B] rounded-none" />
              <div className="font-mono text-sm tracking-widest">{q}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Insights = () => {
  const progression = ["OBSERVATION", "PATTERN", "HYPOTHESIS", "EXPERIMENT", "VALIDATED INSIGHT"];
  
  return (
    <section className="py-32 px-6 bg-[#F6F3EC]">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24">
        
        {/* Progression */}
        <div className="lg:w-1/3">
          <div className="flex flex-col items-center">
            {progression.map((item, i) => (
              <React.Fragment key={item}>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                  className="border border-[#1E2A24] px-4 py-3 text-[10px] font-mono tracking-widest text-[#1E2A24] bg-white w-full text-center rounded-none"
                >
                  {item}
                </motion.div>
                {i < progression.length - 1 && (
                  <div className="h-10 w-[1px] bg-[#D8D2C2]" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Experiment branching */}
        <div className="lg:w-2/3 flex flex-col justify-center">
          <h2 className="text-4xl font-serif text-[#1E2A24] mb-12 uppercase">DON'T GUESS. TEST.</h2>
          <div className="border border-[#D8D2C2] p-8 relative bg-white">
            <div className="flex flex-col md:flex-row justify-between relative z-10 gap-8 md:gap-0">
              <div className="md:w-[45%] border border-[#D8D2C2] p-6 bg-[#F6F3EC]">
                <div className="font-mono text-[10px] text-[#8A6D3B] mb-4 tracking-widest">CURRENT APPROACH</div>
                <div className="font-serif text-base text-[#1E2A24]">Send 100 generic emails per day. Conversion: 1%.</div>
              </div>
              
              <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[10px] bg-white px-2 z-20 text-[#1E2A24] tracking-widest border border-[#D8D2C2] py-1">VS</div>
              
              <div className="md:w-[45%] border border-[#1E2A24] p-6 bg-[#1E2A24] text-[#F6F3EC] relative">
                {/* 2D architectural shadow imitation using border/pseudo element approach */}
                <div className="absolute inset-0 border border-[#8A6D3B] translate-x-2 translate-y-2 pointer-events-none -z-10" />
                <div className="font-mono text-[10px] text-[#8A6D3B] mb-4 tracking-widest">NEW HYPOTHESIS</div>
                <div className="font-serif text-base">Send 20 highly personalized emails per day. Expected Conv: 5%.</div>
              </div>
            </div>
            
            {/* Branching lines behind - desktop only */}
            <svg className="hidden md:block absolute inset-0 w-full h-full z-0" pointerEvents="none">
              <path d="M 25% 100% C 25% 50%, 75% 50%, 75% 0%" fill="none" stroke="#D8D2C2" strokeWidth="1" strokeDasharray="4 4" />
            </svg>
          </div>
        </div>
        
      </div>
    </section>
  );
};

const Optimization = () => {
  const versions = ["v1.0", "v1.1", "v1.2", "v1.3", "v2.0"];
  return (
    <section className="py-32 px-6 bg-[#F6F3EC]">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-serif text-[#1E2A24] mb-16 uppercase">OPTIMIZATION & VERSIONS</h2>
        
        {/* Value changing */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-24 font-mono text-sm tracking-widest">
          <div className="border border-[#D8D2C2] px-6 py-3 line-through text-[#8A6D3B] bg-white">COLD CALLING: 25/DAY</div>
          <div className="text-[#1E2A24] text-xl hidden md:block">→</div>
          <div className="text-[#1E2A24] text-xl md:hidden pl-8">↓</div>
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}
            className="border border-[#1E2A24] px-6 py-3 bg-[#1E2A24] text-[#F6F3EC]"
          >
            COLD CALLING: 15/DAY (QUALIFIED)
          </motion.div>
        </div>

        {/* Timeline */}
        <div className="relative pt-12 mt-12 pb-24">
          <div className="absolute top-14 left-0 right-0 h-[1px] bg-[#D8D2C2]" />
          <div className="flex justify-between relative z-10">
            {versions.map((v, i) => (
              <motion.div 
                key={v}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center group cursor-pointer relative"
              >
                <div className="w-4 h-4 bg-[#F6F3EC] border-2 border-[#1E2A24] rounded-none mb-4 group-hover:bg-[#8A6D3B] group-hover:border-[#8A6D3B] transition-colors" />
                <div className="font-mono text-[10px] tracking-widest text-[#1E2A24]">{v}</div>
                
                {/* Hover details */}
                <div className="absolute top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-[#1E2A24] bg-white p-4 w-56 text-xs font-serif z-20 pointer-events-none shadow-sm">
                  <div className="font-mono text-[8px] text-[#8A6D3B] mb-2 uppercase tracking-widest">Version Notes</div>
                  Adjusted input targets based on Q{i+1} review. Refined weekly pacing and hypothesis execution.
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const History = () => {
  const archives = [
    { period: "2026 Q3", status: "ACTIVE" },
    { period: "2026 Q2", status: "ARCHIVED" },
    { period: "2026 Q1", status: "ARCHIVED" },
    { period: "2025 Q4", status: "ARCHIVED" },
  ];
  return (
    <section className="py-24 px-6 bg-[#F6F3EC]">
      <div className="max-w-4xl mx-auto">
        <h3 className="font-mono text-[10px] text-[#8A6D3B] tracking-widest uppercase mb-8">SYSTEM ARCHIVE</h3>
        <div className="border border-[#1E2A24] bg-white">
          {archives.map((arc, i) => (
            <div key={arc.period} className="flex justify-between items-center p-6 border-b border-[#D8D2C2] last:border-b-0 hover:bg-[#1E2A24] hover:text-[#F6F3EC] transition-colors cursor-pointer group">
              <span className="font-serif text-xl">{arc.period} System</span>
              <span className={`font-mono text-[10px] tracking-widest ${arc.status === 'ACTIVE' ? 'text-[#3F5A48] group-hover:text-[#F6F3EC]' : 'text-[#8A6D3B] group-hover:text-[#D8D2C2]'}`}>
                {arc.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CompleteLoop = () => {
  const loop = ["GOAL", "PLAN", "INPUT", "RESULT", "REVIEW", "INSIGHT", "EXPERIMENT", "OPTIMIZATION", "SYSTEM VERSION", "EXECUTE AGAIN"];
  
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"]
  });

  const yPath = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={ref} className="py-40 px-6 bg-[#F6F3EC]">
      <div className="max-w-xl mx-auto text-center relative">
        <h2 className="text-4xl font-serif text-[#1E2A24] mb-20 uppercase">THE COMPLETE LOOP</h2>
        
        <div className="relative inline-flex flex-col items-center w-full">
          <div className="absolute top-0 bottom-0 w-[1px] bg-[#D8D2C2] left-1/2 -translate-x-1/2" />
          
          <motion.div 
            style={{ top: yPath }}
            className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-[#8A6D3B] z-20 rounded-none shadow-[0_0_0_4px_#F6F3EC]"
          />

          {loop.map((item, i) => (
            <div key={item} className="bg-white py-4 px-6 z-10 my-4 border border-[#1E2A24] font-mono text-[10px] tracking-widest uppercase w-48">
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="py-32 px-6 bg-[#1E2A24] text-[#F6F3EC] flex flex-col items-center text-center">
    <h2 className="text-5xl md:text-7xl font-serif mb-16 uppercase leading-tight">BUILD THE SYSTEM.<br/>THEN RUN IT.</h2>
    <div className="flex flex-col sm:flex-row gap-6 mb-40">
      <Link href="/signup" className="bg-[#F6F3EC] text-[#1E2A24] px-10 py-4 text-xs uppercase font-bold tracking-widest hover:bg-[#8A6D3B] hover:text-[#F6F3EC] hover:border-[#8A6D3B] transition-colors border border-[#F6F3EC] rounded-none">
        CREATE ACCOUNT
      </Link>
      <Link href="/explore" className="bg-transparent border border-[#F6F3EC] text-[#F6F3EC] px-10 py-4 text-xs uppercase font-bold tracking-widest hover:bg-[#F6F3EC] hover:text-[#1E2A24] transition-colors rounded-none">
        EXPLORE
      </Link>
    </div>
    
    <div className="w-full max-w-5xl border-t border-[#3F5A48] pt-10 flex flex-col md:flex-row justify-between items-center font-mono text-[10px] tracking-widest text-[#D8D2C2]">
      <span>© 2026 THE WORKING LEDGER</span>
      <Link href="https://wellmadedigital.vercel.app/" target="_blank" className="hover:text-[#F6F3EC] transition-colors mt-6 md:mt-0 uppercase">
        BUILT BY WELLMADE DIGITAL
      </Link>
    </div>
  </footer>
);

/* -------------------------------------------------------------------------- */
/*                                MAIN EXPORT                                 */
/* -------------------------------------------------------------------------- */

export default function LedgerHomepage() {
  return (
    <div className="bg-[#F6F3EC] text-[#1E2A24] min-h-screen font-sans selection:bg-[#8A6D3B] selection:text-[#F6F3EC]">
      <LedgerLine />
      <Nav />
      <Hero />
      <hr className="border-[#D8D2C2]" />
      <OneSystem />
      <hr className="border-[#D8D2C2]" />
      <Structure />
      <hr className="border-[#D8D2C2]" />
      <DailyInputs />
      <hr className="border-[#D8D2C2]" />
      <ResultsAndReality />
      <hr className="border-[#D8D2C2]" />
      <Review />
      <hr className="border-[#D8D2C2]" />
      <Insights />
      <hr className="border-[#D8D2C2]" />
      <Optimization />
      <hr className="border-[#D8D2C2]" />
      <History />
      <hr className="border-[#D8D2C2]" />
      <CompleteLoop />
      <Footer />
    </div>
  );
}
