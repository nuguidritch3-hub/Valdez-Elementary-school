import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, ComposedChart, LineChart, Line, Legend, LabelList
} from 'recharts';
import { mockData } from '../data/mockData';
import { 
  LayoutDashboard, Mail, Calendar, Users, GraduationCap, DollarSign, 
  ClipboardList, LogOut, Search, Settings, Bell, ChevronDown, MoreHorizontal,
  Award, Briefcase, ChevronLeft, ChevronRight, Check, UserCheck, X, UserPlus,
  Moon, Sun, BarChart2, TrendingUp, TrendingDown, AlertCircle, Lightbulb, Clock, Trash2, Edit,
  Menu, UserX, Download, Upload, Shield, Key
} from 'lucide-react';
import './AdminDashboard.css';
import { getApiUrl } from '../config';

const studentPerformanceData = [
  { name: 'Jul', grade0: 65, grade1: 75, grade2: 82, grade3: 70, grade4: 85, grade5: 78, grade6: 90 },
  { name: 'Aug', grade0: 70, grade1: 68, grade2: 85, grade3: 75, grade4: 88, grade5: 82, grade6: 85 },
  { name: 'Sep', grade0: 85, grade1: 75, grade2: 78, grade3: 82, grade4: 80, grade5: 85, grade6: 88 },
  { name: 'Oct', grade0: 72, grade1: 82, grade2: 88, grade3: 85, grade4: 75, grade5: 78, grade6: 82 },
  { name: 'Nov', grade0: 68, grade1: 85, grade2: 70, grade3: 78, grade4: 82, grade5: 90, grade6: 75 },
  { name: 'Dec', grade0: 78, grade1: 80, grade2: 75, grade3: 90, grade4: 85, grade5: 72, grade6: 80 },
];

const earningsData = [
  { name: 'Jan', earnings: 2000, expenses: 1000 },
  { name: 'Feb', earnings: 3000, expenses: 1500 },
  { name: 'Mar', earnings: 2500, expenses: 1200 },
  { name: 'Apr', earnings: 4000, expenses: 2500 },
  { name: 'May', earnings: 3500, expenses: 2000 },
  { name: 'Jun', earnings: 5000, expenses: 2800 },
  { name: 'Jul', earnings: 5785, expenses: 4020 },
  { name: 'Aug', earnings: 5500, expenses: 3800 },
  { name: 'Sep', earnings: 4800, expenses: 3500 },
  { name: 'Oct', earnings: 6000, expenses: 4200 },
  { name: 'Nov', earnings: 5200, expenses: 3900 },
  { name: 'Dec', earnings: 6500, expenses: 4500 },
];

const genderData = [
  { name: 'Boys', value: 560, color: '#1E3A8A' },
  { name: 'Girls', value: 685, color: '#FB7185' }
];

const attendanceData = [
  { name: 'Mon', present: 1144 },
  { name: 'Tue', present: 1043 },
  { name: 'Wed', present: 933 },
  { name: 'Thu', present: 1089 },
  { name: 'Fri', present: 1089 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-chart-tooltip">
        <p className="tooltip-label">{label}</p>
        <div className="tooltip-items">
          {payload.map((item, index) => {
            const val = item.value;
            let formattedVal = typeof val === 'number' ? val.toLocaleString() : val;
            
            if (typeof val === 'number') {
              const nameLower = (item.name || '').toLowerCase();
              const keyLower = (item.dataKey || '').toString().toLowerCase();
              if (
                nameLower.includes('rate') || 
                nameLower.includes('ratio') || 
                nameLower.includes('percent') ||
                nameLower.includes('grade') ||
                nameLower.includes('attendance') ||
                keyLower.includes('grade') ||
                keyLower.includes('avg') ||
                keyLower.includes('val')
              ) {
                if (val <= 100) {
                  formattedVal = `${val}%`;
                }
              }
            }
            
            return (
              <div key={index} className="tooltip-item">
                <span className="tooltip-dot" style={{ backgroundColor: item.color || item.fill }} />
                <span className="tooltip-name">{item.name || item.dataKey}:</span>
                <span className="tooltip-value" style={{ color: item.color || item.fill }}>{formattedVal}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

const AdminDashboard = ({ user, onLogout }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isChartReady, setIsChartReady] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState('All Grades');
  const [selectedSection, setSelectedSection] = useState('All Sections');
  const [selectedYear, setSelectedYear] = useState('S.Y. 2025-2026');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [studentCurrentPage, setStudentCurrentPage] = useState(1);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentStatusFilter, setStudentStatusFilter] = useState('All');
  const [deletedStudentIds, setDeletedStudentIds] = useState([]);
  const [deletedTeacherIds, setDeletedTeacherIds] = useState([]);
  const [studentStatusOverrides, setStudentStatusOverrides] = useState({});
  const [adminName, setAdminName] = useState(user?.name || 'SUZETTE D. PAGUIO');
  const [adminEmail, setAdminEmail] = useState('suzette@valdez.edu');
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    setStudentCurrentPage(1);
  }, [selectedGrade, selectedSection, selectedYear, studentSearchQuery, studentStatusFilter]);

  useEffect(() => {
    const handleNav = (e) => {
      if (e.detail && e.detail.tab) {
        const targetTab = e.detail.tab;
        const validTabs = ['Dashboard', 'Calendar', 'Teachers', 'Students', 'Analytics', 'Accounts'];
        const matched = validTabs.find(t => t.toLowerCase() === targetTab.toLowerCase());
        if (matched) {
          setActiveTab(matched);
        }
      }
    };
    window.addEventListener('app-navigate', handleNav);
    return () => window.removeEventListener('app-navigate', handleNav);
  }, []);
  const [addStudentForm, setAddStudentForm] = useState({
    firstName: '',
    lastName: '',
    gender: 'Male',
    gradeLevel: '',
    section: '',
    lrn: '',
    parentName: '',
    parentPhone: '',
    address: '',
  });
  const [addStudentLoading, setAddStudentLoading] = useState(false);
  const [addStudentSuccess, setAddStudentSuccess] = useState(false);
  const [addStudentError, setAddStudentError] = useState('');
  const [calendarView, setCalendarView] = useState('Month');
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState('May');
  const [calendarYear, setCalendarYear] = useState('2026');
  const [customEvents, setCustomEvents] = useState([
    { id: 1, title: 'Annual Sport Competition', day: 2, time: '09:00 AM', type: 'sports', description: 'School wide sports event.' },
    { id: 2, title: 'Parent-Teacher Meeting', day: 5, time: '02:00 PM', type: 'meeting', description: 'Monthly meeting.' },
    { id: 3, title: 'Science Fair Registration', day: 12, time: '10:00 AM', type: 'academic', description: 'Registration opens.' },
    { id: 4, title: 'Teacher\'s Training', day: 18, time: '02:00 PM', type: 'meeting', description: 'Mandatory training.' },
    { id: 5, title: 'Holiday', day: 25, time: 'All Day', type: 'holiday', description: 'Public Holiday.' },
    { id: 6, title: 'Annual Science Fair', day: 28, time: '09:00 AM', type: 'academic', description: 'Main event.' }
  ]);
  const [addEventForm, setAddEventForm] = useState({ title: '', date: '', time: '', type: 'academic', description: '' });
  const [addEventSuccess, setAddEventSuccess] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [customConfirm, setCustomConfirm] = useState({ show: false, title: '', message: '', onConfirm: null });
  const [customAlert, setCustomAlert] = useState({ show: false, title: '', message: '', type: 'success' });
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [addTeacherForm, setAddTeacherForm] = useState({
    firstName: '',
    lastName: '',
    subject: '',
    gradeLevel: '',
    section: '',
    type: 'Full-Time',
    phone: '',
    email: '',
  });
  const [addTeacherLoading, setAddTeacherLoading] = useState(false);
  const [addTeacherSuccess, setAddTeacherSuccess] = useState(false);
  const [addTeacherError, setAddTeacherError] = useState('');
  const [showCampusModal, setShowCampusModal] = useState(false);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [enrollmentModalYear, setEnrollmentModalYear] = useState('S.Y. 2025-2026');
  const [insightsFilter, setInsightsFilter] = useState('All');
  const [insightsSearch, setInsightsSearch] = useState('');

  // Classroom Size Modal State
  const [showClassroomSizeModal, setShowClassroomSizeModal] = useState(false);

  // Year Comparison Modal States
  const [showCompareYearModal, setShowCompareYearModal] = useState(false);
  const [compareSelectedYears, setCompareSelectedYears] = useState([]);
  const [compareYearMonthlyTab, setCompareYearMonthlyTab] = useState('');

  // Export/Import Modal State
  const [showExportImportModal, setShowExportImportModal] = useState(false);
  const [exportImportTab, setExportImportTab] = useState('export');
  const [exportYearSelect, setExportYearSelect] = useState('All');
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);

  // Edit Statistics States
  const [showEditStatsModal, setShowEditStatsModal] = useState(false);
  const [editStatsYear, setEditStatsYear] = useState('');
  const [editStatsForm, setEditStatsForm] = useState([]);
  const [editStatsTotalClassrooms, setEditStatsTotalClassrooms] = useState(15);
  const [editStatsTotalSeats, setEditStatsTotalSeats] = useState(461);
  const [editStatsLoading, setEditStatsLoading] = useState(false);

  // Edit Student Details States
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [editStudentForm, setEditStudentForm] = useState({});
  const [editStudentLoading, setEditStudentLoading] = useState(false);

  // Edit Teacher Details States
  const [isEditingTeacher, setIsEditingTeacher] = useState(false);
  const [editTeacherForm, setEditTeacherForm] = useState({});
  const [editTeacherLoading, setEditTeacherLoading] = useState(false);

  // Accounts Tab States
  const [accountSearch, setAccountSearch] = useState('');
  const [accountRoleFilter, setAccountRoleFilter] = useState('All');
  const [accountPage, setAccountPage] = useState(1);

  const [editingAccountId, setEditingAccountId] = useState(null);
  const [editAccountForm, setEditAccountForm] = useState({ username: '', password: '' });
  const [editAccountLoading, setEditAccountLoading] = useState(false);

  const [lastCreatedStudent, setLastCreatedStudent] = useState(null);

  // ─── Dashboard Widget States ───
  // To-Do List
  const [todoItems, setTodoItems] = useState([
    { id: 1, text: 'Review Teacher Attendance Records', date: 'May 11, 2026', completed: true },
    { id: 2, text: 'Prepare Science Fair Guidelines', date: 'May 13, 2026', completed: false },
    { id: 3, text: 'Update Library Book Inventory', date: 'May 14, 2026', completed: false },
  ]);
  const [newTodoText, setNewTodoText] = useState('');
  const [showTodoInput, setShowTodoInput] = useState(false);

  const toggleTodo = (id) => {
    setTodoItems(prev => prev.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const addTodo = () => {
    if (!newTodoText.trim()) return;
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    setTodoItems(prev => [...prev, {
      id: Date.now(),
      text: newTodoText.trim(),
      date: dateStr,
      completed: false,
    }]);
    setNewTodoText('');
    setShowTodoInput(false);
  };

  const removeTodo = (id) => {
    setTodoItems(prev => prev.filter(item => item.id !== id));
  };

  // Dashboard Mini Calendar Navigation
  const [dashCalMonth, setDashCalMonth] = useState(new Date().getMonth()); // 0-11
  const [dashCalYear, setDashCalYear] = useState(new Date().getFullYear());

  const dashCalPrev = () => {
    setDashCalMonth(prev => {
      if (prev === 0) { setDashCalYear(y => y - 1); return 11; }
      return prev - 1;
    });
  };
  const dashCalNext = () => {
    setDashCalMonth(prev => {
      if (prev === 11) { setDashCalYear(y => y + 1); return 0; }
      return prev + 1;
    });
  };

  const getDashCalDays = () => {
    const firstDay = new Date(dashCalYear, dashCalMonth, 1).getDay();
    const daysInMonth = new Date(dashCalYear, dashCalMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(dashCalYear, dashCalMonth, 0).getDate();
    const today = new Date();
    const isCurrentMonth = today.getMonth() === dashCalMonth && today.getFullYear() === dashCalYear;
    const todayDate = today.getDate();

    const days = [];
    // Previous month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, type: 'prev-month' });
    }
    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const hasEvent = customEvents.some(e => e.day === d);
      const isToday = isCurrentMonth && d === todayDate;
      days.push({ day: d, type: isToday ? 'active-cyan' : hasEvent ? 'active-pink' : '', isToday });
    }
    // Next month padding
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({ day: d, type: 'next-month' });
    }
    return days;
  };

  const calPrev = () => {
    const idx = MONTH_NAMES.indexOf(calendarMonth);
    if (idx === 0) {
      setCalendarMonth('December');
      setCalendarYear(y => String(parseInt(y, 10) - 1));
    } else {
      setCalendarMonth(MONTH_NAMES[idx - 1]);
    }
  };

  const calNext = () => {
    const idx = MONTH_NAMES.indexOf(calendarMonth);
    if (idx === 11) {
      setCalendarMonth('January');
      setCalendarYear(y => String(parseInt(y, 10) + 1));
    } else {
      setCalendarMonth(MONTH_NAMES[idx + 1]);
    }
  };

  const getCalendarDays = () => {
    const monthIndex = MONTH_NAMES.indexOf(calendarMonth);
    const year = parseInt(calendarYear, 10) || 2026;
    const firstDay = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, monthIndex, 0).getDate();
    const today = new Date();
    const isCurrentMonth = today.getMonth() === monthIndex && today.getFullYear() === year;
    const todayDate = today.getDate();

    const days = [];
    // Previous month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, type: 'prev-month' });
    }
    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const hasEvent = customEvents.some(e => e.day === d);
      const isToday = isCurrentMonth && d === todayDate;
      days.push({ day: d, type: isToday ? 'active-cyan' : hasEvent ? 'active-pink' : '', isToday, isCurrentMonth: true });
    }
    // Next month padding
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({ day: d, type: 'next-month' });
    }
    return days;
  };

  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Gender chart filter
  const [genderGradeFilter, setGenderGradeFilter] = useState('All Grades');

  // Activity Log (dynamic)
  const [activityLog, setActivityLog] = useState([
    { id: 1, icon: 'users', color: 'blue', text: 'System initialized — Admin dashboard loaded.', time: new Date().toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) },
  ]);

  const addActivity = (icon, color, text) => {
    const time = new Date().toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    setActivityLog(prev => [{ id: Date.now(), icon, color, text, time }, ...prev].slice(0, 20));
  };

  const handleEditSchoolYearStats = (year) => {
    const syData = data?.schoolYears?.[year] || {};
    const classroomsList = syData.classrooms || [];
    
    const order = ['Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];
    const sorted = [...classroomsList].sort((a, b) => {
      return order.indexOf(a.gradeLevel) - order.indexOf(b.gradeLevel);
    });

    setEditStatsYear(year);
    setEditStatsForm(sorted.map(c => ({
      gradeLevel: c.gradeLevel,
      enrollment: c.enrollment || 0,
      repeaters: c.repeaters || 0,
      dropouts: c.dropouts || 0,
      classrooms: c.classrooms || '',
      seats: c.seats || '',
      teachers: c.teachers || 0,
      section: c.section
    })));
    setEditStatsTotalClassrooms(syData.totalClassrooms || 15);
    setEditStatsTotalSeats(syData.totalSeats || 461);
    setShowEditStatsModal(true);
  };

  const handleSaveSchoolYearStats = async (e) => {
    e.preventDefault();
    setEditStatsLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/admin/school-year/update'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          year: editStatsYear,
          classrooms: editStatsForm,
          totalClassrooms: Number(editStatsTotalClassrooms),
          totalSeats: Number(editStatsTotalSeats)
        })
      });
      
      const result = await response.json();
      if (response.ok) {
        setCustomAlert({
          show: true,
          title: 'Success',
          message: result.message || 'School year statistics updated successfully.',
          type: 'success'
        });
        setShowEditStatsModal(false);
        fetchAdminData();
      } else {
        setCustomAlert({
          show: true,
          title: 'Update Failed',
          message: result.error || 'Failed to update statistics.',
          type: 'error'
        });
      }
    } catch (err) {
      console.error('Update school year statistics failed:', err);
      setCustomAlert({
        show: true,
        title: 'Error',
        message: 'A network error occurred while updating the statistics.',
        type: 'error'
      });
    } finally {
      setEditStatsLoading(false);
    }
  };

  const handleDeleteSchoolYearClick = (sy) => {
    setCustomConfirm({
      show: true,
      title: 'Delete School Year',
      message: `Are you sure you want to completely delete ${sy}? This will permanently remove all classrooms, teachers, seats, and census counts for this year from the system database.`,
      onConfirm: () => executeDeleteSchoolYear(sy)
    });
  };

  const executeDeleteSchoolYear = async (sy) => {
    try {
      const response = await fetch(getApiUrl(`/api/admin/school-year?year=${encodeURIComponent(sy)}`), {
        method: 'DELETE'
      });
      const result = await response.json();
      if (response.ok) {
        setCustomAlert({
          show: true,
          title: 'Success',
          message: result.message || 'School year deleted successfully.',
          type: 'success'
        });
        
        if (selectedYear === sy) {
          const remainingYears = globalYears.filter(y => y !== sy);
          if (remainingYears.length > 0) {
            setSelectedYear(remainingYears[0]);
          }
        }
        
        fetchAdminData();
      } else {
        setCustomAlert({
          show: true,
          title: 'Delete Failed',
          message: result.error || 'Failed to delete school year.',
          type: 'error'
        });
      }
    } catch (err) {
      console.error('Delete school year failed:', err);
      setCustomAlert({
        show: true,
        title: 'Error',
        message: 'A network error occurred while deleting the school year.',
        type: 'error'
      });
    }
  };

  const handleExportReportYear = async () => {
    try {
      const url = exportYearSelect === 'All'
        ? getApiUrl('/api/admin/export-report')
        : getApiUrl(`/api/admin/export-report?year=${encodeURIComponent(exportYearSelect)}`);
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = exportYearSelect === 'All'
        ? 'Valdez_ES_Report_2020-2027.xlsx'
        : `Valdez_ES_Report_${exportYearSelect.replace('S.Y. ', '').replace('-', '_')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Export failed:', err);
      setCustomAlert({ show: true, title: 'Export Failed', message: 'Failed to export report. Please try again.', type: 'error' });
    }
  };

  const handleImportYear = async (e) => {
    e.preventDefault();
    if (!importFile) {
      setCustomAlert({ show: true, title: 'Error', message: 'Please select a file to import.', type: 'error' });
      return;
    }

    setImportLoading(true);
    const formData = new FormData();
    formData.append('file', importFile);

    try {
      const response = await fetch(getApiUrl('/api/admin/import-year'), {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      if (response.ok) {
        setCustomAlert({
          show: true,
          title: 'Import Success',
          message: result.message || 'School year data imported successfully.',
          type: 'success'
        });
        setImportFile(null);
        setShowExportImportModal(false);
        fetchAdminData();
      } else {
        throw new Error(result.error || 'Failed to import school year data.');
      }
    } catch (err) {
      console.error('Import failed:', err);
      setCustomAlert({ show: true, title: 'Import Failed', message: err.message, type: 'error' });
    } finally {
      setImportLoading(false);
    }
  };

  // Keep backward-compat helpers
  const compareYearPrimary = compareSelectedYears[0] || '';
  const compareYearSecondary = compareSelectedYears[1] || '';

  const COMPARE_YEAR_COLORS = ['#3B82F6', '#8B5CF6', '#F97316', '#10B981', '#EF4444', '#EC4899', '#06B6D4', '#F59E0B'];
  const COMPARE_YEAR_GRADIENTS = [
    'url(#gradBlue)',
    'url(#gradPurple)',
    'url(#gradOrange)',
    'url(#gradGreen)',
    'url(#gradRose)',
    'url(#gradPink)',
    'url(#gradTeal)',
    'url(#gradAmber)'
  ];

  useEffect(() => {
    if (data?.schoolYears) {
      const sortedYears = Object.keys(data.schoolYears).sort().reverse();
      if (sortedYears.length > 0 && compareSelectedYears.length === 0) {
        const initial = sortedYears.slice(0, Math.min(2, sortedYears.length));
        setCompareSelectedYears(initial);
        setCompareYearMonthlyTab(initial[0]);
      }
    }
  }, [data]);

  const toggleCompareYear = (sy) => {
    setCompareSelectedYears(prev => {
      if (prev.includes(sy)) {
        if (prev.length <= 1) return prev; // keep at least 1
        const next = prev.filter(y => y !== sy);
        if (compareYearMonthlyTab === sy) setCompareYearMonthlyTab(next[0]);
        return next;
      }
      return [...prev, sy];
    });
  };

  const getShortYear = (syKey) => {
    if (!syKey) return '';
    const parts = syKey.split('-');
    if (parts.length > 1) {
      return parts[1].trim();
    }
    return syKey.replace('S.Y. ', '').trim();
  };

  const getYearlyContext = (syKey) => {
    const syData = data?.schoolYears?.[syKey] || {};
    const students = syData.totalStudents || 0;
    const teachers = syData.totalTeachers || 0;
    const repeaters = syData.totalRepeaters || 0;
    const dropouts = syData.totalDropouts || 0;
    
    return {
      drivers: `The student population stood at ${students} enrolled. Grade-level trends show that class sizes were managed across ${syData.classrooms?.length || 0} active sections with optimized intake.`,
      operations: `Active teaching staff comprised of ${teachers} professional educators, maintaining a healthy student-teacher ratio. Functional classrooms and learning areas were fully operational.`,
      efficiency: `We recorded ${repeaters} repeaters and ${dropouts} dropouts. Academic support and early intervention programs were directed towards student retention and performance.`
    };
  };

  const getMultiYearSummaryText = (years) => {
    if (!years || years.length < 2) return 'Select at least 2 years to see a multi-year summary.';
    const sorted = [...years].sort();
    const oldest = sorted[0];
    const newest = sorted[sorted.length - 1];
    const oldData = data?.schoolYears?.[oldest] || {};
    const newData = data?.schoolYears?.[newest] || {};
    const oldStudents = oldData.totalStudents || 0;
    const newStudents = newData.totalStudents || 0;
    const oldShort = getShortYear(oldest);
    const newShort = getShortYear(newest);
    const diff = newStudents - oldStudents;
    const yearNames = sorted.map(y => getShortYear(y)).join(', ');
    
    if (diff > 0) {
      return `Across ${years.length} years (${yearNames}), enrollment grew by +${diff} students from ${oldShort} to ${newShort}, indicating strong community interest and improved student retention.`;
    } else if (diff < 0) {
      return `Across ${years.length} years (${yearNames}), enrollment shifted by ${diff} students from ${oldShort} to ${newShort}. This allows the administration to focus on improving infrastructure and reducing student-to-teacher ratios.`;
    } else {
      return `Across ${years.length} years (${yearNames}), enrollment remained stable at ${newStudents} students, facilitating long-term resource planning and curriculum standardizations.`;
    }
  };

  const getYearExecutiveSummary = (syKey) => {
    const syData = data?.schoolYears?.[syKey] || {};
    const students = syData.totalStudents || 0;
    const dropouts = syData.totalDropouts || 0;
    const yearName = getShortYear(syKey);
    
    if (yearName === '2026') {
      return `"Overall, ${yearName} was a strong growth year with robust student academic performance. Our primary strategic focus into the next cycle should be aggressively managing teacher workload and classroom capacity constraints."`;
    } else if (yearName === '2025') {
      return `"${yearName} was a year of strategic alignment. We managed student retention effectively and upgraded physical facilities while investing heavily in upgrading our modular learning materials."`;
    } else {
      return `"For the ${yearName} academic year, Valdez Elementary focused on stabilizing educational frameworks. The student body reached ${students} and we kept dropouts down to ${dropouts}, aligning with our long-term learning goals."`;
    }
  };

  const getMonthlyBreakdownData = (syKey) => {
    const syData = data?.schoolYears?.[syKey] || {};
    const seed = syKey.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    
    const months = [
      { name: 'Jan', status: 'stable', desc: 'Post-holiday stabilization', issue: null, res: null },
      { name: 'Feb', status: 'growing', desc: 'Launch of Q1 projects', issue: 'Minor system lag', res: 'Server patch applied' },
      { name: 'Mar', status: 'growing', desc: 'School intramurals prep', issue: null, res: null },
      { name: 'Apr', status: 'crisis', desc: 'Mid-term exam stress', issue: 'High student anxiety', res: 'Counseling sessions scheduled' },
      { name: 'May', status: 'growing', desc: 'Year-end completion plans', issue: null, res: null },
      { name: 'Jun', status: 'growing', desc: 'Graduation ceremony and activities', issue: 'Venue logistics', res: 'Coordination with LGU' },
      { name: 'Jul', status: 'stable', desc: 'Off-peak enrollment season', issue: null, res: null },
      { name: 'Aug', status: 'crisis', desc: 'Typhoon season disruptions', issue: 'Flooding in barangay', res: 'Shift to modular learning' },
      { name: 'Sep', status: 'growing', desc: 'Beginning of school year kick-off', issue: null, res: null },
      { name: 'Oct', status: 'growing', desc: 'Expansion of remedial classes', issue: 'Remedial class slots full', res: 'Added volunteer tutors' },
      { name: 'Nov', status: 'growing', desc: 'Pre-holiday academic rush', issue: 'High teacher workload', res: 'Task delegation system' },
      { name: 'Dec', status: 'growing', desc: 'Holiday activities', issue: 'Low focus on classes', res: 'Interactive class projects' }
    ];

    return months.map((m, idx) => {
      const attendance = (92 + ((seed + idx) % 7) * 0.8).toFixed(1) + '%';
      const gradeAvg = (81 + ((seed * 2 + idx * 3) % 9) * 1.1).toFixed(1) + '%';
      
      return {
        ...m,
        attendance,
        gradeAvg
      };
    });
  };

  const getGradeComparisonChartData = (years) => {
    const grades = ['Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];
    
    return grades.map(grade => {
      const row = { name: grade };
      years.forEach(sy => {
        const syData = data?.schoolYears?.[sy] || {};
        const cls = syData.classrooms?.find(c => c.gradeLevel === grade) || {};
        row[sy] = cls.enrollment || 0;
      });
      return row;
    });
  };


  const [lastDataVersion, setLastDataVersion] = useState(null);

  useEffect(() => {
    fetchAdminData();

    // Poll for database.xlsx changes every 5 seconds
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(getApiUrl('/api/data-version'));
        if (res.ok) {
          const { version } = await res.json();
          setLastDataVersion(prev => {
            if (prev !== null && prev !== version) {
              console.log('[Live Sync] database.xlsx updated, refreshing dashboard...');
              fetchAdminData();
            }
            return version;
          });
        }
      } catch (e) { /* silent */ }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    setIsChartReady(false);
    const timer = setTimeout(() => {
      setIsChartReady(true);
    }, 350);
    return () => clearTimeout(timer);
  }, [activeTab, selectedGrade, selectedSection, selectedYear, selectedTeacher]);

  const fetchAdminData = async () => {
    try {
      const response = await fetch(getApiUrl('/api/admin/data'));
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch admin data', error);
    }
  };

  const executeDeleteStudent = async (student) => {
    const isMock = !student.isDb;
    if (isMock) {
      setDeletedStudentIds(prev => [...prev, student.studentId]);
      setSelectedStudent(null);
      return;
    }

    try {
      const res = await fetch(getApiUrl(`/api/admin/student/${student.studentId}`), {
        method: 'DELETE'
      });
      if (res.ok) {
        setCustomAlert({
          show: true,
          title: 'Success',
          message: 'Student deleted successfully.',
          type: 'success'
        });
        addActivity('trash', 'pink', `Student ${student.firstName} ${student.lastName} (${student.studentId}) was deleted.`);
        setSelectedStudent(null);
        fetchAdminData();
      } else {
        setCustomAlert({
          show: true,
          title: 'Error',
          message: 'Failed to delete student.',
          type: 'error'
        });
      }
    } catch (err) {
      console.error('Error deleting student:', err);
      setCustomAlert({
        show: true,
        title: 'Error',
        message: 'Failed to delete student.',
        type: 'error'
      });
    }
  };

  const handleDeleteStudent = (student) => {
    const isMock = !student.isDb;
    const confirmMsg = isMock 
      ? `Are you sure you want to remove mock student ${student.firstName} ${student.lastName}?`
      : `Are you sure you want to completely delete student ${student.firstName} ${student.lastName} (ID: ${student.studentId})? This will delete them from the database and remove their login account.`;
      
    setCustomConfirm({
      show: true,
      title: 'Delete Student',
      message: confirmMsg,
      onConfirm: () => executeDeleteStudent(student)
    });
  };

  const executeToggleStudentStatus = async (student) => {
    const isMock = !student.isDb;
    const currentStatus = student.status || 'Active';
    const newStatus = (currentStatus === 'Dropped') ? 'Enrolled' : 'Dropped';

    if (isMock) {
      setStudentStatusOverrides(prev => ({
        ...prev,
        [student.studentId]: newStatus
      }));
      setSelectedStudent(prev => prev ? { ...prev, status: newStatus } : null);
      setCustomAlert({
        show: true,
        title: 'Success',
        message: `Mock student status changed to ${newStatus}.`,
        type: 'success'
      });
      return;
    }

    try {
      const res = await fetch(getApiUrl('/api/admin/student/status'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId: student.studentId,
          status: newStatus
        })
      });
      if (res.ok) {
        setCustomAlert({
          show: true,
          title: 'Success',
          message: `Student status updated to ${newStatus}.`,
          type: 'success'
        });
        addActivity('alert', 'blue', `Student ${student.firstName} ${student.lastName} status changed to ${newStatus}.`);
        setSelectedStudent(prev => prev ? { ...prev, status: newStatus } : null);
        fetchAdminData();
      } else {
        setCustomAlert({
          show: true,
          title: 'Error',
          message: 'Failed to update student status.',
          type: 'error'
        });
      }
    } catch (err) {
      console.error('Error updating student status:', err);
      setCustomAlert({
        show: true,
        title: 'Error',
        message: 'Failed to update student status.',
        type: 'error'
      });
    }
  };

  const executeDeleteTeacher = async (teacher) => {
    const isMock = !teacher.isDb;
    if (isMock) {
      setDeletedTeacherIds(prev => [...prev, teacher.id]);
      setSelectedTeacher(null);
      return;
    }

    try {
      const res = await fetch(getApiUrl(`/api/admin/teacher/${teacher.id}`), {
        method: 'DELETE'
      });
      if (res.ok) {
        setCustomAlert({
          show: true,
          title: 'Success',
          message: 'Teacher deleted successfully.',
          type: 'success'
        });
        addActivity('trash', 'pink', `Teacher ${teacher.name} (${teacher.id}) was deleted.`);
        setSelectedTeacher(null);
        fetchAdminData();
      } else {
        setCustomAlert({
          show: true,
          title: 'Error',
          message: 'Failed to delete teacher.',
          type: 'error'
        });
      }
    } catch (err) {
      console.error('Error deleting teacher:', err);
      setCustomAlert({
        show: true,
        title: 'Error',
        message: 'Failed to delete teacher.',
        type: 'error'
      });
    }
  };

  const handleDeleteTeacher = (teacher) => {
    const isMock = !teacher.isDb;
    const confirmMsg = isMock 
      ? `Are you sure you want to remove mock teacher ${teacher.name}?`
      : `Are you sure you want to completely delete teacher ${teacher.name} (ID: ${teacher.id})? This will delete them from the database and remove their login account.`;

    setCustomConfirm({
      show: true,
      title: 'Delete Teacher',
      message: confirmMsg,
      onConfirm: () => executeDeleteTeacher(teacher)
    });
  };

  // ─── Edit Student Details ───
  const handleEditStudent = (student) => {
    setEditStudentForm({
      name: `${student.firstName} ${student.lastName}`.trim(),
      gender: student.gender || 'Male',
      gradeLevel: student.gradeLevel || '',
      section: student.section || '',
      parentName: student.parentName || '',
      parentPhone: student.parentPhone || '',
      address: student.address || '',
      lrn: student.lrn || '',
    });
    setIsEditingStudent(true);
  };

  const handleSaveStudent = async () => {
    if (!selectedStudent) return;
    const isMock = !selectedStudent.isDb;
    if (isMock) {
      setCustomAlert({ show: true, title: 'Info', message: 'Mock students cannot be edited permanently.', type: 'warning' });
      setIsEditingStudent(false);
      return;
    }

    setEditStudentLoading(true);
    try {
      const res = await fetch(getApiUrl(`/api/admin/student/${selectedStudent.studentId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editStudentForm)
      });
      if (res.ok) {
        const result = await res.json();
        setCustomAlert({ show: true, title: 'Success', message: 'Student details updated successfully.', type: 'success' });
        addActivity('edit', 'blue', `Student ${editStudentForm.name} details updated.`);
        setIsEditingStudent(false);
        // Update selected student in place
        const nameParts = (editStudentForm.name || '').split(' ');
        setSelectedStudent(prev => ({
          ...prev,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          gender: editStudentForm.gender,
          gradeLevel: editStudentForm.gradeLevel,
          section: editStudentForm.section,
          parentName: editStudentForm.parentName,
          parentPhone: editStudentForm.parentPhone,
          address: editStudentForm.address,
          lrn: editStudentForm.lrn,
        }));
        fetchAdminData();
      } else {
        setCustomAlert({ show: true, title: 'Error', message: 'Failed to update student details.', type: 'error' });
      }
    } catch (err) {
      console.error('Error updating student:', err);
      setCustomAlert({ show: true, title: 'Error', message: 'Network error updating student.', type: 'error' });
    } finally {
      setEditStudentLoading(false);
    }
  };

  // ─── Edit Teacher Details ───
  const handleEditTeacher = (teacher) => {
    setEditTeacherForm({
      name: teacher.name || '',
      subject: teacher.subject || '',
      gradeLevel: teacher.gradeLevel || '',
      section: teacher.section || '',
      phone: teacher.phone || '',
      email: teacher.email || '',
      address: teacher.address || '',
      type: teacher.type || 'Full-Time',
    });
    setIsEditingTeacher(true);
  };

  const handleSaveTeacher = async () => {
    if (!selectedTeacher) return;
    const isMock = !selectedTeacher.isDb;
    if (isMock) {
      setCustomAlert({ show: true, title: 'Info', message: 'Mock teachers cannot be edited permanently.', type: 'warning' });
      setIsEditingTeacher(false);
      return;
    }

    setEditTeacherLoading(true);
    try {
      const res = await fetch(getApiUrl(`/api/admin/teacher/${selectedTeacher.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editTeacherForm)
      });
      if (res.ok) {
        setCustomAlert({ show: true, title: 'Success', message: 'Teacher details updated successfully.', type: 'success' });
        addActivity('edit', 'blue', `Teacher ${editTeacherForm.name} details updated.`);
        setIsEditingTeacher(false);
        setSelectedTeacher(prev => ({
          ...prev,
          name: editTeacherForm.name,
          subject: editTeacherForm.subject,
          gradeLevel: editTeacherForm.gradeLevel,
          section: editTeacherForm.section,
          phone: editTeacherForm.phone,
          email: editTeacherForm.email,
          address: editTeacherForm.address,
          type: editTeacherForm.type,
        }));
        fetchAdminData();
      } else {
        setCustomAlert({ show: true, title: 'Error', message: 'Failed to update teacher details.', type: 'error' });
      }
    } catch (err) {
      console.error('Error updating teacher:', err);
      setCustomAlert({ show: true, title: 'Error', message: 'Network error updating teacher.', type: 'error' });
    } finally {
      setEditTeacherLoading(false);
    }
  };

  const handleSaveAccountCredentials = async (accountId) => {
    if (!editAccountForm.username || editAccountForm.username.trim() === '') {
      setCustomAlert({ show: true, title: 'Error', message: 'Username cannot be empty.', type: 'error' });
      return;
    }
    setEditAccountLoading(true);
    try {
      const res = await fetch(getApiUrl(`/api/admin/user/${accountId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: editAccountForm.username,
          password: editAccountForm.password || undefined // only update password if provided
        })
      });
      if (res.ok) {
        setCustomAlert({ show: true, title: 'Success', message: 'Account credentials updated successfully.', type: 'success' });
        setEditingAccountId(null);
        setEditAccountForm({ username: '', password: '' });
        fetchAdminData();
      } else {
        const errorData = await res.json();
        setCustomAlert({ show: true, title: 'Error', message: errorData.error || 'Failed to update credentials.', type: 'error' });
      }
    } catch (err) {
      console.error('Error updating account credentials:', err);
      setCustomAlert({ show: true, title: 'Error', message: 'Network error updating credentials.', type: 'error' });
    } finally {
      setEditAccountLoading(false);
    }
  };

  const globalYears = data?.schoolYears ? Object.keys(data.schoolYears).sort().reverse() : ['S.Y. 2025-2026'];

  // Get data for the selected school year
  const currentYearData = data?.schoolYears?.[selectedYear] || null;
  const globalClassrooms = currentYearData?.classrooms || data?.classrooms || mockData.classrooms || [];

  // Filter classrooms by selected grade and section
  const filteredClassrooms = globalClassrooms.filter(c => {
    const gradeMatch = selectedGrade === 'All Grades' || c.gradeLevel === selectedGrade;
    const sectionMatch = selectedSection === 'All Sections' || c.section === selectedSection;
    return gradeMatch && sectionMatch;
  });

  // --- Dynamic Data Calculations (driven by selectedYear + selectedGrade) ---
  const totalStudents = selectedGrade === 'All Grades'
    ? (currentYearData?.totalStudents || data?.schoolData?.totalStudents || 502)
    : filteredClassrooms.reduce((sum, c) => sum + (c.enrollment || c.bosyEnrollment || 0), 0);

  const activeTeachers = selectedGrade === 'All Grades'
    ? (currentYearData?.totalTeachers || data?.schoolData?.activeTeachers || 15)
    : filteredClassrooms.reduce((sum, c) => sum + (c.teachers || 0), 0);

  const totalRepeaters = selectedGrade === 'All Grades'
    ? (currentYearData?.totalRepeaters || 3)
    : filteredClassrooms.reduce((sum, c) => sum + (c.repeaters || 0), 0);

  const totalDropouts = selectedGrade === 'All Grades'
    ? (currentYearData?.totalDropouts || 5)
    : filteredClassrooms.reduce((sum, c) => sum + (c.dropouts || 0), 0);

  const supportStaff = data?.users?.filter(u => u.role !== 'Teacher' && u.role !== 'Student').length || 34;
  const totalAwards = 152;

  // Dynamic Retention Rate (100% - dropout%)
  const retentionRate = totalStudents > 0 
    ? (((totalStudents - totalDropouts) / totalStudents) * 100).toFixed(1)
    : '98.5';

  // Teacher year-over-year trend
  const teacherTrendPercent = (() => {
    if (!data?.schoolYears) return '-1.2';
    const years = Object.keys(data.schoolYears).sort();
    if (years.length < 2) return '0.0';
    const currIdx = years.indexOf(selectedYear);
    const prevIdx = currIdx > 0 ? currIdx - 1 : (years.length >= 2 ? years.length - 2 : -1);
    if (prevIdx < 0 || prevIdx === currIdx) return '0.0';
    const prevTeachers = data.schoolYears[years[prevIdx]]?.totalTeachers || activeTeachers;
    if (prevTeachers === 0) return '0.0';
    return (((activeTeachers - prevTeachers) / prevTeachers) * 100).toFixed(1);
  })();

  // Campus Operations from DB
  const campusTotalRooms = currentYearData?.totalClassrooms || data?.schoolData?.totalClassrooms || 42;
  const campusActiveRooms = Math.max(1, campusTotalRooms - Math.floor(campusTotalRooms * 0.1));
  const campusTotalSeats = currentYearData?.totalSeats || data?.schoolData?.totalSeats || 461;

  const schoolInsights = useMemo(() => {
    const insights = [];
    let idCounter = 1;

    const currentYearClassrooms = currentYearData?.classrooms || data?.classrooms || [];
    const allDbStudents = data?.students || [];

    // --- 1. OVERALL ENROLLMENT TREND ---
    if (data?.schoolYears) {
      const years = Object.keys(data.schoolYears).sort();
      const currIdx = years.indexOf(selectedYear);
      if (currIdx > 0) {
        const prevYear = years[currIdx - 1];
        const currentYearStudents = data.schoolYears[selectedYear]?.totalStudents || 0;
        const prevYearStudents = data.schoolYears[prevYear]?.totalStudents || 0;
        if (prevYearStudents > 0) {
          const diff = currentYearStudents - prevYearStudents;
          const pct = ((diff / prevYearStudents) * 100).toFixed(1);
          if (diff > 0) {
            insights.push({
              id: idCounter++,
              type: 'success',
              section: 'School-Wide',
              title: 'Strong Enrollment Growth',
              description: `Enrollment for ${selectedYear} increased by +${pct}% (+${diff} students) compared to the previous year (${prevYear}). Great work on student retention!`,
              time: 'Today',
              impact: 'MEDIUM'
            });
          } else if (diff < 0) {
            insights.push({
              id: idCounter++,
              type: 'warning',
              section: 'School-Wide',
              title: 'Enrollment Decline',
              description: `Enrollment for ${selectedYear} dropped by ${pct}% (${diff} students) compared to ${prevYear}. Demographics or retention strategies should be reviewed.`,
              time: 'Today',
              impact: 'HIGH'
            });
          }
        }
      }
    }

    // --- 2. DROPOUTS ALERTS ---
    const censusDropouts = currentYearData?.totalDropouts || 0;
    const activeGradeStudents = allDbStudents.filter(st => {
      return selectedGrade === 'All Grades' || st.gradeLevel === selectedGrade;
    });
    const databaseDropouts = activeGradeStudents.filter(st => st.status === 'Dropped').length;

    if (censusDropouts > 0 || databaseDropouts > 0) {
      const dropoutCount = Math.max(censusDropouts, databaseDropouts);
      insights.push({
        id: idCounter++,
        type: 'warning',
        section: selectedGrade === 'All Grades' ? 'School-Wide' : selectedGrade,
        title: 'Elevated Dropout Risk',
        description: `Currently, ${dropoutCount} student(s) are recorded as dropped out in ${selectedGrade === 'All Grades' ? selectedYear : selectedGrade}. Dropout prevention is critical; early parent outreach and attendance monitoring are recommended.`,
        time: 'Today',
        impact: 'HIGH'
      });
    } else {
      insights.push({
        id: idCounter++,
        type: 'success',
        section: 'School-Wide',
        title: 'Zero Dropouts Maintained',
        description: 'Outstanding dropout prevention! The school maintains a 0% dropout rate for this selection.',
        time: 'This Week',
        impact: 'MEDIUM'
      });
    }

    // Classroom-specific dropouts
    currentYearClassrooms.forEach(room => {
      const gMatch = selectedGrade === 'All Grades' || room.gradeLevel === selectedGrade;
      const sMatch = selectedSection === 'All Sections' || room.section === selectedSection;
      if (gMatch && sMatch && room.dropouts > 0) {
        insights.push({
          id: idCounter++,
          type: 'warning',
          section: `${room.gradeLevel} - ${room.section}`,
          title: 'Classroom Dropout Alert',
          description: `Section ${room.section} has recorded ${room.dropouts} dropout(s). Immediate counselor home visits and family support are suggested.`,
          time: 'Yesterday',
          impact: 'HIGH'
        });
      }
    });

    // --- 3. REPEATERS INTERVENTION ---
    const censusRepeaters = currentYearData?.totalRepeaters || 0;
    if (censusRepeaters > 0) {
      insights.push({
        id: idCounter++,
        type: 'idea',
        section: 'School-Wide',
        title: 'Remediation Program Suggestion',
        description: `With ${censusRepeaters} repeaters registered, launching a standardized after-school peer-mentoring and tutor network could reduce achievement gaps.`,
        time: 'Yesterday',
        impact: 'MEDIUM'
      });
    }

    currentYearClassrooms.forEach(room => {
      const gMatch = selectedGrade === 'All Grades' || room.gradeLevel === selectedGrade;
      const sMatch = selectedSection === 'All Sections' || room.section === selectedSection;
      if (gMatch && sMatch && room.repeaters > 0) {
        insights.push({
          id: idCounter++,
          type: 'idea',
          section: `${room.gradeLevel} - ${room.section}`,
          title: 'Targeted Remediation Required',
          description: `${room.gradeLevel} (${room.section}) has ${room.repeaters} repeating student(s). Implement weekly diagnostic quizzes and learning aids.`,
          time: '2 Days Ago',
          impact: 'MEDIUM'
        });
      }
    });

    // --- 4. CLASSROOM CAPACITY & RATIOS (OVERCROWDING & SEATS) ---
    currentYearClassrooms.forEach(room => {
      const gMatch = selectedGrade === 'All Grades' || room.gradeLevel === selectedGrade;
      const sMatch = selectedSection === 'All Sections' || room.section === selectedSection;
      if (gMatch && sMatch) {
        const enrollment = room.enrollment || 0;
        const seatsVal = parseInt(room.seats) || 0;

        if (enrollment > 40) {
          insights.push({
            id: idCounter++,
            type: 'warning',
            section: `${room.gradeLevel} - ${room.section}`,
            title: 'Overcrowded Classroom',
            description: `Section ${room.section} contains ${enrollment} students, exceeding DepEd's standard of 40. Consider opening a new section to improve instruction.`,
            time: 'Today',
            impact: 'HIGH'
          });
        }

        if (seatsVal > 0 && enrollment > seatsVal) {
          insights.push({
            id: idCounter++,
            type: 'warning',
            section: `${room.gradeLevel} - ${room.section}`,
            title: 'Seat Capacity Exceeded',
            description: `${room.gradeLevel} section has ${enrollment} students but only ${seatsVal} available desks/seats. Procuring ${enrollment - seatsVal} additional seats is urgent.`,
            time: 'Today',
            impact: 'HIGH'
          });
        } else if (seatsVal > 0 && enrollment >= seatsVal * 0.9) {
          insights.push({
            id: idCounter++,
            type: 'idea',
            section: `${room.gradeLevel} - ${room.section}`,
            title: 'High Seating Utilization',
            description: `${room.gradeLevel} (${room.section}) is utilizing ${(enrollment / seatsVal * 100).toFixed(0)}% of its seating capacity (${enrollment}/${seatsVal}). Seating arrangement is tight.`,
            time: 'Yesterday',
            impact: 'LOW'
          });
        } else if (seatsVal > 0 && enrollment > 0 && enrollment < seatsVal * 0.5) {
          insights.push({
            id: idCounter++,
            type: 'success',
            section: `${room.gradeLevel} - ${room.section}`,
            title: 'Comfortable Spacing',
            description: `Spacious environment in ${room.section} with seating utilization under 50% (${enrollment}/${seatsVal} seats filled). Ideal for interactive learning.`,
            time: 'Yesterday',
            impact: 'LOW'
          });
        }

        if (enrollment > 0 && enrollment < 20) {
          insights.push({
            id: idCounter++,
            type: 'idea',
            section: `${room.gradeLevel} - ${room.section}`,
            title: 'Resource Optimization Opportunity',
            description: `Only ${enrollment} students enrolled in ${room.gradeLevel} - ${room.section}. Consolidation or teacher reallocation may optimize operation.`,
            time: 'Today',
            impact: 'MEDIUM'
          });
        }

        if (!room.teachers || room.teachers === 0) {
          insights.push({
            id: idCounter++,
            type: 'warning',
            section: `${room.gradeLevel} - ${room.section}`,
            title: 'Unassigned Classroom Adviser',
            description: `No adviser has been assigned to ${room.gradeLevel} - ${room.section}. Assign a teacher immediately to handle classes.`,
            time: 'Today',
            impact: 'HIGH'
          });
        }
      }
    });

    // --- 5. ACADEMIC FAILING & HIGH PERFORMANCE ALERTS ---
    const failingStudents = [];
    const subjectFails = {};
    const sectionAverages = {};
    const sectionCounts = {};

    allDbStudents.forEach(st => {
      const gMatch = selectedGrade === 'All Grades' || st.gradeLevel === selectedGrade;
      const sMatch = selectedSection === 'All Sections' || st.section === selectedSection;
      if (!gMatch || !sMatch) return;

      let hasFail = false;
      let totalGradeSum = 0;
      let totalGradeCount = 0;

      if (st.grades) {
        Object.entries(st.grades).forEach(([subj, qGrades]) => {
          if (qGrades) {
            Object.values(qGrades).forEach(score => {
              if (score !== null && score !== undefined && score !== '') {
                const numScore = Number(score);
                if (numScore > 0) {
                  totalGradeSum += numScore;
                  totalGradeCount++;
                  if (numScore < 75) {
                    hasFail = true;
                    subjectFails[subj] = (subjectFails[subj] || 0) + 1;
                  }
                }
              }
            });
          }
        });
      }

      if (hasFail) {
        failingStudents.push(st.name || `${st.firstName} ${st.lastName}`);
      }

      if (totalGradeCount > 0) {
        const studentAvg = totalGradeSum / totalGradeCount;
        const classKey = `${st.gradeLevel} - ${st.section}`;
        sectionAverages[classKey] = (sectionAverages[classKey] || 0) + studentAvg;
        sectionCounts[classKey] = (sectionCounts[classKey] || 0) + 1;
      }
    });

    if (failingStudents.length > 0) {
      const topFailedSubject = Object.entries(subjectFails).sort((a, b) => b[1] - a[1])[0]?.[0];
      const subjectText = topFailedSubject ? `, particularly in ${topFailedSubject}` : '';
      insights.push({
        id: idCounter++,
        type: 'warning',
        section: selectedGrade === 'All Grades' ? 'School-Wide' : selectedGrade,
        title: 'Academic Intervention Required',
        description: `${failingStudents.length} student(s) scored below the passing mark of 75 in quarterly grades${subjectText}. Launch remedial reading and math programs immediately.`,
        time: 'Today',
        impact: 'HIGH'
      });
    }

    Object.entries(sectionCounts).forEach(([classKey, count]) => {
      if (count > 0) {
        const avg = sectionAverages[classKey] / count;
        if (avg >= 85) {
          insights.push({
            id: idCounter++,
            type: 'success',
            section: classKey,
            title: 'Outstanding Academic Performance',
            description: `${classKey} has achieved a high average grade of ${avg.toFixed(1)}% across quarterly tracking database. Excellent instructional results!`,
            time: 'Yesterday',
            impact: 'HIGH'
          });
        }
      }
    });

    if (insights.length < 3) {
      insights.push({
        id: idCounter++,
        type: 'success',
        section: 'School-Wide',
        title: 'Compliance Audit Passed',
        description: "School passed the DepEd compliance and curriculum quality review with flying colors (98/100). All documents are current.",
        time: '1 Week Ago',
        impact: 'LOW'
      });
      insights.push({
        id: idCounter++,
        type: 'idea',
        section: 'School-Wide',
        title: 'Standardize Assessment Tools',
        description: 'Suggest rolling out standard assessment rubrics across sections to minimize grading variance in local gradesheet views.',
        time: 'Today',
        impact: 'MEDIUM'
      });
      insights.push({
        id: idCounter++,
        type: 'idea',
        section: 'School-Wide',
        title: 'Digital Learning Opportunity',
        description: 'Local technology partners expressed interest in donating digital learning tablets. Coordinate with the division office to finalize guidelines.',
        time: 'Today',
        impact: 'MEDIUM'
      });
    }

    return insights;
  }, [data, selectedYear, selectedGrade, selectedSection]);

  const filteredInsights = schoolInsights.filter(i => {
    const typeMatch = insightsFilter === 'All' || i.type === insightsFilter.toLowerCase();
    const searchMatch = insightsSearch === '' || i.title.toLowerCase().includes(insightsSearch.toLowerCase()) || i.section.toLowerCase().includes(insightsSearch.toLowerCase()) || i.description.toLowerCase().includes(insightsSearch.toLowerCase());
    return typeMatch && searchMatch;
  });

  const insightCounts = {
    total: schoolInsights.length,
    warnings: schoolInsights.filter(i => i.type === 'warning').length,
    successes: schoolInsights.filter(i => i.type === 'success').length,
    ideas: schoolInsights.filter(i => i.type === 'idea').length,
  };

  const dynamicGenderData = (gradeFilter) => {
    const filterGrade = gradeFilter || 'All Grades';
    let total;
    if (filterGrade === 'All Grades') {
      total = totalStudents || 502;
    } else {
      total = filteredClassrooms
        .filter(c => c.gradeLevel === filterGrade)
        .reduce((sum, c) => sum + (c.enrollment || c.bosyEnrollment || 0), 0) || 50;
    }
    // Use a seed from filterGrade to vary the ratio slightly per grade
    const seed = filterGrade.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const ratio = 0.42 + ((seed % 16) / 100); // varies ~42-58%
    const boys = Math.round(total * ratio);
    const girls = total - boys;
    
    return [
      { name: 'Boys', value: boys, color: '#3B82F6' },
      { name: 'Girls', value: girls, color: '#EC4899' }
    ];
  };
  const computedGender = dynamicGenderData(selectedGrade);
  const computedGenderFiltered = dynamicGenderData(genderGradeFilter);
  const genderFilteredTotal = computedGenderFiltered.reduce((s, g) => s + g.value, 0);

  const dynamicNotices = () => {
    if (!data?.announcements || data.announcements.length === 0) return null;
    return data.announcements.map((ann, idx) => {
      const icons = ['🔬', '👩‍🏫', '📚', '🚌', '📢'];
      return {
        id: ann.id || idx,
        title: ann.title,
        content: ann.content,
        audience: ann.target || ann.audience || 'All',
        date: new Date(ann.date || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        creator: 'Admin',
        icon: icons[idx % icons.length],
        colorClass: ['cyan', 'pink', 'blue'][idx % 3]
      };
    });
  };
  const computedNotices = dynamicNotices();

  const dynamicPerformance = () => {
    const rawLabels = globalClassrooms.length > 0 
      ? globalClassrooms.map(g => g.gradeLevel)
      : ['Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];

    const labels = selectedGrade === 'All Grades' 
      ? rawLabels 
      : rawLabels.filter(l => l === selectedGrade);

    // Generate dynamic mock data based on year and grade to make the graph "move"
    const seed = (selectedYear.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) + 
                 (selectedGrade.split('').reduce((a, b) => a + b.charCodeAt(0), 0));
    
    const dynamicData = studentPerformanceData.map((item, idx) => {
      const newItem = { ...item };
      rawLabels.forEach((_, i) => {
        // Create a semi-random but stable variation for each year/grade combination
        const variation = ((seed + idx * 13 + i * 7) % 20) - 10;
        const key = `grade${i}`;
        const baseValue = item[key] || (75 + (i * 2));
        newItem[key] = Math.min(98, Math.max(65, baseValue + variation));
      });
      return newItem;
    });

    const colorPalette = ['#06B6D4', '#F43F5E', '#3B82F6', '#EC4899', '#F97316', '#8B5CF6', '#F59E0B'];
    const gradientPalette = ['url(#gradTeal)', 'url(#gradRose)', 'url(#gradBlue)', 'url(#gradPink)', 'url(#gradOrange)', 'url(#gradPurple)', 'url(#gradAmber)'];

    return { 
      data: dynamicData, 
      grades: labels.map(l => `grade${rawLabels.indexOf(l)}`), 
      labels: labels,
      colors: labels.map(l => colorPalette[rawLabels.indexOf(l) % colorPalette.length]),
      gradients: labels.map(l => gradientPalette[rawLabels.indexOf(l) % gradientPalette.length])
    };
  };
  const computedPerf = dynamicPerformance();

  // Build enrollment trends from all school years
  const enrollmentTrendsFromDb = () => {
    if (!data?.schoolYears) return [
      { year: '2021-22', value: 484 }, { year: '2022-23', value: 472 },
      { year: '2023-24', value: 500 }, { year: '2024-25', value: 489 }, { year: '2025-26', value: 502 }
    ];
    return Object.keys(data.schoolYears).sort().map(sy => {
      const syData = data.schoolYears[sy];
      const shortYear = sy.replace('S.Y. ', '').replace(/20(\d{2})-20(\d{2})/, '$1-$2');
      let value;
      if (selectedGrade === 'All Grades') {
        value = syData.totalStudents;
      } else {
        const match = syData.classrooms.find(c => c.gradeLevel === selectedGrade);
        value = match ? match.enrollment : 0;
      }
      return { year: shortYear, value };
    });
  };

  // Build attendance data scaled to current total
  const dynamicAttendanceData = () => {
    const base = totalStudents || 502;
    return [
      { name: 'Mon', present: Math.round(base * 0.94) },
      { name: 'Tue', present: Math.round(base * 0.88) },
      { name: 'Wed', present: Math.round(base * 0.82) },
      { name: 'Thu', present: Math.round(base * 0.91) },
      { name: 'Fri', present: Math.round(base * 0.89) },
    ];
  };

  const renderAnalytics = () => {
    const currentYearStudents = totalStudents;
    const yearlyData = enrollmentTrendsFromDb();
    const prevYearStudents = yearlyData.length > 1 ? yearlyData[yearlyData.length - 2].value : 489;
    const enrollmentGrowth = prevYearStudents > 0 ? (((currentYearStudents - prevYearStudents) / prevYearStudents) * 100).toFixed(1) : '0.0';

    const currentDropouts = totalDropouts;
    const prevDropouts = selectedGrade === 'All Grades' ? 8 : Math.max(0, Math.round(totalDropouts * 1.6));
    const dropoutChange = prevDropouts - currentDropouts;

    const currentRepeaters = totalRepeaters;
    const prevRepeaters = selectedGrade === 'All Grades' ? 7 : Math.max(0, Math.round(totalRepeaters * 1.4));
    const repeaterChange = prevRepeaters - currentRepeaters;

    // Data for new charts
    const kinderStudents = filteredClassrooms.filter(c => c.gradeLevel.toLowerCase().includes('kinder')).reduce((sum, c) => sum + (c.enrollment || c.bosyEnrollment || 0), 0);
    const gr13Students = filteredClassrooms.filter(c => ['grade 1', 'grade 2', 'grade 3'].includes(c.gradeLevel.toLowerCase())).reduce((sum, c) => sum + (c.enrollment || c.bosyEnrollment || 0), 0);
    const gr46Students = filteredClassrooms.filter(c => ['grade 4', 'grade 5', 'grade 6'].includes(c.gradeLevel.toLowerCase())).reduce((sum, c) => sum + (c.enrollment || c.bosyEnrollment || 0), 0);

    let gradeData = [];
    if (selectedGrade !== 'All Grades') {
      gradeData = filteredClassrooms.map((c, idx) => ({
        name: c.section || `Section ${idx + 1}`,
        value: c.enrollment || c.bosyEnrollment || 0,
        color: ['#06B6D4', '#3B82F6', '#FB7185', '#EC4899', '#F59E0B'][idx % 5]
      }));
    } else {
      gradeData = [
        { name: 'Kinder', value: kinderStudents || 55, color: '#06B6D4' },
        { name: 'Gr 1-3', value: gr13Students || 230, color: '#3B82F6' },
        { name: 'Gr 4-6', value: gr46Students || 217, color: '#FB7185' }
      ];
    }

    const seed = (selectedYear.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) + 
                 (selectedGrade.split('').reduce((a, b) => a + b.charCodeAt(0), 0));

    const weeklyActivity = [
      { name: 'MON', val: Math.min(100, Math.max(30, 95 + ((seed % 10) - 5))) },
      { name: 'TUE', val: Math.min(100, Math.max(30, 98 + (((seed * 3) % 10) - 5))) },
      { name: 'WED', val: Math.min(100, Math.max(30, 92 + (((seed * 7) % 10) - 5))) },
      { name: 'THU', val: Math.min(100, Math.max(30, 96 + (((seed * 11) % 10) - 5))) },
      { name: 'FRI', val: Math.min(100, Math.max(30, 89 + (((seed * 13) % 10) - 5))) },
      { name: 'SAT', val: Math.min(100, Math.max(0, 12 + (((seed * 17) % 10) - 5))) },
      { name: 'SUN', val: 0 }
    ];

    const radarData = [
      { subject: 'Math', score: Math.min(100, Math.max(50, 85 + ((seed % 12) - 6))), avg: 75 },
      { subject: 'Science', score: Math.min(100, Math.max(50, 88 + (((seed * 2) % 12) - 6))), avg: 72 },
      { subject: 'English', score: Math.min(100, Math.max(50, 78 + (((seed * 3) % 12) - 6))), avg: 80 },
      { subject: 'History', score: Math.min(100, Math.max(50, 82 + (((seed * 4) % 12) - 6))), avg: 78 },
      { subject: 'Arts', score: Math.min(100, Math.max(50, 92 + (((seed * 5) % 12) - 6))), avg: 85 }
    ];

    const ArrowUpIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>;
    const ArrowDownIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>;

    return (
      <div className="rep-content-scroll rep-premium-analytics">
        <div className="rep-premium-analytics-header" style={{justifyContent: 'flex-end', gap: '12px'}}>
          <button className="rep-dropdown" onClick={() => setShowClassroomSizeModal(true)}>Classroom Size</button>
          <button className="rep-dropdown" onClick={() => setShowCompareYearModal(true)}>Compare Year <ChevronDown size={14}/></button>
          <button className="rep-dropdown" onClick={() => setShowExportImportModal(true)} style={{display: 'flex', alignItems: 'center', gap: '6px'}}><Download size={14}/> S.Y. 2020-2027 Export/Import</button>
        </div>

        <div className="rep-premium-kpis">
          <div className="rep-premium-kpi-card clickable-kpi-card" onClick={() => { setShowEnrollmentModal(true); setEnrollmentModalYear(selectedYear); }} style={{ cursor: 'pointer' }}>
            <div className="rep-premium-kpi-top">
              <div className="rep-premium-kpi-icon" style={{color: '#10B981', backgroundColor: 'rgba(16,185,129,0.1)'}}><Users size={16}/></div>
              <div className="rep-premium-trend-badge up"><ArrowUpIcon/> +{Math.abs(enrollmentGrowth)}%</div>
            </div>
            <div>
              <div className="rep-premium-kpi-label">Total Enrollment</div>
              <h3 className="rep-premium-kpi-value">{currentYearStudents.toLocaleString()}</h3>
            </div>
          </div>
          <div className="rep-premium-kpi-card">
            <div className="rep-premium-kpi-top">
              <div className="rep-premium-kpi-icon" style={{color: '#EF4444', backgroundColor: 'rgba(239,68,68,0.1)'}}><Briefcase size={16}/></div>
              <div className={`rep-premium-trend-badge ${parseFloat(teacherTrendPercent) >= 0 ? 'up' : 'down'}`}>{parseFloat(teacherTrendPercent) >= 0 ? <ArrowUpIcon/> : <ArrowDownIcon/>} {parseFloat(teacherTrendPercent) >= 0 ? '+' : ''}{teacherTrendPercent}%</div>
            </div>
            <div>
              <div className="rep-premium-kpi-label">Active Teachers</div>
              <h3 className="rep-premium-kpi-value">{activeTeachers}</h3>
            </div>
          </div>
          <div className="rep-premium-kpi-card">
            <div className="rep-premium-kpi-top">
              <div className="rep-premium-kpi-icon" style={{color: '#EF4444', backgroundColor: 'rgba(239,68,68,0.1)'}}><UserX size={16}/></div>
              <div className={`rep-premium-trend-badge ${dropoutChange >= 0 ? 'down' : 'up'}`}>{dropoutChange >= 0 ? <ArrowDownIcon/> : <ArrowUpIcon/>} {dropoutChange >= 0 ? `-${Math.abs(dropoutChange)}` : `+${Math.abs(dropoutChange)}`}</div>
            </div>
            <div>
              <div className="rep-premium-kpi-label">Dropout Students</div>
              <h3 className="rep-premium-kpi-value">{currentDropouts}</h3>
            </div>
          </div>
          <div className="rep-premium-kpi-card">
            <div className="rep-premium-kpi-top">
              <div className="rep-premium-kpi-icon" style={{color: '#6366F1', backgroundColor: 'rgba(99,102,241,0.1)'}}><Award size={16}/></div>
              <div className={`rep-premium-trend-badge ${parseFloat(retentionRate) >= 95 ? 'up' : 'down'}`}>{parseFloat(retentionRate) >= 95 ? <ArrowUpIcon/> : <ArrowDownIcon/>} {retentionRate}%</div>
            </div>
            <div>
              <div className="rep-premium-kpi-label">Retention Rate</div>
              <h3 className="rep-premium-kpi-value">{retentionRate}%</h3>
            </div>
          </div>
          <div className="rep-premium-kpi-card">
            <div className="rep-premium-kpi-top">
              <div className="rep-premium-kpi-icon" style={{color: '#EC4899', backgroundColor: 'rgba(236,72,153,0.1)'}}><AlertCircle size={16}/></div>
              <div className="rep-premium-trend-badge down">{repeaterChange >= 0 ? <ArrowDownIcon/> : <ArrowUpIcon/>} {Math.abs(repeaterChange)}</div>
            </div>
            <div>
              <div className="rep-premium-kpi-label">Total Repeaters</div>
              <h3 className="rep-premium-kpi-value">{currentRepeaters}</h3>
            </div>
          </div>
        </div>

        <div className="rep-premium-main-grid">
          
          <div className="rep-premium-card rpg-area">
            <div className="rep-premium-card-header">
              <h3 className="rep-premium-card-title">Enrollment Trends</h3>
              <div className="rep-premium-card-action"><ChevronDown size={16}/></div>
            </div>
            <div className="rep-premium-area-chart">
              {isChartReady ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={yearlyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F97316" stopOpacity={0.4}/>
                        <stop offset="100%" stopColor="#EC4899" stopOpacity={0}/>
                      </linearGradient>
                      <filter id="chartGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid-color)" opacity={0.3} />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: 'var(--text-gray)', fontSize: 10}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-gray)', fontSize: 10}} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="value" stroke="#F97316" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" filter="url(#chartGlow)" isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="rep-chart-skeleton" />
              )}
            </div>
          </div>

          <div className="rep-premium-card rpg-donut">
            <div className="rep-premium-card-header">
              <h3 className="rep-premium-card-title">Students by Grade</h3>
              <div className="rep-premium-card-action"><ChevronDown size={16}/></div>
            </div>
            <div className="rep-premium-donut-chart" style={{position: 'relative'}}>
              {isChartReady ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={gradeData} innerRadius={50} outerRadius={75} paddingAngle={2} cornerRadius={4} dataKey="value" stroke="var(--bg-panel)" strokeWidth={3} isAnimationActive={true} animationDuration={1200} animationEasing="ease-out">
                        {gradeData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'}}>
                    <span style={{fontSize: '20px', fontWeight: 'bold', color: 'var(--text-dark)'}}>{currentYearStudents}</span>
                    <span style={{fontSize: '10px', color: 'var(--text-gray)'}}>Total</span>
                  </div>
                </>
              ) : (
                <div className="rep-chart-skeleton" />
              )}
            </div>
          </div>

          <div className="rep-premium-card rpg-bar">
            <div className="rep-premium-card-header">
              <h3 className="rep-premium-card-title">Weekly Activity</h3>
              <div className="rep-premium-card-action"><ChevronDown size={16}/></div>
            </div>
            <div className="rep-premium-bar-chart">
              {isChartReady ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyActivity} margin={{ top: 10, right: 0, left: -25, bottom: 0 }} barSize={12}>
                    <defs>
                      <linearGradient id="weeklyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EF4444" stopOpacity={0.95}/>
                        <stop offset="100%" stopColor="#F43F5E" stopOpacity={0.25}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: 'var(--text-gray)'}} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.03)'}} />
                    <Bar dataKey="val" fill="url(#weeklyGrad)" radius={[4, 4, 0, 0]} background={{ fill: 'var(--chart-bg-track)', radius: [4, 4, 0, 0] }} isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="rep-chart-skeleton" />
              )}
            </div>
          </div>

          <div className="rep-premium-card rpg-line">
            <div className="rep-premium-card-header">
              <h3 className="rep-premium-card-title"><TrendingUp size={16} className="text-green"/> Performance Trend</h3>
              <div className="rep-premium-card-action"><ChevronDown size={16}/></div>
            </div>
            <div className="rep-premium-line-chart">
              {isChartReady ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={computedPerf.data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <filter id="chartGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid-color)" opacity={0.3} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: 'var(--text-gray)'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fill: 'var(--text-gray)'}} tickFormatter={(v) => `${v}%`} />
                    <Tooltip content={<CustomTooltip />} />
                    {computedPerf.grades.map((g, idx) => (
                      <Line 
                        key={idx} 
                        type="monotone" 
                        dataKey={g} 
                        name={computedPerf.labels[idx]} 
                        stroke={computedPerf.colors[idx]} 
                        strokeWidth={3} 
                        filter="url(#chartGlow)" 
                        dot={{ r: 3, fill: computedPerf.colors[idx], strokeWidth: 1.5, stroke: 'var(--bg-panel)' }} 
                        activeDot={{ r: 5, strokeWidth: 0 }} 
                        isAnimationActive={true} 
                        animationDuration={1200} 
                        animationEasing="ease-out" 
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="rep-chart-skeleton" />
              )}
            </div>
          </div>

          <div className="rep-premium-card rpg-radar">
            <div className="rep-premium-card-header">
              <h3 className="rep-premium-card-title"><Settings size={16} style={{color: '#8B5CF6'}}/> Subject Analysis</h3>
              <div className="rep-premium-card-action"><ChevronDown size={16}/></div>
            </div>
            <div className="rep-premium-radar-chart">
              {isChartReady ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={radarData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="subjectGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.6}/>
                        <stop offset="100%" stopColor="#EC4899" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid-color)" opacity={0.3} />
                    <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: 'var(--text-gray)'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fill: 'var(--text-gray)'}} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="score" fill="url(#subjectGrad)" stroke="#8B5CF6" strokeWidth={2} isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" />
                    <Line type="monotone" dataKey="avg" stroke="#64748B" strokeWidth={2} dot={false} strokeDasharray="3 3" isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="rep-chart-skeleton" />
              )}
            </div>
          </div>

          <div className="rpg-right">
            
            <div className="rep-premium-card">
              <div className="rep-premium-card-header">
                <h3 className="rep-premium-card-title"><Lightbulb size={16} style={{color: '#F59E0B'}}/> Recommendations & Insights</h3>
                <div className="rep-premium-card-action" style={{color: '#F97316', cursor: 'pointer'}} onClick={() => setShowInsightsModal(true)}>View All &rarr;</div>
              </div>
              <div className="rep-premium-insight-list">
                {schoolInsights.slice(0, 3).map((insight) => (
                  <div className="rep-premium-insight-item" key={insight.id}>
                    <div className={`rep-premium-insight-icon ${insight.type === 'warning' ? 'red' : insight.type === 'success' ? 'green' : 'yellow'}`}>
                      {insight.type === 'warning' && <AlertCircle size={14}/>}
                      {insight.type === 'success' && <Check size={14}/>}
                      {insight.type === 'idea' && <Lightbulb size={14}/>}
                    </div>
                    <div className="rep-premium-insight-content">
                      <h4>{insight.title}</h4>
                      <p>{insight.description}</p>
                    </div>
                  </div>
                ))}
                {schoolInsights.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748B', fontSize: '13px' }}>
                    No active insights at this time.
                  </div>
                )}
              </div>
            </div>

            <div className="rep-premium-card">
              <div className="rep-premium-card-header">
                <h3 className="rep-premium-card-title"><Users size={16} style={{color: '#3B82F6'}}/> Campus Operations</h3>
                <div className="rep-premium-card-action" style={{color: '#F97316', cursor: 'pointer'}} onClick={() => setShowCampusModal(true)}>View All &rarr;</div>
              </div>
              
              <div className="rep-premium-branch-ops">
                <div className="rep-premium-branch-stat">
                  <span>Total Rooms</span>
                  <h4>{campusTotalRooms}</h4>
                </div>
                <div className="rep-premium-branch-stat">
                  <span>Active</span>
                  <h4>{campusActiveRooms}</h4>
                </div>
              </div>

              <div className="rep-premium-branch-list" style={{marginBottom: '16px'}}>
                <div className="rep-premium-branch-item">
                  <div className="rep-premium-branch-item-left">
                    <div className="rep-premium-insight-icon red" style={{width: 20, height: 20}}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path></svg></div>
                    <div>
                      <h5>Main Building</h5>
                      <p>{totalStudents > campusTotalSeats * 0.85 ? 'High Volume' : 'Optimal'}</p>
                    </div>
                  </div>
                  <div className="rep-premium-branch-item-right">
                    <h5>{campusTotalSeats}</h5>
                    <p className="text-green">seats</p>
                  </div>
                </div>
                <div className="rep-premium-branch-item">
                  <div className="rep-premium-branch-item-left">
                    <div className="rep-premium-insight-icon red" style={{width: 20, height: 20}}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path></svg></div>
                    <div>
                      <h5>Sections</h5>
                      <p>{globalClassrooms.length} active</p>
                    </div>
                  </div>
                  <div className="rep-premium-branch-item-right">
                    <h5>{activeTeachers}</h5>
                    <p className="text-green">teachers</p>
                  </div>
                </div>
              </div>

              <h3 className="rep-premium-card-title" style={{marginBottom: '12px'}}>School Map</h3>
              <div className="rep-premium-map-container" style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px', aspectRatio: '16/9', width: '100%', minHeight: '200px' }}>
                <iframe 
                  src="https://maps.google.com/maps?q=14.9850179,120.5396375&t=k&z=17&ie=UTF8&iwloc=&output=embed" 
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  style={{ border: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} 
                  allowFullScreen="" 
                  aria-hidden="false" 
                  tabIndex="0"
                  title="School Map"
                ></iframe>
              </div>

            </div>

          </div>

        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="rep-content-scroll">
      <div className="rep-content-grid">
        
        {/* Left/Main Column */}
        <div className="rep-main-column">
          
          {/* Stats Row */}
          <div className="rep-stats-row">
            <div className="rep-stat-card">
              <div className="rep-stat-info">
                <span className="rep-stat-label">Enrolled Students</span>
                <span className="rep-stat-value">{totalStudents.toLocaleString()}</span>
              </div>
              <div className="rep-stat-icon blue">
                <GraduationCap size={24} />
              </div>
            </div>
            
            <div className="rep-stat-card">
              <div className="rep-stat-info">
                <span className="rep-stat-label">Active Teachers</span>
                <span className="rep-stat-value">{activeTeachers}</span>
              </div>
              <div className="rep-stat-icon pink">
                <Briefcase size={24} />
              </div>
            </div>
            
            <div className="rep-stat-card">
              <div className="rep-stat-info">
                <span className="rep-stat-label">Support Staff</span>
                <span className="rep-stat-value">{supportStaff || 34}</span>
              </div>
              <div className="rep-stat-icon blue">
                <Users size={24} />
              </div>
            </div>
            
            <div className="rep-stat-card">
              <div className="rep-stat-info">
                <span className="rep-stat-label">Repeaters Student</span>
                <span className="rep-stat-value">{totalRepeaters}</span>
              </div>
              <div className="rep-stat-icon pink">
                <AlertCircle size={24} />
              </div>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="rep-charts-row">
            {/* Student Performance (Full Width) */}
            <div className="rep-card rep-chart-card" style={{ gridColumn: 'span 2' }}>
              <div className="rep-card-header">
                <h3>Student Performance</h3>
              </div>
              <div className="rep-chart-legend">
                {computedPerf.labels.map((lbl, idx) => (
                  <span key={idx} className="legend-item">
                    <span className="dot" style={{ backgroundColor: computedPerf.colors[idx] }}></span> {lbl}
                  </span>
                ))}
              </div>
              <div className="rep-chart-container" style={{height: 280}}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={computedPerf.data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }} barGap={4} barSize={12}>
                    <defs>
                      <linearGradient id="gradTeal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.95}/>
                        <stop offset="100%" stopColor="#0891B2" stopOpacity={0.25}/>
                      </linearGradient>
                      <linearGradient id="gradRose" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.95}/>
                        <stop offset="100%" stopColor="#BE123C" stopOpacity={0.25}/>
                      </linearGradient>
                      <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.95}/>
                        <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.25}/>
                      </linearGradient>
                      <linearGradient id="gradPink" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EC4899" stopOpacity={0.95}/>
                        <stop offset="100%" stopColor="#BE185D" stopOpacity={0.25}/>
                      </linearGradient>
                      <linearGradient id="gradOrange" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F97316" stopOpacity={0.95}/>
                        <stop offset="100%" stopColor="#C2410C" stopOpacity={0.25}/>
                      </linearGradient>
                      <linearGradient id="gradPurple" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.95}/>
                        <stop offset="100%" stopColor="#6D28D9" stopOpacity={0.25}/>
                      </linearGradient>
                      <linearGradient id="gradAmber" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.95}/>
                        <stop offset="100%" stopColor="#B45309" stopOpacity={0.25}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid-color)" opacity={0.3} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'var(--text-gray)'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'var(--text-gray)'}} tickFormatter={(value) => `${value}%`} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.03)'}} />
                    {computedPerf.grades.map((g, idx) => (
                       <Bar 
                         key={idx} 
                         dataKey={g} 
                         name={computedPerf.labels[idx]} 
                         fill={computedPerf.gradients ? computedPerf.gradients[idx] : computedPerf.colors[idx]} 
                         radius={[4, 4, 0, 0]} 
                       />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="rep-widgets-row">
            {/* Students by Gender */}
            <div className="rep-card">
              <div className="rep-card-header">
                <h3>Students by Gender</h3>
                <select
                  className="rep-dropdown"
                  value={genderGradeFilter}
                  onChange={(e) => setGenderGradeFilter(e.target.value)}
                  style={{ cursor: 'pointer', border: '1px solid var(--border-color)', background: 'var(--bg-panel)', color: 'var(--text-dark)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px' }}
                >
                  <option value="All Grades">All Grades</option>
                  <option value="Kinder">Kinder</option>
                  <option value="Grade 1">Grade 1</option>
                  <option value="Grade 2">Grade 2</option>
                  <option value="Grade 3">Grade 3</option>
                  <option value="Grade 4">Grade 4</option>
                  <option value="Grade 5">Grade 5</option>
                  <option value="Grade 6">Grade 6</option>
                </select>
              </div>
              <div className="rep-donut-container">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={computedGenderFiltered}
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      cornerRadius={4}
                      dataKey="value"
                      stroke="var(--bg-panel)"
                      strokeWidth={3}
                      isAnimationActive={true}
                      animationDuration={800}
                    >
                      {computedGenderFiltered.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="rep-donut-center">
                  <span className="rep-donut-total">{genderFilteredTotal.toLocaleString()}</span>
                </div>
              </div>
              <div className="rep-donut-legend">
                {computedGenderFiltered.map((entry, idx) => (
                  <span key={idx} className="legend-item">
                    <span className="dot" style={{ backgroundColor: entry.color }}></span> {entry.name}: {entry.value}
                  </span>
                ))}
              </div>
            </div>

            {/* Student Attendance */}
            <div className="rep-card">
              <div className="rep-card-header">
                <h3>Student Attendance</h3>

              </div>
              <div className="rep-chart-container" style={{height: 160, marginTop: '1rem'}}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dynamicAttendanceData()} margin={{ top: 15, right: 0, left: 0, bottom: 0 }} barSize={30}>
                    <defs>
                      <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EC4899" stopOpacity={0.95}/>
                        <stop offset="100%" stopColor="#F43F5E" stopOpacity={0.25}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'var(--text-gray)'}} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                    <Bar dataKey="present" fill="url(#attendanceGrad)" radius={[6, 6, 0, 0]} background={{ fill: 'var(--chart-bg-track)', radius: [6, 6, 0, 0] }} isAnimationActive={true} animationDuration={1200} animationEasing="ease-out">
                      <LabelList dataKey="present" position="top" fill="var(--text-gray)" fontSize={10} fontWeight={500} formatter={(v) => v.toLocaleString()} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* To Do List — Interactive */}
            <div className="rep-card">
              <div className="rep-card-header">
                <h3>To Do List</h3>
                <button onClick={() => setShowTodoInput(!showTodoInput)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-gray)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}>
                  {showTodoInput ? <X size={16} /> : <UserPlus size={16} />}
                  {showTodoInput ? 'Cancel' : 'Add'}
                </button>
              </div>
              {showTodoInput && (
                <div style={{ display: 'flex', gap: '8px', padding: '0 16px 12px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                    placeholder="Add a new task..."
                    style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-dark)', fontSize: '12px', outline: 'none' }}
                  />
                  <button onClick={addTodo} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#3B82F6', color: 'white', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Add</button>
                </div>
              )}
              <div className="rep-todo-list">
                {todoItems.map(item => (
                  <div key={item.id} className={`rep-todo-item ${item.completed ? 'completed' : ''}`} style={{ cursor: 'pointer' }}>
                    <div
                      className={`rep-checkbox ${item.completed ? 'checked' : ''}`}
                      onClick={() => toggleTodo(item.id)}
                    >
                      {item.completed && <Check size={12}/>}
                    </div>
                    <div className="rep-todo-text" onClick={() => toggleTodo(item.id)} style={{ flex: 1 }}>
                      <p style={{ textDecoration: item.completed ? 'line-through' : 'none', opacity: item.completed ? 0.6 : 1 }}>{item.text}</p>
                      <span>{item.date}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); removeTodo(item.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-gray)', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center' }} title="Remove">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {todoItems.length === 0 && (
                  <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-gray)', fontSize: '13px' }}>
                    No tasks yet. Click "Add" to create one.
                  </div>
                )}
              </div>
            </div>
          </div>


        </div>

        {/* Right Column / Sidebar Area */}
        <div className="rep-right-column">
          
          {/* Calendar Widget — Navigable */}
          <div className="rep-card">
            <div className="rep-calendar-header">
              <h3>{MONTH_NAMES[dashCalMonth]} {dashCalYear}</h3>
              <div className="rep-cal-nav">
                <button onClick={dashCalPrev}><ChevronLeft size={16}/></button>
                <button onClick={dashCalNext}><ChevronRight size={16}/></button>
              </div>
            </div>
            <div className="rep-calendar-grid">
              <div className="day-name">S</div><div className="day-name">M</div><div className="day-name">T</div><div className="day-name">W</div><div className="day-name">T</div><div className="day-name">F</div><div className="day-name">S</div>
              {getDashCalDays().map((d, i) => (
                <div key={i} className={`day ${d.type}`} style={d.isToday ? { fontWeight: 'bold', boxShadow: '0 0 0 2px #06B6D4' } : {}}>{d.day}</div>
              ))}
            </div>
          </div>

          {/* Events — from customEvents state */}
          <div className="rep-card">
            <div className="rep-card-header">
              <h3>Upcoming Events</h3>
              <button onClick={() => setActiveTab('Calendar')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F97316', fontSize: '12px', fontWeight: 600 }}>View All &rarr;</button>
            </div>
            <div className="rep-events-list">
              {customEvents.slice(0, 4).map((evt, idx) => (
                <div key={evt.id} className="rep-event-item" onClick={() => { setSelectedEvent(evt); setActiveTab('Calendar'); }} style={{ cursor: 'pointer' }}>
                  <div className="rep-event-time">
                    <span className={`tag ${idx % 2 === 0 ? 'pink-light' : 'cyan-light'}`}>{MONTH_NAMES[dashCalMonth]?.slice(0,3)} {evt.day}</span>
                    <span className="time-text">{evt.time}</span>
                  </div>
                  <h4>{evt.title}</h4>
                  <span className="event-audience">{evt.type}</span>
                </div>
              ))}
              {customEvents.length === 0 && (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-gray)', fontSize: '13px' }}>
                  No events yet. Go to Calendar to add events.
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity — Dynamic */}
          <div className="rep-card rep-activity-card">
            <div className="rep-card-header">
              <h3>Recent Activity</h3>
              <span style={{ fontSize: '11px', color: 'var(--text-gray)' }}>{activityLog.length} items</span>
            </div>
            <div className="rep-activity-list">
              {activityLog.slice(0, 6).map((act) => (
                <div key={act.id} className="rep-activity-item">
                  <div className={`rep-activity-icon ${act.color}`}>
                    {act.icon === 'users' && <Users size={14}/>}
                    {act.icon === 'check' && <Check size={14}/>}
                    {act.icon === 'dollar' && <DollarSign size={14}/>}
                    {act.icon === 'calendar' && <Calendar size={14}/>}
                    {act.icon === 'alert' && <AlertCircle size={14}/>}
                    {act.icon === 'edit' && <Edit size={14}/>}
                    {act.icon === 'trash' && <Trash2 size={14}/>}
                    {act.icon === 'award' && <Award size={14}/>}
                  </div>
                  <div className="rep-activity-content">
                    <p>{act.text}</p>
                    <span>{act.time}</span>
                  </div>
                </div>
              ))}
              {activityLog.length === 0 && (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-gray)', fontSize: '13px' }}>
                  No recent activity.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );

  const renderStudentDetails = () => {
    const editInputStyle = {
      width: '100%', padding: '6px 10px', borderRadius: '6px',
      border: '1px solid var(--border-color)', background: 'var(--bg-secondary)',
      color: 'var(--text-dark)', fontSize: '13px', fontFamily: 'inherit', outline: 'none',
    };

    return (
      <div className="rep-modal-overlay" onClick={() => { setSelectedStudent(null); setIsEditingStudent(false); }}>
        <div className="rep-modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="rep-modal-header">
            <h2>Student Details</h2>
            <button className="rep-modal-close" onClick={() => { setSelectedStudent(null); setIsEditingStudent(false); }}>
              <X size={24} />
            </button>
          </div>
          <div className="rep-modal-content">
            <div className="rep-student-details-grid">
          
          {/* Column 1: Profile & Info */}
          <div className="rep-sd-col">
            <div className="rep-card text-center rep-profile-card">
              <img src={`https://api.dicebear.com/7.x/micah/svg?seed=${selectedStudent?.studentId || 'isabella'}&backgroundColor=transparent`} alt="Student" className="rep-profile-img" />
              <h2>{selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : 'Isabella Rossi'}</h2>
              <div className="rep-profile-tags">
                <span className="tag-outline">{selectedStudent?.studentId || 'S-2106'}</span>
                <span className="tag-outline">{selectedStudent?.gradeLevel || 'Grade 1'} - {selectedStudent?.section || 'Mabini'}</span>
                <span className={`rep-status-pill ${selectedStudent?.status === 'Dropped' ? 'pink' : selectedStudent?.status === 'Enrolled' ? 'cyan' : 'cyan'}`}>{selectedStudent?.status || 'Active'}</span>
              </div>

              {/* Edit / Save / Cancel buttons */}
              {!isEditingStudent ? (
                <button
                  style={{
                    marginTop: '16px', backgroundColor: '#3B82F6', color: 'white', border: 'none',
                    padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600',
                    display: 'inline-flex', alignItems: 'center', gap: '8px', width: '100%',
                    justifyContent: 'center', transition: 'background-color 0.2s'
                  }}
                  onClick={() => handleEditStudent(selectedStudent)}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <Edit size={16} /> Edit Student Details
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px', width: '100%' }}>
                  <button
                    style={{
                      flex: 1, backgroundColor: '#059669', color: 'white', border: 'none',
                      padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600',
                      display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'center',
                      opacity: editStudentLoading ? 0.6 : 1
                    }}
                    onClick={handleSaveStudent}
                    disabled={editStudentLoading}
                  >
                    <Check size={16} /> {editStudentLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    style={{
                      flex: 1, backgroundColor: '#6B7280', color: 'white', border: 'none',
                      padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600',
                      display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'center'
                    }}
                    onClick={() => setIsEditingStudent(false)}
                  >
                    <X size={16} /> Cancel
                  </button>
                </div>
              )}
              
              <button 
                className="rep-btn-drop-student" 
                style={{
                  marginTop: '8px',
                  backgroundColor: selectedStudent?.status === 'Dropped' ? '#059669' : '#f97316',
                  color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px',
                  cursor: 'pointer', fontWeight: '600', display: 'inline-flex', alignItems: 'center',
                  gap: '8px', width: '100%', justifyContent: 'center', transition: 'background-color 0.2s'
                }}
                onClick={() => {
                  const action = selectedStudent?.status === 'Dropped' ? 'Re-enroll' : 'Drop';
                  setCustomConfirm({
                    show: true,
                    title: `${action} Student`,
                    message: `Are you sure you want to ${action.toLowerCase()} student ${selectedStudent.firstName} ${selectedStudent.lastName}?`,
                    onConfirm: () => executeToggleStudentStatus(selectedStudent)
                  });
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <UserX size={16} /> {selectedStudent?.status === 'Dropped' ? 'Re-enroll Student' : 'Drop Student'}
              </button>

              <button 
                className="rep-btn-danger" 
                style={{
                  marginTop: '8px', backgroundColor: '#ef4444', color: 'white', border: 'none',
                  padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600',
                  display: 'inline-flex', alignItems: 'center', gap: '8px', width: '100%',
                  justifyContent: 'center', transition: 'background-color 0.2s'
                }}
                onClick={() => handleDeleteStudent(selectedStudent)}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
              >
                <Trash2 size={16} /> Remove Student completely
              </button>
              
              <div className="rep-info-list">
                {isEditingStudent ? (
                  <>
                    <div className="rep-info-item">
                      <span>Full Name</span>
                      <input style={editInputStyle} value={editStudentForm.name || ''} onChange={(e) => setEditStudentForm({...editStudentForm, name: e.target.value})} />
                    </div>
                    <div className="rep-info-item">
                      <span>Gender</span>
                      <select style={editInputStyle} value={editStudentForm.gender || 'Male'} onChange={(e) => setEditStudentForm({...editStudentForm, gender: e.target.value})}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div className="rep-info-item">
                      <span>LRN</span>
                      <input style={editInputStyle} value={editStudentForm.lrn || ''} onChange={(e) => setEditStudentForm({...editStudentForm, lrn: e.target.value})} />
                    </div>
                    <div className="rep-info-item">
                      <span>Grade Level</span>
                      <select style={editInputStyle} value={editStudentForm.gradeLevel || ''} onChange={(e) => setEditStudentForm({...editStudentForm, gradeLevel: e.target.value})}>
                        <option value="">Select</option>
                        <option value="Kinder">Kinder</option>
                        <option value="Grade 1">Grade 1</option>
                        <option value="Grade 2">Grade 2</option>
                        <option value="Grade 3">Grade 3</option>
                        <option value="Grade 4">Grade 4</option>
                        <option value="Grade 5">Grade 5</option>
                        <option value="Grade 6">Grade 6</option>
                      </select>
                    </div>
                    <div className="rep-info-item">
                      <span>Section</span>
                      <input style={editInputStyle} value={editStudentForm.section || ''} onChange={(e) => setEditStudentForm({...editStudentForm, section: e.target.value})} />
                    </div>
                    <div className="rep-info-item">
                      <span>Address</span>
                      <input style={editInputStyle} value={editStudentForm.address || ''} onChange={(e) => setEditStudentForm({...editStudentForm, address: e.target.value})} placeholder="e.g. Floridablanca, Pampanga" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rep-info-item">
                      <span>Gender</span>
                      <p>{selectedStudent?.gender || 'N/A'}</p>
                    </div>
                    <div className="rep-info-item">
                      <span>LRN</span>
                      <p>{selectedStudent?.lrn || 'N/A'}</p>
                    </div>
                    <div className="rep-info-item">
                      <span>Grade Level</span>
                      <p>{selectedStudent?.gradeLevel || 'N/A'}</p>
                    </div>
                    <div className="rep-info-item">
                      <span>Section</span>
                      <p>{selectedStudent?.section || 'N/A'}</p>
                    </div>
                    <div className="rep-info-item">
                      <span>Address</span>
                      <p>{selectedStudent?.address || 'Floridablanca, Pampanga'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="rep-card">
              <div className="rep-card-header">
                <h3>Parent/Guardian Info</h3>
                <MoreHorizontal size={20} className="text-gray" />
              </div>
              <div className="rep-info-list no-border">
                {isEditingStudent ? (
                  <>
                    <div className="rep-info-item">
                      <span>Parent Name</span>
                      <input style={editInputStyle} value={editStudentForm.parentName || ''} onChange={(e) => setEditStudentForm({...editStudentForm, parentName: e.target.value})} placeholder="e.g. Marco Dela Cruz" />
                    </div>
                    <div className="rep-info-item">
                      <span>Phone</span>
                      <input style={editInputStyle} value={editStudentForm.parentPhone || ''} onChange={(e) => setEditStudentForm({...editStudentForm, parentPhone: e.target.value})} placeholder="e.g. +63 912 345 6789" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rep-info-item">
                      <span>Parent/Guardian</span>
                      <div>
                        <p>{selectedStudent?.parentName || `Parent of ${selectedStudent?.firstName || 'Student'}`}</p>
                        <span>{selectedStudent?.parentPhone || 'No phone on file'}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="rep-card">
              <div className="rep-card-header">
                <h3>Documents</h3>
                <MoreHorizontal size={20} className="text-gray" />
              </div>
              <div className="rep-documents-list">
                <div className="rep-doc-item">
                  <div className="rep-doc-icon pink">PDF</div>
                  <div className="rep-doc-info">
                    <p>ReportCard_{selectedStudent?.firstName || 'Isabella'}{selectedStudent?.lastName || 'Rossi'}_Grad...</p>
                    <span>PDF • 2.4 MB</span>
                  </div>
                </div>
                <div className="rep-doc-item">
                  <div className="rep-doc-icon pink">PDF</div>
                  <div className="rep-doc-info">
                    <p>Certificate_ScienceFair_Winner...</p>
                    <span>PDF • 1.8 MB</span>
                  </div>
                </div>
                <div className="rep-doc-item">
                  <div className="rep-doc-icon pink">PDF</div>
                  <div className="rep-doc-info">
                    <p>IDCard_Student_{selectedStudent?.studentId?.replace(/-/g, '_') || 'S2106'}_{selectedStudent?.firstName || 'Isabell'}...</p>
                    <span>PDF • 1.9 MB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Middle */}
          <div className="rep-sd-col">
            <div className="rep-card">
              <div className="rep-calendar-header">
                <h3>May 2026</h3>
                <div className="rep-cal-nav">
                  <button><ChevronLeft size={16}/></button>
                  <button><ChevronRight size={16}/></button>
                </div>
              </div>
              <div className="rep-calendar-grid">
                <div className="day-name">S</div><div className="day-name">M</div><div className="day-name">T</div><div className="day-name">W</div><div className="day-name">T</div><div className="day-name">F</div><div className="day-name">S</div>
                <div className="day prev-month">26</div><div className="day prev-month">27</div><div className="day prev-month">28</div><div className="day prev-month">29</div><div className="day prev-month">30</div><div className="day active-blue">1</div><div className="day">2</div>
                <div className="day">3</div><div className="day">4</div><div className="day">5</div><div className="day">6</div><div className="day">7</div><div className="day">8</div><div className="day">9</div>
                <div className="day">10</div><div className="day">11</div><div className="day">12</div><div className="day active-blue">13</div><div className="day active-blue">14</div><div className="day">15</div><div className="day">16</div>
                <div className="day">17</div><div className="day">18</div><div className="day">19</div><div className="day">20</div><div className="day">21</div><div className="day active-cyan">22</div><div className="day">23</div>
                <div className="day">24</div><div className="day">25</div><div className="day">26</div><div className="day">27</div><div className="day active-pink">28</div><div className="day">29</div><div className="day">30</div>
                <div className="day">31</div><div className="day next-month">1</div><div className="day next-month">2</div><div className="day next-month">3</div><div className="day next-month">4</div><div className="day next-month">5</div><div className="day next-month">6</div>
              </div>
              <div className="rep-attendance-summary">
                <div className="att-box cyan-bg"><span>Present</span><p>14</p></div>
                <div className="att-box pink-bg"><span>Late</span><p>3</p></div>
                <div className="att-box blue-bg"><span>Sick</span><p>2</p></div>
                <div className="att-box gray-bg"><span>Absent</span><p>1</p></div>
              </div>
            </div>

            <div className="rep-card">
              <div className="rep-card-header">
                <h3>Scholarships</h3>
                <MoreHorizontal size={20} className="text-gray" />
              </div>
              <div className="rep-scholarships-list">
                <div className="rep-scholarship-item">
                  <div className="rep-sch-icon blue"><Award size={16}/></div>
                  <div>
                    <h4>Global Young Achievers Award</h4>
                    <span>Finance</span>
                  </div>
                </div>
                <div className="rep-scholarship-item">
                  <div className="rep-sch-icon pink"><Award size={16}/></div>
                  <div>
                    <h4>STEM for Girls Initiative</h4>
                    <span>Enrichment</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rep-card">
              <div className="rep-card-header">
                <h3>Health & Medical Info</h3>
                <MoreHorizontal size={20} className="text-gray" />
              </div>
              <div className="rep-health-list">
                <div className="rep-health-item">
                  <span className="tag cyan-light">Medical Record</span>
                  <p>Routine health check completed Feb 2026 - Fit for activities</p>
                </div>
                <div className="rep-health-item">
                  <span className="tag pink-light">Allergy</span>
                  <p>Mild pollen allergy - medication prescribed.</p>
                </div>
                <div className="rep-health-item">
                  <span className="tag pink-light">Peanut Allergy</span>
                  <p>Severe reaction - strictly avoid exposure; EpiPen required.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Right */}
          <div className="rep-sd-col rep-sd-col-large">
            <div className="rep-card">
              <div className="rep-card-header">
                <h3>Academic Performance</h3>
                <div className="rep-dropdown">Last 6 Months <ChevronDown size={14}/></div>
              </div>
              <div className="rep-perf-wrapper">
                <div className="rep-perf-gauge">
                  <div className="gauge-chart">
                    <svg viewBox="0 0 100 50" className="gauge-svg">
                      <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#F1F5F9" strokeWidth="12" />
                      <path d="M 10 50 A 40 40 0 0 1 80 15" fill="none" stroke="#1E3A8A" strokeWidth="12" strokeLinecap="round" />
                    </svg>
                    <div className="gauge-text">
                      <h2>{selectedStudent?.gpa || '3.9'}<span>/4.0</span></h2>
                      <p>Average Score</p>
                    </div>
                  </div>
                  <p className="gauge-desc">{selectedStudent?.firstName || 'Isabella'} shows consistent excellence in her studies and leadership in group projects. Keep aiming high!</p>
                </div>
                <div className="rep-perf-bars">
                  <div className="bar-item"><div className="bar-fill pink-bg" style={{height: '90%'}}><span>90</span></div><p>Jan</p></div>
                  <div className="bar-item"><div className="bar-fill pink-bg" style={{height: '86%'}}><span>86</span></div><p>Feb</p></div>
                  <div className="bar-item"><div className="bar-fill pink-bg" style={{height: '85%'}}><span>85</span></div><p>Mar</p></div>
                  <div className="bar-item"><div className="bar-fill pink-bg" style={{height: '92%'}}><span>92</span></div><p>Apr</p></div>
                  <div className="bar-item"><div className="bar-fill pink-bg" style={{height: '95%'}}><span>95</span></div><p>May</p></div>
                  <div className="bar-item"><div className="bar-fill pink-bg" style={{height: '96%'}}><span>96</span></div><p>Jun</p></div>
                </div>
              </div>
            </div>

            <div className="rep-card">
              <div className="rep-card-header">
                <h3>Extracurricular</h3>
                <MoreHorizontal size={20} className="text-gray" />
              </div>
              <table className="rep-simple-table">
                <thead>
                  <tr>
                    <th>Club <ChevronDown size={12}/></th>
                    <th>Achievements <ChevronDown size={12}/></th>
                    <th>Duration <ChevronDown size={12}/></th>
                    <th>Advisor <ChevronDown size={12}/></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="club-cell">
                        <div className="club-icon cyan-bg">🏊</div>
                        <div><p>Swimming</p><span>Team Member</span></div>
                      </div>
                    </td>
                    <td>Won 2 Silver Medals (City Meet)</td>
                    <td>2029 - Present</td>
                    <td>Coach Andrea V.</td>
                  </tr>
                  <tr>
                    <td>
                      <div className="club-cell">
                        <div className="club-icon pink-bg">💃</div>
                        <div><p>Dance</p><span>Lead Performer</span></div>
                      </div>
                    </td>
                    <td>Performed at National Festival</td>
                    <td>2030 - Present</td>
                    <td>Ms. Clara F.</td>
                  </tr>
                  <tr>
                    <td>
                      <div className="club-cell">
                        <div className="club-icon blue-bg">💻</div>
                        <div><p>Coding Club</p><span>Scratch Developer</span></div>
                      </div>
                    </td>
                    <td>1st Place in School Science Fair</td>
                    <td>2033 - Present</td>
                    <td>Mr. Daniel K.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="rep-card">
              <div className="rep-card-header">
                <h3>Behavior & Discipline Log</h3>
                <MoreHorizontal size={20} className="text-gray" />
              </div>
              <table className="rep-simple-table">
                <thead>
                  <tr>
                    <th>Date <ChevronDown size={12}/></th>
                    <th>Type & Details <ChevronDown size={12}/></th>
                    <th>Reported By <ChevronDown size={12}/></th>
                    <th>Status/Action <ChevronDown size={12}/></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Jan 10, 2026</td>
                    <td>
                      <div className="log-type">
                        <p>Positive Note</p>
                        <span>Helped classmates during group project</span>
                      </div>
                    </td>
                    <td>Ms. Lee Record</td>
                    <td><span className="status-badge gray">Record Recognition <ChevronDown size={12}/></span></td>
                  </tr>
                  <tr>
                    <td>Feb 02, 2026</td>
                    <td>
                      <div className="log-type">
                        <p>Positive Note</p>
                        <span>Volunteered in school event organization</span>
                      </div>
                    </td>
                    <td>Admin Office</td>
                    <td><span className="status-badge gray">Recognition Recorded</span></td>
                  </tr>
                  <tr>
                    <td>Feb 18, 2026</td>
                    <td>
                      <div className="log-type">
                        <p>Minor Issue</p>
                        <span>Late submission of homework</span>
                      </div>
                    </td>
                    <td>Mr. Maulla</td>
                    <td><span className="status-badge gray">Issue Warning <ChevronDown size={12}/></span></td>
                  </tr>
                  <tr>
                    <td>May 05, 2026</td>
                    <td>
                      <div className="log-type">
                        <p>Minor Issue</p>
                        <span>Absent without prior notice</span>
                      </div>
                    </td>
                    <td>Homeroom Teacher</td>
                    <td><span className="status-badge blue">Parent Notified</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStudents = () => {
    const generateStudents = () => {
      const yearNumber = parseInt(selectedYear.replace(/[^0-9]/g, '').slice(0, 4)) || 2025;
      
      let generatedList = [];
      const firstNames = ['Juan', 'Ana', 'Pedro', 'Maria', 'Jose', 'Carmen', 'Luis', 'Rosa', 'Miguel', 'Sofia', 'Ricardo', 'Elena', 'Diego', 'Lucia', 'Carlos', 'Teresa', 'Eduardo', 'Isabella', 'Javier', 'Valeria'];
      const lastNames = ['Dela Cruz', 'Santos', 'Reyes', 'Cruz', 'Bautista', 'Ocampo', 'Garcia', 'Mendoza', 'Aquino', 'Navarro', 'Torres', 'Ramos', 'Gomez', 'Lopez', 'Diaz', 'Rojas'];
      
      filteredClassrooms.forEach((cls, clsIdx) => {
        const stableIdx = globalClassrooms.findIndex(c => c.gradeLevel === cls.gradeLevel && c.section === cls.section);
        const gIdx = stableIdx >= 0 ? stableIdx : clsIdx;
        
        for (let i = 0; i < 5; i++) {
          const hash = yearNumber + gIdx * 13 + i * 7;
          const firstName = firstNames[hash % firstNames.length];
          const lastName = lastNames[(hash * 3) % lastNames.length];
          
          const gpa = (Math.min(4.0, Math.max(2.0, 3.0 + Math.sin(hash) * 1.0))).toFixed(1);
          const attendance = Math.floor(75 + (hash % 25));
          const status = hash % 15 === 0 ? 'On Leave' : 'Active';
          
          generatedList.push({
            studentId: `S-${yearNumber}-${gIdx + 1}${i.toString().padStart(2, '0')}`,
            firstName: firstName,
            lastName: lastName,
            gradeLevel: cls.gradeLevel,
            section: String(cls.section || 'Section 1'),
            gpa: gpa,
            status: status,
            attendance: `${attendance}%`
          });
        }
      });
      
      return generatedList;
    };

    const dbStudentsMapped = (data?.students || [])
      .filter(s => {
        const gradeMatch = selectedGrade === 'All Grades' || s.gradeLevel === selectedGrade;
        const sectionMatch = selectedSection === 'All Sections' || s.section === selectedSection;
        return gradeMatch && sectionMatch;
      })
      .map(s => {
        const nameParts = (s.name || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        return {
          studentId: s.id,
          firstName: firstName,
          lastName: lastName,
          gradeLevel: s.gradeLevel,
          section: s.section,
          gpa: s.gpa || '3.5',
          status: s.status || 'Active',
          attendance: s.attendanceRate || '95%',
          parentName: s.parentName,
          parentPhone: s.parentPhone,
          address: s.address,
          gender: s.gender,
          lrn: s.lrn,
          isDb: true
        };
      });

    const generated = generateStudents();
    const allStudents = [...dbStudentsMapped];
    generated.forEach(st => {
      if (!allStudents.some(cs => cs.studentId === st.studentId || (cs.firstName === st.firstName && cs.lastName === st.lastName))) {
        allStudents.push(st);
      }
    });

    // Apply status overrides for mock students
    allStudents.forEach(st => {
      if (studentStatusOverrides[st.studentId]) {
        st.status = studentStatusOverrides[st.studentId];
      }
    });

    // Apply search query and status filter
    const filteredStudents = allStudents.filter(st => {
      if (deletedStudentIds.includes(st.studentId)) return false;

      const fullName = `${st.firstName} ${st.lastName}`.toLowerCase();
      const idMatch = (st.studentId || '').toLowerCase().includes(studentSearchQuery.toLowerCase());
      const nameMatch = fullName.includes(studentSearchQuery.toLowerCase());
      const classMatch = `${st.gradeLevel} - ${st.section}`.toLowerCase().includes(studentSearchQuery.toLowerCase());
      
      const searchMatch = studentSearchQuery === '' || idMatch || nameMatch || classMatch;
      const statusMatch = studentStatusFilter === 'All' || st.status === studentStatusFilter;
      
      return searchMatch && statusMatch;
    });

    const itemsPerPage = 10;
    const totalItems = filteredStudents.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    const currentPage = Math.min(studentCurrentPage, totalPages);
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

    const getPerformance = (gpa) => {
      const num = parseFloat(gpa);
      if (isNaN(num)) return { label: 'Good', color: 'cyan' };
      if (num >= 3.0) return { label: 'Good', color: 'cyan' };
      if (num >= 2.5) return { label: 'Needs Support', color: 'pink' };
      return { label: 'At Risk', color: 'pink' };
    };

    const enrollmentTrendsData = enrollmentTrendsFromDb();

    const topClasses = globalClassrooms;
    const boxColors = ['cyan', 'blue', 'pink'];
    const hexColors = ['#06B6D4', '#1E3A8A', '#FB7185'];

    return (
      <div className="rep-content-scroll">
        <div className="rep-content-grid-students">
          
          <div className="rep-students-main-column">
            <div className="rep-students-top-row">
              <div className="rep-students-stats-grid">
                <div className="rep-student-stat-box large">
                  <div className="rep-stat-info">
                    <span className="rep-stat-value text-cyan">{totalStudents.toLocaleString()}</span>
                    <span className="rep-stat-label">Total Students</span>
                  </div>
                  <div className="rep-stat-icon pink">
                    <Users size={24} />
                  </div>
                </div>
                
                {topClasses.map((cls, i) => {
                  const numStr = cls.gradeLevel.replace(/grade\s*/i, '').replace(/kinder.*/i, 'K').trim();
                  return (
                    <div className="rep-student-stat-box" key={i}>
                      <div className="rep-stat-info">
                        <span className="rep-stat-value">{cls.enrollment || cls.studentCount || cls.bosyEnrollment || 0}</span>
                        <span className="rep-stat-label">{cls.gradeLevel} Students</span>
                      </div>
                      <div className={`rep-stat-icon-circle ${boxColors[i % 3]}`}>
                        <span>{numStr}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rep-card rep-chart-card">
                <div className="rep-card-header">
                  <h3>Academic Performance</h3>

                </div>
                <div className="rep-chart-legend">
                  {computedPerf.labels.map((lbl, idx) => (
                    <span className="legend-item" key={idx}>
                      <span className="dot" style={{ backgroundColor: computedPerf.colors[idx] }}></span> {lbl}
                    </span>
                  ))}
                </div>
                <div className="rep-chart-container" style={{height: 180}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={computedPerf.data.slice(0, 6)} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barSize={12}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748B'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748B'}} tickFormatter={(value) => `${value}%`} />
                      <Tooltip cursor={{fill: 'transparent'}} />
                      {computedPerf.grades.map((g, idx) => (
                        <Bar 
                          dataKey={g} 
                          stackId="a" 
                          fill={computedPerf.colors[idx]} 
                          key={idx} 
                          radius={idx === computedPerf.grades.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} 
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="rep-card rep-students-table-card">
              <div className="rep-card-header" style={{ marginBottom: '16px' }}>
                <h3>Students</h3>
                <div className="rep-table-actions">
                  <div className="rep-search-box-small">
                    <Search size={14} className="rep-search-icon" />
                    <input 
                      type="text" 
                      placeholder="Search for a student" 
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                    />
                  </div>
                  <button className="rep-icon-btn-small"><Settings size={14}/></button>
                  <div className="rep-dropdown" style={{ position: 'relative' }}>
                    <select
                      value={studentStatusFilter}
                      onChange={(e) => setStudentStatusFilter(e.target.value)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'inherit',
                        fontFamily: 'inherit',
                        fontSize: 'inherit',
                        fontWeight: 'inherit',
                        outline: 'none',
                        cursor: 'pointer',
                        paddingRight: '16px',
                        appearance: 'none',
                        WebkitAppearance: 'none'
                      }}
                    >
                      <option value="All" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>All Status</option>
                      <option value="Active" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Active</option>
                      <option value="Enrolled" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Enrolled</option>
                      <option value="Dropped" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Dropped</option>
                      <option value="On Leave" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>On Leave</option>
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                  <button className="rep-btn-pink-small" onClick={() => { setShowAddStudentModal(true); setAddStudentSuccess(false); }}>+ Add Student</button>
                </div>
              </div>
              
              <div className="rep-table-responsive">
                <table className="rep-table">
                  <thead>
                    <tr>
                      <th>Student <ChevronDown size={12}/></th>
                      <th>Class <ChevronDown size={12}/></th>
                      <th>GPA <ChevronDown size={12}/></th>
                      <th>Performance <ChevronDown size={12}/></th>
                      <th>Attendance <ChevronDown size={12}/></th>
                      <th>Status <ChevronDown size={12}/></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStudents.map((st, i) => {
                      const perf = getPerformance(st.gpa || (Math.random() * 2 + 2).toFixed(1));
                      const gpa = st.gpa || (Math.random() * 2 + 2).toFixed(1);
                      const att = st.attendance || `${Math.floor(Math.random() * 30 + 70)}%`;
                      const stat = st.status || 'Active';
                      return (
                      <tr key={st.studentId || i} onClick={() => setSelectedStudent(st)} style={{cursor: 'pointer'}}>
                        <td>
                          <div className="rep-table-user">
                            <img src={`https://api.dicebear.com/7.x/micah/svg?seed=${st.studentId || i}&backgroundColor=transparent`} alt="avatar" />
                            <div>
                              <p>{st.firstName} {st.lastName}</p>
                              <span>{st.studentId}</span>
                            </div>
                          </div>
                        </td>
                        <td>{st.gradeLevel} - {st.section}</td>
                        <td className={`font-semibold text-${parseFloat(gpa) > 3 ? 'cyan' : 'pink'}`}>{gpa}</td>
                        <td>
                          <div className="rep-perf-badge">
                            <span className={`dot ${perf.color}`}></span> {perf.label}
                          </div>
                        </td>
                        <td>{att}</td>
                        <td>
                          <span className={`rep-status-pill ${stat === 'Dropped' ? 'pink' : stat === 'Enrolled' ? 'cyan' : stat === 'Active' ? 'cyan' : 'blue'}`}>{stat}</span>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
              <div className="rep-pagination">
                <span>Show <select disabled><option>10</option></select> of {totalItems} results</span>
                <div className="rep-page-numbers">
                  <button 
                    className="rep-page-btn" 
                    onClick={() => setStudentCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    <ChevronLeft size={14}/>
                  </button>
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(page => (
                    <button 
                      key={page}
                      className={`rep-page-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setStudentCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button 
                    className="rep-page-btn" 
                    onClick={() => setStudentCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                  >
                    <ChevronRight size={14}/>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="rep-students-right-column">
            
            <div className="rep-card">
              <div className="rep-card-header">
                <h3>Enrollment Trends</h3>
                <div className="rep-dropdown">Last 5 Years <ChevronDown size={14}/></div>
              </div>
              <div className="rep-chart-container" style={{height: 180}}>
                {isChartReady ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={enrollmentTrendsData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                        <filter id="chartGlow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid-color)" opacity={0.3} />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'var(--text-gray)'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'var(--text-gray)'}} tickFormatter={(val) => val === 0 ? '0' : `${(val/1000).toFixed(1)}K`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" filter="url(#chartGlow)" isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="rep-chart-skeleton" />
                )}
              </div>
            </div>

            <div className="rep-card">
              <div className="rep-card-header">
                <h3>Attendance Overview</h3>
                <div className="rep-dropdown">This Week <ChevronDown size={14}/></div>
              </div>
              <div className="rep-chart-container" style={{height: 140, marginTop: '1rem'}}>
                {isChartReady ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dynamicAttendanceData()} margin={{ top: 25, right: 0, left: 0, bottom: 0 }} barSize={30}>
                      <defs>
                        <linearGradient id="attendanceGrad2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#F472B6" stopOpacity={0.95}/>
                          <stop offset="100%" stopColor="#EC4899" stopOpacity={0.25}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'var(--text-gray)'}} />
                      <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                      <Bar dataKey="present" fill="url(#attendanceGrad2)" radius={[6, 6, 0, 0]} background={{ fill: 'var(--chart-bg-track)', radius: [6, 6, 0, 0] }} isAnimationActive={true} animationDuration={1200} animationEasing="ease-out">
                        <LabelList dataKey="present" position="top" fill="var(--text-gray)" fontSize={10} fontWeight={500} formatter={(v) => v.toLocaleString()} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="rep-chart-skeleton" />
                )}
              </div>
            </div>

            <div className="rep-card">
              <div className="rep-card-header">
                <h3>Special Programs</h3>
                <MoreHorizontal size={20} className="text-gray" />
              </div>
              <div className="rep-special-programs">
                <div className="rep-program-item">
                  <img src="https://api.dicebear.com/7.x/micah/svg?seed=fatima&backgroundColor=transparent" alt="Fatima" />
                  <div className="rep-program-user">
                    <h4>Fatima Noor</h4>
                    <span>S-2003 • 7C</span>
                  </div>
                  <div className="rep-program-info">
                    <span className="rep-prog-type text-cyan">Enrichment</span>
                    <span className="rep-prog-name">Community Leadership Fellowship</span>
                  </div>
                </div>
                <div className="rep-program-item">
                  <img src="https://api.dicebear.com/7.x/micah/svg?seed=alicia&backgroundColor=transparent" alt="Alicia" />
                  <div className="rep-program-user">
                    <h4>Alicia Gomez</h4>
                    <span>S-2001 • 9B</span>
                  </div>
                  <div className="rep-program-info">
                    <span className="rep-prog-type text-pink">Academic Support</span>
                    <span className="rep-prog-name">National Science Scholarship</span>
                  </div>
                </div>
                <div className="rep-program-item">
                  <img src="https://api.dicebear.com/7.x/micah/svg?seed=daniel&backgroundColor=transparent" alt="Daniel" />
                  <div className="rep-program-user">
                    <h4>Daniel Park</h4>
                    <span>S-2002 • 8A</span>
                  </div>
                  <div className="rep-program-info">
                    <span className="rep-prog-type text-cyan">Finance + Enrichment</span>
                    <span className="rep-prog-name">Student Athlete Sponsorship</span>
                  </div>
                </div>
                <div className="rep-program-item">
                  <img src="https://api.dicebear.com/7.x/micah/svg?seed=leo&backgroundColor=transparent" alt="Leo" />
                  <div className="rep-program-user">
                    <h4>Leo Ricci</h4>
                    <span>S-2004 • 9C</span>
                  </div>
                  <div className="rep-program-info">
                    <span className="rep-prog-type text-cyan">Enrichment</span>
                    <span className="rep-prog-name">Arts & Creative Talent Grant</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  };

  const renderTeachers = () => {
    // Get teachers registered in users list
    const usersTeachers = data?.users?.filter(u => u.role === 'Teacher') || [];

    // Create a base template list of teachers for rich mock data
    const baseTeacherCatalog = [
      { id: 'T-1001', name: 'Argen Maulle', subject: 'Mathematics', phone: '+62 123 456 7890', email: 'argen.maulle@studixschool.org', address: '14 Via Milano, Rome, Italy', department: 'Mathematics', type: 'Full-Time' },
      { id: 'T-1002', name: 'Bella Cruz', subject: 'Social Studies - Civics', phone: '+62 234 567 8901', email: 'bella.cruz@studixschool.org', address: '15 Via Torino, Rome, Italy', department: 'Arts', type: 'Full-Time' },
      { id: 'T-1003', name: 'Cliff Villiam', subject: 'English Language', phone: '+62 811 5567 2345', email: 'cliff.villiam@studixschool.org', address: '221B Baker Street, London, UK', department: 'English', type: 'Full-Time' },
      { id: 'T-1004', name: 'Dariah Ahmed', subject: 'History', phone: '+62 345 678 9012', email: 'dariah.ahmed@studixschool.org', address: '16 Via Roma, Rome, Italy', department: 'Arts', type: 'Part-Time' },
      { id: 'T-1005', name: 'Esteban Perez', subject: 'Arts - Visual Arts', phone: '+62 456 789 0123', email: 'esteban.perez@studixschool.org', address: '17 Via Firenze, Rome, Italy', department: 'Arts', type: 'Part-Time' },
      { id: 'T-1006', name: 'Francesca Gill', subject: 'Physical Education', phone: '+62 567 890 1234', email: 'francesca.gill@studixschool.org', address: '18 Via Napoli, Rome, Italy', department: 'Physical Ed', type: 'Full-Time' },
      { id: 'T-1007', name: 'George Abraham', subject: 'Mathematics - Algebra', phone: '+62 678 901 2345', email: 'george.abraham@studixschool.org', address: '19 Via Venezia, Rome, Italy', department: 'Mathematics', type: 'Substitute' },
      { id: 'T-1008', name: 'Hellan Martinez', subject: 'Science - Biology', phone: '+62 789 012 3456', email: 'hellan.martinez@studixschool.org', address: '20 Via Genova, Rome, Italy', department: 'Science', type: 'Full-Time' }
    ];

    // Map user teachers to catalog structure
    const mappedUsersTeachers = usersTeachers.map((ut, idx) => ({
      id: ut.id || `T-USER-${idx}`,
      name: ut.name,
      subject: ut.subject || (ut.gradeLevel === 'Grade 1' ? 'General Education' : 'Mathematics'),
      phone: ut.phone || '+62 987 654 3210',
      email: ut.email || `${ut.username || ut.name.toLowerCase().replace(/\s+/g, '')}@studixschool.org`,
      address: ut.address || 'Valdez Elementary School, PH',
      department: ut.department || (ut.gradeLevel === 'Grade 1' ? 'English' : 'Science'),
      gradeLevel: ut.gradeLevel,
      section: ut.section,
      type: 'Full-Time',
      isDb: true
    }));

    // Merge registered teachers and catalog teachers
    const combinedTeachers = [...mappedUsersTeachers];
    baseTeacherCatalog.forEach(bt => {
      if (!combinedTeachers.some(ct => ct.name === bt.name)) {
        combinedTeachers.push(bt);
      }
    });

    // Filter teachers based on selected grade and section
    const teacherList = combinedTeachers.filter(t => {
      if (deletedTeacherIds.includes(t.id)) return false;

      // If it is a registered teacher with grade assignments
      if (t.gradeLevel) {
        const gradeMatch = selectedGrade === 'All Grades' || t.gradeLevel === selectedGrade;
        const sectionMatch = selectedSection === 'All Sections' || t.section === selectedSection;
        return gradeMatch && sectionMatch;
      }
      
      // Distribute fallback catalog teachers dynamically so the filter responds beautifully
      const hash = t.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      const uniqueGrades = globalClassrooms.length > 0 ? [...new Set(globalClassrooms.map(c => c.gradeLevel))] : ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];
      const assignedGradeIndex = hash % uniqueGrades.length;
      const assignedGrade = uniqueGrades[assignedGradeIndex] || 'Grade 1';
      
      if (selectedGrade !== 'All Grades') {
        return assignedGrade === selectedGrade;
      }
      return true;
    });

    // Make statistics dynamic based on teacherList
    const activeTeachersCount = teacherList.length;

    // Count departments dynamically from teacherList
    const deptCounts = {};
    teacherList.forEach(t => {
      const dept = t.department || 'Mathematics';
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });

    const departmentColors = {
      'Science': '#3B82F6',
      'Mathematics': '#10B981',
      'English': '#EC4899',
      'Arts': '#8B5CF6',
      'Physical Ed': '#F59E0B'
    };

    const departmentData = Object.keys(deptCounts).map(dept => ({
      name: dept,
      value: deptCounts[dept],
      color: departmentColors[dept] || '#64748B'
    }));

    const attendanceData = [
      { name: 'Mon', present: Math.round(activeTeachersCount * 0.93), late: Math.round(activeTeachersCount * 0.07) },
      { name: 'Tue', present: Math.round(activeTeachersCount * 0.95), late: Math.round(activeTeachersCount * 0.05) },
      { name: 'Wed', present: Math.round(activeTeachersCount * 0.98), late: Math.round(activeTeachersCount * 0.02) },
      { name: 'Thu', present: Math.round(activeTeachersCount * 0.96), late: Math.round(activeTeachersCount * 0.04) },
      { name: 'Fri', present: Math.round(activeTeachersCount * 0.91), late: Math.round(activeTeachersCount * 0.09) },
    ];

    const workloadData = [
      { name: 'Mon', classes: Math.round(activeTeachersCount * 0.4), hours: Math.round(activeTeachersCount * 0.5), extra: Math.round(activeTeachersCount * 0.1) },
      { name: 'Tue', classes: Math.round(activeTeachersCount * 0.3), hours: Math.round(activeTeachersCount * 0.4), extra: Math.round(activeTeachersCount * 0.2) },
      { name: 'Wed', classes: Math.round(activeTeachersCount * 0.5), hours: Math.round(activeTeachersCount * 0.6), extra: Math.round(activeTeachersCount * 0.1) },
      { name: 'Thu', classes: Math.round(activeTeachersCount * 0.4), hours: Math.round(activeTeachersCount * 0.5), extra: Math.round(activeTeachersCount * 0.2) },
      { name: 'Fri', classes: Math.round(activeTeachersCount * 0.2), hours: Math.round(activeTeachersCount * 0.3), extra: Math.round(activeTeachersCount * 0.3) },
    ];

    return (
      <div className="rep-content-scroll">
        <div className="rep-content-grid-students">
          <div className="rep-students-main-column">
            <div className="rep-students-stats-grid">
              <div className="rep-student-stat-box">
                <div className="rep-stat-info">
                  <span className="rep-stat-label">Total Teachers</span>
                  <span className="rep-stat-value">{activeTeachersCount}</span>
                </div>
                <div className="rep-stat-icon-circle blue"><Briefcase size={18}/></div>
              </div>
              <div className="rep-student-stat-box">
                <div className="rep-stat-info">
                  <span className="rep-stat-label">Full-Time Teacher</span>
                  <span className="rep-stat-value">{teacherList.filter(t => t.type === 'Full-Time').length}</span>
                </div>
                <div className="rep-stat-icon-circle cyan"><Briefcase size={18}/></div>
              </div>
              <div className="rep-student-stat-box">
                <div className="rep-stat-info">
                  <span className="rep-stat-label">Part-Time Teacher</span>
                  <span className="rep-stat-value">{teacherList.filter(t => t.type === 'Part-Time').length}</span>
                </div>
                <div className="rep-stat-icon-circle pink"><Briefcase size={18}/></div>
              </div>
              <div className="rep-student-stat-box">
                <div className="rep-stat-info">
                  <span className="rep-stat-label">Substitute Teacher</span>
                  <span className="rep-stat-value">{teacherList.filter(t => t.type === 'Substitute').length}</span>
                </div>
                <div className="rep-stat-icon-circle" style={{backgroundColor: '#F1F5F9', color: '#64748B'}}><Briefcase size={18}/></div>
              </div>
            </div>

            <div className="rep-card">
              <div className="rep-card-header" style={{ marginBottom: '16px' }}>
                <h3>Teachers</h3>
                <div className="rep-table-actions">
                  <div className="rep-search-box-small">
                    <Search size={14} className="rep-search-icon" />
                    <input type="text" placeholder="Search teacher" />
                  </div>
                  <button className="rep-btn-pink-small" onClick={() => { setShowAddTeacherModal(true); setAddTeacherSuccess(false); }}>+ Add Teacher</button>
                </div>
              </div>
              
              <div className="rep-teacher-cards-grid">
                {teacherList.map((t, i) => (
                  <div key={i} className="rep-teacher-card" onClick={() => setSelectedTeacher(t)}>
                    <div className="rep-teacher-card-top">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.name}&backgroundColor=b6e3f4`} alt={t.name} style={{ borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }} />
                      <div className="rep-teacher-card-info">
                        <h4>{t.name}</h4>
                        <p>{t.id} &bull; {t.subject}</p>
                      </div>
                    </div>
                    <div className="rep-teacher-card-details">
                      <div className="rep-teacher-detail-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        <span>{t.phone}</span>
                      </div>
                      <div className="rep-teacher-detail-item">
                        <Mail size={14} />
                        <span>{t.email}</span>
                      </div>
                      <div className="rep-teacher-detail-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        <span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{t.address}</span>
                      </div>
                    </div>
                    <div className="rep-teacher-card-actions" style={{ display: 'flex', gap: '8px' }}>
                      <button className="rep-teacher-btn" onClick={(e) => { e.stopPropagation(); }}><Mail size={14}/> Message</button>
                      <button 
                        className="rep-teacher-btn-danger" 
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          transition: 'background-color 0.2s'
                        }}
                        onClick={(e) => { e.stopPropagation(); handleDeleteTeacher(t); }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                      >
                        <Trash2 size={12}/> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rep-pagination" style={{marginTop: '20px'}}>
                <span>Show <select><option>{teacherList.length}</option></select> of {activeTeachersCount} results</span>
                <div className="rep-page-numbers">
                  <button className="rep-page-btn"><ChevronLeft size={14}/></button>
                  <button className="rep-page-btn active">1</button>
                  <button className="rep-page-btn">2</button>
                  <button className="rep-page-btn">3</button>
                  <button className="rep-page-btn">5</button>
                  <button className="rep-page-btn"><ChevronRight size={14}/></button>
                </div>
              </div>
            </div>
          </div>

          <div className="rep-students-right-column">
            <div className="rep-card">
              <div className="rep-card-header">
                <h3>Department</h3>
                <MoreHorizontal size={20} className="text-gray" />
              </div>
              <div className="rep-donut-container">
                {isChartReady ? (
                  <>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={departmentData} innerRadius={40} outerRadius={70} paddingAngle={2} cornerRadius={4} dataKey="value" stroke="var(--bg-panel)" strokeWidth={3} isAnimationActive={true} animationDuration={1200} animationEasing="ease-out">
                          {departmentData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="rep-donut-center">
                      <span className="rep-donut-total">{activeTeachersCount}</span>
                      <span style={{fontSize: 10, color: 'var(--text-gray)'}}>Total Teachers</span>
                    </div>
                  </>
                ) : (
                  <div className="rep-chart-skeleton" style={{height: 160}} />
                )}
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px'}}>
                {departmentData.map((d, i) => (
                  <div key={i} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <div className="dot" style={{backgroundColor: d.color}}></div>
                      <span>{d.name}</span>
                    </div>
                    <div style={{display: 'flex', gap: '16px', color: 'var(--text-gray)'}}>
                      <span>{d.value}</span>
                      <span>{activeTeachersCount > 0 ? Math.round((d.value / activeTeachersCount) * 100) : 0}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rep-card">
              <div className="rep-card-header">
                <h3>Attendance Overview</h3>
                <div className="rep-dropdown">Weekly <ChevronDown size={14}/></div>
              </div>
              <div className="rep-chart-container" style={{height: 140, marginTop: '1rem'}}>
                {isChartReady ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={attendanceData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <filter id="chartGlow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid-color)" opacity={0.3} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'var(--text-gray)'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'var(--text-gray)'}} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="present" stroke="#3B82F6" strokeWidth={3} filter="url(#chartGlow)" dot={{r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: 'var(--bg-panel)'}} activeDot={{ r: 6, strokeWidth: 0 }} isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="rep-chart-skeleton" />
                )}
              </div>
            </div>

            <div className="rep-card">
              <div className="rep-card-header">
                <h3>Workload Distribution</h3>
                <MoreHorizontal size={20} className="text-gray" />
              </div>
              <div className="rep-chart-legend" style={{marginBottom: '8px'}}>
                <span className="legend-item"><span className="dot blue"></span> Total Classes</span>
                <span className="legend-item"><span className="dot cyan"></span> Teaching Hours</span>
                <span className="legend-item"><span className="dot pink"></span> Extra Duties</span>
              </div>
              <div className="rep-chart-container" style={{height: 160}}>
                {isChartReady ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={workloadData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barSize={12}>
                      <defs>
                        <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.95}/>
                          <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.25}/>
                        </linearGradient>
                        <linearGradient id="gradTeal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.95}/>
                          <stop offset="100%" stopColor="#0891B2" stopOpacity={0.25}/>
                        </linearGradient>
                        <linearGradient id="gradRose" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.95}/>
                          <stop offset="100%" stopColor="#BE123C" stopOpacity={0.25}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid-color)" opacity={0.3} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'var(--text-gray)'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'var(--text-gray)'}} />
                      <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.03)'}} />
                      <Bar dataKey="classes" stackId="a" fill="url(#gradBlue)" isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" />
                      <Bar dataKey="hours" stackId="a" fill="url(#gradTeal)" isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" />
                      <Bar dataKey="extra" stackId="a" fill="url(#gradRose)" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="rep-chart-skeleton" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTeacherDetails = () => {
    const workloadArea = [
      { name: 'Jul', classes: 20, hours: 25, extra: 5 },
      { name: 'Aug', classes: 40, hours: 35, extra: 8 },
      { name: 'Sep', classes: 60, hours: 45, extra: 15 },
      { name: 'Oct', classes: 80, hours: 55, extra: 20 },
      { name: 'Nov', classes: 90, hours: 65, extra: 25 },
      { name: 'Dec', classes: 110, hours: 85, extra: 30 },
      { name: 'Jan', classes: 130, hours: 110, extra: 35 },
      { name: 'Feb', classes: 140, hours: 134, extra: 32 }
    ];

    return (
      <div className="rep-modal-overlay" onClick={() => { setSelectedTeacher(null); setIsEditingTeacher(false); }}>
        <div className="rep-modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="rep-modal-header">
            <h2>Teacher Details</h2>
            <button className="rep-modal-close" onClick={() => { setSelectedTeacher(null); setIsEditingTeacher(false); }}>
              <X size={24} />
            </button>
          </div>
          <div className="rep-modal-content">
            <div className="rep-student-details-grid">
          
          {/* Column 1: Profile & Info */}
          <div className="rep-sd-col">
            <div className="rep-card text-center rep-profile-card">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedTeacher?.name || 'T'}&backgroundColor=b6e3f4`} alt="Teacher" className="rep-profile-img" style={{borderRadius: '50%'}} />
              <h2>{selectedTeacher?.name || 'Cliff Villiam'}</h2>
              <div className="rep-profile-tags">
                <span className="tag-outline">{selectedTeacher?.id || 'T-1003'}</span>
                <span className="rep-status-pill blue">{selectedTeacher?.type || 'Full-Time'}</span>
              </div>

              {/* Edit / Save / Cancel buttons */}
              {!isEditingTeacher ? (
                <button
                  style={{
                    marginTop: '16px', backgroundColor: '#3B82F6', color: 'white', border: 'none',
                    padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600',
                    display: 'inline-flex', alignItems: 'center', gap: '8px', width: '100%',
                    justifyContent: 'center', transition: 'background-color 0.2s'
                  }}
                  onClick={() => handleEditTeacher(selectedTeacher)}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <Edit size={16} /> Edit Teacher Details
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px', width: '100%' }}>
                  <button
                    style={{
                      flex: 1, backgroundColor: '#059669', color: 'white', border: 'none',
                      padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600',
                      display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'center',
                      opacity: editTeacherLoading ? 0.6 : 1
                    }}
                    onClick={handleSaveTeacher}
                    disabled={editTeacherLoading}
                  >
                    <Check size={16} /> {editTeacherLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    style={{
                      flex: 1, backgroundColor: '#6B7280', color: 'white', border: 'none',
                      padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600',
                      display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'center'
                    }}
                    onClick={() => setIsEditingTeacher(false)}
                  >
                    <X size={16} /> Cancel
                  </button>
                </div>
              )}

              <button 
                className="rep-btn-danger" 
                style={{
                  marginTop: '8px', backgroundColor: '#ef4444', color: 'white', border: 'none',
                  padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600',
                  display: 'inline-flex', alignItems: 'center', gap: '8px', width: '100%',
                  justifyContent: 'center', transition: 'background-color 0.2s'
                }}
                onClick={() => handleDeleteTeacher(selectedTeacher)}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
              >
                <Trash2 size={16} /> Remove Teacher completely
              </button>
              
              {(() => {
                const teachEditStyle = {
                  width: '100%', padding: '6px 10px', borderRadius: '6px',
                  border: '1px solid var(--border-color)', background: 'var(--bg-secondary)',
                  color: 'var(--text-dark)', fontSize: '13px', fontFamily: 'inherit', outline: 'none',
                };
                return (
                  <>
                    <div className="rep-info-list" style={{borderBottom: '1px solid var(--border-color)', paddingBottom: '16px'}}>
                      {isEditingTeacher ? (
                        <>
                          <div className="rep-info-item">
                            <span>Full Name</span>
                            <input style={teachEditStyle} value={editTeacherForm.name || ''} onChange={(e) => setEditTeacherForm({...editTeacherForm, name: e.target.value})} />
                          </div>
                          <div className="rep-info-item">
                            <span>Subject</span>
                            <input style={teachEditStyle} value={editTeacherForm.subject || ''} onChange={(e) => setEditTeacherForm({...editTeacherForm, subject: e.target.value})} />
                          </div>
                          <div className="rep-info-item">
                            <span>Grade Level</span>
                            <select style={teachEditStyle} value={editTeacherForm.gradeLevel || ''} onChange={(e) => setEditTeacherForm({...editTeacherForm, gradeLevel: e.target.value})}>
                              <option value="">Select</option>
                              <option value="Kinder">Kinder</option>
                              <option value="Grade 1">Grade 1</option>
                              <option value="Grade 2">Grade 2</option>
                              <option value="Grade 3">Grade 3</option>
                              <option value="Grade 4">Grade 4</option>
                              <option value="Grade 5">Grade 5</option>
                              <option value="Grade 6">Grade 6</option>
                            </select>
                          </div>
                          <div className="rep-info-item">
                            <span>Section</span>
                            <input style={teachEditStyle} value={editTeacherForm.section || ''} onChange={(e) => setEditTeacherForm({...editTeacherForm, section: e.target.value})} />
                          </div>
                          <div className="rep-info-item">
                            <span>Type</span>
                            <select style={teachEditStyle} value={editTeacherForm.type || 'Full-Time'} onChange={(e) => setEditTeacherForm({...editTeacherForm, type: e.target.value})}>
                              <option value="Full-Time">Full-Time</option>
                              <option value="Part-Time">Part-Time</option>
                              <option value="Substitute">Substitute</option>
                            </select>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="rep-info-item">
                            <span>Subject</span>
                            <p>{selectedTeacher?.subject || 'General Education'}</p>
                          </div>
                          <div className="rep-info-item">
                            <span>Class</span>
                            <p>{selectedTeacher?.gradeLevel ? `${selectedTeacher.gradeLevel} - ${selectedTeacher.section || 'N/A'}` : 'N/A'}</p>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="rep-card-header" style={{marginTop: '24px', marginBottom: '8px', width: '100%'}}>
                      <h3 style={{fontSize: '14px', color: 'var(--text-dark)'}}>Personal Info</h3>
                      <MoreHorizontal size={16} className="text-gray" />
                    </div>
                    <div className="rep-info-list no-border">
                      {isEditingTeacher ? (
                        <>
                          <div className="rep-info-item">
                            <span>Email Address</span>
                            <input style={teachEditStyle} value={editTeacherForm.email || ''} onChange={(e) => setEditTeacherForm({...editTeacherForm, email: e.target.value})} />
                          </div>
                          <div className="rep-info-item">
                            <span>Phone Number</span>
                            <input style={teachEditStyle} value={editTeacherForm.phone || ''} onChange={(e) => setEditTeacherForm({...editTeacherForm, phone: e.target.value})} />
                          </div>
                          <div className="rep-info-item">
                            <span>Address</span>
                            <input style={teachEditStyle} value={editTeacherForm.address || ''} onChange={(e) => setEditTeacherForm({...editTeacherForm, address: e.target.value})} />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="rep-info-item">
                            <span>Email Address</span>
                            <p>{selectedTeacher?.email || 'N/A'}</p>
                          </div>
                          <div className="rep-info-item">
                            <span>Phone Number</span>
                            <p>{selectedTeacher?.phone || 'N/A'}</p>
                          </div>
                          <div className="rep-info-item">
                            <span>Address</span>
                            <p>{selectedTeacher?.address || 'Valdez Elementary School, PH'}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="rep-card">
              <div className="rep-card-header">
                <h3>Documents & Compliance</h3>
                <MoreHorizontal size={20} className="text-gray" />
              </div>
              <div className="rep-documents-list">
                <div className="rep-doc-item">
                  <div className="rep-doc-icon pink">PDF</div>
                  <div className="rep-doc-info">
                    <p>Employment_Contract_{selectedTeacher?.name?.replace(' ','_') || 'CliffVilliam'}.pdf</p>
                    <span>PDF • 2.4 MB</span>
                  </div>
                </div>
                <div className="rep-doc-item">
                  <div className="rep-doc-icon pink">PDF</div>
                  <div className="rep-doc-info">
                    <p>Certification_EnglishTeaching_C...</p>
                    <span>PDF • 1.8 MB</span>
                  </div>
                </div>
                <div className="rep-doc-item">
                  <div className="rep-doc-icon pink">PDF</div>
                  <div className="rep-doc-info">
                    <p>ID_Passport_{selectedTeacher?.name?.replace(' ','_') || 'CliffVilliam'}_T1003.pdf</p>
                    <span>PDF • 2.2 MB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Middle */}
          <div className="rep-sd-col">
            <div className="rep-card">
              <div className="rep-card-header">
                <h3>Workload Summary</h3>
                <div className="rep-dropdown">Last 8 months <ChevronDown size={14}/></div>
              </div>
              <div className="rep-chart-legend">
                <span className="legend-item"><span className="dot blue"></span> Total Classes</span>
                <span className="legend-item"><span className="dot cyan"></span> Teaching Hours</span>
                <span className="legend-item"><span className="dot pink"></span> Extra Duties</span>
              </div>
              
              <div className="rep-chart-container" style={{height: 220, marginTop: '1rem'}}>
                {isChartReady ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={workloadArea} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="workloadClasses" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.5}/>
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="workloadHours" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.5}/>
                          <stop offset="100%" stopColor="#06B6D4" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="workloadExtra" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.5}/>
                          <stop offset="100%" stopColor="#F43F5E" stopOpacity={0}/>
                        </linearGradient>
                        <filter id="chartGlow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid-color)" opacity={0.3} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'var(--text-gray)'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'var(--text-gray)'}} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="classes" stackId="1" stroke="#3B82F6" fill="url(#workloadClasses)" filter="url(#chartGlow)" isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" />
                      <Area type="monotone" dataKey="hours" stackId="1" stroke="#06B6D4" fill="url(#workloadHours)" filter="url(#chartGlow)" isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" />
                      <Area type="monotone" dataKey="extra" stackId="1" stroke="#F43F5E" fill="url(#workloadExtra)" filter="url(#chartGlow)" isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="rep-chart-skeleton" />
                )}
              </div>
            </div>

            <div className="rep-card">
              <div className="rep-card-header">
                <h3>Schedule</h3>
                <div className="rep-dropdown">Weekly <ChevronDown size={14}/></div>
              </div>
              <div className="rep-schedule-grid">
                <div className="rep-schedule-header">
                  <div>Time</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div>
                </div>
                <div className="rep-schedule-row">
                  <div className="rep-schedule-time">08:00<br/>09:00</div>
                  <div className="rep-schedule-cell"></div>
                  <div className="rep-schedule-cell"></div>
                  <div className="rep-schedule-cell"></div>
                  <div className="rep-schedule-cell"></div>
                  <div className="rep-schedule-cell"></div>
                </div>
                <div className="rep-schedule-row">
                  <div className="rep-schedule-time">09:00<br/>10:00</div>
                  <div className="rep-schedule-cell"><div className="rep-schedule-block cyan">8C</div></div>
                  <div className="rep-schedule-cell"></div>
                  <div className="rep-schedule-cell"><div className="rep-schedule-block blue">9A</div></div>
                  <div className="rep-schedule-cell"></div>
                  <div className="rep-schedule-cell"></div>
                </div>
                <div className="rep-schedule-row">
                  <div className="rep-schedule-time">10:00<br/>11:00</div>
                  <div className="rep-schedule-cell"></div>
                  <div className="rep-schedule-cell"><div className="rep-schedule-block cyan">8C</div></div>
                  <div className="rep-schedule-cell"></div>
                  <div className="rep-schedule-cell"><div className="rep-schedule-block pink">9B</div></div>
                  <div className="rep-schedule-cell"></div>
                </div>
                <div className="rep-schedule-row">
                  <div className="rep-schedule-time">11:00<br/>12:00</div>
                  <div className="rep-schedule-cell"></div>
                  <div className="rep-schedule-cell"></div>
                  <div className="rep-schedule-cell"><div className="rep-schedule-block cyan">8C</div></div>
                  <div className="rep-schedule-cell"></div>
                  <div className="rep-schedule-cell"></div>
                </div>
                <div className="rep-schedule-row">
                  <div className="rep-schedule-time">13:00<br/>14:00</div>
                  <div className="rep-schedule-cell"></div>
                  <div className="rep-schedule-cell"></div>
                  <div className="rep-schedule-cell"></div>
                  <div className="rep-schedule-cell"></div>
                  <div className="rep-schedule-cell"><div className="rep-schedule-block pink">9B</div></div>
                </div>
                <div className="rep-schedule-row">
                  <div className="rep-schedule-time">14:00<br/>15:00</div>
                  <div className="rep-schedule-cell"><div className="rep-schedule-block blue">9A</div></div>
                  <div className="rep-schedule-cell"></div>
                  <div className="rep-schedule-cell"></div>
                  <div className="rep-schedule-cell"><div className="rep-schedule-block cyan">8C</div></div>
                  <div className="rep-schedule-cell"></div>
                </div>
              </div>
            </div>

            <div className="rep-card">
              <div className="rep-card-header">
                <h3>Development & Training</h3>
                <div className="rep-dropdown">This Semester <ChevronDown size={14}/></div>
              </div>
              <div style={{overflowX: 'auto'}}>
                <table className="rep-simple-table">
                  <thead>
                    <tr>
                      <th style={{whiteSpace: 'nowrap'}}>Event <ChevronDown size={12}/></th>
                      <th style={{whiteSpace: 'nowrap'}}>Date <ChevronDown size={12}/></th>
                      <th style={{whiteSpace: 'nowrap'}}>Loc/Platform <ChevronDown size={12}/></th>
                      <th style={{whiteSpace: 'nowrap'}}>Status <ChevronDown size={12}/></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{minWidth: '120px'}}>Digital Learning Tools Training<br/><span style={{fontSize: 10, color: 'var(--text-gray)', whiteSpace: 'nowrap'}}>Training</span></td>
                      <td style={{whiteSpace: 'nowrap'}}><span className="text-cyan font-semibold">Apr 2, 2026</span></td>
                      <td style={{minWidth: '120px'}}>Zoom - International Education Network</td>
                      <td style={{whiteSpace: 'nowrap'}}><span className="status-badge gray">Upcoming</span></td>
                    </tr>
                    <tr>
                      <td style={{minWidth: '120px'}}>Classroom Management Certification<br/><span style={{fontSize: 10, color: 'var(--text-gray)', whiteSpace: 'nowrap'}}>Certification</span></td>
                      <td style={{whiteSpace: 'nowrap'}}><span className="text-cyan font-semibold">Feb 8, 2026</span></td>
                      <td style={{minWidth: '120px'}}>Cambridge University Online (UK)</td>
                      <td style={{whiteSpace: 'nowrap'}}><span className="status-badge blue">Completed</span></td>
                    </tr>
                    <tr>
                      <td style={{minWidth: '120px'}}>Advanced English Teaching Methods<br/><span style={{fontSize: 10, color: 'var(--text-gray)', whiteSpace: 'nowrap'}}>Workshop</span></td>
                      <td style={{whiteSpace: 'nowrap'}}><span className="text-cyan font-semibold">Jan 12, 2026</span></td>
                      <td style={{minWidth: '120px'}}>London, UK - British Council</td>
                      <td style={{whiteSpace: 'nowrap'}}><span className="status-badge blue">Completed</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Column 3: Right */}
          <div className="rep-sd-col">
            <div className="rep-card">
              <div className="rep-calendar-header">
                <h3>May 2026</h3>
                <div className="rep-cal-nav">
                  <button><ChevronLeft size={16}/></button>
                  <button><ChevronRight size={16}/></button>
                </div>
              </div>
              <div className="rep-calendar-grid">
                <div className="day-name">S</div><div className="day-name">M</div><div className="day-name">T</div><div className="day-name">W</div><div className="day-name">T</div><div className="day-name">F</div><div className="day-name">S</div>
                <div className="day prev-month">26</div><div className="day prev-month">27</div><div className="day prev-month">28</div><div className="day prev-month">29</div><div className="day prev-month">30</div><div className="day">1</div><div className="day">2</div>
                <div className="day">3</div><div className="day active-pink">4</div><div className="day">5</div><div className="day">6</div><div className="day">7</div><div className="day">8</div><div className="day">9</div>
                <div className="day">10</div><div className="day">11</div><div className="day">12</div><div className="day active-blue">13</div><div className="day">14</div><div className="day">15</div><div className="day">16</div>
                <div className="day">17</div><div className="day">18</div><div className="day">19</div><div className="day">20</div><div className="day">21</div><div className="day active-cyan">22</div><div className="day">23</div>
                <div className="day">24</div><div className="day">25</div><div className="day">26</div><div className="day">27</div><div className="day">28</div><div className="day">29</div><div className="day">30</div>
                <div className="day">31</div><div className="day next-month">1</div><div className="day next-month">2</div><div className="day next-month">3</div><div className="day next-month">4</div><div className="day next-month">5</div><div className="day next-month">6</div>
              </div>
              <div className="rep-attendance-summary" style={{justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', margin: '16px -24px 0', padding: '16px 24px 0'}}>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}><span>Present</span><p>11</p></div>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}><span>Late</span><p>4</p></div>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}><span>On Leave</span><p>2</p></div>
              </div>
            </div>

            <div className="rep-card">
              <div className="rep-card-header">
                <h3>Leave Request</h3>
                <MoreHorizontal size={20} className="text-gray" />
              </div>
              <div className="rep-leave-request">
                <span className="tag pink-light">Sick Leave</span>
                <p>Fever and medical rest advised by doctor</p>
                <div className="rep-leave-actions">
                  <button className="rep-btn-approve">Approve</button>
                  <button className="rep-btn-decline">Decline</button>
                </div>
              </div>
            </div>

            <div className="rep-card">
              <div className="rep-card-header">
                <h3>Performance</h3>
                <div className="rep-dropdown">Last Month <ChevronDown size={14}/></div>
              </div>
              <div className="rep-perf-bars-list">
                <div className="rep-perf-bar-item">
                  <div className="rep-perf-bar-header">
                    <span>Grading Timeliness</span>
                    <small>Excellent</small>
                  </div>
                  <div className="rep-perf-bar-bg">
                    <div className="rep-perf-bar-fill" style={{backgroundColor: '#06B6D4', width: '95%'}}></div>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '11px'}}>
                    <strong>95%</strong>
                    <span style={{color: 'var(--text-gray)'}}>90%</span>
                  </div>
                </div>

                <div className="rep-perf-bar-item">
                  <div className="rep-perf-bar-header">
                    <span>Student Avg. Grade</span>
                    <small>Good</small>
                  </div>
                  <div className="rep-perf-bar-bg">
                    <div className="rep-perf-bar-fill" style={{backgroundColor: '#3B82F6', width: '85%'}}></div>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '11px'}}>
                    <strong>85</strong>
                    <span style={{color: 'var(--text-gray)'}}>90</span>
                  </div>
                </div>

                <div className="rep-perf-bar-item">
                  <div className="rep-perf-bar-header">
                    <span>Student Attendance</span>
                    <small>Needs Improvement</small>
                  </div>
                  <div className="rep-perf-bar-bg">
                    <div className="rep-perf-bar-fill" style={{backgroundColor: '#FB7185', width: '76%'}}></div>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '11px'}}>
                    <strong>76%</strong>
                    <span style={{color: 'var(--text-gray)'}}>90%</span>
                  </div>
                </div>

                <div className="rep-perf-bar-item">
                  <div className="rep-perf-bar-header">
                    <span>Parent Feedback</span>
                    <small>Below Standard</small>
                  </div>
                  <div className="rep-perf-bar-bg">
                    <div className="rep-perf-bar-fill" style={{backgroundColor: '#F43F5E', width: '65%'}}></div>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '11px'}}>
                    <strong>65%</strong>
                    <span style={{color: 'var(--text-gray)'}}>85%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── Accounts Management Tab ───
  const renderAccounts = () => {
    const allUsers = data?.users || [];

    const filteredAccounts = allUsers.filter(u => {
      const nameMatch = (u.name || '').toLowerCase().includes(accountSearch.toLowerCase());
      const usernameMatch = (u.username || '').toLowerCase().includes(accountSearch.toLowerCase());
      const idMatch = (u.id || '').toLowerCase().includes(accountSearch.toLowerCase());
      const searchMatch = accountSearch === '' || nameMatch || usernameMatch || idMatch;
      const roleMatch = accountRoleFilter === 'All' || u.role === accountRoleFilter;
      return searchMatch && roleMatch;
    });

    const accountsPerPage = 12;
    const totalAccountPages = Math.ceil(filteredAccounts.length / accountsPerPage) || 1;
    const currentAccountPage = Math.min(accountPage, totalAccountPages);
    const paginatedAccounts = filteredAccounts.slice(
      (currentAccountPage - 1) * accountsPerPage,
      currentAccountPage * accountsPerPage
    );

    const roleCounts = {
      total: allUsers.length,
      admins: allUsers.filter(u => u.role === 'Admin').length,
      teachers: allUsers.filter(u => u.role === 'Teacher').length,
      students: allUsers.filter(u => u.role === 'Student').length,
    };

    const getRoleBadge = (role) => {
      switch(role) {
        case 'Admin': return 'blue';
        case 'Teacher': return 'cyan';
        case 'Student': return 'pink';
        default: return 'gray';
      }
    };

    return (
      <div className="rep-content-scroll">
        <div className="rep-content-grid-students">
          <div className="rep-students-main-column" style={{ gridColumn: '1 / -1' }}>
            
            {/* Stats Row */}
            <div className="rep-students-top-row">
              <div className="rep-students-stats-grid">
                <div className="rep-student-stat-box large">
                  <div className="rep-stat-info">
                    <span className="rep-stat-value text-cyan">{roleCounts.total}</span>
                    <span className="rep-stat-label">Total Accounts</span>
                  </div>
                  <div className="rep-stat-icon pink">
                    <Shield size={24} />
                  </div>
                </div>
                <div className="rep-student-stat-box">
                  <div className="rep-stat-info">
                    <span className="rep-stat-value">{roleCounts.admins}</span>
                    <span className="rep-stat-label">Admin Accounts</span>
                  </div>
                  <div className="rep-stat-icon-circle blue">
                    <span>A</span>
                  </div>
                </div>
                <div className="rep-student-stat-box">
                  <div className="rep-stat-info">
                    <span className="rep-stat-value">{roleCounts.teachers}</span>
                    <span className="rep-stat-label">Teacher Accounts</span>
                  </div>
                  <div className="rep-stat-icon-circle cyan">
                    <span>T</span>
                  </div>
                </div>
                <div className="rep-student-stat-box">
                  <div className="rep-stat-info">
                    <span className="rep-stat-value">{roleCounts.students}</span>
                    <span className="rep-stat-label">Student Accounts</span>
                  </div>
                  <div className="rep-stat-icon-circle pink">
                    <span>S</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Accounts Table */}
            <div className="rep-card rep-students-table-card">
              <div className="rep-card-header" style={{ marginBottom: '16px' }}>
                <h3>User Accounts & Credentials</h3>
                <div className="rep-table-actions">
                  <div className="rep-search-box-small">
                    <Search size={14} className="rep-search-icon" />
                    <input 
                      type="text" 
                      placeholder="Search accounts" 
                      value={accountSearch}
                      onChange={(e) => { setAccountSearch(e.target.value); setAccountPage(1); }}
                    />
                  </div>
                  <div className="rep-dropdown" style={{ position: 'relative' }}>
                    <select
                      value={accountRoleFilter}
                      onChange={(e) => { setAccountRoleFilter(e.target.value); setAccountPage(1); }}
                      style={{
                        background: 'transparent', border: 'none', color: 'inherit',
                        fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'inherit',
                        outline: 'none', cursor: 'pointer', paddingRight: '16px',
                        appearance: 'none', WebkitAppearance: 'none'
                      }}
                    >
                      <option value="All" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>All Roles</option>
                      <option value="Admin" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Admin</option>
                      <option value="Teacher" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Teacher</option>
                      <option value="Student" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Student</option>
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                </div>
              </div>
              
              <div className="rep-table-responsive">
                <table className="rep-table">
                  <thead>
                    <tr>
                      <th>User <ChevronDown size={12}/></th>
                      <th>Role <ChevronDown size={12}/></th>
                      <th>Username <ChevronDown size={12}/></th>
                      <th>Password <ChevronDown size={12}/></th>
                      <th>Grade / Section <ChevronDown size={12}/></th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAccounts.map((u, i) => (
                      <tr key={u.id || i}>
                        <td>
                          <div className="rep-table-user">
                            <img src={`https://api.dicebear.com/7.x/${u.role === 'Student' ? 'micah' : 'avataaars'}/svg?seed=${u.name || u.id}&backgroundColor=${u.role === 'Admin' ? 'c0aede' : u.role === 'Teacher' ? 'b6e3f4' : 'transparent'}`} alt="avatar" style={u.role !== 'Student' ? { borderRadius: '50%' } : {}} />
                            <div>
                              <p>{u.name}</p>
                              <span>{u.id}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`rep-status-pill ${getRoleBadge(u.role)}`}>{u.role}</span>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                          {editingAccountId === u.id ? (
                            <input 
                              type="text" 
                              value={editAccountForm.username} 
                              onChange={(e) => setEditAccountForm({ ...editAccountForm, username: e.target.value })}
                              style={{
                                padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)',
                                background: 'var(--bg-secondary)', color: 'var(--text-dark)', fontSize: '13px',
                                width: '130px', fontFamily: 'monospace', outline: 'none'
                              }}
                            />
                          ) : (
                            u.username
                          )}
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                          {editingAccountId === u.id ? (
                            <input 
                              type="text" 
                              placeholder="New password" 
                              value={editAccountForm.password} 
                              onChange={(e) => setEditAccountForm({ ...editAccountForm, password: e.target.value })}
                              style={{
                                padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)',
                                background: 'var(--bg-secondary)', color: 'var(--text-dark)', fontSize: '13px',
                                width: '130px', fontFamily: 'monospace', outline: 'none'
                              }}
                            />
                          ) : (
                            <span style={{ color: 'var(--text-gray)' }}>{'•'.repeat(Math.min((u.password || '').length, 8))}</span>
                          )}
                        </td>
                        <td>{u.gradeLevel ? `${u.gradeLevel} - ${u.section || 'N/A'}` : '—'}</td>
                        <td>
                          {editingAccountId === u.id ? (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button 
                                className="rep-icon-btn-small" 
                                title="Save Credentials"
                                style={{ backgroundColor: '#10B981', color: 'white', border: 'none' }}
                                onClick={() => handleSaveAccountCredentials(u.id)}
                                disabled={editAccountLoading}
                              >
                                <Check size={14} />
                              </button>
                              <button 
                                className="rep-icon-btn-small" 
                                title="Cancel"
                                style={{ backgroundColor: '#6B7280', color: 'white', border: 'none' }}
                                onClick={() => setEditingAccountId(null)}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button 
                                className="rep-icon-btn-small" 
                                title="Change Username/Password"
                                onClick={() => {
                                  setEditingAccountId(u.id);
                                  setEditAccountForm({ username: u.username || '', password: '' });
                                }}
                              >
                                <Key size={14} />
                              </button>
                              {u.role === 'Teacher' && (
                                <button 
                                  className="rep-icon-btn-small" 
                                  title="View Teacher"
                                  onClick={() => {
                                    const teacherData = {
                                      id: u.id, name: u.name, subject: u.subject || 'General Education',
                                      gradeLevel: u.gradeLevel, section: u.section,
                                      phone: u.phone || '', email: u.email || `${u.username}@studixschool.org`,
                                      address: u.address || 'Valdez Elementary School, PH',
                                      type: u.type || 'Full-Time', isDb: true
                                    };
                                    setSelectedTeacher(teacherData);
                                    setActiveTab('Teachers');
                                  }}
                                >
                                  <Edit size={14} />
                                </button>
                              )}
                              {u.role === 'Student' && (
                                <button 
                                  className="rep-icon-btn-small" 
                                  title="View Student"
                                  onClick={() => {
                                    const student = data?.students?.find(s => s.id + '_login' === u.id || s.id === u.id.replace('_login', ''));
                                    if (student) {
                                      const nameParts = (student.name || '').split(' ');
                                      setSelectedStudent({
                                        studentId: student.id, firstName: nameParts[0] || '', lastName: nameParts.slice(1).join(' ') || '',
                                        gradeLevel: student.gradeLevel, section: student.section, status: student.status || 'Active',
                                        gpa: student.gpa || '3.5', attendance: student.attendanceRate || '95%',
                                        parentName: student.parentName, parentPhone: student.parentPhone,
                                        address: student.address, gender: student.gender, lrn: student.lrn, isDb: true
                                      });
                                      setActiveTab('Students');
                                    }
                                  }}
                                >
                                  <Edit size={14} />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="rep-pagination">
                <span>Showing {filteredAccounts.length > 0 ? ((currentAccountPage - 1) * accountsPerPage + 1) : 0}-{Math.min(currentAccountPage * accountsPerPage, filteredAccounts.length)} of {filteredAccounts.length} accounts</span>
                <div className="rep-pagination-btns">
                  <button disabled={currentAccountPage <= 1} onClick={() => setAccountPage(prev => Math.max(1, prev - 1))}><ChevronLeft size={16}/></button>
                  {Array.from({ length: Math.min(totalAccountPages, 5) }).map((_, i) => (
                    <button key={i} className={currentAccountPage === i + 1 ? 'active' : ''} onClick={() => setAccountPage(i + 1)}>{i + 1}</button>
                  ))}
                  <button disabled={currentAccountPage >= totalAccountPages} onClick={() => setAccountPage(prev => Math.min(totalAccountPages, prev + 1))}><ChevronRight size={16}/></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    return (
      <div className="rep-content-scroll">
        <div className="rep-content-grid">
          {/* Main Column */}
          <div className="rep-main-column">
            
            {/* Stats Row */}
            <div className="rep-stats-row">
              <div className="rep-stat-card">
                <div className="rep-stat-info">
                  <span className="rep-stat-label">Total Teachers</span>
                  <span className="rep-stat-value">{activeTeachers}</span>
                </div>
                <div className="rep-stat-icon blue">
                  <Briefcase size={24} />
                </div>
              </div>
              
              <div className="rep-stat-card">
                <div className="rep-stat-info">
                  <span className="rep-stat-label">Total Students</span>
                  <span className="rep-stat-value">{totalStudents.toLocaleString()}</span>
                </div>
                <div className="rep-stat-icon pink">
                  <GraduationCap size={24} />
                </div>
              </div>
              
              <div className="rep-stat-card">
                <div className="rep-stat-info">
                  <span className="rep-stat-label">Attendance Today</span>
                  <span className="rep-stat-value">{Math.round((totalStudents || 502) * 0.94).toLocaleString()}</span>
                </div>
                <div className="rep-stat-icon blue">
                  <UserCheck size={24} />
                </div>
              </div>
              
              <div className="rep-stat-card">
                <div className="rep-stat-info">
                  <span className="rep-stat-label">Off Day Today</span>
                  <span className="rep-stat-value">5</span>
                </div>
                <div className="rep-stat-icon pink">
                  <Calendar size={24} />
                </div>
              </div>
            </div>

            {/* Big Calendar */}
            <div className="rep-card">
              <div className="rep-card-header">
                <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                  <h3 style={{margin: 0, padding: 0}}>
                    <select 
                      value={calendarMonth} 
                      onChange={(e) => setCalendarMonth(e.target.value)}
                      style={{appearance: 'none', border: 'none', background: 'transparent', outline: 'none', color: 'inherit', fontWeight: 'inherit', fontSize: 'inherit', cursor: 'pointer', fontFamily: 'inherit'}}
                    >
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </h3>
                  <h3 style={{margin: 0, padding: 0}}>
                    <select 
                      value={calendarYear} 
                      onChange={(e) => setCalendarYear(e.target.value)}
                      style={{appearance: 'none', border: 'none', background: 'transparent', outline: 'none', color: 'inherit', fontWeight: 'inherit', fontSize: 'inherit', cursor: 'pointer', fontFamily: 'inherit'}}
                    >
                      {['2026', '2025', '2024', '2023', '2022', '2021'].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </h3>
                  <ChevronDown size={20} style={{color: 'var(--text-gray)', marginTop: '2px'}}/>
                </div>
                <div className="rep-table-actions">
                  <button className={calendarView === 'Day' ? "rep-btn-pink-small active" : "rep-btn-white-small"} onClick={() => setCalendarView('Day')}>Day</button>
                  <button className={calendarView === 'Week' ? "rep-btn-pink-small active" : "rep-btn-white-small"} onClick={() => setCalendarView('Week')}>Week</button>
                  <button className={calendarView === 'Month' ? "rep-btn-pink-small active" : "rep-btn-white-small"} onClick={() => setCalendarView('Month')}>Month</button>
                  <button className="rep-icon-btn-small"><Settings size={14}/></button>
                  <button className="rep-btn-pink-small" onClick={() => setShowAddEventModal(true)}>+ Add Event</button>
                </div>
              </div>
              
              {calendarView === 'Month' && (
                <div className="rep-big-calendar">
                  <div className="rep-big-cal-header">
                    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                  </div>
                  <div className="rep-big-cal-grid">
                    {getCalendarDays().map((dObj, idx) => {
                      const day = dObj.day;
                      const isCurrent = dObj.isCurrentMonth;
                      const dayEvents = isCurrent ? customEvents.filter(e => e.day === day) : [];
                      return (
                        <div 
                          key={idx} 
                          className={`rep-big-cal-day ${!isCurrent ? 'prev-month' : ''} ${dObj.isToday ? 'active-cyan' : ''}`}
                        >
                          <span className="day-number" style={!isCurrent ? {color: 'var(--text-light)'} : {}}>{day}</span>
                          {dayEvents.map(ev => (
                            <div key={ev.id} className={`rep-cal-event ${ev.type === 'academic' ? 'blue' : ev.type === 'sports' ? 'pink' : ev.type === 'holiday' ? 'cyan' : 'yellow'}`} onClick={() => setSelectedEvent(ev)} style={{cursor: 'pointer'}}>
                              <span>{ev.time}</span>
                              <p>{ev.title}</p>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {calendarView === 'Week' && (
                <div className="rep-big-calendar rep-week-view">
                  <div className="rep-big-cal-header">
                    <div>Mon 12</div><div>Tue 13</div><div>Wed 14</div><div>Thu 15</div><div>Fri 16</div><div>Sat 17</div><div>Sun 18</div>
                  </div>
                  <div className="rep-big-cal-grid" style={{ gridTemplateRows: '1fr', minHeight: '600px' }}>
                    {Array.from({length: 7}).map((_, col) => (
                      <div key={col} className="rep-big-cal-day" style={{borderRight: '1px solid var(--border-color)', borderBottom: 'none', height: '100%', boxSizing: 'border-box'}}>
                        {col === 0 && (
                          <div className="rep-cal-event yellow" style={{marginTop: '40px', width: '100%', boxSizing: 'border-box'}}>
                            <span>10:00 AM</span>
                            <p>Science Fair</p>
                          </div>
                        )}
                        {col === 3 && (
                          <div className="rep-cal-event blue" style={{marginTop: '160px', width: '100%', boxSizing: 'border-box'}}>
                            <span>02:00 PM</span>
                            <p>Meeting</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {calendarView === 'Day' && (
                <div className="rep-big-calendar rep-day-view">
                  <div className="rep-day-timeline">
                    {['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM'].map((time, idx) => (
                      <div key={time} className="rep-day-time-slot" style={{display: 'flex', borderBottom: '1px solid var(--border-color)', height: '80px'}}>
                        <div style={{width: '80px', color: 'var(--text-gray)', fontSize: '13px', padding: '10px'}}>{time}</div>
                        <div style={{flex: 1, borderLeft: '1px solid var(--border-color)', position: 'relative', padding: '10px'}}>
                          {idx === 1 && (
                             <div className="rep-cal-event pink" style={{position: 'absolute', top: '10px', left: '10px', right: '10px', zIndex: 1}}>
                               <span>09:00 AM - 10:30 AM</span>
                               <p>Annual Sport Competition</p>
                             </div>
                          )}
                          {idx === 6 && (
                             <div className="rep-cal-event cyan" style={{position: 'absolute', top: '10px', left: '10px', right: '10px', zIndex: 1}}>
                               <span>02:00 PM - 03:00 PM</span>
                               <p>Parent-Teacher Meeting</p>
                             </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
          </div>

          {/* Right Column */}
          <div className="rep-right-column">
            
            {/* Small Calendar */}
            <div className="rep-card">
              <div className="rep-calendar-header">
                <h3>{calendarMonth} {calendarYear}</h3>
                <div className="rep-cal-nav">
                  <button onClick={calPrev}><ChevronLeft size={16}/></button>
                  <button onClick={calNext}><ChevronRight size={16}/></button>
                </div>
              </div>
              <div className="rep-calendar-grid">
                <div className="day-name">S</div><div className="day-name">M</div><div className="day-name">T</div><div className="day-name">W</div><div className="day-name">T</div><div className="day-name">F</div><div className="day-name">S</div>
                {getCalendarDays().map((dObj, idx) => {
                  const day = dObj.day;
                  const isCurrent = dObj.isCurrentMonth;
                  return (
                    <div 
                      key={idx} 
                      className={`day ${!isCurrent ? 'prev-month' : ''} ${dObj.type ? dObj.type : ''}`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Event */}
            <div className="rep-card">
              <div className="rep-card-header">
                <h3>Upcoming Event</h3>
                <MoreHorizontal size={20} className="text-gray" />
              </div>
              {(() => {
                const upcomingEvent = customEvents && customEvents.length > 0
                  ? [...customEvents].sort((a, b) => a.day - b.day)[0]
                  : null;
                if (!upcomingEvent) {
                  return (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-gray)', fontSize: '14px' }}>
                      No upcoming events scheduled.
                    </div>
                  );
                }
                const boxColorClass = upcomingEvent.type === 'academic' ? 'blue' : upcomingEvent.type === 'sports' ? 'pink' : upcomingEvent.type === 'holiday' ? 'cyan' : 'yellow';
                return (
                  <div className="rep-upcoming-event-card" onClick={() => setSelectedEvent(upcomingEvent)} style={{ cursor: 'pointer' }}>
                    <div className={`event-date-box ${boxColorClass}`}>
                      <span>{upcomingEvent.day}</span>
                      <small>{calendarMonth.substring(0, 3)}</small>
                    </div>
                    <div className="event-details">
                      <h4>{upcomingEvent.title}</h4>
                      <p>{upcomingEvent.time}</p>
                      <div className="event-users">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=T1&backgroundColor=b6e3f4" alt="u1" style={{ borderRadius: '50%' }} />
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=T2&backgroundColor=ffdfbf" alt="u2" style={{ borderRadius: '50%' }} />
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=T3&backgroundColor=c0aede" alt="u3" style={{ borderRadius: '50%' }} />
                        <span className="more-users">+5</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="rep-dashboard" data-theme={theme}>
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="rep-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`rep-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="rep-logo">
          <div className="rep-logo-icon" style={{ width: '40px', height: '40px' }}>
            <img src="/valdez-logo.png" alt="Valdez Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <span className="rep-logo-text" style={{ fontSize: '20px' }}>Valdez ES</span>
        </div>

        <nav className="rep-nav">
          <a href="#" className={`rep-nav-item ${activeTab === 'Dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('Dashboard'); setIsSidebarOpen(false); }}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </a>

          <a href="#" className={`rep-nav-item ${activeTab === 'Calendar' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('Calendar'); setIsSidebarOpen(false); }}>
            <Calendar size={20} />
            <span>Calendar</span>
          </a>
          <a href="#" className={`rep-nav-item ${activeTab === 'Teachers' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('Teachers'); setSelectedTeacher(null); setIsSidebarOpen(false); }}>
            <Briefcase size={20} />
            <span>Teachers</span>
          </a>
          <a href="#" className={`rep-nav-item ${activeTab === 'Students' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('Students'); setIsSidebarOpen(false); }}>
            <Users size={20} />
            <span>Students</span>
          </a>

          <a href="#" className={`rep-nav-item ${activeTab === 'Analytics' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('Analytics'); setIsSidebarOpen(false); }}>
            <BarChart2 size={20} />
            <span>Analytics</span>
          </a>

          <a href="#" className={`rep-nav-item ${activeTab === 'Accounts' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('Accounts'); setIsSidebarOpen(false); }}>
            <Shield size={20} />
            <span>Accounts</span>
          </a>
        </nav>

        <button className="rep-logout" onClick={() => { setIsSidebarOpen(false); onLogout(); }}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
        
        <div className="rep-footer-links">
          Copyright © 2025 Peterdraw &nbsp;|&nbsp; Privacy Policy &nbsp;|&nbsp; Term and conditions &nbsp;|&nbsp; Contact
        </div>
      </aside>

      {/* Main Container */}
      <div className="rep-main-wrapper">
        {/* Top Header */}
        <header className="rep-header">
          <button className="rep-menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu size={22} />
          </button>

          {selectedStudent ? (
            <div className="rep-header-title-area rep-header-student-details">
              <button className="rep-back-btn" onClick={() => setSelectedStudent(null)}>
                <ChevronLeft size={20} />
              </button>
              <div>
                <h1 className="rep-page-title">Student Details</h1>
                <div className="rep-page-breadcrumbs">
                  <span style={{cursor: 'pointer'}} onClick={() => { setSelectedStudent(null); setActiveTab('Dashboard'); }}>Dashboard</span> / <span style={{cursor: 'pointer'}} onClick={() => setSelectedStudent(null)}>Students</span> / <span style={{color: 'var(--text-gray)'}}>Student Details</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rep-header-title-area">
              <h1 className="rep-page-title">{activeTab}</h1>
              {(activeTab === 'Students' || activeTab === 'Teachers' || activeTab === 'Accounts') && (
                <div className="rep-page-breadcrumbs">
                  <span>Dashboard</span> / {activeTab}
                </div>
              )}
            </div>
          )}
          
          <div className="rep-header-right">
            {!selectedStudent && (
              <>
                <div className="rep-dropdown">
                  <select 
                    value={selectedYear} 
                    onChange={(e) => setSelectedYear(e.target.value)} 
                    style={{appearance: 'none', border: 'none', background: 'transparent', outline: 'none', color: 'inherit', fontWeight: 'inherit', paddingRight: '8px', cursor: 'pointer'}}
                  >
                    {globalYears.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <ChevronDown size={14}/>
                </div>
                
                <div className="rep-dropdown">
                  <select 
                    value={selectedGrade} 
                    onChange={(e) => {
                      setSelectedGrade(e.target.value);
                      setSelectedSection('All Sections');
                    }} 
                    style={{appearance: 'none', border: 'none', background: 'transparent', outline: 'none', color: 'inherit', fontWeight: 'inherit', paddingRight: '8px', cursor: 'pointer'}}
                  >
                    <option value="All Grades">All Grades</option>
                    {[...new Set(globalClassrooms.map(c => c.gradeLevel))].map(grade => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                  <ChevronDown size={14}/>
                </div>

              </>
            )}

            <button className="rep-icon-btn" onClick={() => setShowSettingsModal(true)}>
              <Settings size={20} />
            </button>
            
            <div className="rep-user-profile">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(adminName)}&backgroundColor=b6e3f4`} alt={adminName} className="rep-avatar" style={{ borderRadius: '50%' }} />
              <div className="rep-user-info">
                <span className="rep-user-name">{adminName}</span>
                <span className="rep-user-role">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div key={activeTab} className="rep-tab-content-wrapper">
          {activeTab === 'Dashboard' && renderDashboard()}
          {activeTab === 'Analytics' && renderAnalytics()}
          {activeTab === 'Students' && (
            <>
              {renderStudents()}
              {selectedStudent && renderStudentDetails()}
            </>
          )}
          {activeTab === 'Teachers' && (
            <>
              {renderTeachers()}
              {selectedTeacher && renderTeacherDetails()}
            </>
          )}
          {activeTab === 'Calendar' && renderCalendar()}
          {activeTab === 'Accounts' && renderAccounts()}
        </div>
      </div>

      {/* ─── ADD STUDENT MODAL ─── */}
      {showAddStudentModal && (
        <div className="rep-modal-overlay" onClick={() => setShowAddStudentModal(false)}>
          <div className="rep-add-student-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rep-modal-header">
              <div className="rep-modal-header-left">
                <div className="rep-modal-title-icon">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h2>Add New Student</h2>
                  <p className="rep-modal-subtitle">Fill in the student's information below</p>
                </div>
              </div>
              <button className="rep-modal-close" onClick={() => setShowAddStudentModal(false)}>
                <X size={24} />
              </button>
            </div>

            {addStudentSuccess ? (
              <div className="rep-add-student-success">
                <div className="rep-success-icon">
                  <Check size={40} />
                </div>
                <h3>Student Added Successfully!</h3>
                <p>The new student has been enrolled and their login credentials have been created.</p>
                <div className="rep-success-info">
                  <div className="rep-success-info-item">
                    <span>Username (LRN)</span>
                    <p>{lastCreatedStudent?.lrn || addStudentForm.lrn || 'Generated LRN'}</p>
                  </div>
                  <div className="rep-success-info-item">
                    <span>Default Password</span>
                    <p>password123</p>
                  </div>
                </div>
                <div className="rep-success-actions">
                  <button className="rep-btn-add-another" onClick={() => {
                    setAddStudentForm({ firstName: '', lastName: '', gender: 'Male', gradeLevel: '', section: '', lrn: '', parentName: '', parentPhone: '', address: '' });
                    setAddStudentSuccess(false);
                  }}>+ Add Another Student</button>
                  <button className="rep-btn-done" onClick={() => setShowAddStudentModal(false)}>Done</button>
                </div>
              </div>
            ) : (
              <form className="rep-add-student-form" onSubmit={async (e) => {
                e.preventDefault();
                setAddStudentLoading(true);
                setAddStudentError('');
                try {
                  const res = await fetch(getApiUrl('/api/admin/student'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: `${addStudentForm.firstName} ${addStudentForm.lastName}`.trim(),
                      gender: addStudentForm.gender,
                      gradeLevel: addStudentForm.gradeLevel,
                      section: addStudentForm.section,
                      parentName: addStudentForm.parentName,
                      parentPhone: addStudentForm.parentPhone,
                      address: addStudentForm.address,
                      lrn: addStudentForm.lrn,
                    })
                  });
                  if (res.ok) {
                    const result = await res.json();
                    setLastCreatedStudent(result.student);
                    setAddStudentSuccess(true);
                    addActivity('users', 'pink', `Registered new student: ${addStudentForm.firstName} ${addStudentForm.lastName} (${addStudentForm.gradeLevel} - ${addStudentForm.section}).`);
                    // Refresh admin data so the new student appears in the table
                    fetchAdminData();
                  } else {
                    setAddStudentError('Failed to add student. Please try again.');
                  }
                } catch (err) {
                  console.error('Error adding student:', err);
                  setAddStudentError('Failed to add student. Make sure the server is running.');
                } finally {
                  setAddStudentLoading(false);
                }
              }}>
                {addStudentError && (
                  <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #f87171' }}>
                    {addStudentError}
                  </div>
                )}
                <div className="rep-form-section">
                  <h4 className="rep-form-section-title">
                    <span className="rep-form-section-num">1</span>
                    Personal Information
                  </h4>
                  <div className="rep-form-grid">
                    <div className="rep-form-group">
                      <label>First Name <span className="req">*</span></label>
                      <input
                        type="text" required placeholder="e.g. Juan"
                        value={addStudentForm.firstName}
                        onChange={(e) => setAddStudentForm({...addStudentForm, firstName: e.target.value})}
                      />
                    </div>
                    <div className="rep-form-group">
                      <label>Last Name <span className="req">*</span></label>
                      <input
                        type="text" required placeholder="e.g. Dela Cruz"
                        value={addStudentForm.lastName}
                        onChange={(e) => setAddStudentForm({...addStudentForm, lastName: e.target.value})}
                      />
                    </div>
                    <div className="rep-form-group">
                      <label>Gender <span className="req">*</span></label>
                      <select
                        value={addStudentForm.gender}
                        onChange={(e) => setAddStudentForm({...addStudentForm, gender: e.target.value})}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div className="rep-form-group">
                      <label>LRN (Learner Reference No.)</label>
                      <input
                        type="text" placeholder="Auto-generated if empty"
                        value={addStudentForm.lrn}
                        onChange={(e) => setAddStudentForm({...addStudentForm, lrn: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="rep-form-section">
                  <h4 className="rep-form-section-title">
                    <span className="rep-form-section-num">2</span>
                    Class Assignment
                  </h4>
                  <div className="rep-form-grid">
                    <div className="rep-form-group">
                      <label>Grade Level <span className="req">*</span></label>
                      <select
                        required
                        value={addStudentForm.gradeLevel}
                        onChange={(e) => {
                          const grade = e.target.value;
                          const matchingClassroom = globalClassrooms.find(c => c.gradeLevel === grade);
                          setAddStudentForm({
                            ...addStudentForm,
                            gradeLevel: grade,
                            section: matchingClassroom ? (matchingClassroom.section || matchingClassroom.classrooms || '') : ''
                          });
                        }}
                      >
                        <option value="">Select grade level</option>
                        {[...new Set(globalClassrooms.map(c => c.gradeLevel))].map(grade => (
                          <option key={grade} value={grade}>{grade}</option>
                        ))}
                      </select>
                    </div>
                    <div className="rep-form-group">
                      <label>Section <span className="req">*</span></label>
                      <select
                        required
                        value={addStudentForm.section}
                        onChange={(e) => setAddStudentForm({...addStudentForm, section: e.target.value})}
                      >
                        <option value="">Select section</option>
                        {(() => {
                          const GRADE_SECTIONS = {
                            'Kinder': ['Section A', 'Section B', 'Section C'],
                            'Grade 1': ['Mabini', 'Bonifacio'],
                            'Grade 2': ['Rizal', 'Luna'],
                            'Grade 3': ['Del Pilar', 'Jacinto'],
                            'Grade 4': ['Aguinaldo', 'Quezon'],
                            'Grade 5': ['Gomez', 'Burgos'],
                            'Grade 6': ['Sampaguita', 'Ilang-Ilang']
                          };
                          const gradeToUse = addStudentForm.gradeLevel;
                          let options = [];
                          if (gradeToUse && GRADE_SECTIONS[gradeToUse]) {
                            options = GRADE_SECTIONS[gradeToUse];
                          } else {
                            options = Object.values(GRADE_SECTIONS).flat();
                          }
                          return options.map((sec, idx) => (
                            <option key={`${sec}-${idx}`} value={sec}>{sec}</option>
                          ));
                        })()}
                      </select>
                    </div>
                    <div className="rep-form-group rep-form-group-full">
                      <label>Assigned Teacher (Adviser)</label>
                      <div className="rep-assigned-teacher-display">
                        {(() => {
                          const matchedClassroom = globalClassrooms.find(
                            c => c.gradeLevel === addStudentForm.gradeLevel && c.section === addStudentForm.section
                          );
                          const adviser = matchedClassroom?.adviser;
                          if (!addStudentForm.gradeLevel || !addStudentForm.section) {
                            return <span className="rep-teacher-placeholder">Select grade level and section first</span>;
                          }
                          return (
                            <div className="rep-teacher-assigned-card">
                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${adviser || 'TBD'}&backgroundColor=b6e3f4`} alt="teacher" style={{ borderRadius: '50%' }} />
                              <div>
                                <p>{adviser || 'TBD'}</p>
                                <span>{addStudentForm.gradeLevel} - {addStudentForm.section}</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rep-form-section">
                  <h4 className="rep-form-section-title">
                    <span className="rep-form-section-num">3</span>
                    Parent / Guardian
                  </h4>
                  <div className="rep-form-grid">
                    <div className="rep-form-group">
                      <label>Parent/Guardian Name</label>
                      <input
                        type="text" placeholder="e.g. Maria Dela Cruz"
                        value={addStudentForm.parentName}
                        onChange={(e) => setAddStudentForm({...addStudentForm, parentName: e.target.value})}
                      />
                    </div>
                    <div className="rep-form-group">
                      <label>Contact Number</label>
                      <input
                        type="text" placeholder="e.g. +63 917 123 4567"
                        value={addStudentForm.parentPhone}
                        onChange={(e) => setAddStudentForm({...addStudentForm, parentPhone: e.target.value})}
                      />
                    </div>
                    <div className="rep-form-group" style={{ gridColumn: 'span 2' }}>
                      <label>Address</label>
                      <input
                        type="text" placeholder="e.g. Floridablanca, Pampanga"
                        value={addStudentForm.address}
                        onChange={(e) => setAddStudentForm({...addStudentForm, address: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="rep-form-actions">
                  <button type="button" className="rep-btn-cancel" onClick={() => setShowAddStudentModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="rep-btn-submit" disabled={addStudentLoading}>
                    {addStudentLoading ? (
                      <><span className="rep-spinner"></span> Adding...</>
                    ) : (
                      <><UserPlus size={16} /> Add Student</>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ─── ADD EVENT MODAL ─── */}
      {showAddEventModal && (
        <div className="rep-modal-overlay" onClick={() => setShowAddEventModal(false)}>
          <div className="rep-add-student-modal" onClick={(e) => e.stopPropagation()} style={{maxWidth: '500px'}}>
            <div className="rep-modal-header">
              <div className="rep-modal-header-left">
                <div className="rep-modal-title-icon" style={{backgroundColor: 'var(--accent-pink-bg)', color: 'var(--accent-pink)'}}>
                  <Calendar size={20} />
                </div>
                <div>
                  <h2>Add New Event</h2>
                  <p className="rep-modal-subtitle">Schedule an event for the school calendar</p>
                </div>
              </div>
              <button className="rep-modal-close" onClick={() => setShowAddEventModal(false)}>
                <X size={24} />
              </button>
            </div>

            {addEventSuccess ? (
              <div className="rep-add-student-success">
                <div className="rep-success-icon">
                  <Check size={40} />
                </div>
                <h3>Event Added Successfully!</h3>
                <p>Your new event has been scheduled in the school calendar.</p>
                <div className="rep-success-info">
                  <div className="rep-success-info-item">
                    <span>Event Title</span>
                    <p>{addEventForm.title}</p>
                  </div>
                  <div className="rep-success-info-item">
                    <span>Date &amp; Time</span>
                    <p>{addEventForm.date} at {addEventForm.time}</p>
                  </div>
                </div>
                <div className="rep-success-actions">
                  <button className="rep-btn-add-another" onClick={() => {
                    setAddEventForm({ title: '', date: '', time: '', type: 'academic', description: '' });
                    setAddEventSuccess(false);
                  }}>+ Add Another Event</button>
                  <button className="rep-btn-done" onClick={() => {
                    setShowAddEventModal(false);
                    setAddEventSuccess(false);
                    setAddEventForm({ title: '', date: '', time: '', type: 'academic', description: '' });
                  }}>Done</button>
                </div>
              </div>
            ) : (
            <form className="rep-add-student-form" onSubmit={(e) => {
              e.preventDefault();
              const [year, month, day] = addEventForm.date.split('-');
              const newEvent = {
                id: Date.now(),
                title: addEventForm.title,
                day: parseInt(day, 10),
                time: addEventForm.time,
                type: addEventForm.type,
                description: addEventForm.description
              };
              setCustomEvents([...customEvents, newEvent]);
              addActivity('calendar', 'pink', `Scheduled new event: "${addEventForm.title}" for day ${parseInt(day, 10)}.`);
              setAddEventSuccess(true);
            }}>
              <div className="rep-form-section">
                <div className="rep-form-grid" style={{gridTemplateColumns: '1fr'}}>
                  <div className="rep-form-group">
                    <label>Event Title <span className="req">*</span></label>
                    <input type="text" required placeholder="e.g. Annual Science Fair" value={addEventForm.title} onChange={(e) => setAddEventForm({...addEventForm, title: e.target.value})} />
                  </div>
                  <div className="rep-form-group">
                    <label>Date &amp; Time <span className="req">*</span></label>
                    <div style={{display: 'flex', gap: '10px'}}>
                      <input type="date" required style={{flex: 1}} value={addEventForm.date} onChange={(e) => setAddEventForm({...addEventForm, date: e.target.value})} />
                      <input type="time" required style={{flex: 1}} value={addEventForm.time} onChange={(e) => setAddEventForm({...addEventForm, time: e.target.value})} />
                    </div>
                  </div>
                  <div className="rep-form-group">
                    <label>Event Type</label>
                    <select value={addEventForm.type} onChange={(e) => setAddEventForm({...addEventForm, type: e.target.value})}>
                      <option value="academic">Academic</option>
                      <option value="sports">Sports</option>
                      <option value="meeting">Meeting</option>
                      <option value="holiday">Holiday</option>
                    </select>
                  </div>
                  <div className="rep-form-group">
                    <label>Description</label>
                    <textarea rows="3" placeholder="Additional details..." style={{
                      width: '100%', padding: '12px', border: '1px solid var(--border-color)', 
                      borderRadius: '10px', backgroundColor: 'var(--bg-main)', color: 'var(--text-dark)', 
                      fontFamily: 'inherit', resize: 'vertical'
                    }} value={addEventForm.description} onChange={(e) => setAddEventForm({...addEventForm, description: e.target.value})}></textarea>
                  </div>
                </div>
              </div>

              <div className="rep-form-actions">
                <button type="button" className="rep-btn-cancel" onClick={() => setShowAddEventModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="rep-btn-submit">
                  <Calendar size={16} /> Add Event
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      )}

      {/* ─── EVENT DETAILS & EDIT MODAL ─── */}
      {selectedEvent && (
        <div className="rep-modal-overlay" onClick={() => { setSelectedEvent(null); setIsEditingEvent(false); }}>
          <div className="rep-add-student-modal" onClick={(e) => e.stopPropagation()} style={{maxWidth: '500px'}}>
            <div className="rep-modal-header">
              <div className="rep-modal-header-left">
                <div className="rep-modal-title-icon" style={{backgroundColor: 'var(--accent-pink-bg)', color: 'var(--accent-pink)'}}>
                  <Calendar size={20} />
                </div>
                <div>
                  <h2>{isEditingEvent ? 'Edit Event' : 'Event Details'}</h2>
                  <p className="rep-modal-subtitle">
                    {isEditingEvent 
                      ? 'Update event information' 
                      : (selectedEvent.day ? `${calendarMonth} ${selectedEvent.day}, ${calendarYear}` : 'Scheduled Event')}
                  </p>
                </div>
              </div>
              <button className="rep-modal-close" onClick={() => { setSelectedEvent(null); setIsEditingEvent(false); }}>
                <X size={24} />
              </button>
            </div>

            {isEditingEvent ? (
              <form className="rep-add-student-form" onSubmit={(e) => {
                e.preventDefault();
                const [year, month, day] = addEventForm.date.split('-');
                const updatedEvents = customEvents.map(ev => 
                  ev.id === selectedEvent.id ? { 
                    ...ev, 
                    title: addEventForm.title,
                    day: parseInt(day, 10),
                    time: addEventForm.time,
                    type: addEventForm.type,
                    description: addEventForm.description
                  } : ev
                );
                setCustomEvents(updatedEvents);
                addActivity('edit', 'blue', `Updated event details: "${addEventForm.title}".`);
                setSelectedEvent({
                  ...selectedEvent,
                  title: addEventForm.title,
                  day: parseInt(day, 10),
                  time: addEventForm.time,
                  type: addEventForm.type,
                  description: addEventForm.description
                });
                setIsEditingEvent(false);
              }}>
                <div className="rep-form-section">
                  <div className="rep-form-grid" style={{gridTemplateColumns: '1fr'}}>
                    <div className="rep-form-group">
                      <label>Event Title <span className="req">*</span></label>
                      <input type="text" required placeholder="e.g. Annual Science Fair" value={addEventForm.title} onChange={(e) => setAddEventForm({...addEventForm, title: e.target.value})} />
                    </div>
                    <div className="rep-form-group">
                      <label>Date &amp; Time <span className="req">*</span></label>
                      <div style={{display: 'flex', gap: '10px'}}>
                        <input type="date" required style={{flex: 1}} value={addEventForm.date} onChange={(e) => setAddEventForm({...addEventForm, date: e.target.value})} />
                        <input type="time" required style={{flex: 1}} value={addEventForm.time} onChange={(e) => setAddEventForm({...addEventForm, time: e.target.value})} />
                      </div>
                    </div>
                    <div className="rep-form-group">
                      <label>Event Type</label>
                      <select value={addEventForm.type} onChange={(e) => setAddEventForm({...addEventForm, type: e.target.value})}>
                        <option value="academic">Academic</option>
                        <option value="sports">Sports</option>
                        <option value="meeting">Meeting</option>
                        <option value="holiday">Holiday</option>
                      </select>
                    </div>
                    <div className="rep-form-group">
                      <label>Description</label>
                      <textarea rows="3" placeholder="Additional details..." style={{
                        width: '100%', padding: '12px', border: '1px solid var(--border-color)', 
                        borderRadius: '10px', backgroundColor: 'var(--bg-main)', color: 'var(--text-dark)', 
                        fontFamily: 'inherit', resize: 'vertical'
                      }} value={addEventForm.description} onChange={(e) => setAddEventForm({...addEventForm, description: e.target.value})}></textarea>
                    </div>
                  </div>
                </div>

                <div className="rep-form-actions" style={{justifyContent: 'space-between'}}>
                  <button type="button" className="rep-btn-cancel" onClick={() => setIsEditingEvent(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="rep-btn-submit">
                    <Check size={16} /> Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="rep-event-details-content" style={{padding: '0 24px 24px 24px'}}>
                <div style={{marginBottom: '20px'}}>
                  <span style={{display: 'inline-block', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize', backgroundColor: 'var(--accent-blue-bg)', color: 'var(--accent-blue)', marginBottom: '12px'}}>
                    {selectedEvent.type} Event
                  </span>
                  <h3 style={{fontSize: '24px', fontWeight: '600', color: 'var(--text-dark)', margin: '0 0 16px 0'}}>{selectedEvent.title}</h3>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-gray)', fontSize: '15px'}}>
                    <span style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <Calendar size={18} style={{color: 'var(--accent-pink)'}}/> 
                      {selectedEvent.day ? `${calendarMonth} ${selectedEvent.day}, ${calendarYear}` : 'Scheduled Date'}
                    </span>
                    <span style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <Clock size={18} style={{color: 'var(--accent-cyan)'}}/> 
                      {selectedEvent.time}
                    </span>
                  </div>
                </div>

                <div style={{marginBottom: '32px', backgroundColor: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)'}}>
                  <h4 style={{fontSize: '14px', color: 'var(--text-light)', marginBottom: '8px', fontWeight: '500'}}>Description</h4>
                  <p style={{fontSize: '15px', lineHeight: '1.6', color: 'var(--text-dark)', margin: 0}}>
                    {selectedEvent.description || 'No additional details provided for this event.'}
                  </p>
                </div>

                <div className="rep-form-actions" style={{justifyContent: 'space-between'}}>
                  <button 
                    type="button" 
                    className="rep-btn-cancel" 
                    style={{color: '#ef4444', borderColor: '#fee2e2', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', gap: '6px'}} 
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                  <button 
                    type="button" 
                    className="rep-btn-submit" 
                    style={{display: 'flex', alignItems: 'center', gap: '6px'}}
                    onClick={() => {
                      setAddEventForm({
                        title: selectedEvent.title,
                        date: `${calendarYear}-05-${String(selectedEvent.day || 1).padStart(2, '0')}`,
                        time: selectedEvent.time,
                        type: selectedEvent.type || 'academic',
                        description: selectedEvent.description || ''
                      });
                      setIsEditingEvent(true);
                    }}
                  >
                    <Edit size={16} /> Edit Event
                  </button>
                </div>
              </div>
            )}

            {showDeleteConfirm && (
              <div className="rep-modal-overlay" style={{ zIndex: 1000, background: 'rgba(0,0,0,0.6)' }} onClick={() => setShowDeleteConfirm(false)}>
                <div className="rep-add-student-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center', padding: '32px 24px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                    <AlertCircle size={32} />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '12px' }}>Delete Event?</h3>
                  <p style={{ color: 'var(--text-gray)', fontSize: '15px', marginBottom: '24px', lineHeight: '1.5' }}>
                    Are you sure you want to delete <strong>{selectedEvent.title}</strong>? This action cannot be undone.
                  </p>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button 
                      type="button" 
                      className="rep-btn-cancel" 
                      style={{ padding: '10px 20px', fontSize: '14px', flex: 1, justifyContent: 'center' }} 
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      className="rep-btn-submit" 
                      style={{ backgroundColor: '#ef4444', padding: '10px 20px', fontSize: '14px', flex: 1, border: 'none', justifyContent: 'center' }} 
                      onClick={() => {
                        addActivity('trash', 'red', `Deleted event: "${selectedEvent.title}".`);
                        setCustomEvents(customEvents.filter(ev => ev.id !== selectedEvent.id));
                        setShowDeleteConfirm(false);
                        setSelectedEvent(null);
                      }}
                    >
                      Yes, Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── ADD TEACHER MODAL ─── */}
      {showAddTeacherModal && (
        <div className="rep-modal-overlay" onClick={() => setShowAddTeacherModal(false)}>
          <div className="rep-add-student-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rep-modal-header">
              <div className="rep-modal-header-left">
                <div className="rep-modal-title-icon" style={{backgroundColor: 'var(--accent-cyan-bg, #e0f7fa)', color: 'var(--accent-cyan, #06B6D4)'}}>
                  <Briefcase size={20} />
                </div>
                <div>
                  <h2>Add New Teacher</h2>
                  <p className="rep-modal-subtitle">Fill in the teacher's information below</p>
                </div>
              </div>
              <button className="rep-modal-close" onClick={() => setShowAddTeacherModal(false)}>
                <X size={24} />
              </button>
            </div>

            {addTeacherSuccess ? (
              <div className="rep-add-student-success">
                <div className="rep-success-icon">
                  <Check size={40} />
                </div>
                <h3>Teacher Added Successfully!</h3>
                <p>The new teacher has been registered and their login credentials have been created.</p>
                <div className="rep-success-info">
                  <div className="rep-success-info-item">
                    <span>Username</span>
                    <p>{(addTeacherForm.firstName + addTeacherForm.lastName).toLowerCase().replace(/\s+/g, '')}</p>
                  </div>
                  <div className="rep-success-info-item">
                    <span>Default Password</span>
                    <p>password123</p>
                  </div>
                </div>
                <div className="rep-success-actions">
                  <button className="rep-btn-add-another" onClick={() => {
                    setAddTeacherForm({ firstName: '', lastName: '', subject: '', gradeLevel: '', section: '', type: 'Full-Time', phone: '', email: '' });
                    setAddTeacherSuccess(false);
                  }}>+ Add Another Teacher</button>
                  <button className="rep-btn-done" onClick={() => setShowAddTeacherModal(false)}>Done</button>
                </div>
              </div>
            ) : (
              <form className="rep-add-student-form" onSubmit={async (e) => {
                e.preventDefault();
                setAddTeacherLoading(true);
                setAddTeacherError('');
                try {
                  const fullName = `${addTeacherForm.firstName} ${addTeacherForm.lastName}`.trim();
                  const res = await fetch(getApiUrl('/api/admin/teacher'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: fullName,
                      gradeLevel: addTeacherForm.gradeLevel,
                      section: addTeacherForm.section,
                      username: (addTeacherForm.firstName + addTeacherForm.lastName).toLowerCase().replace(/\s+/g, ''),
                      password: 'password123',
                    })
                  });
                  if (res.ok) {
                    setAddTeacherSuccess(true);
                    addActivity('users', 'blue', `Registered new teacher: ${fullName} (${addTeacherForm.gradeLevel || 'No Advisory'} - ${addTeacherForm.section || ''}).`);
                    fetchAdminData();
                  } else {
                    setAddTeacherError('Failed to add teacher. Please try again.');
                  }
                } catch (err) {
                  console.error('Error adding teacher:', err);
                  setAddTeacherError('Failed to add teacher. Make sure the server is running.');
                } finally {
                  setAddTeacherLoading(false);
                }
              }}>
                {addTeacherError && (
                  <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #f87171' }}>
                    {addTeacherError}
                  </div>
                )}
                <div className="rep-form-section">
                  <h4 className="rep-form-section-title">
                    <span className="rep-form-section-num">1</span>
                    Personal Information
                  </h4>
                  <div className="rep-form-grid">
                    <div className="rep-form-group">
                      <label>First Name <span className="req">*</span></label>
                      <input
                        type="text" required placeholder="e.g. Argen"
                        value={addTeacherForm.firstName}
                        onChange={(e) => setAddTeacherForm({...addTeacherForm, firstName: e.target.value})}
                      />
                    </div>
                    <div className="rep-form-group">
                      <label>Last Name <span className="req">*</span></label>
                      <input
                        type="text" required placeholder="e.g. Maulle"
                        value={addTeacherForm.lastName}
                        onChange={(e) => setAddTeacherForm({...addTeacherForm, lastName: e.target.value})}
                      />
                    </div>
                    <div className="rep-form-group">
                      <label>Email Address</label>
                      <input
                        type="email" placeholder="e.g. teacher@school.org"
                        value={addTeacherForm.email}
                        onChange={(e) => setAddTeacherForm({...addTeacherForm, email: e.target.value})}
                      />
                    </div>
                    <div className="rep-form-group">
                      <label>Phone Number</label>
                      <input
                        type="text" placeholder="e.g. +63 917 123 4567"
                        value={addTeacherForm.phone}
                        onChange={(e) => setAddTeacherForm({...addTeacherForm, phone: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="rep-form-section">
                  <h4 className="rep-form-section-title">
                    <span className="rep-form-section-num">2</span>
                    Assignment Details
                  </h4>
                  <div className="rep-form-grid">
                    <div className="rep-form-group">
                      <label>Subject <span className="req">*</span></label>
                      <input
                        type="text" required placeholder="e.g. Mathematics"
                        value={addTeacherForm.subject}
                        onChange={(e) => setAddTeacherForm({...addTeacherForm, subject: e.target.value})}
                      />
                    </div>
                    <div className="rep-form-group">
                      <label>Employment Type <span className="req">*</span></label>
                      <select
                        value={addTeacherForm.type}
                        onChange={(e) => setAddTeacherForm({...addTeacherForm, type: e.target.value})}
                      >
                        <option value="Full-Time">Full-Time</option>
                        <option value="Part-Time">Part-Time</option>
                        <option value="Substitute">Substitute</option>
                      </select>
                    </div>
                    <div className="rep-form-group">
                      <label>Grade Level</label>
                      <select
                        value={addTeacherForm.gradeLevel}
                        onChange={(e) => {
                          const grade = e.target.value;
                          const matchingClassroom = globalClassrooms.find(c => c.gradeLevel === grade);
                          setAddTeacherForm({
                            ...addTeacherForm,
                            gradeLevel: grade,
                            section: matchingClassroom ? (matchingClassroom.section || matchingClassroom.classrooms || '') : ''
                          });
                        }}
                      >
                        <option value="">Select grade level</option>
                        {[...new Set(globalClassrooms.map(c => c.gradeLevel))].map(grade => (
                          <option key={grade} value={grade}>{grade}</option>
                        ))}
                      </select>
                    </div>
                    <div className="rep-form-group">
                      <label>Section</label>
                      <select
                        value={addTeacherForm.section}
                        onChange={(e) => setAddTeacherForm({...addTeacherForm, section: e.target.value})}
                      >
                        <option value="">Select section</option>
                        {(() => {
                          const GRADE_SECTIONS = {
                            'Kinder': ['Section A', 'Section B', 'Section C'],
                            'Grade 1': ['Mabini', 'Bonifacio'],
                            'Grade 2': ['Rizal', 'Luna'],
                            'Grade 3': ['Del Pilar', 'Jacinto'],
                            'Grade 4': ['Aguinaldo', 'Quezon'],
                            'Grade 5': ['Gomez', 'Burgos'],
                            'Grade 6': ['Sampaguita', 'Ilang-Ilang']
                          };
                          const gradeToUse = addTeacherForm.gradeLevel;
                          let options = [];
                          if (gradeToUse && GRADE_SECTIONS[gradeToUse]) {
                            options = GRADE_SECTIONS[gradeToUse];
                          } else {
                            options = Object.values(GRADE_SECTIONS).flat();
                          }
                          return options.map((sec, idx) => (
                            <option key={`${sec}-${idx}`} value={sec}>{sec}</option>
                          ));
                        })()}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="rep-form-actions">
                  <button type="button" className="rep-btn-cancel" onClick={() => setShowAddTeacherModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="rep-btn-submit" disabled={addTeacherLoading}>
                    {addTeacherLoading ? (
                      <><span className="rep-spinner"></span> Adding...</>
                    ) : (
                      <><Briefcase size={16} /> Add Teacher</>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}


      {/* ─── CAMPUS OPERATIONS MODAL ─── */}
      {showCampusModal && (
        <div className="rep-modal-overlay" onClick={() => setShowCampusModal(false)}>
          <div 
            className="rep-campus-modal" 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '900px', 
              maxWidth: '95vw', 
              height: '600px',
              backgroundColor: '#0F172A', 
              borderRadius: '16px', 
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              maxHeight: '90vh'
            }}
          >
            <div className="rep-modal-header" style={{ borderBottom: '1px solid #1E293B', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ backgroundColor: 'rgba(59,130,246,0.15)', color: '#3B82F6', padding: '8px', borderRadius: '8px', display: 'flex' }}>
                  <Users size={20} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: 'white' }}>All Campus Operations</h2>
                  <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8' }}>Comprehensive overview of all facilities and rooms</p>
                </div>
              </div>
              <button onClick={() => setShowCampusModal(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              {/* Left Side: List */}
              <div style={{ width: '350px', borderRight: '1px solid #1E293B', display: 'flex', flexDirection: 'column', backgroundColor: '#0F172A' }}>
                <div style={{ padding: '16px' }}>
                  <div style={{ backgroundColor: '#1E293B', borderRadius: '8px', display: 'flex', alignItems: 'center', padding: '10px 12px' }}>
                    <Search size={16} color="#64748B" />
                    <input type="text" placeholder="Search facilities..." style={{ background: 'none', border: 'none', color: 'white', marginLeft: '8px', width: '100%', outline: 'none' }} />
                  </div>
                </div>
                
                <div className="rep-content-scroll" style={{ padding: '0 16px 16px', flex: 1, overflowY: 'auto' }}>
                  {filteredClassrooms.map((room, idx) => (
                    <div key={idx} style={{ 
                      backgroundColor: '#1E293B', 
                      borderRadius: '12px', 
                      padding: '16px', 
                      marginBottom: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid transparent',
                      transition: 'border-color 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3B82F6'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ color: '#3B82F6' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path></svg>
                        </div>
                        <div>
                          <h5 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '600', color: 'white' }}>{room.section}</h5>
                          <p style={{ margin: 0, fontSize: '11px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
                            {room.gradeLevel}
                          </p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <h5 style={{ margin: '0 0 4px', fontSize: '14px', color: 'white' }}>{room.enrollment || 0}</h5>
                        <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8' }}>Students</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Right Side: Map */}
              <div style={{ flex: 1, backgroundColor: '#1E293B', position: 'relative' }}>
                <iframe src="https://www.google.com/maps/embed?pb=!3m2!1sen!2sph!4v1779170860597!5m2!1sen!2sph!6m8!1m7!1szEc29c1XrMKd0OTJUkV46g!2m2!1d14.98525023648257!2d120.5392525055562!3f178.47472142220045!4f-15.57242978303492!5f0.7820865974627469" width="100%" height="100%" style={{border:0, position: 'absolute', top: 0, left: 0}} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TOTAL ENROLLMENT DETAILS MODAL ─── */}
      {showEnrollmentModal && (
        <div className="rep-compare-modal-overlay" onClick={() => setShowEnrollmentModal(false)} style={{ zIndex: 600 }}>
          <div
            className="rep-enrollment-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="rep-enrollment-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
                  <Users size={20} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#F1F5F9' }}>
                    Enrollment & Facility Details
                  </h2>
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748B' }}>
                    Grade-level breakdown of enrollment, classrooms, seats, and teachers.
                  </p>
                </div>
              </div>
              <button onClick={() => setShowEnrollmentModal(false)} className="rep-insights-close-btn">
                <X size={22} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="rep-enrollment-modal-content">
              {/* Year Selector Control */}
              <div className="rep-enrollment-year-picker">
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#CBD5E1' }}>Select Academic Year:</span>
                <div className="rep-enrollment-year-tabs">
                  {globalYears.map(year => (
                    <button
                      key={year}
                      className={`rep-enrollment-year-btn ${enrollmentModalYear === year ? 'active' : ''}`}
                      onClick={() => setEnrollmentModalYear(year)}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>

              {/* Responsive Table Card */}
              <div className="rep-enrollment-table-card">
                <div className="rep-enrollment-table-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{enrollmentModalYear} Statistics</span>
                  <button
                    onClick={() => handleEditSchoolYearStats(enrollmentModalYear)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '6px',
                      color: '#3B82F6',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: '600'
                    }}
                  >
                    <Edit size={13} /> Edit Data
                  </button>
                </div>
                <div className="rep-enrollment-table-wrapper">
                  <table className="rep-enrollment-table">
                    <thead>
                      <tr>
                        <th>Grade Level</th>
                        <th>BOSY Enrollment</th>
                        <th>Number of Repeaters</th>
                        <th>Number of Dropouts</th>
                        <th>Number of Functional Classrooms</th>
                        <th>Number of Seats</th>
                        <th>Number of Teachers</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const syData = data?.schoolYears?.[enrollmentModalYear] || {};
                        const classroomsList = syData.classrooms || [];
                        
                        // Sort classrooms to ensure: Kinder, Grade 1, Grade 2, ...
                        const order = ['Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];
                        const sortedClassrooms = [...classroomsList].sort((a, b) => {
                          return order.indexOf(a.gradeLevel) - order.indexOf(b.gradeLevel);
                        });

                        // Calculate totals
                        const totalStudents = sortedClassrooms.reduce((sum, c) => sum + (c.enrollment || 0), 0);
                        const totalRepeaters = sortedClassrooms.reduce((sum, c) => sum + (c.repeaters || 0), 0);
                        const totalDropouts = sortedClassrooms.reduce((sum, c) => sum + (c.dropouts || 0), 0);
                        
                        // Functional Classrooms Total
                        const classroomsTotalCount = syData.totalClassrooms || sortedClassrooms.reduce((sum, c) => {
                          const num = parseInt(c.classrooms);
                          return sum + (isNaN(num) ? 0 : num);
                        }, 0);

                        // Seats Total
                        const seatsTotalCount = syData.totalSeats || sortedClassrooms.reduce((sum, c) => {
                          const num = parseInt(c.seats);
                          return sum + (isNaN(num) ? 0 : num);
                        }, 0);

                        const totalTeachersCount = syData.totalTeachers || (sortedClassrooms.reduce((sum, c) => sum + (c.teachers || 0), 0) + (enrollmentModalYear === 'S.Y. 2021-2022' ? 0 : 1));
                        
                        const relievingTeachersCount = Math.max(0, totalTeachersCount - sortedClassrooms.reduce((sum, c) => sum + (c.teachers || 0), 0));

                        return (
                          <>
                            {sortedClassrooms.map((row, idx) => (
                              <tr key={idx}>
                                <td className="font-semibold">{row.gradeLevel.toUpperCase()}</td>
                                <td>{row.enrollment}</td>
                                <td>{row.repeaters}</td>
                                <td>{row.dropouts}</td>
                                <td>{row.classrooms}</td>
                                <td>{row.seats}</td>
                                <td>{row.teachers}</td>
                              </tr>
                            ))}
                            {/* Relieving Teacher Row */}
                            <tr className="relieving-teacher-row">
                              <td className="font-semibold">RELIEVING TEACHER</td>
                              <td className="disabled-cell"></td>
                              <td className="disabled-cell"></td>
                              <td className="disabled-cell"></td>
                              <td className="disabled-cell"></td>
                              <td className="disabled-cell"></td>
                              <td>{relievingTeachersCount}</td>
                            </tr>
                            {/* Total Row */}
                            <tr className="total-row">
                              <td className="font-bold">TOTAL</td>
                              <td className="font-bold">{totalStudents}</td>
                              <td className="font-bold">{totalRepeaters}</td>
                              <td className="font-bold">{totalDropouts}</td>
                              <td className="font-bold">{classroomsTotalCount}</td>
                              <td className="font-bold">{seatsTotalCount}</td>
                              <td className="font-bold">{totalTeachersCount}</td>
                            </tr>
                          </>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── EDIT SCHOOL YEAR STATISTICS MODAL ─── */}
      {showEditStatsModal && (
        <div className="rep-compare-modal-overlay" style={{ zIndex: 700 }}>
          <div
            className="rep-compare-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '850px', height: 'auto', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
                  <Edit size={20} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#F1F5F9' }}>
                    Edit statistics for {editStatsYear}
                  </h2>
                  <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#64748B' }}>
                    Manually update the enrollment, Repeaters, Dropouts, classrooms, seats, and teachers counts.
                  </p>
                </div>
              </div>
              <button onClick={() => setShowEditStatsModal(false)} className="rep-compare-close-btn">
                <X size={20} />
              </button>
            </div>

            {/* Modal Content Form */}
            <form onSubmit={handleSaveSchoolYearStats} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Year Totals Info Override */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', backgroundColor: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: '700', marginBottom: '6px' }}>Total Functional Classrooms (Override)</label>
                  <input 
                    type="number"
                    value={editStatsTotalClassrooms}
                    onChange={(e) => setEditStatsTotalClassrooms(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      backgroundColor: '#0D131F',
                      color: '#F8FAFC',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: '700', marginBottom: '6px' }}>Total Seats (Override)</label>
                  <input 
                    type="number"
                    value={editStatsTotalSeats}
                    onChange={(e) => setEditStatsTotalSeats(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      backgroundColor: '#0D131F',
                      color: '#F8FAFC',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                    required
                  />
                </div>
              </div>

              {/* Grade Level Table Inputs */}
              <div style={{ overflowX: 'auto', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <th style={{ padding: '12px 16px', color: '#94A3B8', fontWeight: '600' }}>Grade Level</th>
                      <th style={{ padding: '12px 16px', color: '#94A3B8', fontWeight: '600' }}>Enrollment</th>
                      <th style={{ padding: '12px 16px', color: '#94A3B8', fontWeight: '600' }}>Repeaters</th>
                      <th style={{ padding: '12px 16px', color: '#94A3B8', fontWeight: '600' }}>Dropouts</th>
                      <th style={{ padding: '12px 16px', color: '#94A3B8', fontWeight: '600' }}>Classrooms</th>
                      <th style={{ padding: '12px 16px', color: '#94A3B8', fontWeight: '600' }}>Seats</th>
                      <th style={{ padding: '12px 16px', color: '#94A3B8', fontWeight: '600' }}>Teachers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editStatsForm.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: '600', color: '#F8FAFC' }}>{row.gradeLevel.toUpperCase()}</td>
                        <td style={{ padding: '8px 12px' }}>
                          <input 
                            type="number" 
                            value={row.enrollment} 
                            onChange={(e) => {
                              const updated = [...editStatsForm];
                              updated[idx].enrollment = Number(e.target.value) || 0;
                              setEditStatsForm(updated);
                            }}
                            style={{ width: '75px', padding: '6px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#0D131F', color: 'white', outline: 'none' }}
                            required
                            min="0"
                          />
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <input 
                            type="number" 
                            value={row.repeaters} 
                            onChange={(e) => {
                              const updated = [...editStatsForm];
                              updated[idx].repeaters = Number(e.target.value) || 0;
                              setEditStatsForm(updated);
                            }}
                            style={{ width: '70px', padding: '6px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#0D131F', color: 'white', outline: 'none' }}
                            required
                            min="0"
                          />
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <input 
                            type="number" 
                            value={row.dropouts} 
                            onChange={(e) => {
                              const updated = [...editStatsForm];
                              updated[idx].dropouts = Number(e.target.value) || 0;
                              setEditStatsForm(updated);
                            }}
                            style={{ width: '70px', padding: '6px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#0D131F', color: 'white', outline: 'none' }}
                            required
                            min="0"
                          />
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <input 
                            type="text" 
                            value={row.classrooms} 
                            onChange={(e) => {
                              const updated = [...editStatsForm];
                              updated[idx].classrooms = e.target.value;
                              setEditStatsForm(updated);
                            }}
                            style={{ width: '70px', padding: '6px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#0D131F', color: 'white', outline: 'none' }}
                            required
                          />
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <input 
                            type="text" 
                            value={row.seats} 
                            onChange={(e) => {
                              const updated = [...editStatsForm];
                              updated[idx].seats = e.target.value;
                              setEditStatsForm(updated);
                            }}
                            style={{ width: '70px', padding: '6px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#0D131F', color: 'white', outline: 'none' }}
                            required
                          />
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <input 
                            type="number" 
                            value={row.teachers} 
                            onChange={(e) => {
                              const updated = [...editStatsForm];
                              updated[idx].teachers = Number(e.target.value) || 0;
                              setEditStatsForm(updated);
                            }}
                            style={{ width: '65px', padding: '6px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#0D131F', color: 'white', outline: 'none' }}
                            required
                            min="0"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowEditStatsModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    color: '#94A3B8',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editStatsLoading}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    opacity: editStatsLoading ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
                  }}
                >
                  {editStatsLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ─── ALL SCHOOL INSIGHTS MODAL ─── */}
      {showInsightsModal && (
        <div className="rep-modal-overlay" onClick={() => setShowInsightsModal(false)} style={{zIndex: 600}}>
          <div
            className="rep-insights-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="rep-insights-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button className="rep-insights-back-btn" onClick={() => setShowInsightsModal(false)}>
                  <ChevronLeft size={20} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Lightbulb size={22} style={{ color: '#F59E0B' }} />
                  <div>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#F1F5F9', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      All School Insights
                      <span style={{ fontSize: '11px', backgroundColor: '#10B981', color: 'white', padding: '3px 10px', borderRadius: '20px', fontWeight: '600' }}>{insightCounts.total} Active</span>
                    </h2>
                    <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748B' }}>Comprehensive school-wide actionable insights and operational recommendations.</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowInsightsModal(false)} className="rep-insights-close-btn">
                <X size={22} />
              </button>
            </div>

            {/* Summary Cards */}
            <div className="rep-insights-summary-row">
              <div className="rep-insights-summary-card" style={{borderLeft: '3px solid #3B82F6'}}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}><ClipboardList size={14} /></div>
                  <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '500' }}>Total Insights</span>
                </div>
                <h3 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#F1F5F9' }}>{insightCounts.total}</h3>
              </div>
              <div className="rep-insights-summary-card" style={{borderLeft: '3px solid #EF4444'}}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}><AlertCircle size={14} /></div>
                  <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '500' }}>Warnings</span>
                </div>
                <h3 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#F1F5F9' }}>{insightCounts.warnings}</h3>
              </div>
              <div className="rep-insights-summary-card" style={{borderLeft: '3px solid #10B981'}}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}><Check size={14} /></div>
                  <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '500' }}>Successes</span>
                </div>
                <h3 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#F1F5F9' }}>{insightCounts.successes}</h3>
              </div>
              <div className="rep-insights-summary-card" style={{borderLeft: '3px solid #F59E0B'}}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}><Lightbulb size={14} /></div>
                  <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '500' }}>Ideas & Recs</span>
                </div>
                <h3 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#F1F5F9' }}>{insightCounts.ideas}</h3>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="rep-insights-toolbar">
              <div className="rep-insights-search">
                <Search size={16} style={{ color: '#64748B' }} />
                <input
                  type="text"
                  placeholder="Search insights by section, title, or keywords..."
                  value={insightsSearch}
                  onChange={(e) => setInsightsSearch(e.target.value)}
                />
              </div>
              <div className="rep-insights-filter-tabs">
                {['All', 'Warning', 'Success', 'Idea'].map(tab => (
                  <button
                    key={tab}
                    className={`rep-insights-filter-btn ${insightsFilter === tab ? 'active' : ''}`}
                    onClick={() => setInsightsFilter(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Insights Grid */}
            <div className="rep-insights-cards-grid">
              {filteredInsights.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 0', color: '#64748B' }}>
                  <Search size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
                  <p style={{ fontSize: '15px', margin: 0 }}>No insights match your search or filter.</p>
                </div>
              ) : (
                filteredInsights.map((insight, idx) => (
                  <div
                    key={insight.id}
                    className={`rep-insights-card rep-insights-card--${insight.type}`}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="rep-insights-card-top">
                      <div className={`rep-insights-card-icon rep-insights-card-icon--${insight.type}`}>
                        {insight.type === 'warning' && <AlertCircle size={18} />}
                        {insight.type === 'success' && <Check size={18} />}
                        {insight.type === 'idea' && <Lightbulb size={18} />}
                      </div>
                      <span className="rep-insights-card-section">
                        <span className={`rep-insights-section-dot rep-insights-section-dot--${insight.type}`}></span>
                        {insight.section}
                      </span>
                    </div>
                    <h4 className="rep-insights-card-title">{insight.title}</h4>
                    <p className="rep-insights-card-desc">{insight.description}</p>
                    <div className="rep-insights-card-footer">
                      <span className="rep-insights-card-time">{insight.time}</span>
                      <span className={`rep-insights-impact-badge rep-insights-impact--${insight.impact.toLowerCase()}`}>{insight.impact} IMPACT</span>
                      <button className="rep-insights-review-btn">Review Action</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── CLASSROOM SIZE MODAL ─── */}
      {showClassroomSizeModal && (
        <div className="rep-classroom-size-overlay" onClick={() => setShowClassroomSizeModal(false)}>
          <div className="rep-classroom-size-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rep-classroom-size-header">
              <div className="rep-classroom-size-title-group">
                <div className="rep-classroom-size-title-icon">
                  <LayoutDashboard size={20} />
                </div>
                <div>
                  <h2>Classroom Size</h2>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94A3B8' }}>Layout configurations and specifications by grade levels.</p>
                </div>
              </div>
              <button onClick={() => setShowClassroomSizeModal(false)} className="rep-classroom-size-close-btn">
                <X size={20} />
              </button>
            </div>
            <div className="rep-classroom-size-body">
              <div className="rep-classroom-size-img-wrapper">
                <img 
                  src="/classroom_size.jpg" 
                  alt="Classroom Size Layouts" 
                  className="rep-classroom-size-img" 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── YEAR COMPARISON MODAL ─── */}
      {showCompareYearModal && (
        <div className="rep-compare-modal-overlay" onClick={() => setShowCompareYearModal(false)}>
          <div className="rep-compare-modal" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="rep-compare-modal-header">
              <div className="rep-compare-modal-title">
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(249,115,22,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F97316' }}>
                  <BarChart2 size={20} />
                </div>
                <div>
                  <h2>Year Comparison</h2>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>Analyze and compare school performance metrics across different academic years.</p>
                </div>
              </div>
              <button onClick={() => setShowCompareYearModal(false)} className="rep-compare-close-btn">
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="rep-compare-modal-content">
              
              {/* Year Select Pills - Multi-select */}
              <div className="rep-compare-pills-container">
                <span className="rep-compare-pills-label">Select years to compare:</span>
                <div className="rep-compare-pills">
                  {data?.schoolYears && Object.keys(data.schoolYears).sort().reverse().map((sy, idx) => {
                    const shortName = getShortYear(sy);
                    const isSelected = compareSelectedYears.includes(sy);
                    const colorIdx = compareSelectedYears.indexOf(sy);
                    
                    return (
                      <button 
                        key={sy}
                        className={`rep-compare-pill ${isSelected ? 'selected' : ''}`}
                        style={isSelected ? { 
                          backgroundColor: COMPARE_YEAR_COLORS[colorIdx % COMPARE_YEAR_COLORS.length], 
                          borderColor: COMPARE_YEAR_COLORS[colorIdx % COMPARE_YEAR_COLORS.length],
                          color: '#fff' 
                        } : {}}
                        onClick={() => toggleCompareYear(sy)}
                      >
                        {shortName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Top Row: KPI cards for each selected year + Chart */}
              <div className="rep-compare-top-layout" style={{ gridTemplateColumns: `repeat(${Math.min(compareSelectedYears.length, 3)}, 1fr) 2fr` }}>
                
                {/* Dynamic KPI cards for each selected year */}
                {compareSelectedYears.slice(0, 3).map((sy, idx) => (
                  <div key={sy} className="rep-compare-kpi-card" style={{ borderTop: `3px solid ${COMPARE_YEAR_COLORS[idx % COMPARE_YEAR_COLORS.length]}` }}>
                    <div className="rep-compare-kpi-card-header">
                      <span className="rep-compare-kpi-card-title">{getShortYear(sy)} Metrics</span>
                      <span className="rep-compare-badge" style={{ backgroundColor: COMPARE_YEAR_COLORS[idx % COMPARE_YEAR_COLORS.length] + '22', color: COMPARE_YEAR_COLORS[idx % COMPARE_YEAR_COLORS.length] }}>
                        {idx === 0 ? 'Primary' : `Compare ${idx}`}
                      </span>
                    </div>
                    <div className="rep-compare-kpi-list">
                      <div className="rep-compare-kpi-item">
                        <span className="rep-compare-kpi-item-label">Enrollment</span>
                        <span className="rep-compare-kpi-item-value">{data?.schoolYears?.[sy]?.totalStudents || 0}</span>
                      </div>
                      <div className="rep-compare-kpi-item">
                        <span className="rep-compare-kpi-item-label">Active Teachers</span>
                        <span className="rep-compare-kpi-item-value">{data?.schoolYears?.[sy]?.totalTeachers || 0}</span>
                      </div>
                      <div className="rep-compare-kpi-item">
                        <span className="rep-compare-kpi-item-label">Dropout of Student</span>
                        <span className="rep-compare-kpi-item-value">
                          {data?.schoolYears?.[sy]?.totalDropouts || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Recharts Performance Comparison Chart - multi-year bars */}
                <div className="rep-compare-chart-card">
                  <div className="rep-compare-chart-card-header">
                    <div>
                      <div className="rep-compare-chart-title">
                        <TrendingUp size={16} style={{ color: '#3B82F6' }} /> Performance Comparison
                      </div>
                      <div className="rep-compare-chart-subtitle">Grade-level enrollment distributions</div>
                    </div>
                    <div className="rep-compare-chart-legend" style={{ flexWrap: 'wrap' }}>
                      {compareSelectedYears.map((sy, idx) => (
                        <div key={sy} className="rep-compare-chart-legend-item">
                          <div className="rep-compare-chart-legend-color" style={{ backgroundColor: COMPARE_YEAR_COLORS[idx % COMPARE_YEAR_COLORS.length] }}></div>
                          {getShortYear(sy)}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ flex: 1, minHeight: '260px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getGradeComparisonChartData(compareSelectedYears)} margin={{ top: 10, right: 10, left: -25, bottom: 0 }} barGap={4}>
                        <defs>
                          <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.95}/>
                            <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.25}/>
                          </linearGradient>
                          <linearGradient id="gradPurple" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.95}/>
                            <stop offset="100%" stopColor="#6D28D9" stopOpacity={0.25}/>
                          </linearGradient>
                          <linearGradient id="gradOrange" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#F97316" stopOpacity={0.95}/>
                            <stop offset="100%" stopColor="#C2410C" stopOpacity={0.25}/>
                          </linearGradient>
                          <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10B981" stopOpacity={0.95}/>
                            <stop offset="100%" stopColor="#047857" stopOpacity={0.25}/>
                          </linearGradient>
                          <linearGradient id="gradRose" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.95}/>
                            <stop offset="100%" stopColor="#BE123C" stopOpacity={0.25}/>
                          </linearGradient>
                          <linearGradient id="gradPink" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#EC4899" stopOpacity={0.95}/>
                            <stop offset="100%" stopColor="#BE185D" stopOpacity={0.25}/>
                          </linearGradient>
                          <linearGradient id="gradTeal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.95}/>
                            <stop offset="100%" stopColor="#0891B2" stopOpacity={0.25}/>
                          </linearGradient>
                          <linearGradient id="gradAmber" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.95}/>
                            <stop offset="100%" stopColor="#B45309" stopOpacity={0.25}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-gray)', fontSize: 10}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-gray)', fontSize: 10}} />
                        <Tooltip content={<CustomTooltip />} />
                        {compareSelectedYears.map((sy, idx) => (
                          <Bar key={sy} dataKey={sy} fill={COMPARE_YEAR_GRADIENTS[idx % COMPARE_YEAR_GRADIENTS.length]} radius={[3, 3, 0, 0]} isAnimationActive={true} animationDuration={800} />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* Dynamic Context Drivers Row - scrollable for many years */}
              <div className="rep-compare-context-row" style={{ flexWrap: 'nowrap', overflowX: 'auto' }}>
                
                {/* Context card for each selected year */}
                {compareSelectedYears.map((sy, idx) => (
                  <div key={sy} className="rep-compare-context-card" style={{ minWidth: '280px', flex: '1 0 280px', borderTop: `2px solid ${COMPARE_YEAR_COLORS[idx % COMPARE_YEAR_COLORS.length]}` }}>
                    <h4 className="rep-compare-context-card-title" style={{ color: COMPARE_YEAR_COLORS[idx % COMPARE_YEAR_COLORS.length] }}>
                      <GraduationCap size={16} /> {getShortYear(sy)} Context
                    </h4>
                    <div className="rep-compare-context-list">
                      <div className="rep-compare-context-item">
                        <h5>Enrollment Drivers</h5>
                        <p>{getYearlyContext(sy).drivers}</p>
                      </div>
                      <div className="rep-compare-context-item">
                        <h5>Staffing & Operations</h5>
                        <p>{getYearlyContext(sy).operations}</p>
                      </div>
                      <div className="rep-compare-context-item">
                        <h5>Efficiency & Retention</h5>
                        <p>{getYearlyContext(sy).efficiency}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Multi-Year Summary */}
                <div className="rep-compare-context-card summary" style={{ minWidth: '280px', flex: '1 0 280px' }}>
                  <h4 className="rep-compare-context-card-title" style={{ color: '#EA580C' }}>
                    <TrendingUp size={16} /> Multi-Year Summary
                  </h4>
                  <p style={{ fontSize: '13px', color: '#E2E8F0', lineHeight: 1.6, margin: 0 }}>
                    {getMultiYearSummaryText(compareSelectedYears)}
                  </p>
                </div>

              </div>

              {/* Executive Summary Row - all selected years */}
              <div className="rep-compare-exec-row" style={{ display: 'grid', gridTemplateColumns: `repeat(${compareSelectedYears.length}, 1fr)`, gap: '12px' }}>
                {compareSelectedYears.map((sy, idx) => (
                  <div key={sy} className="rep-compare-exec-card" style={{ borderLeft: `3px solid ${COMPARE_YEAR_COLORS[idx % COMPARE_YEAR_COLORS.length]}` }}>
                    <h4 className="rep-compare-exec-card-title" style={{ color: COMPARE_YEAR_COLORS[idx % COMPARE_YEAR_COLORS.length] }}>
                      <ClipboardList size={14} /> Executive Summary ({getShortYear(sy)})
                    </h4>
                    <p>{getYearExecutiveSummary(sy)}</p>
                  </div>
                ))}
              </div>

              {/* Monthly Performance Breakdown Section */}
              <div className="rep-compare-monthly-section">
                <div className="rep-compare-monthly-header-row">
                  <div className="rep-compare-monthly-title">
                    <h3>Monthly Performance Breakdown</h3>
                    <p>Track monthly trends, highlights, and operational warnings</p>
                  </div>
                  <div className="rep-compare-monthly-tabs" style={{ flexWrap: 'wrap' }}>
                    {compareSelectedYears.map((sy, idx) => (
                      <button 
                        key={sy}
                        className={`rep-compare-monthly-tab ${compareYearMonthlyTab === sy ? 'active' : ''}`}
                        onClick={() => setCompareYearMonthlyTab(sy)}
                        style={compareYearMonthlyTab === sy ? { borderColor: COMPARE_YEAR_COLORS[idx % COMPARE_YEAR_COLORS.length], color: COMPARE_YEAR_COLORS[idx % COMPARE_YEAR_COLORS.length] } : {}}
                      >
                        {getShortYear(sy)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Months Grid */}
                <div className="rep-compare-monthly-grid">
                  {getMonthlyBreakdownData(compareYearMonthlyTab).map(month => (
                    <div key={month.name} className="rep-compare-month-card">
                      <div className="rep-compare-month-card-header">
                        <span className="rep-compare-month-name">{month.name}</span>
                        <span className={`rep-compare-month-badge ${month.status}`}>
                          {month.status}
                        </span>
                      </div>
                      
                      <div className="rep-compare-month-boxes">
                        <div className="rep-compare-month-box">
                          <div className="rep-compare-month-box-label">Attendance</div>
                          <div className="rep-compare-month-box-value">{month.attendance}</div>
                        </div>
                        <div className="rep-compare-month-box">
                          <div className="rep-compare-month-box-label">Grade Avg</div>
                          <div className="rep-compare-month-box-value">{month.gradeAvg}</div>
                        </div>
                      </div>

                      <div className="rep-compare-month-narrative">
                        <div className="rep-compare-month-narrative-group">
                          <span className="rep-compare-narrative-label">What Happened</span>
                          <span className="rep-compare-narrative-val">{month.desc}</span>
                        </div>
                        
                        {month.issue && (
                          <div className="rep-compare-month-narrative-group">
                            <span className="rep-compare-narrative-label">Issue Encountered</span>
                            <span className="rep-compare-narrative-val issue">"{month.issue}"</span>
                          </div>
                        )}

                        {month.res && (
                          <div className="rep-compare-month-narrative-group">
                            <span className="rep-compare-narrative-label">Resolution / Next</span>
                            <span className="rep-compare-narrative-val resolution">{month.res}</span>
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* ─── CUSTOM CONFIRM MODAL ─── */}
      {customConfirm.show && (
        <div className="rep-modal-overlay" style={{ zIndex: 3000, background: 'rgba(4, 7, 12, 0.85)', backdropFilter: 'blur(8px)' }} onClick={() => setCustomConfirm({ ...customConfirm, show: false })}>
          <div className="rep-compare-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', height: 'auto', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', flexShrink: 0 }}>
                <AlertCircle size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '700', color: '#F8FAFC', textAlign: 'left' }}>
                  {customConfirm.title}
                </h3>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#94A3B8', lineHeight: 1.6, textAlign: 'left' }}>
                  {customConfirm.message}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button 
                onClick={() => setCustomConfirm({ ...customConfirm, show: false })}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  color: '#94A3B8',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (customConfirm.onConfirm) {
                    customConfirm.onConfirm();
                  }
                  setCustomConfirm({ ...customConfirm, show: false });
                }}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                  transition: 'all 0.2s'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── EXPORT / IMPORT SCHOOL YEAR MODAL ─── */}
      {showExportImportModal && (
        <div className="rep-compare-modal-overlay" onClick={() => setShowExportImportModal(false)}>
          <div className="rep-compare-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px', height: 'auto', padding: '0', overflow: 'hidden' }}>
            {/* Modal Header */}
            <div className="rep-compare-modal-header" style={{ padding: '20px 24px' }}>
              <div className="rep-compare-modal-title">
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
                  <Download size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#F8FAFC', margin: 0 }}>Export & Import School Data</h2>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>Census data reports and upload records for academic school years.</p>
                </div>
              </div>
              <button onClick={() => setShowExportImportModal(false)} className="rep-compare-close-btn">
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="rep-compare-modal-content" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Tab Selector */}
              <div className="rep-expimp-tabs-container">
                <button
                  type="button"
                  className={`rep-expimp-tab-btn ${exportImportTab === 'export' ? 'active' : ''}`}
                  onClick={() => setExportImportTab('export')}
                >
                  <Download size={15} /> Export Report
                </button>
                <button
                  type="button"
                  className={`rep-expimp-tab-btn ${exportImportTab === 'import' ? 'active' : ''}`}
                  onClick={() => setExportImportTab('import')}
                >
                  <Upload size={15} /> Import Data
                </button>
                <button
                  type="button"
                  className={`rep-expimp-tab-btn ${exportImportTab === 'manage' ? 'active' : ''}`}
                  onClick={() => setExportImportTab('manage')}
                >
                  <Trash2 size={15} /> Manage School Years
                </button>
              </div>

              {/* Export Section */}
              {exportImportTab === 'export' && (
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#F8FAFC', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Download size={16} style={{ color: '#10B981' }} /> Export School Year Report
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#94A3B8', margin: '0 0 16px 0', lineHeight: '1.4' }}>
                    Download a professionally formatted Excel spreadsheet (.xlsx) with enrollment counts, teachers, seats, and classrooms for the chosen school year or the entire 7-year history.
                  </p>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: '700', marginBottom: '6px' }}>Select School Year</label>
                      <select 
                        value={exportYearSelect} 
                        onChange={(e) => setExportYearSelect(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid rgba(255,255,255,0.08)',
                          backgroundColor: '#0D131F',
                          color: '#F8FAFC',
                          fontSize: '13px',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="All">All School Years (2020-2027)</option>
                        <option value="S.Y. 2020-2021">S.Y. 2020-2021</option>
                        <option value="S.Y. 2021-2022">S.Y. 2021-2022</option>
                        <option value="S.Y. 2022-2023">S.Y. 2022-2023</option>
                        <option value="S.Y. 2023-2024">S.Y. 2023-2024</option>
                        <option value="S.Y. 2024-2025">S.Y. 2024-2025</option>
                        <option value="S.Y. 2025-2026">S.Y. 2025-2026</option>
                        <option value="S.Y. 2026-2027">S.Y. 2026-2027</option>
                      </select>
                    </div>
                    <button 
                      onClick={handleExportReportYear}
                      style={{
                        alignSelf: 'flex-end',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        color: 'white',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Download size={15} /> Export File
                    </button>
                  </div>
                </div>
              )}

              {/* Import Section */}
              {exportImportTab === 'import' && (
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#F8FAFC', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Upload size={16} style={{ color: '#3B82F6' }} /> Import New School Year Data
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#94A3B8', margin: '0 0 16px 0', lineHeight: '1.4' }}>
                    Add or overwrite records for any school year by uploading a compatible Excel spreadsheet template. The spreadsheet must begin with a row containing the year label (e.g. <strong>"S.Y. 2020-2021"</strong>).
                  </p>
                  <form onSubmit={handleImportYear} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div 
                      style={{ 
                        border: '2px dashed rgba(255, 255, 255, 0.1)', 
                        borderRadius: '10px', 
                        padding: '24px', 
                        textAlign: 'center',
                        background: 'rgba(255, 255, 255, 0.01)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        position: 'relative'
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          setImportFile(e.dataTransfer.files[0]);
                        }
                      }}
                    >
                      <input 
                        type="file" 
                        accept=".xlsx, .xls"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setImportFile(e.target.files[0]);
                          }
                        }}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          opacity: 0,
                          cursor: 'pointer'
                        }}
                      />
                      <Upload size={28} style={{ color: '#64748B', marginBottom: '8px' }} />
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '500', color: '#F8FAFC' }}>
                        {importFile ? importFile.name : 'Click to select or drag & drop Excel file'}
                      </p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748B' }}>
                        Supports .xlsx, .xls formats up to 10MB
                      </p>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                      {importFile && (
                        <button 
                          type="button"
                          onClick={() => setImportFile(null)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            background: 'rgba(255, 255, 255, 0.03)',
                            color: '#94A3B8',
                            fontSize: '12.5px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Clear File
                        </button>
                      )}
                      <button 
                        type="submit"
                        disabled={importLoading || !importFile}
                        style={{
                          padding: '8px 20px',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                          color: 'white',
                          fontSize: '12.5px',
                          fontWeight: '600',
                          cursor: importFile ? 'pointer' : 'not-allowed',
                          opacity: importFile ? 1 : 0.6,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: importFile ? '0 4px 12px rgba(59, 130, 246, 0.2)' : 'none',
                          transition: 'all 0.2s'
                        }}
                      >
                        {importLoading ? 'Uploading...' : 'Upload & Import'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Manage School Years Section */}
              {exportImportTab === 'manage' && (
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#F8FAFC', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Trash2 size={16} style={{ color: '#EF4444' }} /> Manage School Years
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#94A3B8', margin: '0 0 16px 0', lineHeight: '1.4' }}>
                    Completely delete a school year and all its corresponding census data from the database. This action is irreversible.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                    {globalYears.map(sy => (
                      <div 
                        key={sy} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between', 
                          padding: '8px 12px', 
                          backgroundColor: '#0D131F', 
                          border: '1px solid rgba(255,255,255,0.06)', 
                          borderRadius: '8px' 
                        }}
                      >
                        <span style={{ fontSize: '12.5px', fontWeight: '500', color: '#F8FAFC' }}>{sy}</span>
                        <button 
                          type="button"
                          onClick={() => handleDeleteSchoolYearClick(sy)}
                          disabled={globalYears.length <= 1}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: globalYears.length <= 1 ? '#475569' : '#EF4444',
                            cursor: globalYears.length <= 1 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '4px',
                            borderRadius: '4px',
                            transition: 'background-color 0.2s'
                          }}
                          title={globalYears.length <= 1 ? "Cannot delete the only remaining school year" : `Delete ${sy}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ─── CUSTOM ALERT MODAL ─── */}
      {customAlert.show && (
        <div className="rep-modal-overlay" style={{ zIndex: 3100, background: 'rgba(4, 7, 12, 0.7)', backdropFilter: 'blur(4px)' }} onClick={() => setCustomAlert({ ...customAlert, show: false })}>
          <div className="rep-compare-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', height: 'auto', padding: '24px', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              backgroundColor: customAlert.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: customAlert.type === 'success' ? '#10B981' : '#EF4444',
              margin: '0 auto 16px'
            }}>
              {customAlert.type === 'success' ? <Check size={28} /> : <AlertCircle size={28} />}
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '700', color: '#F8FAFC' }}>
              {customAlert.title}
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '13.5px', color: '#94A3B8', lineHeight: 1.5 }}>
              {customAlert.message}
            </p>
            <button 
              onClick={() => setCustomAlert({ ...customAlert, show: false })}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: customAlert.type === 'success' ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                color: 'white',
                fontSize: '13.5px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div className="rep-modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div 
            className="rep-modal-container" 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '450px',
              maxWidth: '90vw',
              backgroundColor: '#0F172A',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: 'white',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(16px)',
              overflow: 'hidden'
            }}
          >
            <div className="rep-modal-header" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6', padding: '8px', borderRadius: '8px', display: 'flex' }}>
                  <Settings size={20} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: 'white' }}>Admin Settings</h2>
                  <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8' }}>Customize your portal preferences</p>
                </div>
              </div>
              <button onClick={() => setShowSettingsModal(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', display: 'flex' }}>
                <X size={20} />
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const newName = formData.get('adminName');
                const newEmail = formData.get('adminEmail');
                const newTheme = formData.get('adminTheme');
                const newYear = formData.get('adminYear');
                
                if (newName) setAdminName(newName);
                if (newEmail) setAdminEmail(newEmail);
                if (newTheme) setTheme(newTheme);
                if (newYear) setSelectedYear(newYear);
                
                setShowSettingsModal(false);
              }}
              style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#94A3B8' }}>Admin Name</label>
                <input 
                  type="text" 
                  name="adminName"
                  defaultValue={adminName} 
                  required
                  style={{
                    backgroundColor: '#1E293B',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#94A3B8' }}>Admin Email</label>
                <input 
                  type="email" 
                  name="adminEmail"
                  defaultValue={adminEmail} 
                  required
                  style={{
                    backgroundColor: '#1E293B',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#94A3B8' }}>Theme Selection</label>
                <select 
                  name="adminTheme"
                  defaultValue={theme}
                  style={{
                    backgroundColor: '#1E293B',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#94A3B8' }}>Default School Year</label>
                <select 
                  name="adminYear"
                  defaultValue={selectedYear}
                  style={{
                    backgroundColor: '#1E293B',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="S.Y. 2025-2026">S.Y. 2025-2026</option>
                  <option value="S.Y. 2026-2027">S.Y. 2026-2027</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowSettingsModal(false)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    background: 'transparent',
                    color: '#94A3B8',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                    color: 'white',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)'
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
