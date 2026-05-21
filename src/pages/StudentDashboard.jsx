import React, { useState, useEffect, useMemo } from 'react';
import './StudentDashboard.css';
import { 
  Bell, UserPlus, Star, Wallet, Activity, BarChart2, 
  Megaphone, FileText, Calendar, GraduationCap, ChevronDown, 
  ChevronRight, HelpCircle, Home, Menu, X, ChevronLeft, Search, Settings, BookOpen,
  Trophy, CreditCard, Stethoscope, User, BookA, Clock, HeartPulse, Receipt, Shield, Baby,
  Heart, Zap, ChevronUp, ArrowUpDown, Share2
} from 'lucide-react';
import {
  AnnouncementsScreen, GradesScreen, AchievementsScreen,
  AttendanceScreen, EnrollmentScreen,
  MedicalScreen, ReportCardScreen, MyChildScreen, ConductScreen,
  SettingsScreen, HelpScreen
} from './StudentFeatureScreens';
import { getApiUrl } from '../config';
import ShareModal from '../components/ShareModal';

/* ───────────────── helper: live calendar ───────────────── */
function useCalendar() {
  const [viewDate, setViewDate] = useState(new Date());
  const today = useMemo(() => new Date(), []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const weeks = [];
  let day = 1 - firstDay;
  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let d = 0; d < 7; d++, day++) {
      if (day < 1) week.push({ num: daysInPrevMonth + day, outside: true });
      else if (day > daysInMonth) week.push({ num: day - daysInMonth, outside: true });
      else {
        const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
        week.push({ num: day, outside: false, isToday });
      }
    }
    weeks.push(week);
    if (day > daysInMonth) break;
  }

  const monthLabel = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return {
    weeks, monthLabel,
    prev: () => setViewDate(new Date(year, month - 1, 1)),
    next: () => setViewDate(new Date(year, month + 1, 1)),
    goToday: () => setViewDate(new Date()),
  };
}

/* ───────────────── Tile config (kept for sidebar nav) ───────────────── */
const TILES = [
  { id: 'announcements', label: 'School Announcements',   icon: Megaphone,      gradient: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)', span: 'wide', badge: 2 },
  { id: 'grades',        label: 'Academic Grades',        icon: BookA,          gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
  { id: 'achievements',  label: 'Achievements & Awards',  icon: Trophy,         gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' },
  { id: 'attendance',    label: 'Attendance Record',      icon: Clock,          gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)' },
  { id: 'enrollment',    label: 'Enrollment Process',     icon: UserPlus,       gradient: 'linear-gradient(135deg, #ca8a04 0%, #a16207 100%)' },
  { id: 'payments',      label: 'Pending Payments',       icon: CreditCard,     gradient: 'linear-gradient(135deg, #047857 0%, #064e3b 100%)' },
  { id: 'medical',       label: 'Medical Records',        icon: Stethoscope,    gradient: 'linear-gradient(135deg, #65a30d 0%, #4d7c0f 100%)' },
  { id: 'reportCard',    label: 'Request Report Card',    icon: FileText,       gradient: 'linear-gradient(135deg, #84cc16 0%, #65a30d 100%)', span: 'wide' },
];

/* ───────────────── Student proficiency data removed (now dynamic) ───────────────── */

/* ───────────────── Component ───────────────── */
const StudentDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeFeature, setActiveFeature] = useState('overview');
  const [studentData, setStudentData] = useState(null);
  const [adviserName, setAdviserName] = useState('Teacher');
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sortField, setSortField] = useState('avgScore');
  const [sortDir, setSortDir] = useState('desc');
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const [expandedMenus, setExpandedMenus] = useState({
    academics: false,
    finance: false
  });

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const cal = useCalendar();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentRes = await fetch(getApiUrl(`/api/student/${user.name}`));
        const sData = await studentRes.json();
        setStudentData(sData);

        if (sData?.gradeLevel && sData?.section) {
          try {
            const classRes = await fetch(getApiUrl(`/api/teacher/dashboard/${sData.gradeLevel}/${sData.section}`));
            if (classRes.ok) {
              const cData = await classRes.json();
              if (cData.classroom?.adviser) {
                setAdviserName(cData.classroom.adviser);
              }
            }
          } catch (e) {
            console.error("Failed to fetch classroom data", e);
          }
        }
      } catch (err) {
        console.error("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const intervalId = setInterval(fetchData, 3000); // Poll every 3 seconds for live updates
    return () => clearInterval(intervalId);
  }, [user]);

  useEffect(() => {
    if (!loading) {
      requestAnimationFrame(() => setMounted(true));
    }
  }, [loading]);

  /* ── Subject proficiency data ── */
  const subjectProficiency = useMemo(() => {
    if (!studentData?.grades) return [];

    return Object.entries(studentData.grades).map(([subject, quarters]) => {
      const validGrades = Object.values(quarters).filter(g => g !== null && g !== '');
      const avgScore = validGrades.length ? Math.round(validGrades.reduce((a, b) => a + Number(b), 0) / validGrades.length) : 0;
      
      let status = 'Mastered';
      if (avgScore === 0) status = 'N/A';
      else if (avgScore < 80) status = 'Needs Attention';
      else if (avgScore < 90) status = 'On Track';

      return {
        name: subject,
        teacher: adviserName,
        workCompleted: `${validGrades.length} / 4`,
        avgScore,
        status
      };
    });
  }, [studentData, adviserName]);

  /* ── Sorting ── */
  const sortedSubjects = useMemo(() => {
    return [...subjectProficiency].sort((a, b) => {
      const aVal = a[sortField] || a.name;
      const bVal = b[sortField] || b.name;
      if (sortDir === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });
  }, [subjectProficiency, sortField, sortDir]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  /* ── loading state ── */
  if (loading || !studentData) {
    return (
      <div className="sd-loading">
        <div className="sd-loading-spinner" />
        <p>Loading Parent Dashboard…</p>
      </div>
    );
  }

  /* ── Overall average from student data ── */
  const overallScore = subjectProficiency.length > 0 
    ? Math.round(subjectProficiency.reduce((acc, curr) => acc + curr.avgScore, 0) / subjectProficiency.length) 
    : 0;

  /* ── compute performance groups ── */
  const totalSubjects = subjectProficiency.length;
  const needingAttCount = subjectProficiency.filter(s => s.avgScore > 0 && s.avgScore < 80).length;
  const workingTowardsCount = subjectProficiency.filter(s => s.avgScore >= 80 && s.avgScore < 90).length;
  const masteredCount = subjectProficiency.filter(s => s.avgScore >= 90).length;

  const navTabs = [
    { id: 'overview', label: 'Dashboard' },
    { id: 'grades', label: 'Academics' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'help', label: 'Support' },
  ];

  /* ── render ── */
  return (
    <div className="sd-root">
      {/* ─── TOP NAV BAR ─── */}
      <header className="sd-topbar">
        <div className="sd-topbar-left">
          <div className="sd-logo-container">
            <img src="/logo.png?v=4" alt="Valdez Elementary School Logo" className="sd-logo-img" />
          </div>
          <nav className="sd-topnav">
            {navTabs.map(tab => (
              <button
                key={tab.id}
                className={`sd-topnav-item ${activeFeature === tab.id || (tab.id === 'overview' && activeFeature === 'overview') ? 'sd-topnav-item--active' : ''}`}
                onClick={() => setActiveFeature(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="sd-topbar-right">
          <button className="sd-topbar-icon" aria-label="Share Link" onClick={() => setShareModalOpen(true)} title="Share Link">
            <Share2 size={18} />
          </button>
          <button className="sd-topbar-icon" aria-label="Favorites">
            <Heart size={18} />
          </button>
          <button className="sd-topbar-icon sd-topbar-notif" aria-label="Notifications">
            <Bell size={18} />
            <span className="sd-notif-badge">3</span>
          </button>
          <div className="sd-user-avatar" onClick={onLogout} title="Logout">
            <span>{user?.name?.charAt(0)}</span>
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <div className="sd-content-area">
        <div key={activeFeature}>
          {activeFeature === 'overview' ? (
            <div className="sd-overview">
              {/* Dashboard Header */}
            <div className="sd-dash-header">
              <div className="sd-dash-header-left">
                <h1 className="sd-dash-title">Dashboard</h1>
                <div className="sd-class-selector">
                  <GraduationCap size={16} />
                  <span>{studentData.section || 'Class A'}</span>
                  <ChevronDown size={14} />
                </div>
                <div className="sd-avatar-group">
                  <div className="sd-avatar-circle" style={{ zIndex: 3 }}>
                    <span>🧑</span>
                  </div>
                  <span className="sd-avatar-name">{studentData.name}</span>
                </div>
              </div>
              <div className="sd-dash-header-right">
                <div className="sd-alerts-badge" onClick={() => setSelectedInsight('Alerts')}>
                  <Zap size={16} />
                  <span>Alerts</span>
                  {masteredCount > 0 && <span className="sd-alert-count sd-alert-count--green">{masteredCount}</span>}
                  {needingAttCount > 0 && <span className="sd-alert-count sd-alert-count--red">{needingAttCount}</span>}
                  {masteredCount === 0 && needingAttCount === 0 && <span className="sd-alert-count" style={{ background: '#e5e7eb', color: '#6b7280' }}>0</span>}
                </div>
              </div>
            </div>

            {/* ── Summary Cards Row ── */}
            <div className="sd-summary-row">
              {/* Overall Class Score */}
              <div className="sd-summary-card sd-summary-card--score">
                <div className="sd-score-info">
                  <div className="sd-score-labels">
                    <span className="sd-score-title">Overall<br/>Average</span>
                    <span className="sd-score-big">{overallScore}%</span>
                  </div>
                  <div className="sd-trophy-icon">🏆</div>
                  <div className="sd-score-labels">
                    <span className="sd-score-title">Subjects<br/>Taken</span>
                    <span className="sd-score-big">{totalSubjects}</span>
                  </div>
                </div>
                <div className="sd-score-meta">
                  <div className="sd-meta-item">
                    <span className="sd-meta-label">Standing</span>
                    <span className="sd-meta-value">{overallScore >= 90 ? 'Excellent' : overallScore >= 80 ? 'Good' : 'Needs Work'}</span>
                  </div>
                  <div className="sd-meta-spacer"></div>
                  <div className="sd-meta-item">
                    <span className="sd-meta-label">Status</span>
                    <span className="sd-meta-value">{studentData.status || 'Enrolled'}</span>
                  </div>
                </div>
                {/* Bubble pattern */}
                <div className="sd-bubbles-pattern">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="sd-bubble"
                      style={{
                        width: `${8 + Math.random() * 16}px`,
                        height: `${8 + Math.random() * 16}px`,
                        left: `${55 + Math.random() * 35}%`,
                        top: `${10 + Math.random() * 60}%`,
                        opacity: 0.25 + Math.random() * 0.5,
                        animationDelay: `${Math.random() * 2}s`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Performance Cards */}
              <div className="sd-perf-card sd-perf-card--green" onClick={() => setSelectedInsight('Mastered')}>
                <div className="sd-perf-avatar">🌟</div>
                <span className="sd-perf-big">{masteredCount}</span>
                <div className="sd-perf-details">
                  <span className="sd-perf-pct">{Math.round((masteredCount / (totalSubjects || 1)) * 100)}%</span>
                  <span className="sd-perf-label">of subjects</span>
                  <span className="sd-perf-sublabel">Mastered<br/>(90%+)</span>
                </div>
              </div>
              <div className="sd-perf-card sd-perf-card--yellow" onClick={() => setSelectedInsight('On Track')}>
                <div className="sd-perf-avatar">📈</div>
                <span className="sd-perf-big">{workingTowardsCount}</span>
                <div className="sd-perf-details">
                  <span className="sd-perf-pct">{Math.round((workingTowardsCount / (totalSubjects || 1)) * 100)}%</span>
                  <span className="sd-perf-label">of subjects</span>
                  <span className="sd-perf-sublabel">On Track<br/>(80-89%)</span>
                </div>
              </div>
              <div className="sd-perf-card sd-perf-card--orange" onClick={() => setSelectedInsight('Needs Attention')}>
                <div className="sd-perf-avatar">⚠️</div>
                <span className="sd-perf-big">{needingAttCount}</span>
                <div className="sd-perf-details">
                  <span className="sd-perf-pct">{Math.round((needingAttCount / (totalSubjects || 1)) * 100)}%</span>
                  <span className="sd-perf-label">of subjects</span>
                  <span className="sd-perf-sublabel">Needs Attention<br/>(&lt;80%)</span>
                </div>
              </div>
            </div>

            {/* ── Students Proficiency Table ── */}
            <div className="sd-proficiency-section">
              <div className="sd-proficiency-header">
                <h2 className="sd-proficiency-title">Subject Proficiency</h2>
                <div className="sd-proficiency-controls">
                  <button className="sd-proficiency-tab sd-proficiency-tab--active">
                    <BookOpen size={14} /> Academic Performance
                  </button>
                </div>
              </div>

              <div className="sd-proficiency-table-wrap">
                <table className="sd-proficiency-table">
                  <thead>
                    <tr>
                      <th>
                        <button className="sd-th-sort" onClick={() => toggleSort('name')}>
                          Subject
                          {sortField === 'name' ? (sortDir === 'asc' ? <ChevronUp size={12}/> : <ChevronDown size={12}/>) : <ArrowUpDown size={12}/>}
                        </button>
                      </th>
                      <th>Teacher</th>
                      <th>Quarters Completed</th>
                      <th>
                        <button className="sd-th-sort" onClick={() => toggleSort('avgScore')}>
                          Average Score
                          {sortField === 'avgScore' ? (sortDir === 'asc' ? <ChevronUp size={12}/> : <ChevronDown size={12}/>) : <ArrowUpDown size={12}/>}
                        </button>
                      </th>
                      <th>Standing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSubjects.map((subject, idx) => {
                      const scoreColor = subject.avgScore >= 90 ? '#4ade80' : subject.avgScore >= 80 ? '#fbbf24' : '#f87171';
                      const barWidth = mounted ? `${subject.avgScore}%` : '0%';
                      let standingBadge = 'sd-badge--green';
                      if (subject.status === 'Needs Attention') standingBadge = 'sd-badge--red';
                      else if (subject.status === 'On Track') standingBadge = 'sd-badge--yellow';
                      else if (subject.status === 'N/A') standingBadge = 'sd-badge--gray';
                      
                      return (
                        <tr key={idx} className="sd-proficiency-row" style={{ animationDelay: `${idx * 80}ms` }}>
                          <td>
                            <div className="sd-student-cell">
                              <div className="sd-student-avatar-sm">📚</div>
                              <span className="sd-student-name">{subject.name}</span>
                            </div>
                          </td>
                          <td>
                            <span className="sd-work-completed">{subject.teacher}</span>
                          </td>
                          <td>
                            <span className="sd-work-completed">{subject.workCompleted}</span>
                          </td>
                          <td>
                            <div className="sd-score-cell">
                              <div className="sd-score-bar-track">
                                <div className="sd-score-bar-fill" style={{ width: barWidth, background: scoreColor, transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                              </div>
                              <span className="sd-score-text" style={{ color: scoreColor, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s ease-in 1s' }}>{subject.avgScore > 0 ? `${subject.avgScore}%` : 'N/A'}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`sd-badge ${standingBadge}`}>{subject.status}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="sd-feature-layout">
            {activeFeature === 'announcements' && <AnnouncementsScreen onBack={() => setActiveFeature('overview')} />}
            {activeFeature === 'grades' && <GradesScreen studentData={studentData} onBack={() => setActiveFeature('overview')} />}
            {activeFeature === 'achievements' && <AchievementsScreen studentData={studentData} onBack={() => setActiveFeature('overview')} />}
            {activeFeature === 'attendance' && <AttendanceScreen studentData={studentData} onBack={() => setActiveFeature('overview')} />}
            {activeFeature === 'enrollment' && <EnrollmentScreen studentData={studentData} onBack={() => setActiveFeature('overview')} />}
            {activeFeature === 'medical' && <MedicalScreen studentData={studentData} onBack={() => setActiveFeature('overview')} />}
            {activeFeature === 'reportCard' && <ReportCardScreen onBack={() => setActiveFeature('overview')} />}
            {activeFeature === 'myChild' && <MyChildScreen studentData={studentData} onBack={() => setActiveFeature('overview')} />}
            {activeFeature === 'conduct' && <ConductScreen studentData={studentData} onBack={() => setActiveFeature('overview')} />}
            {activeFeature === 'settings' && <SettingsScreen onBack={() => setActiveFeature('overview')} />}
            {activeFeature === 'help' && <HelpScreen onBack={() => setActiveFeature('overview')} />}
          </div>
        )}
        </div>
      </div>

      {/* ─── INSIGHTS MODAL ─── */}
      {selectedInsight && (
        <div className="sd-modal-overlay" onClick={() => setSelectedInsight(null)}>
          <div className="sd-modal-content" onClick={e => e.stopPropagation()}>
            <button className="sd-modal-close" onClick={() => setSelectedInsight(null)}>
              <X size={20} />
            </button>
            <h2 className="sd-modal-title">
              {selectedInsight === 'Alerts' ? 'Recent Alerts' : `${selectedInsight} Insights`}
            </h2>
            <div className="sd-modal-body">
              {(() => {
                if (selectedInsight === 'Alerts') {
                  const hasAlerts = masteredCount > 0 || needingAttCount > 0;
                  return (
                    <div>
                      <p className="sd-modal-recommendation" style={{ borderLeftColor: "#8b5cf6" }}>
                        Overview of your recent academic alerts and notifications.
                      </p>
                      {hasAlerts ? (
                        <ul className="sd-modal-subject-list">
                          {needingAttCount > 0 && (
                            <li className="sd-modal-subject-item" style={{ borderLeft: '4px solid #ef4444' }}>
                              <strong>Needs Attention</strong> 
                              <span style={{ color: '#ef4444', fontWeight: 600 }}>{needingAttCount} subject(s) below 80%</span>
                            </li>
                          )}
                          {masteredCount > 0 && (
                            <li className="sd-modal-subject-item" style={{ borderLeft: '4px solid #22c55e' }}>
                              <strong>Mastered</strong> 
                              <span style={{ color: '#22c55e', fontWeight: 600 }}>{masteredCount} subject(s) performing excellently</span>
                            </li>
                          )}
                        </ul>
                      ) : (
                        <p style={{ color: '#6b7280', fontSize: '0.9rem', textAlign: 'center', marginTop: '20px' }}>
                          No new alerts at this time.
                        </p>
                      )}
                    </div>
                  );
                }

                const subjects = subjectProficiency.filter(s => s.status === selectedInsight);
                let recommendation = "";
                let borderColor = "#3b82f6";
                
                if (selectedInsight === 'Mastered') {
                  recommendation = "Excellent work! The student has a strong grasp of these subjects. Recommendation: Provide advanced materials or enrichment activities to keep them challenged.";
                  borderColor = "#22c55e";
                } else if (selectedInsight === 'On Track') {
                  recommendation = "Good progress! The student is doing well but has room for improvement. Recommendation: Review recent quizzes to identify minor gaps in understanding.";
                  borderColor = "#eab308";
                } else if (selectedInsight === 'Needs Attention') {
                  recommendation = "Action required. The student is struggling with these subjects. Recommendation: Schedule a one-on-one tutoring session and focus on foundational concepts.";
                  borderColor = "#f97316";
                }

                return (
                  <div>
                    <p className="sd-modal-recommendation" style={{ borderLeftColor: borderColor }}>
                      {recommendation}
                    </p>
                    {subjects.length > 0 ? (
                      <ul className="sd-modal-subject-list">
                        {subjects.map((subj, idx) => (
                          <li key={idx} className="sd-modal-subject-item">
                            <strong>{subj.name}</strong> 
                            <span style={{ fontWeight: 800, color: borderColor }}>{subj.avgScore}%</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ color: '#6b7280', fontSize: '0.9rem', textAlign: 'center', marginTop: '20px' }}>
                        No subjects in this category.
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <nav className="sd-mobile-bottomnav">
        {navTabs.map(tab => {
          let Icon = Home;
          if (tab.id === 'grades') Icon = BookOpen;
          else if (tab.id === 'attendance') Icon = Clock;
          else if (tab.id === 'achievements') Icon = Trophy;
          else if (tab.id === 'help') Icon = HelpCircle;
          return (
            <button
              key={tab.id}
              className={`sd-mobile-bottomnav-item ${activeFeature === tab.id ? 'active' : ''}`}
              onClick={() => setActiveFeature(tab.id)}
            >
              <Icon size={20} className="sd-mobile-icon" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
      <ShareModal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} role="Student" />
    </div>
  );
};

export default StudentDashboard;
