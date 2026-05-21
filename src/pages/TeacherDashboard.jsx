import React, { useState, useEffect } from 'react';
import { Search, GraduationCap, Users, Clock, Settings, Package, Play, ChevronDown, Calendar as CalendarIcon, FileText, Check, X, AlertCircle, Share2 } from 'lucide-react';
import ShareModal from '../components/ShareModal';
import './TeacherDashboard.css';
import { getApiUrl } from '../config';

const TeacherDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState(0); // 0: Learning Plan, 1: Students, 2: Calendar, 3: Exams, 4: Settings
  const [mountedAnim, setMountedAnim] = useState(false);
  const [students, setStudents] = useState([]);
  const [classroom, setClassroom] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Grade Editing State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editedGrades, setEditedGrades] = useState(null);
  const [saving, setSaving] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Prepared Exams State
  const [examsList, setExamsList] = useState([
    { id: 1, title: 'Q1 Midterm Exam', date: 'March 15, 2026', type: 'Multiple Choice' },
    { id: 2, title: 'Reading Comprehension', date: 'March 22, 2026', type: 'Essay' },
    { id: 3, title: 'Math Quiz 4', date: 'April 02, 2026', type: 'Problem Solving' },
    { id: 4, title: 'Science Finals', date: 'April 10, 2026', type: 'Mixed' }
  ]);
  const [createExamModalOpen, setCreateExamModalOpen] = useState(false);
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamDate, setNewExamDate] = useState('');
  const [newExamType, setNewExamType] = useState('Multiple Choice');

  useEffect(() => {
    setTimeout(() => setMountedAnim(true), 100);
    const fetchData = async () => {
      try {
        const [dashRes, annRes] = await Promise.all([
          fetch(getApiUrl(`/api/teacher/dashboard/${user?.gradeLevel || '1'}/${user?.section || 'A'}`)),
          fetch(getApiUrl('/api/announcements'))
        ]);
        const dashData = await dashRes.json();
        const annData = await annRes.json();
        setClassroom(dashData.classroom);
        setStudents(dashData.students || []);
        setAnnouncements(annData || []);
      } catch (err) {
        console.error("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchData();

      // Poll for database.xlsx changes every 5 seconds
      let lastVersion = null;
      const pollInterval = setInterval(async () => {
        try {
          const res = await fetch(getApiUrl('/api/data-version'));
          if (res.ok) {
            const { version } = await res.json();
            if (lastVersion !== null && lastVersion !== version) {
              console.log('[Live Sync] database.xlsx updated, refreshing teacher dashboard...');
              fetchData();
            }
            lastVersion = version;
          }
        } catch (e) { /* silent */ }
      }, 5000);

      return () => clearInterval(pollInterval);
    } else {
      setLoading(false);
    }
  }, [user]);

  const calculatedLeaderboard = students.map(student => {
    let total = 0;
    let count = 0;
    if (student.grades) {
      Object.values(student.grades).forEach(subject => {
        if (subject.q1) { total += subject.q1; count++; }
        if (subject.q2) { total += subject.q2; count++; }
        if (subject.q3) { total += subject.q3; count++; }
        if (subject.q4) { total += subject.q4; count++; }
      });
    }
    const average = count > 0 ? (total / count).toFixed(1) : 0;
    return {
      ...student,
      average: Number(average)
    };
  }).sort((a, b) => b.average - a.average);

  const topStudent = calculatedLeaderboard.length > 0 ? calculatedLeaderboard[0] : null;
  const runnerUps = calculatedLeaderboard.slice(1, 6).map((student, idx) => ({
    rank: idx + 2,
    name: student.name,
    score: `${student.average}% Average`,
    class: `td-rank-${idx + 2}`
  }));

  const formatDateString = (dateStr) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return dateStr;
    return dateObj.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
  };

  const handleCreateExam = (e) => {
    if (e) e.preventDefault();
    if (!newExamTitle.trim() || !newExamDate) return;
    
    const newExam = {
      id: examsList.length + 1,
      title: newExamTitle.trim(),
      date: formatDateString(newExamDate),
      type: newExamType
    };
    
    setExamsList(prev => [...prev, newExam]);
    setCreateExamModalOpen(false);
    
    // Reset form fields
    setNewExamTitle('');
    setNewExamDate('');
    setNewExamType('Multiple Choice');
  };

  const [modalViewType, setModalViewType] = useState('grades');

  const openStudentModal = (student, viewType = 'grades') => {
    setSelectedStudent(student);
    setEditedGrades(JSON.parse(JSON.stringify(student.grades || {})));
    setModalViewType(viewType);
  };

  const handleGradeChange = (subject, quarter, value) => {
    setEditedGrades(prev => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        [quarter]: value === '' ? null : Number(value)
      }
    }));
  };

  const saveGrades = async () => {
    setSaving(true);
    try {
      const res = await fetch(getApiUrl('/api/teacher/grades'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          grades: editedGrades
        })
      });
      if (res.ok) {
        setStudents(students.map(s => s.id === selectedStudent.id ? { ...s, grades: editedGrades } : s));
        setSelectedStudent(null);
      } else {
        console.error('Failed to save grades');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // --- Render Tab Views ---

  const renderLearningPlan = () => (
    <>
      <div className="td-left-panel">
        <div className="td-panel-header">
          <h1 className="td-panel-title">
            My Students <span style={{fontSize: '2rem'}}>🎓</span>
          </h1>
          <div className="td-search-bar">
            <Search size={18} color="#a0a0a0" />
            <input type="text" placeholder="Search" />
          </div>
        </div>
        <div className="td-cards-grid">
          {students.slice(0, 3).map((student, idx) => {
            const bgColors = ['#dcfce7', '#fef3c7', '#e0e7ff'];
            return (
              <div key={student.id} className="td-card" onClick={() => openStudentModal(student, 'details')}>
                <div className="td-card-date">{15 + idx}</div>
                <div className="td-card-month">Aug</div>
                <img src={`https://api.dicebear.com/7.x/micah/svg?seed=${student.name}&backgroundColor=transparent`} alt={student.name} className="td-card-avatar" />
                <div className="td-card-name">{student.name}</div>
                <div className="td-card-role">{student.gender} • LRN {student.lrn.slice(-4)}</div>
                <div className="td-card-task" style={{ background: bgColors[idx % 3] }}>
                  <div className="td-task-info">
                    <h4>{student.status}</h4>
                    <p><Users size={12} /> Adv: {user?.name || 'TBD'}</p>
                  </div>
                  <div className="td-waveform">
                    <span /><span /><span /><span /><span />
                  </div>
                </div>
              </div>
            );
          })}
          
          {students.length > 3 && (
            <div className="td-card tilted" style={{ zIndex: 10 }} onClick={() => openStudentModal(students[3], 'details')}>
              <div className="td-card-date">18</div>
              <div className="td-card-month">Aug</div>
              <img src={`https://api.dicebear.com/7.x/micah/svg?seed=${students[3].name}&backgroundColor=transparent`} alt={students[3].name} className="td-card-avatar" />
              <div className="td-card-name">{students[3].name}</div>
              <div className="td-card-role">{students[3].gender} • LRN {students[3].lrn.slice(-4)}</div>
              <div className="td-card-task" style={{ background: '#fef3c7' }}>
                <div className="td-task-info">
                  <h4>{students[3].status}</h4>
                  <p><Users size={12} /> Adv: {user?.name || 'TBD'}</p>
                </div>
                <div className="td-waveform">
                  <span /><span /><span /><span /><span />
                </div>
              </div>
            </div>
          )}
          
          <div className="td-card td-card-purple">
            <span className="td-note-1">🎵</span>
            <span className="td-note-2">🎶</span>
            <div className="td-play-btn">
              <Play size={32} fill="#0f1011" color="#0f1011" style={{ marginLeft: '4px' }} />
            </div>
            <h3>Circulatory<br/>System</h3>
            <p><Clock size={14} /> Keep watching 00:30</p>
          </div>
          
          {students.length > 4 && students.slice(4).map((student, idx) => (
            <div key={student.id} className="td-card" onClick={() => openStudentModal(student, 'details')}>
              <div className="td-card-date">{19 + idx}</div>
              <div className="td-card-month">Aug</div>
              <img src={`https://api.dicebear.com/7.x/micah/svg?seed=${student.name}&backgroundColor=transparent`} alt={student.name} className="td-card-avatar" />
              <div className="td-card-name">{student.name}</div>
              <div className="td-card-role">{student.gender} • LRN {student.lrn.slice(-4)}</div>
              <div className="td-card-task" style={{ background: '#e0e7ff' }}>
                <div className="td-task-info">
                  <h4>{student.status}</h4>
                  <p><Users size={12} /> Adv: {user?.name || 'TBD'}</p>
                </div>
                <div className="td-waveform">
                  <span /><span /><span /><span /><span />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="td-right-panel-replica">
        <h2 className="td-leaderboard-title">
          Leaderboard <span>🏆</span>
        </h2>
        {topStudent && (
          <div className="td-top1-container">
            <div className="td-top1-avatar-wrap">
              <div className="td-top1-bg" />
              <div className="td-top1-crown">👑</div>
              <img src={`https://api.dicebear.com/7.x/micah/svg?seed=${topStudent.name}&backgroundColor=transparent`} alt={topStudent.name} className="td-top1-avatar" />
              <div className="td-top1-badge">1</div>
            </div>
            <div className="td-top1-name">{topStudent.name}</div>
            <div className="td-top1-score">{topStudent.average}% Average</div>
          </div>
        )}
        <div className="td-leaderboard-list">
          {runnerUps.map((u, idx) => (
            <div key={u.rank} className={`td-list-item ${idx === 0 ? 'active' : ''}`}>
              <img src={`https://api.dicebear.com/7.x/micah/svg?seed=${u.name}&backgroundColor=f4f6f8`} alt={u.name} className="td-list-avatar" />
              <div className="td-list-info">
                <div className="td-list-name">{u.name}</div>
                <div className="td-list-score">{u.score}</div>
              </div>
              <div className={`td-list-rank ${u.class}`}>{u.rank}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderStudents = () => (
    <div className="td-left-panel" style={{ width: '100%', flex: 'none', height: '100%' }}>
      <div className="td-panel-header">
        <h1 className="td-panel-title">My Students</h1>
        <div className="td-search-bar">
          <Search size={18} color="#a0a0a0" />
          <input type="text" placeholder="Search students..." />
        </div>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#a0a0a0' }}>Loading students...</div>
      ) : (
        <div className="td-students-grid">
          {students.map(student => (
            <div key={student.id} className="td-student-card" onClick={() => openStudentModal(student, 'grades')}>
              <img src={`https://api.dicebear.com/7.x/micah/svg?seed=${student.name}&backgroundColor=transparent`} alt={student.name} className="td-student-avatar" />
              <div className="td-student-info">
                <h3>{student.name}</h3>
                <p>LRN: {student.lrn} • {student.gender}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCalendar = () => (
    <div className="td-left-panel" style={{ width: '100%', flex: 'none', height: '100%' }}>
      <div className="td-panel-header">
        <h1 className="td-panel-title">Announcements & Calendar</h1>
      </div>
      
      <div className="td-calendar-layout">
        <div className="td-announcements-col">
          {announcements.length === 0 ? (
            <p style={{ color: '#a0a0a0' }}>No new announcements.</p>
          ) : (
            announcements.map(ann => (
              <div key={ann.id} className="td-announcement-card">
                <div className="td-announcement-header">
                  <h3>{ann.title}</h3>
                  <span className="td-announcement-date">{ann.date}</span>
                </div>
                <p>{ann.content}</p>
              </div>
            ))
          )}
        </div>
        
        <div className="td-calendar-col">
          <div className="td-mini-calendar-header">
            <span>May 2026</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ cursor: 'pointer' }}>&lt;</span>
              <span style={{ cursor: 'pointer' }}>&gt;</span>
            </div>
          </div>
          <div className="td-mini-calendar-grid">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
              <div key={d} className="td-mini-calendar-day-name">{d}</div>
            ))}
            {Array.from({ length: 31 }).map((_, i) => (
              <div key={i} className={`td-mini-calendar-day ${i === 16 ? 'active' : ''}`}>
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderExams = () => (
    <div className="td-left-panel" style={{ width: '100%', flex: 'none', height: '100%' }}>
      <div className="td-panel-header">
        <h1 className="td-panel-title">Prepared Exams</h1>
        <button className="td-btn td-btn-primary" onClick={() => setCreateExamModalOpen(true)}>+ Create Exam</button>
      </div>
      <div className="td-exams-grid">
        {examsList.map(exam => (
          <div key={exam.id} className="td-exam-card">
            <div className="td-exam-icon"><FileText size={24} /></div>
            <div>
              <h3>{exam.title}</h3>
              <p className="td-exam-meta"><CalendarIcon size={14}/> {exam.date}</p>
              <p className="td-exam-meta" style={{ marginTop: '4px' }}>Type: {exam.type}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="td-left-panel" style={{ width: '100%', flex: 'none', height: '100%' }}>
      <div className="td-panel-header">
        <h1 className="td-panel-title">Settings</h1>
      </div>
      <div className="td-settings-panel">
        <div className="td-settings-group">
          <label>Full Name</label>
          <input type="text" className="td-settings-input" defaultValue={user?.name || 'Ellington Thom'} />
        </div>
        <div className="td-settings-group">
          <label>Email Address</label>
          <input type="email" className="td-settings-input" defaultValue="annette@gmail.com" />
        </div>
        <div className="td-settings-group">
          <label>Notification Preferences</label>
          <select className="td-settings-input">
            <option>All Notifications</option>
            <option>Important Only</option>
            <option>None</option>
          </select>
        </div>
        <button className="td-btn td-btn-primary">Save Changes</button>
      </div>
    </div>
  );

  return (
    <div className="td-root">
      {/* ── Top Header ── */}
      <header className="td-header-replica">
        <div className="td-header-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo.png" alt="Valdez Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
          Valdez Elementary
        </div>
        
        <nav className="td-header-nav">
          <div className={`td-nav-item ${activeTab === 0 ? 'active' : ''}`} onClick={() => setActiveTab(0)}>
            <GraduationCap className="td-nav-icon" />
            <span>Learning Plan</span>
          </div>
          <div className={`td-nav-item ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)} title="Students">
            <Users className="td-nav-icon" />
            <span>Students</span>
          </div>
          <div className={`td-nav-item ${activeTab === 2 ? 'active' : ''}`} onClick={() => setActiveTab(2)} title="Calendar & Announcements">
            <Clock className="td-nav-icon" />
            <span>Calendar</span>
          </div>
          <div className={`td-nav-item ${activeTab === 3 ? 'active' : ''}`} onClick={() => setActiveTab(3)} title="Exams">
            <Package className="td-nav-icon" />
            <span>Exams</span>
          </div>
          <div className={`td-nav-item ${activeTab === 4 ? 'active' : ''}`} onClick={() => setActiveTab(4)} title="Settings">
            <Settings className="td-nav-icon" />
            <span>Settings</span>
          </div>
        </nav>

        <button 
          className="td-btn-share" 
          onClick={() => setShareModalOpen(true)}
          style={{
            background: 'none',
            border: '1px solid #e0e0e0',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#4a4a4a',
            marginRight: '12px',
            transition: 'all 0.2s',
          }}
          title="Share Link"
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f4f6f8'; e.currentTarget.style.borderColor = '#a0a0a0'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = '#e0e0e0'; }}
        >
          <Share2 size={16} />
        </button>

        <div className="td-header-profile" onClick={onLogout}>
          <div className="td-profile-info">
            <span className="td-profile-name">{user?.name || 'Ellington Thom'}</span>
            <span className="td-profile-email">annette@gmail.com</span>
          </div>
          <img src={`https://api.dicebear.com/7.x/micah/svg?seed=${user?.name || 'Ellington'}&backgroundColor=transparent`} alt="Profile" className="td-profile-avatar" />
          <ChevronDown size={16} color="#a0a0a0" />
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main className="td-main-content">
        {activeTab === 0 && renderLearningPlan()}
        {activeTab === 1 && renderStudents()}
        {activeTab === 2 && renderCalendar()}
        {activeTab === 3 && renderExams()}
        {activeTab === 4 && renderSettings()}
      </main>

      {/* ── Grade Editing Modal ── */}
      {selectedStudent && editedGrades && (
        <div className="td-modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="td-modal-content" onClick={e => e.stopPropagation()}>
            <div className="td-modal-header">
              <h2>Student Details</h2>
              <X className="td-modal-close" onClick={() => setSelectedStudent(null)} />
            </div>
            
            <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', alignItems: 'center' }}>
              <img 
                src={`https://api.dicebear.com/7.x/micah/svg?seed=${selectedStudent.name}&backgroundColor=f4f6f8`} 
                alt={selectedStudent.name} 
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} 
              />
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#0f1011' }}>{selectedStudent.name}</h3>
                <p style={{ color: '#a0a0a0', fontSize: '0.9rem', margin: '4px 0' }}>
                  <strong>LRN:</strong> {selectedStudent.lrn} &nbsp;•&nbsp; <strong>Gender:</strong> {selectedStudent.gender}
                </p>
                <div style={{ display: 'inline-block', padding: '4px 12px', background: selectedStudent.status === 'Enrolled' ? '#dcfce7' : '#fee2e2', color: selectedStudent.status === 'Enrolled' ? '#166534' : '#991b1b', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
                  {selectedStudent.status}
                </div>
              </div>
            </div>

            {modalViewType === 'details' ? (
              <div style={{ background: '#f4f6f8', borderRadius: '16px', padding: '24px', marginTop: '12px', color: '#1a1a1a' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px 0', color: '#0f1011' }}>Additional Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.95rem' }}>
                  <div>
                    <span style={{ color: '#6b7280', display: 'block', marginBottom: '4px' }}>Grade Level</span>
                    <strong style={{ color: '#0f1011' }}>{selectedStudent.gradeLevel}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#6b7280', display: 'block', marginBottom: '4px' }}>Section</span>
                    <strong style={{ color: '#0f1011' }}>{selectedStudent.section}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#6b7280', display: 'block', marginBottom: '4px' }}>Student ID</span>
                    <strong style={{ color: '#0f1011' }}>{selectedStudent.id}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#6b7280', display: 'block', marginBottom: '4px' }}>Adviser</span>
                    <strong style={{ color: '#0f1011' }}>{user?.name || 'TBD'}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: '#0f1011' }}>Academic Grades</h4>
                <div style={{ overflowX: 'auto', border: '1px solid #f0f0f0', borderRadius: '12px' }}>
                  <table className="td-grades-table">
                    <thead style={{ background: '#f4f6f8' }}>
                      <tr>
                        <th>Subject</th>
                        <th>Q1</th>
                        <th>Q2</th>
                        <th>Q3</th>
                        <th>Q4</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(editedGrades).map(subject => (
                        <tr key={subject}>
                          <td style={{ fontWeight: 600 }}>{subject}</td>
                          {['q1', 'q2', 'q3', 'q4'].map(q => (
                            <td key={q}>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                className="td-grade-input"
                                value={editedGrades[subject][q] === null ? '' : editedGrades[subject][q]}
                                onChange={(e) => handleGradeChange(subject, q, e.target.value)}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <div className="td-modal-actions">
              <button className="td-btn td-btn-secondary" onClick={() => setSelectedStudent(null)}>{modalViewType === 'details' ? 'Close' : 'Cancel'}</button>
              {modalViewType === 'grades' && (
                <button className="td-btn td-btn-primary" onClick={saveGrades} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <ShareModal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} role="Teacher" />

      {/* ── Create Exam Modal ── */}
      {createExamModalOpen && (
        <div className="td-modal-overlay" onClick={() => setCreateExamModalOpen(false)}>
          <div className="td-modal-content" onClick={e => e.stopPropagation()}>
            <div className="td-modal-header">
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f1011', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={24} /> Create Prepared Exam
              </h2>
              <X className="td-modal-close" onClick={() => setCreateExamModalOpen(false)} />
            </div>
            
            <form onSubmit={handleCreateExam} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="td-settings-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '8px' }}>Exam Title</label>
                <input
                  type="text"
                  className="td-settings-input"
                  placeholder="e.g. Science Midterm Exam"
                  value={newExamTitle}
                  onChange={(e) => setNewExamTitle(e.target.value)}
                  required
                />
              </div>

              <div className="td-settings-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '8px' }}>Exam Date</label>
                <input
                  type="date"
                  className="td-settings-input"
                  value={newExamDate}
                  onChange={(e) => setNewExamDate(e.target.value)}
                  required
                />
              </div>

              <div className="td-settings-group" style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '8px' }}>Exam Type</label>
                <select
                  className="td-settings-input"
                  value={newExamType}
                  onChange={(e) => setNewExamType(e.target.value)}
                >
                  <option value="Multiple Choice">Multiple Choice</option>
                  <option value="Essay">Essay</option>
                  <option value="Problem Solving">Problem Solving</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>

              <div className="td-modal-actions" style={{ marginTop: '0' }}>
                <button type="button" className="td-btn td-btn-secondary" onClick={() => setCreateExamModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="td-btn td-btn-primary">
                  Create Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
