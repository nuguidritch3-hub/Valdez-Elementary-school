import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getApiUrl } from '../config';
import './AiAssistant.css';

/* ──────────────────────────────────────────────────────────
   Bella — Cute Black Cat SVG, fully inline, no external assets
   ────────────────────────────────────────────────────────── */
const CatCharacter = ({ isWalking, mood }) => {
  return (
    <svg viewBox="0 0 120 130" className="ai-char-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="catGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="catBodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a2a3e" />
          <stop offset="60%" stopColor="#181827" />
          <stop offset="100%" stopColor="#0a0a14" />
        </linearGradient>
        <linearGradient id="catBellyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3d3d54" />
          <stop offset="100%" stopColor="#2c2c3c" />
        </linearGradient>
        <linearGradient id="catEarInner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffe259" />
          <stop offset="100%" stopColor="#ffa751" />
        </linearGradient>
        <radialGradient id="bellGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffe259" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffe259" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background glow */}
      <circle cx="60" cy="65" r="55" fill="url(#catGlow)" />

      {/* Tail — animated swish */}
      <g>
        <path d="M88,90 Q105,75 110,55 Q112,48 108,50 Q100,58 90,85" fill="url(#catBodyGrad)" stroke="#0f0f1a" strokeWidth="0.5">
          {isWalking ? (
            <animateTransform attributeName="transform" type="rotate" values="0 88 90;8 88 90;0 88 90;-8 88 90;0 88 90" dur="0.6s" repeatCount="indefinite" />
          ) : (
            <animateTransform attributeName="transform" type="rotate" values="0 88 90;5 88 90;0 88 90;-5 88 90;0 88 90" dur="2.5s" repeatCount="indefinite" />
          )}
        </path>
      </g>

      {/* Body */}
      <ellipse cx="60" cy="78" rx="30" ry="28" fill="url(#catBodyGrad)" />

      {/* Belly patch */}
      <ellipse cx="60" cy="84" rx="16" ry="14" fill="url(#catBellyGrad)" opacity="0.8" />

      {/* Head */}
      <circle cx="60" cy="48" r="24" fill="url(#catBodyGrad)" />

      {/* Left ear */}
      <polygon points="38,38 30,12 50,32" fill="#2a2a3e" stroke="#0a0a14" strokeWidth="0.5" />
      <polygon points="39,35 34,18 48,33" fill="url(#catEarInner)" opacity="0.75" />

      {/* Right ear */}
      <polygon points="82,38 90,12 70,32" fill="#2a2a3e" stroke="#0a0a14" strokeWidth="0.5" />
      <polygon points="81,35 86,18 72,33" fill="url(#catEarInner)" opacity="0.75" />

      {/* Princess/Queen Mascot Golden Crown */}
      <g>
        <path d="M50,26 L45,14 L52,19 L60,10 L68,19 L75,14 L70,26 Z" fill="url(#goldGrad)" stroke="#b45309" strokeWidth="0.5" />
        <circle cx="45" cy="14" r="1.5" fill="#f43f5e" />
        <circle cx="60" cy="10" r="1.5" fill="#3b82f6" />
        <circle cx="75" cy="14" r="1.5" fill="#f43f5e" />
        <circle cx="60" cy="20" r="1.2" fill="#10b981" />
      </g>

      {/* Eye whites glow */}
      <ellipse cx="48" cy="46" rx="10" ry="11" fill="#2dd4bf" opacity="0.2" />
      <ellipse cx="72" cy="46" rx="10" ry="11" fill="#2dd4bf" opacity="0.2" />

      {/* Eyes — big glossy cat eyes */}
      <g className="ai-eye">
        <ellipse cx="48" cy="46" rx="8" ry="9" fill="#34d399" />
        <ellipse cx="48" cy="46" rx="8" ry="9" fill="none" stroke="#065f46" strokeWidth="1" />
        <ellipse cx="48" cy="46" rx="3.5" ry="8" fill="#0f172a" />
        <circle cx="45" cy="43" r="2.5" fill="white" opacity="0.9" />
        <circle cx="51" cy="48" r="1.2" fill="white" opacity="0.6" />
        <ellipse cx="48" cy="46" rx="8" ry="9" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="0.5" />
      </g>
      <g className="ai-eye ai-eye-right">
        <ellipse cx="72" cy="46" rx="8" ry="9" fill="#34d399" />
        <ellipse cx="72" cy="46" rx="8" ry="9" fill="none" stroke="#065f46" strokeWidth="1" />
        <ellipse cx="72" cy="46" rx="3.5" ry="8" fill="#0f172a" />
        <circle cx="69" cy="43" r="2.5" fill="white" opacity="0.9" />
        <circle cx="75" cy="48" r="1.2" fill="white" opacity="0.6" />
        <ellipse cx="72" cy="46" rx="8" ry="9" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="0.5" />
      </g>

      {/* Cute Cheek Blush */}
      <ellipse cx="38" cy="54" rx="4.5" ry="3" fill="#f472b6" opacity="0.5" />
      <ellipse cx="82" cy="54" rx="4.5" ry="3" fill="#f472b6" opacity="0.5" />

      {/* Nose */}
      <polygon points="60,54 57,57 63,57" fill="#f9a8d4" />

      {/* Mouth */}
      <path d="M57,58 Q60,61 63,58" fill="none" stroke="#374151" strokeWidth="1" strokeLinecap="round" />

      {/* Whiskers left */}
      <line x1="30" y1="52" x2="44" y2="55" stroke="#4b5563" strokeWidth="0.8" opacity="0.6">
        {isWalking && <animateTransform attributeName="transform" type="rotate" values="0 44 55;3 44 55;0 44 55;-3 44 55;0 44 55" dur="0.5s" repeatCount="indefinite" />}
      </line>
      <line x1="28" y1="56" x2="44" y2="57" stroke="#4b5563" strokeWidth="0.8" opacity="0.6" />
      <line x1="30" y1="60" x2="44" y2="59" stroke="#4b5563" strokeWidth="0.8" opacity="0.6" />

      {/* Whiskers right */}
      <line x1="90" y1="52" x2="76" y2="55" stroke="#4b5563" strokeWidth="0.8" opacity="0.6">
        {isWalking && <animateTransform attributeName="transform" type="rotate" values="0 76 55;-3 76 55;0 76 55;3 76 55;0 76 55" dur="0.5s" repeatCount="indefinite" />}
      </line>
      <line x1="92" y1="56" x2="76" y2="57" stroke="#4b5563" strokeWidth="0.8" opacity="0.6" />
      <line x1="90" y1="60" x2="76" y2="59" stroke="#4b5563" strokeWidth="0.8" opacity="0.6" />

      {/* Front paws */}
      <g>
        <ellipse cx="48" cy="104" rx="8" ry="4" fill="#2a2a3e" />
        <ellipse cx="72" cy="104" rx="8" ry="4" fill="#2a2a3e" />
        {/* Toe beans */}
        <circle cx="44" cy="103" r="1.5" fill="#f9a8d4" opacity="0.6" />
        <circle cx="48" cy="102" r="1.5" fill="#f9a8d4" opacity="0.6" />
        <circle cx="52" cy="103" r="1.5" fill="#f9a8d4" opacity="0.6" />
        <circle cx="68" cy="103" r="1.5" fill="#f9a8d4" opacity="0.6" />
        <circle cx="72" cy="102" r="1.5" fill="#f9a8d4" opacity="0.6" />
        <circle cx="76" cy="103" r="1.5" fill="#f9a8d4" opacity="0.6" />
        {isWalking && (
          <animateTransform attributeName="transform" type="translate" values="0,0;-2,-1;0,0;2,-1;0,0" dur="0.4s" repeatCount="indefinite" />
        )}
      </g>

      {/* Premium Golden Collar and Glowing Bell */}
      <g>
        <path d="M44,66 Q60,74 76,66" fill="none" stroke="url(#goldGrad)" strokeWidth="3.2" strokeLinecap="round" />
        <circle cx="60" cy="74" r="5.5" fill="url(#goldGrad)" stroke="#b45309" strokeWidth="0.5" />
        <circle cx="60" cy="74" r="10" fill="url(#bellGlow)" opacity="0.45" pointerEvents="none" />
        <line x1="56" y1="72" x2="64" y2="72" stroke="#b45309" strokeWidth="1.2" />
        <circle cx="60" cy="76" r="1.5" fill="#78350f" />
      </g>

      {/* Sparkle stars */}
      <text x="16" y="25" fontSize="10" opacity="0.65">✨</text>
      <text x="95" y="35" fontSize="8" opacity="0.55">⭐</text>

      {/* Happy mouth when happy — bigger smile */}
      {mood === 'happy' && (
        <>
          <path d="M55,59 Q60,64 65,59" fill="none" stroke="#f9a8d4" strokeWidth="1.5" strokeLinecap="round" />
          <text x="85" y="28" fontSize="9" opacity="0.8">💖</text>
        </>
      )}

      {/* Thinking — squinty eyes effect */}
      {mood === 'thinking' && (
        <>
          <line x1="42" y1="44" x2="54" y2="44" stroke="#2a2a3e" strokeWidth="4" strokeLinecap="round" />
          <line x1="66" y1="44" x2="78" y2="44" stroke="#2a2a3e" strokeWidth="4" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
};

/* ──────────────────────────────────────────────────────────
   Smart Responses — uses database context + learned memories
   ────────────────────────────────────────────────────────── */

function getTimeAgo(dateStr) {
  if (!dateStr) return 'just now';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const GREETINGS = [
  "Meow! 🐱 I'm Bella — your school AI assistant! I know everything about the school database. Ask me anything, nya~!",
  "Hello! 👋 I'm Bella the cat — your friendly school assistant. I have access to all dashboards and databases. How can I help? 🐾",
  "*purrs* Welcome! I'm Bella, here to help you navigate school data. Students, teachers, enrollment, grades — I know it all! 🐱✨",
];

const IDLE_TIPS = [
  "🐾 *stretches* Ask me about enrollment trends!",
  "📊 Try asking: 'How many students are enrolled?' nya~",
  "🎓 I can tell you about any grade level stats! *purrs*",
  "👩‍🏫 Ask Bella about teachers or classrooms!",
  "📈 *meow* Want to know dropout or repeater numbers?",
  "🐱 Pet me... or ask me school data questions!",
];

/* ── Learning Pattern Detectors ── */
const TEACH_PATTERNS = [
  /(?:remember|memorize|learn|note|save|store|keep in mind|don'?t forget)\s*(?:that\s*)?(.+)/i,
  /(?:my name is|i am|i'm|call me)\s+(.+)/i,
  /(?:i like|i love|i enjoy|i hate|i dislike|my favorite)\s+(.+)/i,
  /(?:the principal is|the school head is|our principal is)\s+(.+)/i,
  /(?:did you know|fun fact|fyi|btw|by the way)[:\s]*(.+)/i,
  /(?:the school|valdez|our school)\s+(?:is|has|was|will)\s+(.+)/i,
  /(?:today is|tomorrow is|next week|this week)\s+(.+)/i,
  /(?:i need|i want|i have|i got|we have|we need)\s+(.+)/i,
  /(?:the password is|the code is|the number is|the answer is)\s+(.+)/i,
  /(?:please note|take note|important)[:\s]*(.+)/i,
];

const RECALL_PATTERNS = [
  /(?:do you remember|what did i|recall|what do you know about|tell me what you learned|what have you learned)/i,
  /(?:what is my name|who am i|what did i say|what did i tell you)/i,
  /(?:your memories|your brain|what do you know|show.*memor)/i,
  /(?:forget everything|clear.*memory|erase.*memory|reset.*brain)/i,
];

function extractKeywords(text) {
  const stopWords = new Set(['the','a','an','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','shall','should','may','might','must','can','could','i','me','my','we','our','you','your','he','she','it','they','them','this','that','these','those','and','but','or','nor','for','so','yet','in','on','at','to','from','by','with','of','about','into','through','during','before','after','above','below','between','under','over','up','down','out','off','then','than','too','very','just','also','not','no','all','each','every','both','few','more','most','some','any','such','only','same','other','another','here','there','when','where','while','if','because','as','until','although','though','even','like','know','said','tell','told','please','want','need','think','make','take','get','go','come','see','look','find','give','use','try','ask','work','call','keep','let','put','say','seem','help','show','turn','play','run','move','live','believe','hold','bring','happen','write','provide','sit','stand','lose','pay','meet','include','continue','set','learn','change','lead','understand','watch','follow','stop','create','speak','read','add','spend','grow','open','walk','win','teach','offer','remember','consider','appear','buy','serve','die','send','build','stay','fall','cut','reach','kill','remain','suggest','raise','pass','sell','require','report','decide','pull','develop']);
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
}

function categorizeMemory(text) {
  const t = text.toLowerCase();
  if (/name|call me|i am|i'm/.test(t)) return 'personal';
  if (/school|valdez|class|grade|teacher|student|principal/.test(t)) return 'school';
  if (/like|love|hate|favorite|enjoy|prefer/.test(t)) return 'preferences';
  if (/date|today|tomorrow|week|month|schedule|event/.test(t)) return 'dates';
  if (/password|code|number|secret/.test(t)) return 'sensitive';
  if (/rule|policy|important|note/.test(t)) return 'rules';
  return 'general';
}

function findRelevantMemories(query, memories, maxResults = 5) {
  if (!memories || memories.length === 0) return [];
  const queryWords = extractKeywords(query);
  if (queryWords.length === 0) return memories.slice(-3);

  const scored = memories.map(m => {
    const memWords = new Set(extractKeywords(m.fact));
    const kwSet = new Set((m.keywords || []).map(k => k.toLowerCase()));
    let score = 0;
    queryWords.forEach(w => {
      if (memWords.has(w)) score += 2;
      if (kwSet.has(w)) score += 3;
      if (m.fact.toLowerCase().includes(w)) score += 1;
    });
    return { memory: m, score };
  }).filter(s => s.score > 0).sort((a, b) => b.score - a.score);

  return scored.slice(0, maxResults).map(s => s.memory);
}

function generateSmartResponse(query, dbContext, memories) {
  const q = query.toLowerCase().trim();

  if (!dbContext || !dbContext.loaded) {
    return { text: "*meow* I'm still loading the school database... Give me a moment! 🐱", learn: null };
  }

  const { students, users, schoolYears, currentYear, currentYearData, announcements } = dbContext;

  // ── Local Navigation Requests ──
  if (q.includes('navigate') || q.includes('go to') || q.includes('open') || q.includes('switch to') || q.includes('show')) {
    if (q.includes('analytic')) {
      return { text: "*purrs* 🐱 Switching you to the **Analytics** view~ 📊<navigate>Analytics</navigate>", learn: null };
    }
    if (q.includes('teacher')) {
      return { text: "*purrs* 🐱 Opening the **Teachers** list for you~ 👩‍🏫<navigate>Teachers</navigate>", learn: null };
    }
    if (q.includes('student')) {
      return { text: "*purrs* 🐱 Navigating to the **Students** section~ 🎓<navigate>Students</navigate>", learn: null };
    }
    if (q.includes('calendar') || q.includes('announc')) {
      return { text: "*purrs* 🐱 Opening the **Calendar** and Announcements~ 📅<navigate>Calendar</navigate>", learn: null };
    }
    if (q.includes('exam')) {
      return { text: "*purrs* 🐱 Taking you to the **Exams** dashboard~ 📝<navigate>Exams</navigate>", learn: null };
    }
    if (q.includes('plan') || q.includes('learning')) {
      return { text: "*purrs* 🐱 Let's look at the **Learning Plan**~ 📚<navigate>Learning Plan</navigate>", learn: null };
    }
    if (q.includes('grade') || q.includes('academic')) {
      return { text: "*purrs* 🐱 Navigating to your **Grades** / Academics overview~ 📈<navigate>Grades</navigate>", learn: null };
    }
    if (q.includes('attendance')) {
      return { text: "*purrs* 🐱 Opening the **Attendance** records~ ⏰<navigate>Attendance</navigate>", learn: null };
    }
    if (q.includes('achievement') || q.includes('award') || q.includes('trophy')) {
      return { text: "*purrs* 🐱 Opening the **Achievements** list~ 🏆<navigate>Achievements</navigate>", learn: null };
    }
    if (q.includes('enrollment')) {
      return { text: "*purrs* 🐱 Let's check **Enrollment**~ 📝<navigate>Enrollment</navigate>", learn: null };
    }
    if (q.includes('payment') || q.includes('finance')) {
      return { text: "*purrs* 🐱 Navigating to the **Payments** tab~ 💳<navigate>Payments</navigate>", learn: null };
    }
    if (q.includes('medical') || q.includes('health')) {
      return { text: "*purrs* 🐱 Opening your **Medical** records~ 🩺<navigate>Medical</navigate>", learn: null };
    }
    if (q.includes('report') || q.includes('card')) {
      return { text: "*purrs* 🐱 Opening the **Report Card** request screen~ 📄<navigate>Report Card</navigate>", learn: null };
    }
    if (q.includes('setting')) {
      return { text: "*purrs* 🐱 Taking you to **Settings**~ ⚙️<navigate>Settings</navigate>", learn: null };
    }
    if (q.includes('help') || q.includes('support')) {
      return { text: "*purrs* 🐱 Directing you to **Support** help~ ❓<navigate>Help</navigate>", learn: null };
    }
  }

  // ── Conversational Greetings & Casual Chit-Chat ──
  const isGreeting = /^(hi|hello|hey|yo|howdy|hola|greetings|good\s+morning|good\s+afternoon|good\s+evening|sup)(\s+|$)/i.test(q);
  if (isGreeting) {
    const greetingTexts = [
      "*purrs* Hello! I'm Bella, your friendly cat assistant. How are you doing today? 🐾",
      "*stretches* Meow! Hello there! What can I do for you today? 🐱✨",
      "*ears perk up* Nya~ Hi! Hope you are having a wonderful day. How can I help you navigate the school portal? 🌸",
      "*wags tail* Hey there! Bella is ready to assist you. Ask me anything, or tell me to navigate somewhere! 🐾"
    ];
    const randomText = greetingTexts[Math.floor(Math.random() * greetingTexts.length)];
    return { text: randomText, learn: null };
  }

  // How are you query
  if (/how\s+are\s+you|how's\s+it\s+going|how\s+are\s+things/i.test(q)) {
    return { text: "*purrs happily* I'm doing claw-some, thank you! Just keeping watch over our school database. How are you doing? 🐱💖", learn: null };
  }

  // Who are you query
  if (/who\s+are\s+you|what\s+is\s+your\s+name|your\s+name/i.test(q)) {
    return { text: "I am Bella, the animated black cat mascot and AI companion for Valdez Elementary School! I can answer questions about students, teachers, grades, dropouts, or navigate you to any tab you need. 🐾✨", learn: null };
  }

  // Casual pleasantries
  if (/^(thank\s+you|thanks|thank\s+you\s+very\s+much|cool|awesome|great|perfect|nice)/i.test(q)) {
    return { text: "*purrs* You're very welcome! Let me know if there's anything else I can fetch for you~ 🐱🐾", learn: null };
  }

  if (/^(bye|goodbye|see\s+you|see\s+ya|talk\s+to\s+you\s+later)/i.test(q)) {
    return { text: "*yawns and curls up* Goodbye! Have a wonderful day, and come back soon! Meow~ 💤🐱", learn: null };
  }

  // ═══ MEMORY RECALL COMMANDS ═══
  const isRecallRequest = RECALL_PATTERNS.some(p => p.test(q));

  // Clear/forget memories
  if (/(?:forget everything|clear.*memory|erase.*memory|reset.*brain|delete.*memory)/i.test(q)) {
    return { text: "*shakes head* 🐱 Okay... I'll forget everything you taught me. My memory is being cleared... *sad meow* 😿", learn: null, clearMemory: true };
  }

  // Show all memories
  if (isRecallRequest) {
    if (!memories || memories.length === 0) {
      return { text: "*tilts head* 🐱 I don't have any learned memories yet! You can teach me things by saying:\n\n• \"Remember that...\"\n• \"My name is...\"\n• \"The principal is...\"\n• \"Did you know...\"\n\nI'll absorb everything you tell me! 🧠✨", learn: null };
    }
    const recent = memories.slice(-8).reverse();
    const memList = recent.map(m => {
      const ago = getTimeAgo(m.learnedAt);
      return `• 🧠 **${m.fact}** *(${m.category}, ${ago})*`;
    }).join('\n');
    return { text: `*purrs proudly* I remember **${memories.length} thing(s)**! Here are my recent memories:\n\n${memList}\n\n${memories.length > 8 ? `...and ${memories.length - 8} more memories stored! ` : ''}Teach me more anytime~ 🐱✨`, learn: null };
  }

  // ═══ LEARNING DETECTION ═══
  for (const pattern of TEACH_PATTERNS) {
    const match = q.match(pattern);
    if (match && match[1] && match[1].trim().length > 2) {
      const fact = match[1].trim().replace(/[.!?]+$/, '');
      // Check if we already know this
      const alreadyKnows = memories?.some(m => m.fact.toLowerCase() === fact.toLowerCase());
      if (alreadyKnows) {
        return { text: `*purrs* I already remember that! 🐱 "${fact}" is safely stored in my brain~ 🧠`, learn: null };
      }
      const category = categorizeMemory(fact);
      const keywords = extractKeywords(fact);
      return {
        text: `*ears perk up* 🐱✨ Ooh! I just learned something new!\n\n🧠 **\"${fact}\"**\n📁 Category: ${category}\n\nI'll remember this forever! You can ask me about it anytime. Teach me more~ *purrs* 🐾`,
        learn: { fact, category, keywords }
      };
    }
  }

  // ═══ CHECK MEMORIES FOR RELEVANT CONTEXT ═══
  const relevant = findRelevantMemories(query, memories || []);
  let memoryContext = '';
  if (relevant.length > 0) {
    memoryContext = '\n\n---\n🧠 *Bella recalls:* ' + relevant.map(m => `"${m.fact}"`).join(', ');
  }

  // ── Enrollment / Student count ──
  if (q.includes('how many student') || q.includes('total student') || q.includes('enrollment') || q.includes('enrolled')) {
    const total = currentYearData?.totalStudents || students?.length || 0;
    const enrolledStudents = students?.filter(s => s.status === 'Enrolled') || [];
    const droppedStudents = students?.filter(s => s.status === 'Dropped') || [];
    return { text: `📊 For **${currentYear}**, the school has **${total} total enrolled students** in the census data.\n\nFrom the live student records:\n• **${enrolledStudents.length}** currently Enrolled\n• **${droppedStudents.length}** Dropped\n\nThe school manages grades from Kinder through Grade 6! 🎓${memoryContext}`, learn: null };
  }

  // ── Teachers ──
  if (q.includes('teacher') || q.includes('faculty') || q.includes('staff')) {
    const teachers = users?.filter(u => u.role === 'Teacher') || [];
    const totalTeachers = currentYearData?.totalTeachers || teachers.length;
    const teacherNames = teachers.map(t => t.name).join(', ');
    return { text: `👩‍🏫 The school has **${totalTeachers} teachers** for ${currentYear}.\n\n${teachers.length > 0 ? `Registered teachers: ${teacherNames}` : 'Teacher data is available in the admin dashboard.'}\n\nTeachers are assigned across 7 grade levels (Kinder to Grade 6).${memoryContext}`, learn: null };
  }

  // ── Dropouts ──
  if (q.includes('dropout') || q.includes('drop out') || q.includes('dropped')) {
    const totalDropouts = currentYearData?.totalDropouts || 0;
    const droppedStudents = students?.filter(s => s.status === 'Dropped') || [];
    return { text: `⚠️ For **${currentYear}**:\n• Census data shows **${totalDropouts} dropout(s)**\n• Live database has **${droppedStudents.length}** student(s) with "Dropped" status${droppedStudents.length > 0 ? ': ' + droppedStudents.map(s => s.name).join(', ') : ''}\n\nDropout prevention is a priority — the school monitors attendance and provides counseling support.${memoryContext}`, learn: null };
  }

  // ── Repeaters ──
  if (q.includes('repeater') || q.includes('repeat')) {
    const totalRepeaters = currentYearData?.totalRepeaters || 0;
    return { text: `📋 For **${currentYear}**, there are **${totalRepeaters} repeater(s)** across all grade levels.\n\nRepeaters receive additional academic support through remedial programs and tutoring sessions.${memoryContext}`, learn: null };
  }

  // ── Grades / Performance ──
  if (q.includes('grade') && (q.includes('performance') || q.includes('score') || q.includes('average'))) {
    if (students && students.length > 0) {
      let totalAvg = 0; let count = 0;
      students.forEach(s => { if (s.grades) { Object.values(s.grades).forEach(subj => { Object.values(subj).forEach(val => { if (val !== null && val !== '') { totalAvg += Number(val); count++; } }); }); } });
      const avg = count > 0 ? (totalAvg / count).toFixed(1) : 'N/A';
      return { text: `📈 Based on **${students.length} students** in the database:\n• Overall grade average: **${avg}%**\n• Subjects tracked: Math, Science, English, Filipino, MAPEH, Makabayan\n• Quarters: Q1 through Q4\n\nFor detailed breakdowns, check the Admin or Teacher dashboards! 📊${memoryContext}`, learn: null };
    }
    return { text: "I can see grade data is being tracked across 6 subjects and 4 quarters. Check the Teacher dashboard for detailed breakdowns!" + memoryContext, learn: null };
  }

  // ── Grade levels ──
  if (q.includes('grade level') || q.includes('kinder') || q.includes('grade 1') || q.includes('grade 2') || q.includes('grade 3') || q.includes('grade 4') || q.includes('grade 5') || q.includes('grade 6')) {
    const classrooms = currentYearData?.classrooms || [];
    if (classrooms.length > 0) {
      const breakdown = classrooms.map(c => `• **${c.gradeLevel}** (${c.section}): ${c.enrollment} students, ${c.teachers} teacher(s)`).join('\n');
      return { text: `🏫 Grade-level breakdown for **${currentYear}**:\n\n${breakdown}\n\nTotal classrooms: ${currentYearData.totalClassrooms || classrooms.length}${memoryContext}`, learn: null };
    }
    return { text: "The school has 7 grade levels: Kinder, Grade 1 through Grade 6, each with their own section and assigned teacher!" + memoryContext, learn: null };
  }

  // ── Specific student lookup ──
  if (q.includes('student') && (q.includes('find') || q.includes('search') || q.includes('look up') || q.includes('info'))) {
    if (students && students.length > 0) {
      const studentList = students.slice(0, 5).map(s => `• **${s.name}** — ${s.gradeLevel} ${s.section} (${s.status})`).join('\n');
      return { text: `🔍 Here are some students in the database:\n\n${studentList}${students.length > 5 ? `\n\n...and ${students.length - 5} more!` : ''}\n\nYou can search for specific students in the Admin dashboard.${memoryContext}`, learn: null };
    }
    return { text: "Student data is available through the Admin and Teacher dashboards!" + memoryContext, learn: null };
  }

  // ── Announcements ──
  if (q.includes('announcement') || q.includes('news') || q.includes('notice')) {
    if (announcements && announcements.length > 0) {
      const annList = announcements.map(a => `• **${a.title}** (${a.date}) — ${a.content?.substring(0, 60)}...`).join('\n');
      return { text: `📢 School Announcements:\n\n${annList}\n\nCheck the Calendar tab for more details!${memoryContext}`, learn: null };
    }
    return { text: "No announcements found at the moment. Check back later! 📢" + memoryContext, learn: null };
  }

  // ── School years / trends ──
  if (q.includes('school year') || q.includes('trend') || q.includes('history') || q.includes('year')) {
    const years = Object.keys(schoolYears || {}).sort();
    if (years.length > 0) {
      const trendData = years.map(sy => { const d = schoolYears[sy]; return `• **${sy}**: ${d.totalStudents || 0} students, ${d.totalTeachers || 0} teachers, ${d.totalDropouts || 0} dropouts`; }).join('\n');
      return { text: `📅 School Year Data (${years.length} years tracked):\n\n${trendData}\n\nUse the Compare Year feature in the Admin dashboard for detailed analysis!${memoryContext}`, learn: null };
    }
    return { text: "School year data spans from S.Y. 2020-2021 to present. Check the Admin dashboard for detailed trends!" + memoryContext, learn: null };
  }

  // ── Specific Dashboard Guides ──
  if (q.includes('how') && q.includes('use') && (q.includes('student') || q.includes('parent'))) {
    return {
      text: `🐱 **HOW TO USE THE STUDENT/PARENT DASHBOARD**\n\nThis dashboard is designed for students and parents to view student performance and records. Here is a detailed breakdown of the features available:\n\n• **Dashboard / Overview**: Shows the student's adviser details, academic status card, a list of subject proficiency cards (color-coded), and upcoming calendar events.\n• **Grades / Academics**: Access detailed quarterly subject grades (Q1 to Q4) for Math, Science, English, Filipino, MAPEH, and Makabayan. Displays final averages and visual indicators (Passed/Failed).\n• **Attendance**: Displays an interactive monthly attendance calendar highlighting present, absent, or late days.\n• **Achievements**: View a list of certificates, medals, and academic awards earned.\n• **Enrollment**: Access official student profile information (LRN, grade level, section, and enrolled dates).\n• **Payments**: Financial records detailing school fees, tuition summaries, and payment history.\n• **Medical / Health**: Digital clinic card detailing physical growth (height, weight), vaccination records, dental checkups, and consultation logs.\n• **Report Card**: View, request, and print official report cards.\n• **Help / Support**: Portal user guide, FAQs, and contact forms for administrative assistance.\n\n*purrs* Let me know if you want me to navigate you to any of these tabs, nya~! 🐾${memoryContext}`,
      learn: null
    };
  }

  if (q.includes('how') && q.includes('use') && q.includes('teacher')) {
    return {
      text: `🐱 **HOW TO USE THE TEACHER DASHBOARD**\n\nThis dashboard allows teachers to manage their classrooms, input grades, and schedule exams. Here is a detailed breakdown of the features:\n\n• **Learning Plan**: Outline weekly subject objectives, competencies, and lesson plans for the class.\n• **Students**: Displays the student roster for your assigned section. Click on a student to:\n  - Input/update grades (Q1 to Q4) in the Grades Modal across the 6 subjects.\n  - Switch views to monitor monthly class attendance records.\n• **Calendar & Announcements**: Post announcements, configure upcoming classroom events, and check schedules.\n• **Exams**: Create mock tests using the **Create Exam Modal** (set subject, date, passing percentage, test type). Generate mock test papers.\n• **Settings**: Securely update your teacher login password.\n\n*purrs* Tell me to navigate to "learning plan" or "exams" if you need to open those sections! 🐾${memoryContext}`,
      learn: null
    };
  }

  if ((q.includes('how') && q.includes('use') && q.includes('dashboard')) || (q.includes('how') && q.includes('use') && q.includes('admin'))) {
    return {
      text: `🐱 **HOW TO USE THE ADMIN DASHBOARD**\n\nThis dashboard gives administrators complete control over Valdez Elementary School's portal. Here is a comprehensive guide to all tabs and popup modals:\n\n**1. Main Tabs & Sections:**\n• **Dashboard**: Track overall metrics (Total Students, Repeaters, Dropouts, Classrooms, Teachers, Seats) for the selected School Year (S.Y.). Create or delete school years. Trigger the **Edit Census Stats** modal to adjust baseline statistics.\n• **Calendar**: Post school-wide notices and events using the **Add Event** modal.\n• **Teachers**: Search, edit, delete, or add new teachers. Assign teachers to specific grade levels and sections.\n• **Students**: Roster of all students with advanced filters. Actions include editing details, deleting students, updating enrollment status, and viewing individual grade sheets. Add students using the **Add Student** modal.\n• **Analytics**: Performance charts, average grades, and visual metrics comparing school years.\n• **Accounts**: Search and update usernames or passwords for students, parents, teachers, and admins.\n\n**2. Core Popup Modals & How to Trigger Them:**\n• **Add Student Modal** (Trigger: Click "+ Add Student" on the Students tab): Enroll a new student and auto-generate login credentials (Username: LRN, Default Password: \`password123\`).\n• **Add Teacher Modal** (Trigger: Click "+ Add Teacher" on the Teachers tab): Add a new faculty member.\n• **Add Event Modal** (Trigger: Click "+ Add Event" on the Calendar tab): Post calendar events/announcements.\n• **Compare Year Modal** (Trigger: Click "Compare Year" dropdown on the Dashboard tab): View side-by-side comparisons of different school years.\n• **S.Y. 2020-2027 Export/Import Modal** (Trigger: Click "S.Y. 2020-2027 Export/Import" button): Backup or restore the entire database using Excel files.\n• **Classroom Size Modal** (Trigger: Click "Classroom Size" button on the Dashboard tab): Visualizes student-teacher ratios (target 33:1) and classroom capacity warnings.\n• **Edit Census Stats Modal** (Trigger: Click the "Edit Stats" button on the Dashboard card): Manually adjust baseline statistics for enrollment adjustments.\n\n💡 **Tip**: If you want instructions for the Teacher or Student/Parent dashboard instead, ask me: "How do I use the teacher dashboard?" or "How do I use the student dashboard?" 🐾${memoryContext}`,
      learn: null
    };
  }

  // ── Dashboard info ──
  if (q.includes('dashboard') || q.includes('feature') || q.includes('what can')) {
    return { text: `🏫 **Valdez Elementary School Portal** has 3 dashboards:\n\n• **Admin Dashboard** — Full school management: enrollment data, teacher management, grade analytics, calendar, school year comparisons, export/import data\n\n• **Teacher Dashboard** — Class management: student grades, leaderboard, announcements, exam creation, calendar\n\n• **Student/Parent Dashboard** — Academic overview: grades, attendance, achievements, subject proficiency, report cards\n\nI have access to ALL of this data! Ask Bella anything specific~ 🐱\n\n💡 **NEW:** You can also teach me things! Say "Remember that..." and I'll learn it forever! 🧠${memoryContext}`, learn: null };
  }

  // ── Classrooms / Sections ──
  if (q.includes('classroom') || q.includes('section') || q.includes('room')) {
    const classrooms = currentYearData?.classrooms || [];
    const sections = classrooms.map(c => `${c.gradeLevel} — ${c.section}`).join(', ');
    return { text: `🏫 Classroom sections: ${sections || 'Kinder (Section A), Grade 1 (Mabini), Grade 2 (Rizal), Grade 3 (Del Pilar), Grade 4 (Aguinaldo), Grade 5 (Gomez), Grade 6 (Sampaguita)'}\n\nTotal functional classrooms: ${currentYearData?.totalClassrooms || 15}\nTotal seats: ${currentYearData?.totalSeats || 461}${memoryContext}`, learn: null };
  }

  // ── Dynamic Insights / Recommendations & Data Problems ──
  if (q.includes('insight') || q.includes('recommend') || q.includes('problem') || q.includes('warning') || q.includes('alert') || q.includes('analysis')) {
    const insights = [];
    const classrooms = currentYearData?.classrooms || dbContext.classrooms || [];
    const allDbStudents = students || [];

    // --- 1. Enrollments ---
    if (schoolYears && currentYear) {
      const years = Object.keys(schoolYears).sort();
      const currIdx = years.indexOf(currentYear);
      if (currIdx > 0) {
        const prevYear = years[currIdx - 1];
        const currentYearStudents = schoolYears[currentYear]?.totalStudents || 0;
        const prevYearStudents = schoolYears[prevYear]?.totalStudents || 0;
        if (prevYearStudents > 0) {
          const diff = currentYearStudents - prevYearStudents;
          const pct = ((diff / prevYearStudents) * 100).toFixed(1);
          if (diff > 0) {
            insights.push(`📈 **Strong Enrollment Growth**: Enrollment increased by +${pct}% (+${diff} students) compared to S.Y. ${prevYear}.`);
          } else if (diff < 0) {
            insights.push(`⚠️ **Enrollment Decline**: Enrollment dropped by ${pct}% (${diff} students) compared to S.Y. ${prevYear}.`);
          }
        }
      }
    }

    // --- 2. Dropouts ---
    const dropoutsCount = currentYearData?.totalDropouts || allDbStudents.filter(st => st.status === 'Dropped').length || 0;
    if (dropoutsCount > 0) {
      insights.push(`⚠️ **Elevated Dropout Risk**: There are **${dropoutsCount}** registered dropout(s) in S.Y. ${currentYear}. Home visitations and counselor calls are recommended immediately to prevent further student disengagement.`);
    } else {
      insights.push(`✨ **Zero Dropouts Maintained**: S.Y. ${currentYear} has 0 dropouts currently. Excellent student retention!`);
    }

    // --- 3. Overcrowded & Seat Shortages ---
    classrooms.forEach(room => {
      const enrollment = room.enrollment || 0;
      const seatsVal = parseInt(room.seats) || 0;
      if (enrollment > 40) {
        insights.push(`⚠️ **Overcrowding**: Section **${room.gradeLevel} - ${room.section}** has **${enrollment}** students, exceeding DepEd's 40-student standard.`);
      }
      if (seatsVal > 0 && enrollment > seatsVal) {
        insights.push(`⚠️ **Seat Shortage**: Section **${room.gradeLevel} - ${room.section}** has **${enrollment}** students but only **${seatsVal}** seats (shortage of ${enrollment - seatsVal} seats).`);
      }
      if (!room.teachers || room.teachers === 0) {
        insights.push(`⚠️ **Unassigned Teacher**: Section **${room.gradeLevel} - ${room.section}** has no adviser assigned.`);
      }
    });

    // --- 4. Failing Grades ---
    const failingStudents = [];
    const subjectFails = {};
    allDbStudents.forEach(st => {
      let hasFail = false;
      if (st.grades) {
        Object.entries(st.grades).forEach(([subj, qGrades]) => {
          if (qGrades) {
            Object.values(qGrades).forEach(score => {
              if (score !== null && score !== undefined && score !== '') {
                const numScore = Number(score);
                if (numScore > 0 && numScore < 75) {
                  hasFail = true;
                  subjectFails[subj] = (subjectFails[subj] || 0) + 1;
                }
              }
            });
          }
        });
      }
      if (hasFail) failingStudents.push(st.name);
    });

    if (failingStudents.length > 0) {
      const topFailedSubject = Object.entries(subjectFails).sort((a, b) => b[1] - a[1])[0]?.[0];
      const subjectText = topFailedSubject ? `, especially in **${topFailedSubject}**` : '';
      insights.push(`⚠️ **Academic Intervention Needed**: **${failingStudents.length}** student(s) have quarterly grades below the passing threshold of 75${subjectText}. Launching remedial tutoring is advised.`);
    }

    const insightsText = insights.length > 0 
      ? insights.map(ins => `• ${ins}`).join('\n\n')
      : "• Everything is running smoothly! No anomalies, seat shortages, or academic alerts detected in the database. 🐱✨";

    return {
      text: `🐱 *purrs* Based on my active scan of the school database for **${currentYear || 'the current year'}**, here are the dynamic insights and recommendations:\n\n${insightsText}\n\n*Meow!* Keep adding or updating database records, and I will continue scanning to highlight any changes or problems! 🐾`,
      learn: null
    };
  }

  // ── General help / fallback ──
  if (q.includes('help') || q.includes('what') || q.includes('how')) {
    return { text: `Bella can help you with:\n\n• 📊 **Student enrollment** numbers and trends\n• 👩‍🏫 **Teacher information** and assignments\n• 📈 **Academic performance** and grades\n• ⚠️ **Dropout and repeater** statistics\n• 📢 **School announcements**\n• 🏫 **Classroom** and section details\n• 📅 **School year** historical data\n• 🧠 **Teach me things** — say "Remember that..." and I'll learn!\n• 🐾 **Recall memories** — ask "What do you remember?"\n\nI absorb everything you tell me~ 🐱${memoryContext}`, learn: null };
  }

  // ── Auto-learn: if the message contains substantial info, absorb it ──
  const autoLearnFact = query.trim();
  const wordCount = autoLearnFact.split(/\s+/).length;
  if (wordCount >= 4 && autoLearnFact.length > 15) {
    const category = categorizeMemory(autoLearnFact);
    const keywords = extractKeywords(autoLearnFact);
    const alreadyKnows = memories?.some(m => m.fact.toLowerCase() === autoLearnFact.toLowerCase());
    if (!alreadyKnows && keywords.length >= 2) {
      // Silently absorb the conversation
      return { text: `*ears twitch* 🐱 Ooh, I just absorbed that into my memory!\n\n🧠 Learned: **"${autoLearnFact}"**\n\nKeep talking to me — I learn from everything you tell me! 🐾${memoryContext}`, learn: { fact: autoLearnFact, category, keywords } };
    }
  }

  // ── Catch-all Fallback ──
  return { text: `*tilts head* 🐱 I'm not quite sure how to answer that specific question, but I'm here as your school companion!\n\nYou can ask me about students, teachers, grades, dropouts, repeaters, or announcements. You can also tell me to navigate to any tab (like "go to calendar" or "open analytics")! 🐾${memoryContext}`, learn: null };
}

/* ──────────────────────────────────────────────────────────
   AiAssistant Component
   ────────────────────────────────────────────────────────── */
const AiAssistant = ({ userRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleText, setBubbleText] = useState('');
  const [isWalking, setIsWalking] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [mood, setMood] = useState('normal');
  const [charPosition, setCharPosition] = useState({ right: 24 });
  const [dbContext, setDbContext] = useState({ loaded: false });
  const [sparkles, setSparkles] = useState([]);
  const [memories, setMemories] = useState([]);
  const [memoryCount, setMemoryCount] = useState(0);
  const [showConfig, setShowConfig] = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const walkIntervalRef = useRef(null);
  const bubbleTimeoutRef = useRef(null);
  const tipIndexRef = useRef(0);

  // ── Load Bella's memories from server ──
  const loadMemories = useCallback(async () => {
    try {
      const res = await fetch(getApiUrl('/api/ai/memory'));
      if (res.ok) {
        const data = await res.json();
        setMemories(data.memories || []);
        setMemoryCount((data.memories || []).length);
      }
    } catch (err) {
      console.log('[Bella] Could not load memories');
    }
  }, []);

  // ── Save a learned fact to server ──
  const saveMemory = useCallback(async (fact, category, keywords) => {
    try {
      const res = await fetch(getApiUrl('/api/ai/memory'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fact, category, keywords, source: 'user' })
      });
      if (res.ok) {
        const data = await res.json();
        if (!data.duplicate) {
          setMemories(prev => [...prev, data.memory]);
          setMemoryCount(data.totalMemories);
        }
      }
    } catch (err) {
      console.log('[Bella] Could not save memory');
    }
  }, []);

  // ── Clear all memories ──
  const clearAllMemories = useCallback(async () => {
    try {
      await fetch(getApiUrl('/api/ai/memory'), { method: 'DELETE' });
      setMemories([]);
      setMemoryCount(0);
    } catch (err) {
      console.log('[Bella] Could not clear memories');
    }
  }, []);

  // ── Check if Gemini API is configured ──
  const checkConfig = useCallback(async () => {
    try {
      const res = await fetch(getApiUrl('/api/ai/config'));
      if (res.ok) {
        const data = await res.json();
        setIsConfigured(data.configured);
      }
    } catch (err) {
      console.log('[Bella] Could not load API key config status');
    }
  }, []);

  // ── Save Gemini API Key ──
  const handleSaveConfig = useCallback(async (keyToSave) => {
    try {
      const res = await fetch(getApiUrl('/api/ai/config'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: keyToSave })
      });
      if (res.ok) {
        const data = await res.json();
        setIsConfigured(data.configured);
        setShowConfig(false);
        setGeminiKeyInput('');
        
        const welcomeMessage = data.configured
          ? '🐱 *purrs happily* Yay! I am now connected to the Gemini AI model! Ask me anything in natural language, and I will reason over your school data! 🚀✨'
          : '🐱 *meow* API Key cleared. I am back to using my local rule-based system!';
          
        setMessages(prev => [...prev, { role: 'assistant', content: welcomeMessage }]);
      }
    } catch (err) {
      console.log('[Bella] Could not save API key');
    }
  }, []);

  // ── Fetch all database context ──
  const fetchDatabaseContext = useCallback(async () => {
    try {
      // Try the admin endpoint for full data
      const res = await fetch(getApiUrl('/api/admin/data'));
      if (res.ok) {
        const data = await res.json();
        const yearKeys = data.schoolYears ? Object.keys(data.schoolYears).sort().reverse() : [];
        const currentYear = yearKeys[0] || 'S.Y. 2025-2026';
        setDbContext({
          loaded: true,
          students: data.students || [],
          users: data.users || [],
          classrooms: data.classrooms || [],
          announcements: data.announcements || [],
          schoolData: data.schoolData || {},
          schoolYears: data.schoolYears || {},
          currentYear,
          currentYearData: data.schoolYears?.[currentYear] || {},
        });
      }
    } catch (err) {
      console.log('[AI Assistant] Could not load full context, using limited mode');
      setDbContext({ loaded: true });
    }
  }, []);

  useEffect(() => {
    fetchDatabaseContext();
    loadMemories();
    checkConfig();
    // Refresh context periodically
    const refreshInterval = setInterval(fetchDatabaseContext, 30000);
    return () => clearInterval(refreshInterval);
  }, [fetchDatabaseContext, loadMemories, checkConfig]);

  // ── Auto-scroll messages ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ── Random walking animation (Disabled to keep Bella fixed on one side) ──
  useEffect(() => {
    setCharPosition({ right: 24 });
    setIsWalking(false);
  }, []);

  // ── Random idle tips ──
  useEffect(() => {
    if (isOpen) return;

    const showTip = () => {
      const tip = IDLE_TIPS[tipIndexRef.current % IDLE_TIPS.length];
      tipIndexRef.current++;
      setBubbleText(tip);
      setShowBubble(true);
      
      bubbleTimeoutRef.current = setTimeout(() => {
        setShowBubble(false);
      }, 4000);
    };

    // Show first tip after a delay
    const initialDelay = setTimeout(showTip, 5000);
    const tipInterval = setInterval(showTip, 20000 + Math.random() * 10000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(tipInterval);
      clearTimeout(bubbleTimeoutRef.current);
    };
  }, [isOpen]);

  // ── Sparkle effect ──
  const addSparkle = useCallback(() => {
    const id = Date.now();
    const sparkle = {
      id,
      left: Math.random() * 60 + 10,
      top: Math.random() * 40 + 10,
    };
    setSparkles(prev => [...prev, sparkle]);
    setTimeout(() => {
      setSparkles(prev => prev.filter(s => s.id !== id));
    }, 1500);
  }, []);

  // ── Open chat ──
  const openChat = useCallback(() => {
    setIsBouncing(true);
    addSparkle();
    addSparkle();
    addSparkle();
    setTimeout(() => setIsBouncing(false), 500);

    setIsOpen(true);
    setShowBubble(false);
    setMood('happy');

    if (messages.length === 0) {
      const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
      setMessages([{ role: 'assistant', content: greeting }]);
    }

    setTimeout(() => {
      inputRef.current?.focus();
      setMood('normal');
    }, 600);
  }, [messages.length, addSparkle]);

  // ── Send message ──
  const sendMessage = useCallback(async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: trimmed }]);
    setIsTyping(true);
    setMood('thinking');

    // Simulate typing delay for realism
    const delay = 800 + Math.random() * 1200;
    setTimeout(async () => {
      let responseText = '';
      let shouldClearMemory = false;
      let learnData = null;

      try {
        // Try backend Gemini endpoint
        const apiRes = await fetch(getApiUrl('/api/ai/chat'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: trimmed, dbContext, memories })
        });
        
        if (apiRes.ok) {
          const resData = await apiRes.json();
          if (resData.status === 'success') {
            responseText = resData.text;
            shouldClearMemory = resData.clearMemory;
            learnData = resData.learn;
          }
        }
      } catch (err) {
        console.log('[Bella] Gemini API query failed, falling back to local processing', err);
      }

      // If backend Gemini not configured or failed, fall back to local rule-based engine
      if (!responseText) {
        const localResponse = generateSmartResponse(trimmed, dbContext, memories);
        responseText = localResponse.text;
        shouldClearMemory = localResponse.clearMemory;
        learnData = localResponse.learn;
      }

      // Check for navigation tags and dispatch event
      let navigationTarget = null;
      const navMatch = responseText.match(/<navigate>(.*?)<\/navigate>/i);
      if (navMatch && navMatch[1]) {
        navigationTarget = navMatch[1].trim();
        responseText = responseText.replace(/<navigate>.*?<\/navigate>/gi, '').trim();
      }

      setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
      setIsTyping(false);

      if (navigationTarget) {
        window.dispatchEvent(new CustomEvent('app-navigate', { detail: { tab: navigationTarget } }));
      }
      
      // Perform memory actions
      if (shouldClearMemory) {
        await clearAllMemories();
      } else if (learnData) {
        await saveMemory(learnData.fact, learnData.category || 'general', learnData.keywords || []);
      }

      // Log conversation to server for context/logs
      try {
        await fetch(getApiUrl('/api/ai/memory/conversation'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userMessage: trimmed, bellaResponse: responseText })
        });
      } catch (e) {
        // ignore
      }

      setMood('happy');
      setTimeout(() => setMood('normal'), 2000);
    }, delay);
  }, [input, dbContext, memories, saveMemory, clearAllMemories]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Quick action chips ──
  const quickActions = [
    { label: '🧠 Bella\'s Memory', query: 'What do you remember?' },
    { label: '📊 Enrollment', query: 'How many students are enrolled?' },
    { label: '👩‍🏫 Teachers', query: 'Tell me about the teachers' },
    { label: '⚠️ Dropouts', query: 'How many dropouts are there?' },
    { label: '🏫 Dashboards', query: 'What dashboards are available?' },
    { label: '📅 School Years', query: 'Show me school year trends' },
    { label: '📈 Grades', query: 'What is the average grade performance?' },
  ];

  // ── Format message content (basic markdown-like) ──
  const formatContent = (text) => {
    return text.split('\n').map((line, i) => {
      const formatted = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/• /g, '&bull; ');
      return <p key={i} style={{ margin: '2px 0' }} dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  return (
    <>
      {/* ── Animated Character ── */}
      {!isOpen && (
        <div
          className={`ai-character ${isWalking ? 'walking' : ''} ${isBouncing ? 'bouncing' : ''}`}
          style={{ right: `${charPosition.right}px` }}
          onClick={openChat}
          title="Click me! I'm Bella, your AI school assistant 🐱"
        >
          <CatCharacter isWalking={isWalking} mood={mood} />
          
          {/* Sparkles */}
          {sparkles.map(s => (
            <div
              key={s.id}
              className="ai-sparkle"
              style={{ left: `${s.left}%`, top: `${s.top}%` }}
            />
          ))}

          {/* Speech bubble */}
          {showBubble && (
            <div className="ai-speech-bubble">{bubbleText}</div>
          )}
        </div>
      )}

      {/* ── Chat Panel ── */}
      {isOpen && (
        <>
          <div className="ai-chat-overlay" onClick={() => setIsOpen(false)} />
          <div className="ai-chat-panel">
             {/* Header */}
            <div className="ai-chat-header">
              <div className="ai-chat-header-avatar">🐱</div>
              <div className="ai-chat-header-info">
                <div className="ai-chat-header-name">Bella — AI Assistant</div>
                <div className="ai-chat-header-status">
                  Online — {dbContext.loaded ? `All data loaded (${memoryCount} memories)` : 'Loading data...'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  className="ai-chat-close"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255, 255, 255, 0.1)',
                    width: '28px',
                    height: '28px',
                    padding: '0',
                    borderRadius: '6px',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowConfig(!showConfig)}
                  title="Configure Gemini AI Key"
                >
                  ⚙️
                </button>
                <button className="ai-chat-close" onClick={() => setIsOpen(false)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Gemini API Key Configuration Panel */}
            {showConfig && (
              <div className="ai-config-panel" style={{
                padding: '16px',
                background: 'rgba(30, 30, 46, 0.98)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>⚙️ Gemini AI Model</span>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '2px 8px',
                    borderRadius: '20px',
                    background: isConfigured ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    fontWeight: '700'
                  }}>
                    {isConfigured ? 'Connected (Gemini active)' : 'Local Engine active'}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8, lineHeight: '1.4' }}>
                  Bella can integrate Google's Gemini API to answer open-ended questions and analyze the school database! Paste your Gemini API Key below:
                </div>
                <input
                  type="password"
                  placeholder="Enter Gemini API Key..."
                  value={geminiKeyInput}
                  onChange={(e) => setGeminiKeyInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleSaveConfig(geminiKeyInput)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '6px',
                      background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                      color: '#fff',
                      fontWeight: '600',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Save Key
                  </button>
                  {isConfigured && (
                    <button
                      onClick={() => handleSaveConfig('')}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        background: 'rgba(239, 68, 68, 0.2)',
                        color: '#ef4444',
                        fontWeight: '600',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      Remove Key
                    </button>
                  )}
                  <button
                    onClick={() => setShowConfig(false)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="ai-quick-actions">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  className="ai-quick-chip"
                  onClick={() => sendMessage(action.query)}
                >
                  {action.label}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="ai-chat-messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`ai-msg ${msg.role === 'user' ? 'user' : ''}`}>
                  <div className="ai-msg-avatar">
                    {msg.role === 'user' ? '👤' : '🐱'}
                  </div>
                  <div className="ai-msg-bubble">
                    {formatContent(msg.content)}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="ai-msg">
                  <div className="ai-msg-avatar">🐱</div>
                  <div className="ai-msg-bubble">
                    <div className="ai-typing">
                      <div className="ai-typing-dot" />
                      <div className="ai-typing-dot" />
                      <div className="ai-typing-dot" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="ai-chat-input-area">
              <input
                ref={inputRef}
                className="ai-chat-input"
                placeholder="Ask Bella about school data... 🐾"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
              />
              <button
                className="ai-chat-send"
                onClick={() => sendMessage()}
                disabled={!input.trim()}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default AiAssistant;
