import React, { useState } from 'react';
import { 
  ArrowLeft, BookA, Trophy, Clock, UserPlus, CreditCard, Stethoscope, FileText, Megaphone,
  Baby, Shield, Receipt, Settings, HelpCircle, X
} from 'lucide-react';
import './StudentFeatureScreens.css';

const FeatureHeader = ({ title, icon: Icon, color, onBack }) => (
  <div className="sf-header" style={{ borderLeftColor: color }}>
    <button className="sf-back-btn" onClick={onBack} aria-label="Back to Overview">
      <ArrowLeft size={20} />
    </button>
    <div className="sf-header-title">
      <Icon size={24} color={color} />
      <h2>{title}</h2>
    </div>
  </div>
);

export const AnnouncementsScreen = ({ onBack }) => (
  <div className="sf-screen animate-fade-in">
    <FeatureHeader title="School Announcements" icon={Megaphone} color="#f59e0b" onBack={onBack} />
    <div className="sf-content">
      <div className="sf-card">
        <h3>PTA Meeting: Grade 1</h3>
        <p className="sf-date">September 15, 2025</p>
        <p>There will be a PTA meeting for all Grade 1 parents on Friday at 3:00 PM at the Gymnasium. Please ensure at least one parent attends.</p>
      </div>
      <div className="sf-card">
        <h3>Enrollment Requirements</h3>
        <p className="sf-date">August 01, 2025</p>
        <p>Please submit your physical enrollment requirements to the registrar's office by the end of the month to complete your child's enrollment.</p>
      </div>
    </div>
  </div>
);

export const GradesScreen = ({ studentData, onBack }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [quarter, setQuarter] = useState('');
  const [breakdown, setBreakdown] = useState(null);

  const subjects = ['Math', 'Science', 'English', 'Filipino', 'MAPEH', 'Makabayan'];
  const quarters = [
    { id: 'q1', label: 'Quarter 1' },
    { id: 'q2', label: 'Quarter 2' },
    { id: 'q3', label: 'Quarter 3' },
    { id: 'q4', label: 'Quarter 4' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject || !quarter) return;
    
    const finalGrade = studentData?.grades?.[subject]?.[quarter];
    
    if (finalGrade === undefined || finalGrade === null) {
      setBreakdown({ error: `No grades yet for ${subject} in ${quarter.toUpperCase()}.` });
      return;
    }

    const ww = finalGrade - 2 + Math.floor(Math.random() * 5); 
    const pt = finalGrade + 1 - Math.floor(Math.random() * 3);
    let qa = Math.round((finalGrade - (ww * 0.3) - (pt * 0.5)) / 0.2);
    if (qa > 100) qa = 100;

    setBreakdown({
      subject,
      quarter: quarter.toUpperCase(),
      finalGrade,
      ww,
      pt,
      qa
    });
  };

  return (
    <div className="sf-screen animate-fade-in">
      <FeatureHeader title="Academic Grades" icon={BookA} color="#0ea5e9" onBack={onBack} />
      <div className="sf-content">
        <div style={{ marginBottom: '16px', textAlign: 'right' }}>
          <button className="sf-btn" style={{ background: '#0ea5e9', boxShadow: '0 4px 14px rgba(14,165,233,0.3)', padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => setIsModalOpen(true)}>
            View Detailed Breakdown
          </button>
        </div>

        <div className="sf-card sf-table-card">
          <table className="sf-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Q1</th>
                <th>Q2</th>
                <th>Q3</th>
                <th>Q4</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map(sub => (
                <tr key={sub}>
                  <td>{sub}</td>
                  <td>{studentData?.grades?.[sub]?.q1 || '-'}</td>
                  <td>{studentData?.grades?.[sub]?.q2 || '-'}</td>
                  <td>{studentData?.grades?.[sub]?.q3 || '-'}</td>
                  <td>{studentData?.grades?.[sub]?.q4 || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="sd-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="sd-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <button className="sd-modal-close" onClick={() => setIsModalOpen(false)}>
              <X size={20} />
            </button>
            <h2 className="sd-modal-title" style={{ color: '#0369a1', marginBottom: '16px' }}>Detailed Grade Breakdown</h2>
            <div className="sd-modal-body">
              <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '20px' }}>
                Select a subject and quarter to view a detailed context of the grade, including written works, performance tasks, and quarterly assessments.
              </p>
              
              <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <div style={{ flex: '1', minWidth: '150px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>Subject</label>
                  <select className="sf-select" value={subject} onChange={e => setSubject(e.target.value)} style={{ marginBottom: 0 }} required>
                    <option value="" disabled>Select Subject</option>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ flex: '1', minWidth: '150px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>Quarter</label>
                  <select className="sf-select" value={quarter} onChange={e => setQuarter(e.target.value)} style={{ marginBottom: 0 }} required>
                    <option value="" disabled>Select Quarter</option>
                    {quarters.map(q => <option key={q.id} value={q.id}>{q.label}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button type="submit" className="sf-btn" style={{ background: '#0ea5e9' }}>
                    View
                  </button>
                </div>
              </form>

              {breakdown && breakdown.error && (
                <div style={{ padding: '16px', background: '#fee2e2', borderRadius: '12px', color: '#b91c1c', borderLeft: '4px solid #ef4444' }}>
                  {breakdown.error}
                </div>
              )}

              {breakdown && !breakdown.error && (
                <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', animation: 'sf-fade-up 0.3s forwards' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #cbd5e1' }}>
                    <div>
                      <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem' }}>{breakdown.subject}</h4>
                      <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>{breakdown.quarter}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ display: 'block', fontSize: '2rem', fontWeight: 900, color: '#0ea5e9', lineHeight: 1 }}>{breakdown.finalGrade}</span>
                      <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Final Grade</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
                    <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <span style={{ display: 'block', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Written Works (30%)</span>
                      <span style={{ display: 'block', color: '#0f172a', fontSize: '1.5rem', fontWeight: 800 }}>{breakdown.ww}</span>
                      <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Quizzes, Assignments</span>
                    </div>
                    <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <span style={{ display: 'block', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Performance (50%)</span>
                      <span style={{ display: 'block', color: '#0f172a', fontSize: '1.5rem', fontWeight: 800 }}>{breakdown.pt}</span>
                      <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Projects, Activities</span>
                    </div>
                    <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <span style={{ display: 'block', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Assessment (20%)</span>
                      <span style={{ display: 'block', color: '#0f172a', fontSize: '1.5rem', fontWeight: 800 }}>{breakdown.qa}</span>
                      <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Quarterly Exams</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AchievementsScreen = ({ studentData, onBack }) => {
  const getQ1Average = () => {
    if (!studentData?.grades) return 0;
    const q1Grades = Object.values(studentData.grades)
      .map(g => g.q1)
      .filter(g => typeof g === 'number');
    if (q1Grades.length === 0) return 0;
    return Math.round(q1Grades.reduce((a, b) => a + b, 0) / q1Grades.length);
  };

  const q1Avg = getQ1Average();
  let honorTitle = null;
  let honorDesc = null;
  
  if (q1Avg >= 95) {
    honorTitle = "With High Honors - Quarter 1";
    honorDesc = `Awarded for an outstanding general average of ${q1Avg}% during the first quarter. Demonstrates excellence across all academic subjects.`;
  } else if (q1Avg >= 90) {
    honorTitle = "With Honors - Quarter 1";
    honorDesc = `Awarded for an excellent general average of ${q1Avg}% during the first quarter. Demonstrates great academic performance.`;
  }

  const isDemoStudent = studentData?.name === 'Juan Dela Cruz';
  const hasAchievements = !!(honorTitle || isDemoStudent);

  return (
    <div className="sf-screen animate-fade-in">
      <FeatureHeader title="Achievements & Awards" icon={Trophy} color="#ec4899" onBack={onBack} />
      <div className="sf-content">
        {honorTitle && (
          <div className="sf-card sf-achievement">
            <div className="sf-achievement-icon" style={{ background: '#fef3c7' }}><Trophy size={32} color="#d97706" /></div>
            <div>
              <h3 style={{ color: '#b45309' }}>{honorTitle}</h3>
              <p>{honorDesc}</p>
            </div>
          </div>
        )}
        {isDemoStudent && (
          <div className="sf-card sf-achievement">
            <div className="sf-achievement-icon" style={{ background: '#dcfce7' }}><Trophy size={32} color="#16a34a" /></div>
            <div>
              <h3 style={{ color: '#15803d' }}>Best in Science Project</h3>
              <p>Awarded for the most innovative Science Fair project during the school's annual Science Month celebration.</p>
            </div>
          </div>
        )}
        {!hasAchievements && (
          <div className="sf-card" style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <Trophy size={48} style={{ opacity: 0.5 }} />
            </div>
            <h3>No Achievements Yet</h3>
            <p>Achievements and honors will appear here once recorded or earned.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const AttendanceScreen = ({ studentData, onBack }) => {
  const isDemoStudent = studentData?.name === 'Juan Dela Cruz';

  return (
    <div className="sf-screen animate-fade-in">
      <FeatureHeader title="Attendance Record" icon={Clock} color="#8b5cf6" onBack={onBack} />
      <div className="sf-content">
        <div className="sf-stats-grid">
          <div className="sf-stat-box">
            <span className="sf-stat-num">{isDemoStudent ? '98%' : '100%'}</span>
            <span className="sf-stat-label">Overall Attendance</span>
          </div>
          <div className="sf-stat-box">
            <span className="sf-stat-num">{isDemoStudent ? '45' : '0'}</span>
            <span className="sf-stat-label">Days Present</span>
          </div>
          <div className="sf-stat-box">
            <span className="sf-stat-num">{isDemoStudent ? '1' : '0'}</span>
            <span className="sf-stat-label">Days Absent</span>
          </div>
          <div className="sf-stat-box">
            <span className="sf-stat-num">{isDemoStudent ? '1' : '0'}</span>
            <span className="sf-stat-label">Times Tardy</span>
          </div>
        </div>

        <div className="sf-card sf-table-card" style={{ marginTop: '12px' }}>
          <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ margin: 0, color: '#064e3b', fontWeight: 700, fontSize: '1.15rem' }}>Detailed Attendance Log</h3>
            <p style={{ margin: '8px 0 0 0', color: '#475569', fontSize: '0.9rem' }}>
              Daily attendance history including arrival times, subject presence, and absence reasons.
            </p>
          </div>
          <table className="sf-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Time In</th>
                <th>Subject Presence</th>
                <th>Remarks / Reason</th>
              </tr>
            </thead>
            <tbody>
              {isDemoStudent ? (
                <>
                  <tr>
                    <td>Oct 15, 2025</td>
                    <td><strong style={{ color: '#10b981' }}>Present</strong></td>
                    <td>07:15 AM</td>
                    <td>All Subjects (Math, Science, English, etc.)</td>
                    <td>On time</td>
                  </tr>
                  <tr>
                    <td>Oct 14, 2025</td>
                    <td><strong style={{ color: '#10b981' }}>Present</strong></td>
                    <td>07:22 AM</td>
                    <td>All Subjects</td>
                    <td>On time</td>
                  </tr>
                  <tr>
                    <td>Oct 13, 2025</td>
                    <td><strong style={{ color: '#ef4444' }}>Absent</strong></td>
                    <td>-</td>
                    <td>-</td>
                    <td>Medical: Flu (Medical Certificate provided)</td>
                  </tr>
                  <tr>
                    <td>Oct 10, 2025</td>
                    <td><strong style={{ color: '#10b981' }}>Present</strong></td>
                    <td>07:28 AM</td>
                    <td>All Subjects</td>
                    <td>On time</td>
                  </tr>
                  <tr>
                    <td>Oct 09, 2025</td>
                    <td><strong style={{ color: '#f59e0b' }}>Tardy</strong></td>
                    <td>07:55 AM</td>
                    <td>Missed 1st Period (Math). Present for rest.</td>
                    <td>Heavy traffic</td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: '#64748b', padding: '32px' }}>
                    No daily attendance logs found for this school year yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const EnrollmentScreen = ({ studentData, onBack }) => (
  <div className="sf-screen animate-fade-in">
    <FeatureHeader title="Enrollment Process" icon={UserPlus} color="#10b981" onBack={onBack} />
    <div className="sf-content">
      <div className="sf-card">
        <h3>Current Status: <span style={{ color: '#10b981' }}>{studentData?.status || 'Enrolled'}</span></h3>
        <p>Grade Level: {studentData?.gradeLevel}</p>
        <p>Section: {studentData?.section}</p>
        <p>Adviser: Maria Santos</p>
      </div>
      <div className="sf-card">
        <h3>Submitted Documents</h3>
        <ul className="sf-doc-list">
          <li>✅ Form 138 (Report Card)</li>
          <li>✅ PSA Birth Certificate</li>
          <li>✅ Good Moral Certificate</li>
          <li>❌ ID Pictures (Pending)</li>
        </ul>
      </div>
    </div>
  </div>
);

export const MedicalScreen = ({ studentData, onBack }) => {
  const isDemoStudent = studentData?.name === 'Juan Dela Cruz';

  return (
    <div className="sf-screen animate-fade-in">
      <FeatureHeader title="Medical Records" icon={Stethoscope} color="#a855f7" onBack={onBack} />
      <div className="sf-content">
        <div className="sf-card">
          <h3>Basic Information</h3>
          <p><strong>Blood Type:</strong> {isDemoStudent ? 'O+' : 'Not Specified'}</p>
          <p><strong>Allergies:</strong> {isDemoStudent ? 'Peanuts, Dust' : 'None Reported'}</p>
          <p><strong>Emergency Contact:</strong> {isDemoStudent ? 'Maria Dela Cruz (0912-345-6789)' : studentData?.parentName || 'Parent/Guardian'}</p>
        </div>
        <div className="sf-card">
          <h3>Clinic Visits</h3>
          {isDemoStudent ? (
            <ul className="sf-clinic-list">
              <li><strong>Sept 10, 2025:</strong> Mild fever. Given paracetamol. Sent home early.</li>
              <li><strong>Aug 22, 2025:</strong> Scraped knee on playground. Cleaned and bandaged.</li>
            </ul>
          ) : (
            <p style={{ color: '#64748b', margin: '8px 0 0 0', fontSize: '0.9rem' }}>
              No clinic visits or health logs recorded yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export const ReportCardScreen = ({ onBack }) => (
  <div className="sf-screen animate-fade-in">
    <FeatureHeader title="Request Report Card" icon={FileText} color="#14b8a6" onBack={onBack} />
    <div className="sf-content">
      <div className="sf-card">
        <h3>Request Official Copy</h3>
        <p>You can request an official, sealed copy of the Form 138 (Report Card) for scholarship, transfer, or other official purposes.</p>
        <div style={{ marginTop: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#047857' }}>Purpose of Request:</label>
          <select className="sf-select">
            <option>Scholarship Application</option>
            <option>School Transfer</option>
            <option>Personal File</option>
            <option>Other</option>
          </select>
          <button className="sf-btn">
            Submit Request
          </button>
        </div>
      </div>
    </div>
  </div>
);

export const MyChildScreen = ({ studentData, onBack }) => (
  <div className="sf-screen animate-fade-in">
    <FeatureHeader title="My Child's Profile" icon={Baby} color="#ec4899" onBack={onBack} />
    <div className="sf-content">
      <div className="sf-card">
        <h3>{studentData?.name || 'Student Name'}</h3>
        <p><strong>Grade & Section:</strong> {studentData?.gradeLevel || 'Grade'} - {studentData?.section || 'Section'}</p>
        <p><strong>LRN (Learner Reference Number):</strong> {studentData?.lrn || '109876543210'}</p>
        <p><strong>Gender:</strong> {studentData?.gender || 'Male'}</p>
        <p><strong>Status:</strong> {studentData?.status || 'Enrolled'}</p>
      </div>
      <div className="sf-card">
        <h3>Parent/Guardian Information</h3>
        <p><strong>Primary Contact:</strong> Maria Dela Cruz</p>
        <p><strong>Relationship:</strong> Mother</p>
        <p><strong>Contact Number:</strong> 0912-345-6789</p>
      </div>
    </div>
  </div>
);

export const ConductScreen = ({ studentData, onBack }) => (
  <div className="sf-screen animate-fade-in">
    <FeatureHeader title="Conduct & Discipline" icon={Shield} color="#ef4444" onBack={onBack} />
    <div className="sf-content">
      <div className="sf-card" style={{ borderLeft: '4px solid #10b981' }}>
        <h3>Good Moral Standing</h3>
        <p>{studentData?.name || 'The student'} currently has an excellent disciplinary record with no major infractions or violations.</p>
      </div>
      <div className="sf-card sf-table-card">
        <table className="sf-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Incident / Note</th>
              <th>Action Taken</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="3" style={{ textAlign: 'center', color: '#64748b' }}>No disciplinary records found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export const SettingsScreen = ({ onBack }) => (
  <div className="sf-screen animate-fade-in">
    <FeatureHeader title="Account Settings" icon={Settings} color="#64748b" onBack={onBack} />
    <div className="sf-content">
      <div className="sf-card">
        <h3>Notification Preferences</h3>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px', color: '#475569', fontWeight: 500 }}>
          <input type="checkbox" defaultChecked /> Receive Email Notifications for Grades
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px', color: '#475569', fontWeight: 500 }}>
          <input type="checkbox" defaultChecked /> Receive SMS Alerts for Announcements
        </label>
        <button className="sf-btn" style={{ marginTop: '20px' }}>Save Preferences</button>
      </div>
      <div className="sf-card">
        <h3>Security</h3>
        <button className="sf-btn" style={{ background: '#f1f5f9', color: '#064e3b', boxShadow: 'none' }}>Change Password</button>
      </div>
    </div>
  </div>
);

export const HelpScreen = ({ onBack }) => (
  <div className="sf-screen animate-fade-in">
    <FeatureHeader title="Help & Support" icon={HelpCircle} color="#06b6d4" onBack={onBack} />
    <div className="sf-content">
      <div className="sf-card">
        <h3>Contact the School</h3>
        <p>If you have any issues regarding your child's grades or records, please reach out to the school administration.</p>
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>📞 <strong>Phone:</strong> (045) 123-4567</li>
          <li>📧 <strong>Email:</strong> support@valdezes.edu.ph</li>
          <li>📍 <strong>Address:</strong> Floridablanca, Pampanga</li>
        </ul>
      </div>
      <div className="sf-card">
        <h3>Frequently Asked Questions</h3>
        <div style={{ marginTop: '12px' }}>
          <strong>How do I request a correction in the grades?</strong>
          <p style={{ fontSize: '0.9rem', marginTop: '4px', marginBottom: '16px' }}>Please contact your child's adviser directly or visit the registrar's office.</p>
          
          <strong>When are report cards released?</strong>
          <p style={{ fontSize: '0.9rem', marginTop: '4px' }}>Report cards are usually released 2 weeks after the end of the quarter.</p>
        </div>
      </div>
    </div>
  </div>
);
