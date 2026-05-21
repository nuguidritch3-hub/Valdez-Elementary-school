import React, { useState, useEffect } from 'react';
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
  Menu
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

  useEffect(() => {
    setStudentCurrentPage(1);
  }, [selectedGrade, selectedSection, selectedYear, studentSearchQuery, studentStatusFilter]);
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
  const [insightsFilter, setInsightsFilter] = useState('All');
  const [insightsSearch, setInsightsSearch] = useState('');

  // Year Comparison Modal States
  const [showCompareYearModal, setShowCompareYearModal] = useState(false);
  const [compareYearPrimary, setCompareYearPrimary] = useState('S.Y. 2025-2026');
  const [compareYearSecondary, setCompareYearSecondary] = useState('S.Y. 2024-2025');
  const [compareYearMonthlyTab, setCompareYearMonthlyTab] = useState('S.Y. 2025-2026');

  useEffect(() => {
    if (data?.schoolYears) {
      const sortedYears = Object.keys(data.schoolYears).sort().reverse();
      if (sortedYears.length > 0) {
        setCompareYearPrimary(sortedYears[0]);
        setCompareYearMonthlyTab(sortedYears[0]);
      }
      if (sortedYears.length > 1) {
        setCompareYearSecondary(sortedYears[1]);
      }
    }
  }, [data]);

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

  const getMultiYearSummaryText = (pYear, sYear) => {
    const pData = data?.schoolYears?.[pYear] || {};
    const sData = data?.schoolYears?.[sYear] || {};
    const pStudents = pData.totalStudents || 0;
    const sStudents = sData.totalStudents || 0;
    const pShort = getShortYear(pYear);
    const sShort = getShortYear(sYear);
    
    if (pStudents > sStudents) {
      return `Ultimately, comparing the two years shows a positive enrollment growth of +${pStudents - sStudents} students from ${sShort} to ${pShort}, indicating strong community interest and improved student retention.`;
    } else if (pStudents < sStudents) {
      return `Ultimately, comparing the two periods shows an enrollment stabilization with a change of -${sStudents - pStudents} students from ${sShort} to ${pShort}. This allows the administration to focus on improving infrastructure and reducing student-to-teacher ratios.`;
    } else {
      return `Ultimately, comparing the two years shows a highly stable student enrollment at exactly ${pStudents} students, facilitating long-term resource planning and curriculum standardizations.`;
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

  const getGradeComparisonChartData = (pYear, sYear) => {
    const pData = data?.schoolYears?.[pYear] || {};
    const sData = data?.schoolYears?.[sYear] || {};
    
    const grades = ['Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];
    
    return grades.map(grade => {
      const pClass = pData.classrooms?.find(c => c.gradeLevel === grade) || {};
      const sClass = sData.classrooms?.find(c => c.gradeLevel === grade) || {};
      
      const pEnrollment = pClass.enrollment || 0;
      const sEnrollment = sClass.enrollment || 0;
      
      return {
        name: grade,
        [pYear]: pEnrollment,
        [sYear]: sEnrollment
      };
    });
  };

  const schoolInsights = [
    { id: 1, type: 'warning', section: 'Grade 6 - Sampaguita', title: 'High Absenteeism Rate', description: 'Absenteeism is 15% above target. Consider parent-teacher interventions and home visitation programs.', time: 'Today', impact: 'HIGH' },
    { id: 2, type: 'success', section: 'Grade 1 - Mabini', title: 'Strong Enrollment Growth', description: 'Next year\'s enrollment is projected to exceed targets by 12% based on current trends. Great work from the admissions team.', time: 'Yesterday', impact: 'MEDIUM' },
    { id: 3, type: 'idea', section: 'Grade 4 - Aguinaldo', title: 'Resource Optimization', description: 'Underutilized classrooms detected. Consider consolidating sections to optimize teacher allocation.', time: '2 Days Ago', impact: 'HIGH' },
    { id: 4, type: 'warning', section: 'Kinder - Section A', title: 'Low Reading Proficiency', description: 'Reading proficiency dropped to 68%. Re-evaluate literacy programs and schedule remedial reading sessions.', time: 'Today', impact: 'MEDIUM' },
    { id: 5, type: 'success', section: 'Grade 3 - Del Pilar', title: 'Excellent Math Scores', description: 'Average math scores reached 92/100 consistently over the past quarterly exam. Outstanding teaching methodology.', time: '3 Days Ago', impact: 'HIGH' },
    { id: 6, type: 'warning', section: 'Grade 5 - Gomez', title: 'Elevated Dropout Risk', description: 'Average attendance dropped significantly. Check for socioeconomic factors or temporary family issues.', time: 'Yesterday', impact: 'HIGH' },
    { id: 7, type: 'idea', section: 'Grade 2 - Rizal', title: 'Digital Learning Opportunity', description: 'Local tech partners expressed interest in donating tablets. Follow up to secure long-term digital learning resources.', time: 'Today', impact: 'MEDIUM' },
    { id: 8, type: 'success', section: 'All Sections', title: 'Compliance Audit Passed', description: 'School passed the DepEd compliance audit with flying colors (98/100). All documentation is up to date.', time: '1 Week Ago', impact: 'LOW' },
    { id: 9, type: 'idea', section: 'School-Wide', title: 'Standardize Assessment Tools', description: 'Grading variances across sections noticed. Suggesting a unified rubric rollout for Q4 exams.', time: '2 Weeks Ago', impact: 'HIGH' },
    { id: 10, type: 'idea', section: 'Grade 1 - Bonifacio', title: 'AI-Assisted Tutoring', description: 'Implement AI-driven adaptive learning modules to personalize instruction and reduce remedial class load by 25%.', time: 'Today', impact: 'MEDIUM' },
  ];

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

  const dynamicGenderData = () => {
    const total = totalStudents || 502;
    const ratio = 560 / 1245;
    const boys = Math.round(total * ratio);
    const girls = total - boys;
    
    return [
      { name: 'Boys', value: boys, color: '#1E3A8A' },
      { name: 'Girls', value: girls, color: '#FB7185' }
    ];
  };
  const computedGender = dynamicGenderData();

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

    const colorPalette = ['#06B6D4', '#FB7185', '#1E3A8A', '#F472B6', '#3B82F6', '#2DD4BF', '#FBBF24'];

    return { 
      data: dynamicData, 
      grades: labels.map(l => `grade${rawLabels.indexOf(l)}`), 
      labels: labels,
      colors: labels.map(l => colorPalette[rawLabels.indexOf(l) % colorPalette.length])
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
        <div className="rep-premium-analytics-header" style={{justifyContent: 'flex-end'}}>
          <button className="rep-dropdown" onClick={() => setShowCompareYearModal(true)}>Compare Year <ChevronDown size={14}/></button>
        </div>

        <div className="rep-premium-kpis">
          <div className="rep-premium-kpi-card">
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
              <div className="rep-premium-trend-badge down"><ArrowDownIcon/> -1.2%</div>
            </div>
            <div>
              <div className="rep-premium-kpi-label">Active Teachers</div>
              <h3 className="rep-premium-kpi-value">{activeTeachers}</h3>
            </div>
          </div>
          <div className="rep-premium-kpi-card">
            <div className="rep-premium-kpi-top">
              <div className="rep-premium-kpi-icon" style={{color: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.1)'}}><TrendingUp size={16}/></div>
              <div className="rep-premium-trend-badge up"><ArrowUpIcon/> +2.5%</div>
            </div>
            <div>
              <div className="rep-premium-kpi-label">Average Attendance</div>
              <h3 className="rep-premium-kpi-value">94.2%</h3>
            </div>
          </div>
          <div className="rep-premium-kpi-card">
            <div className="rep-premium-kpi-top">
              <div className="rep-premium-kpi-icon" style={{color: '#6366F1', backgroundColor: 'rgba(99,102,241,0.1)'}}><Award size={16}/></div>
              <div className="rep-premium-trend-badge up"><ArrowUpIcon/> +0.8%</div>
            </div>
            <div>
              <div className="rep-premium-kpi-label">Retention Rate</div>
              <h3 className="rep-premium-kpi-value">98.5%</h3>
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
                        <stop offset="5%" stopColor="#F97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: 'var(--text-gray)', fontSize: 10}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-gray)', fontSize: 10}} />
                    <Tooltip contentStyle={{backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-color)'}} />
                    <Area type="monotone" dataKey="value" stroke="#F97316" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" />
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
                      <Pie data={gradeData} innerRadius={50} outerRadius={75} paddingAngle={2} dataKey="value" stroke="none" isAnimationActive={true} animationDuration={1200} animationEasing="ease-out">
                        {gradeData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
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
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: 'var(--text-gray)'}} />
                    <Tooltip cursor={{fill: 'var(--bg-main)'}} />
                    <Bar dataKey="val" fill="#EF4444" radius={[2, 2, 0, 0]} background={{ fill: 'var(--bg-main)' }} isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" />
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
                  <LineChart data={yearlyData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: 'var(--text-gray)'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fill: 'var(--text-gray)'}} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} dot={false} isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" />
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
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: 'var(--text-gray)'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fill: 'var(--text-gray)'}} />
                    <Tooltip />
                    <Area type="monotone" dataKey="score" fill="#8B5CF6" stroke="#8B5CF6" fillOpacity={0.2} isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" />
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
                <div className="rep-premium-insight-item">
                  <div className="rep-premium-insight-icon red"><AlertCircle size={14}/></div>
                  <div className="rep-premium-insight-content">
                    <h4>High Absenteeism Rate</h4>
                    <p>Grade 6 absenteeism is 15% above target. Consider parent-teacher interventions.</p>
                  </div>
                </div>
                <div className="rep-premium-insight-item">
                  <div className="rep-premium-insight-icon green"><Check size={14}/></div>
                  <div className="rep-premium-insight-content">
                    <h4>Strong Enrollment Growth</h4>
                    <p>Next year's enrollment is projected to exceed targets by 12% based on current trends.</p>
                  </div>
                </div>
                <div className="rep-premium-insight-item">
                  <div className="rep-premium-insight-icon yellow"><Lightbulb size={14}/></div>
                  <div className="rep-premium-insight-content">
                    <h4>Resource Optimization</h4>
                    <p>Underutilized classrooms detected. Consider consolidating Grade 4 sections.</p>
                  </div>
                </div>
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
                  <h4>42</h4>
                </div>
                <div className="rep-premium-branch-stat">
                  <span>Active</span>
                  <h4>38</h4>
                </div>
              </div>

              <div className="rep-premium-branch-list" style={{marginBottom: '16px'}}>
                <div className="rep-premium-branch-item">
                  <div className="rep-premium-branch-item-left">
                    <div className="rep-premium-insight-icon red" style={{width: 20, height: 20}}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path></svg></div>
                    <div>
                      <h5>Main Building</h5>
                      <p>Optimal</p>
                    </div>
                  </div>
                  <div className="rep-premium-branch-item-right">
                    <h5>850</h5>
                    <p className="text-green">+5%</p>
                  </div>
                </div>
                <div className="rep-premium-branch-item">
                  <div className="rep-premium-branch-item-left">
                    <div className="rep-premium-insight-icon red" style={{width: 20, height: 20}}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path></svg></div>
                    <div>
                      <h5>Science Wing</h5>
                      <p>High Volume</p>
                    </div>
                  </div>
                  <div className="rep-premium-branch-item-right">
                    <h5>320</h5>
                    <p className="text-green">+2%</p>
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
                <span className="rep-stat-label">Total Awards</span>
                <span className="rep-stat-value">{totalAwards}</span>
              </div>
              <div className="rep-stat-icon pink">
                <Award size={24} />
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
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}} tickFormatter={(value) => `${value}%`} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    {computedPerf.grades.map((g, idx) => (
                       <Bar 
                         key={idx} 
                         dataKey={g} 
                         name={computedPerf.labels[idx]} 
                         fill={computedPerf.colors[idx]} 
                         radius={[4, 4, 4, 4]} 
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
                <div className="rep-dropdown">Grade 1 <ChevronDown size={14}/></div>
              </div>
              <div className="rep-donut-container">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={computedGender}
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={0}
                      dataKey="value"
                      stroke="none"
                    >
                      {computedGender.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="rep-donut-center">
                  <span className="rep-donut-total">{totalStudents.toLocaleString()}</span>
                </div>
              </div>
              <div className="rep-donut-legend">
                {computedGender.map((entry, idx) => (
                  <span key={idx} className="legend-item">
                    <span className={`dot ${entry.color === '#1E3A8A' ? 'blue' : 'pink'}`}></span> {entry.name}: {entry.value}
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
                  <BarChart data={dynamicAttendanceData()} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barSize={30}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="present" fill="#F472B6" radius={[4, 4, 0, 0]} background={{ fill: '#F1F5F9', radius: [4, 4, 0, 0] }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="rep-attendance-labels">
                <span>1,144</span>
                <span>1,043</span>
                <span>933</span>
                <span>1,089</span>
                <span>1,089</span>
              </div>
            </div>

            {/* To Do List */}
            <div className="rep-card">
              <div className="rep-card-header">
                <h3>To Do List</h3>
                <MoreHorizontal size={20} className="text-gray" />
              </div>
              <div className="rep-todo-list">
                <div className="rep-todo-item completed">
                  <div className="rep-checkbox checked"><Check size={12}/></div>
                  <div className="rep-todo-text">
                    <p>Review Teacher Attendance Records</p>
                    <span>March 11, 2035</span>
                  </div>
                </div>
                <div className="rep-todo-item">
                  <div className="rep-checkbox"></div>
                  <div className="rep-todo-text">
                    <p>Prepare Science Fair Guidelines</p>
                    <span>March 13, 2035</span>
                  </div>
                </div>
                <div className="rep-todo-item">
                  <div className="rep-checkbox"></div>
                  <div className="rep-todo-text">
                    <p>Update Library Book Inventory</p>
                    <span>March 14, 2035</span>
                  </div>
                </div>
              </div>
            </div>
          </div>


        </div>

        {/* Right Column / Sidebar Area */}
        <div className="rep-right-column">
          
          {/* Calendar Widget */}
          <div className="rep-card">
            <div className="rep-calendar-header">
              <h3>March 2035</h3>
              <div className="rep-cal-nav">
                <button><ChevronLeft size={16}/></button>
                <button><ChevronRight size={16}/></button>
              </div>
            </div>
            <div className="rep-calendar-grid">
              <div className="day-name">S</div><div className="day-name">M</div><div className="day-name">T</div><div className="day-name">W</div><div className="day-name">T</div><div className="day-name">F</div><div className="day-name">S</div>
              <div className="day prev-month">25</div><div className="day prev-month">26</div><div className="day prev-month">27</div><div className="day prev-month">28</div><div className="day">1</div><div className="day active-pink">2</div><div className="day">3</div>
              <div className="day">4</div><div className="day active-cyan">5</div><div className="day">6</div><div className="day">7</div><div className="day">8</div><div className="day">9</div><div className="day">10</div>
              <div className="day">11</div><div className="day">12</div><div className="day">13</div><div className="day">14</div><div className="day">15</div><div className="day">16</div><div className="day">17</div>
              <div className="day">18</div><div className="day">19</div><div className="day">20</div><div className="day">21</div><div className="day">22</div><div className="day">23</div><div className="day">24</div>
              <div className="day">25</div><div className="day">26</div><div className="day">27</div><div className="day active-pink">28</div><div className="day">29</div><div className="day">30</div><div className="day">31</div>
            </div>
          </div>

          {/* Events */}
          <div className="rep-card">
            <div className="rep-card-header">
              <h3>Events</h3>
              <MoreHorizontal size={20} className="text-gray" />
            </div>
            <div className="rep-events-list">
              <div className="rep-event-item">
                <div className="rep-event-time">
                  <span className="tag pink-light">March 2</span>
                  <span className="time-text">09:00 AM - 12:00 PM</span>
                </div>
                <h4>Annual Sport Competition</h4>
                <span className="event-audience">All Classes</span>
              </div>
              <div className="rep-event-item">
                <div className="rep-event-time">
                  <span className="tag cyan-light">March 5</span>
                  <span className="time-text">02:00 PM - 04:00 PM</span>
                </div>
                <h4>Parent-Teacher Meeting</h4>
                <span className="event-audience">1A, 1B</span>
              </div>
              <div className="rep-event-item">
                <div className="rep-event-time">
                  <span className="tag pink-light">March 28</span>
                  <span className="time-text">09:00 AM - 05:00 PM</span>
                </div>
                <h4>Annual Science Fair</h4>
                <span className="event-audience">All Classes</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rep-card rep-activity-card">
            <div className="rep-card-header">
              <h3>Recent Activity</h3>
              <MoreHorizontal size={20} className="text-gray" />
            </div>
            <div className="rep-activity-list">
              <div className="rep-activity-item">
                <div className="rep-activity-icon blue"><Users size={14}/></div>
                <div className="rep-activity-content">
                  <p>New student Alicia Gomez (Class 2B) enrolled by Registrar.</p>
                  <span>March 7, 2035 - 09:15 AM</span>
                </div>
              </div>
              <div className="rep-activity-item">
                <div className="rep-activity-icon pink"><Check size={14}/></div>
                <div className="rep-activity-content">
                  <p>Attendance for Class 1A marked by Teacher John Smith.</p>
                  <span>March 7, 2035 - 11:30 AM</span>
                </div>
              </div>
              <div className="rep-activity-item">
                <div className="rep-activity-icon blue"><DollarSign size={14}/></div>
                <div className="rep-activity-content">
                  <p>Monthly fee payments verified for Grade 6 students.</p>
                  <span>March 8, 2035 - 02:45 PM</span>
                </div>
              </div>
              <div className="rep-activity-item">
                <div className="rep-activity-icon pink"><Calendar size={14}/></div>
                <div className="rep-activity-content">
                  <p>Exam timetable for Term 2 updated by Academic Coordinator.</p>
                  <span>March 9, 2035 - 10:20 AM</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );

  const renderStudentDetails = () => {
    return (
      <div className="rep-modal-overlay" onClick={() => setSelectedStudent(null)}>
        <div className="rep-modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="rep-modal-header">
            <h2>Student Details</h2>
            <button className="rep-modal-close" onClick={() => setSelectedStudent(null)}>
              <X size={24} />
            </button>
          </div>
          <div className="rep-modal-content">
            <div className="rep-student-details-grid">
          
          {/* Column 1: Profile & Info */}
          <div className="rep-sd-col">
            <div className="rep-card text-center rep-profile-card">
              <img src={`https://api.dicebear.com/7.x/micah/svg?seed=${selectedStudent?.studentId || 'isabella'}&backgroundColor=transparent`} alt="Isabella Rossi" className="rep-profile-img" />
              <h2>{selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : 'Isabella Rossi'}</h2>
              <div className="rep-profile-tags">
                <span className="tag-outline">{selectedStudent?.studentId || 'S-2106'}</span>
                <span className="tag-outline">Class {selectedStudent?.gradeLevel?.replace('Grade ', '') || '8'}C</span>
                <span className="rep-status-pill cyan">{selectedStudent?.status || 'Active'}</span>
              </div>
              
              <button 
                className="rep-btn-danger" 
                style={{
                  marginTop: '16px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s'
                }}
                onClick={() => handleDeleteStudent(selectedStudent)}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
              >
                <Trash2 size={16} /> Remove Student completely
              </button>
              
              <div className="rep-info-list">
                <div className="rep-info-item">
                  <span>Gender</span>
                  <p>Female</p>
                </div>
                <div className="rep-info-item">
                  <span>Date of Birth</span>
                  <p>May 18, 2022</p>
                </div>
                <div className="rep-info-item">
                  <span>Phone Number</span>
                  <p>+62 812 9988 7766</p>
                </div>
                <div className="rep-info-item">
                  <span>Address</span>
                  <p>14 Via Milano,<br/>Rome, Italy</p>
                </div>
              </div>
            </div>

            <div className="rep-card">
              <div className="rep-card-header">
                <h3>Parent/Guardian Info</h3>
                <MoreHorizontal size={20} className="text-gray" />
              </div>
              <div className="rep-info-list no-border">
                <div className="rep-info-item">
                  <span>Father</span>
                  <div>
                    <p>Marco {selectedStudent?.lastName || 'Rossi'}</p>
                    <span>+39 331 222 5566</span>
                  </div>
                </div>
                <div className="rep-info-item">
                  <span>Mother</span>
                  <div>
                    <p>Elena {selectedStudent?.lastName || 'Rossi'}</p>
                    <span>+39 331 444 7788</span>
                  </div>
                </div>
                <div className="rep-info-item">
                  <span>Alternative Guardian</span>
                  <div>
                    <p>Lucia Bianchi (Aunt)</p>
                    <span>+39 331 555 6677</span>
                  </div>
                </div>
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
                <h3>March 2035</h3>
                <div className="rep-cal-nav">
                  <button><ChevronLeft size={16}/></button>
                  <button><ChevronRight size={16}/></button>
                </div>
              </div>
              <div className="rep-calendar-grid">
                <div className="day-name">S</div><div className="day-name">M</div><div className="day-name">T</div><div className="day-name">W</div><div className="day-name">T</div><div className="day-name">F</div><div className="day-name">S</div>
                <div className="day prev-month">25</div><div className="day prev-month">26</div><div className="day prev-month">27</div><div className="day prev-month">28</div><div className="day">1</div><div className="day active-blue">2</div><div className="day">3</div>
                <div className="day">4</div><div className="day">5</div><div className="day">6</div><div className="day">7</div><div className="day">8</div><div className="day">9</div><div className="day">10</div>
                <div className="day">11</div><div className="day">12</div><div className="day">13</div><div className="day active-blue">14</div><div className="day active-blue">15</div><div className="day">16</div><div className="day">17</div>
                <div className="day">18</div><div className="day">19</div><div className="day">20</div><div className="day">21</div><div className="day">22</div><div className="day">23</div><div className="day">24</div>
                <div className="day">25</div><div className="day">26</div><div className="day">27</div><div className="day active-pink">28</div><div className="day">29</div><div className="day">30</div><div className="day">31</div>
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
                  <p>Routine health check completed Feb 2035 - Fit for activities</p>
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
                        <div className="club-icon blue-bg">🤖</div>
                        <div><p>Robotics</p><span>Programmer</span></div>
                      </div>
                    </td>
                    <td>1st Place in School Robotics Fair</td>
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
                    <td>Jan 10, 2035</td>
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
                    <td>Feb 02, 2035</td>
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
                    <td>Feb 18, 2035</td>
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
                    <td>Mar 05, 2035</td>
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
                          <span className={`rep-status-pill ${stat === 'Active' ? 'cyan' : 'blue'}`}>{stat}</span>
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
                          <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748B'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748B'}} tickFormatter={(val) => val === 0 ? '0' : `${(val/1000).toFixed(1)}K`} />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke="#1E3A8A" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" />
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
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}} />
                      <Tooltip cursor={{fill: 'transparent'}} />
                      <Bar dataKey="present" fill="#F472B6" radius={[4, 4, 0, 0]} background={{ fill: '#F1F5F9', radius: [4, 4, 0, 0] }} isAnimationActive={true} animationDuration={1200} animationEasing="ease-out">
                        <LabelList dataKey="present" position="top" fill="#64748B" fontSize={11} fontWeight={500} formatter={(v) => v.toLocaleString()} />
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
      'Science': '#1E3A8A',
      'Mathematics': '#06B6D4',
      'English': '#FB7185',
      'Arts': '#F472B6',
      'Physical Ed': '#F1F5F9'
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
                        <Pie data={departmentData} innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none" isAnimationActive={true} animationDuration={1200} animationEasing="ease-out">
                          {departmentData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
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
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748B'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748B'}} />
                      <Tooltip />
                      <Line type="monotone" dataKey="present" stroke="#1E3A8A" strokeWidth={3} dot={{r: 4, fill: '#1E3A8A', strokeWidth: 2, stroke: '#fff'}} isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" />
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
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748B'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748B'}} />
                      <Tooltip cursor={{fill: 'transparent'}} />
                      <Bar dataKey="classes" stackId="a" fill="#1E3A8A" isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" />
                      <Bar dataKey="hours" stackId="a" fill="#06B6D4" isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" />
                      <Bar dataKey="extra" stackId="a" fill="#FB7185" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" />
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
      <div className="rep-modal-overlay" onClick={() => setSelectedTeacher(null)}>
        <div className="rep-modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="rep-modal-header">
            <h2>Teacher Details</h2>
            <button className="rep-modal-close" onClick={() => setSelectedTeacher(null)}>
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
                <span className="rep-status-pill blue">Full-Time</span>
              </div>

              <button 
                className="rep-btn-danger" 
                style={{
                  marginTop: '16px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s'
                }}
                onClick={() => handleDeleteTeacher(selectedTeacher)}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
              >
                <Trash2 size={16} /> Remove Teacher completely
              </button>
              
              <div className="rep-info-list" style={{borderBottom: '1px solid var(--border-color)', paddingBottom: '16px'}}>
                <div className="rep-info-item">
                  <span>Subject</span>
                  <p>{selectedTeacher?.subject || 'English Language'}</p>
                </div>
                <div className="rep-info-item">
                  <span>Class</span>
                  <p>8C - 9A - 9B</p>
                </div>
              </div>

              <div className="rep-card-header" style={{marginTop: '24px', marginBottom: '8px', width: '100%'}}>
                <h3 style={{fontSize: '14px', color: 'var(--text-dark)'}}>Personal Info</h3>
                <MoreHorizontal size={16} className="text-gray" />
              </div>
              <div className="rep-info-list no-border">
                <div className="rep-info-item">
                  <span>Gender</span>
                  <p>Male</p>
                </div>
                <div className="rep-info-item">
                  <span>Date of Birth</span>
                  <p>April 15, 1990</p>
                </div>
                <div className="rep-info-item">
                  <span>Email Address</span>
                  <p>{selectedTeacher?.email || 'cliff.villiam@studixschool.org'}</p>
                </div>
                <div className="rep-info-item">
                  <span>Phone Number</span>
                  <p>{selectedTeacher?.phone || '+62 811 5567 2345'}</p>
                </div>
                <div className="rep-info-item">
                  <span>Address</span>
                  <p>{selectedTeacher?.address || '221B Baker Street, London, UK'}</p>
                </div>
              </div>
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
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748B'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748B'}} />
                      <Tooltip content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div style={{ background: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid var(--border-color)' }}>
                              <strong style={{marginBottom: '4px'}}>{label} 2034</strong>
                              <div style={{display: 'flex', justifyContent: 'space-between', gap: '20px', color: 'var(--text-gray)'}}><span><span className="dot blue" style={{display:'inline-block'}}></span> Total Classes</span> <strong style={{color: 'var(--text-dark)'}}>{payload[0].value} Hours</strong></div>
                              <div style={{display: 'flex', justifyContent: 'space-between', gap: '20px', color: 'var(--text-gray)'}}><span><span className="dot cyan" style={{display:'inline-block'}}></span> Teaching Hours</span> <strong style={{color: 'var(--text-dark)'}}>{payload[1].value} Hours</strong></div>
                              <div style={{display: 'flex', justifyContent: 'space-between', gap: '20px', color: 'var(--text-gray)'}}><span><span className="dot pink" style={{display:'inline-block'}}></span> Extra Duties</span> <strong style={{color: 'var(--text-dark)'}}>{payload[2].value} Hours</strong></div>
                            </div>
                          );
                        }
                        return null;
                      }} />
                      <Area type="monotone" dataKey="classes" stackId="1" stroke="#1E3A8A" fill="#1E3A8A" fillOpacity={1} isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" />
                      <Area type="monotone" dataKey="hours" stackId="1" stroke="#06B6D4" fill="#06B6D4" fillOpacity={1} isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" />
                      <Area type="monotone" dataKey="extra" stackId="1" stroke="#FB7185" fill="#FB7185" fillOpacity={1} isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" />
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
                      <td style={{whiteSpace: 'nowrap'}}><span className="text-cyan font-semibold">Apr 2, 2035</span></td>
                      <td style={{minWidth: '120px'}}>Zoom - International Education Network</td>
                      <td style={{whiteSpace: 'nowrap'}}><span className="status-badge gray">Upcoming</span></td>
                    </tr>
                    <tr>
                      <td style={{minWidth: '120px'}}>Classroom Management Certification<br/><span style={{fontSize: 10, color: 'var(--text-gray)', whiteSpace: 'nowrap'}}>Certification</span></td>
                      <td style={{whiteSpace: 'nowrap'}}><span className="text-cyan font-semibold">Feb 8, 2035</span></td>
                      <td style={{minWidth: '120px'}}>Cambridge University Online (UK)</td>
                      <td style={{whiteSpace: 'nowrap'}}><span className="status-badge blue">Completed</span></td>
                    </tr>
                    <tr>
                      <td style={{minWidth: '120px'}}>Advanced English Teaching Methods<br/><span style={{fontSize: 10, color: 'var(--text-gray)', whiteSpace: 'nowrap'}}>Workshop</span></td>
                      <td style={{whiteSpace: 'nowrap'}}><span className="text-cyan font-semibold">Jan 12, 2035</span></td>
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
                <h3>March 2035</h3>
                <div className="rep-cal-nav">
                  <button><ChevronLeft size={16}/></button>
                  <button><ChevronRight size={16}/></button>
                </div>
              </div>
              <div className="rep-calendar-grid">
                <div className="day-name">S</div><div className="day-name">M</div><div className="day-name">T</div><div className="day-name">W</div><div className="day-name">T</div><div className="day-name">F</div><div className="day-name">S</div>
                <div className="day prev-month">25</div><div className="day prev-month">26</div><div className="day prev-month">27</div><div className="day prev-month">28</div><div className="day">1</div><div className="day">2</div><div className="day">3</div>
                <div className="day">4</div><div className="day active-pink">5</div><div className="day">6</div><div className="day">7</div><div className="day">8</div><div className="day">9</div><div className="day">10</div>
                <div className="day">11</div><div className="day">12</div><div className="day">13</div><div className="day active-blue">14</div><div className="day">15</div><div className="day">16</div><div className="day">17</div>
                <div className="day">18</div><div className="day">19</div><div className="day">20</div><div className="day">21</div><div className="day">22</div><div className="day">23</div><div className="day">24</div>
                <div className="day">25</div><div className="day">26</div><div className="day">27</div><div className="day">28</div><div className="day">29</div><div className="day">30</div><div className="day">31</div>
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
                    <div className="rep-big-cal-day prev-month"><span className="day-number" style={{color: 'var(--text-light)'}}>25</span></div>
                    <div className="rep-big-cal-day prev-month"><span className="day-number" style={{color: 'var(--text-light)'}}>26</span></div>
                    <div className="rep-big-cal-day prev-month"><span className="day-number" style={{color: 'var(--text-light)'}}>27</span></div>
                    <div className="rep-big-cal-day prev-month"><span className="day-number" style={{color: 'var(--text-light)'}}>28</span></div>
                    {Array.from({length: 31}).map((_, i) => {
                      const day = i + 1;
                      const dayEvents = customEvents.filter(e => e.day === day);
                      return (
                        <div key={day} className="rep-big-cal-day">
                          <span className="day-number">{day}</span>
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
                  <button><ChevronLeft size={16}/></button>
                  <button><ChevronRight size={16}/></button>
                </div>
              </div>
              <div className="rep-calendar-grid">
                <div className="day-name">S</div><div className="day-name">M</div><div className="day-name">T</div><div className="day-name">W</div><div className="day-name">T</div><div className="day-name">F</div><div className="day-name">S</div>
                <div className="day prev-month">25</div><div className="day prev-month">26</div><div className="day prev-month">27</div><div className="day prev-month">28</div><div className="day">1</div><div className="day active-pink">2</div><div className="day">3</div>
                <div className="day">4</div><div className="day active-cyan">5</div><div className="day">6</div><div className="day">7</div><div className="day">8</div><div className="day">9</div><div className="day">10</div>
                <div className="day">11</div><div className="day">12</div><div className="day">13</div><div className="day">14</div><div className="day">15</div><div className="day">16</div><div className="day">17</div>
                <div className="day">18</div><div className="day">19</div><div className="day">20</div><div className="day">21</div><div className="day">22</div><div className="day">23</div><div className="day">24</div>
                <div className="day">25</div><div className="day">26</div><div className="day">27</div><div className="day active-pink">28</div><div className="day">29</div><div className="day">30</div><div className="day">31</div>
              </div>
            </div>

            {/* Upcoming Event */}
            <div className="rep-card">
              <div className="rep-card-header">
                <h3>Upcoming Event</h3>
                <MoreHorizontal size={20} className="text-gray" />
              </div>
              <div className="rep-upcoming-event-card">
                <div className="event-date-box pink">
                  <span>18</span>
                  <small>Mar</small>
                </div>
                <div className="event-details">
                  <h4>Teacher's Training</h4>
                  <p>02:00 PM - 04:00 PM</p>
                  <div className="event-users">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=T1&backgroundColor=b6e3f4" alt="u1" style={{ borderRadius: '50%' }} />
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=T2&backgroundColor=ffdfbf" alt="u2" style={{ borderRadius: '50%' }} />
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=T3&backgroundColor=c0aede" alt="u3" style={{ borderRadius: '50%' }} />
                    <span className="more-users">+5</span>
                  </div>
                </div>
              </div>
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
              {(activeTab === 'Students' || activeTab === 'Teachers') && (
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

            <div className="rep-search-box">
              <Search size={18} className="rep-search-icon" />
              <input type="text" placeholder="Search anything" />
            </div>
            
            <button className="rep-icon-btn" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button className="rep-icon-btn"><Settings size={20} /></button>
            <button className="rep-icon-btn"><Bell size={20} /></button>
            
            <div className="rep-user-profile">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Suzette+Paguio&backgroundColor=b6e3f4" alt="SUZETTE D. PAGUIO" className="rep-avatar" style={{ borderRadius: '50%' }} />
              <div className="rep-user-info">
                <span className="rep-user-name">SUZETTE D. PAGUIO</span>
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
                    <span>Username</span>
                    <p>{(addStudentForm.firstName + addStudentForm.lastName).toLowerCase().replace(/\s+/g, '')}</p>
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
                      lrn: addStudentForm.lrn,
                    })
                  });
                  if (res.ok) {
                    setAddStudentSuccess(true);
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
              
              {/* Year Select Pills */}
              <div className="rep-compare-pills-container">
                <span className="rep-compare-pills-label">Select years:</span>
                <div className="rep-compare-pills">
                  {data?.schoolYears && Object.keys(data.schoolYears).sort().reverse().map(sy => {
                    const shortName = getShortYear(sy);
                    const isPrimary = compareYearPrimary === sy;
                    const isSecondary = compareYearSecondary === sy;
                    
                    return (
                      <button 
                        key={sy}
                        className={`rep-compare-pill ${isPrimary ? 'primary' : ''} ${isSecondary ? 'secondary' : ''}`}
                        onClick={() => {
                          if (isPrimary) return;
                          setCompareYearSecondary(compareYearPrimary);
                          setCompareYearPrimary(sy);
                          setCompareYearMonthlyTab(sy);
                        }}
                      >
                        {shortName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Top Row: Side-by-Side KPIs & Bar Chart */}
              <div className="rep-compare-top-layout">
                
                {/* Primary Year KPIs */}
                <div className="rep-compare-kpi-card primary">
                  <div className="rep-compare-kpi-card-header">
                    <span className="rep-compare-kpi-card-title">{getShortYear(compareYearPrimary)} Metrics</span>
                    <span className="rep-compare-badge primary">Primary</span>
                  </div>
                  <div className="rep-compare-kpi-list">
                    <div className="rep-compare-kpi-item">
                      <span className="rep-compare-kpi-item-label">Enrollment</span>
                      <span className="rep-compare-kpi-item-value">{data?.schoolYears?.[compareYearPrimary]?.totalStudents || 0}</span>
                    </div>
                    <div className="rep-compare-kpi-item">
                      <span className="rep-compare-kpi-item-label">Active Teachers</span>
                      <span className="rep-compare-kpi-item-value">{data?.schoolYears?.[compareYearPrimary]?.totalTeachers || 0}</span>
                    </div>
                    <div className="rep-compare-kpi-item">
                      <span className="rep-compare-kpi-item-label">Retention Rate</span>
                      <span className="rep-compare-kpi-item-value">
                        {(() => {
                          const syData = data?.schoolYears?.[compareYearPrimary] || {};
                          const students = syData.totalStudents || 1;
                          const dropouts = syData.totalDropouts || 0;
                          return ((students - dropouts) / students * 100).toFixed(1) + '%';
                        })()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Secondary Year KPIs */}
                <div className="rep-compare-kpi-card">
                  <div className="rep-compare-kpi-card-header">
                    <span className="rep-compare-kpi-card-title">{getShortYear(compareYearSecondary)} Metrics</span>
                    <span className="rep-compare-badge secondary">Compare</span>
                  </div>
                  <div className="rep-compare-kpi-list">
                    <div className="rep-compare-kpi-item">
                      <span className="rep-compare-kpi-item-label">Enrollment</span>
                      <span className="rep-compare-kpi-item-value">{data?.schoolYears?.[compareYearSecondary]?.totalStudents || 0}</span>
                    </div>
                    <div className="rep-compare-kpi-item">
                      <span className="rep-compare-kpi-item-label">Active Teachers</span>
                      <span className="rep-compare-kpi-item-value">{data?.schoolYears?.[compareYearSecondary]?.totalTeachers || 0}</span>
                    </div>
                    <div className="rep-compare-kpi-item">
                      <span className="rep-compare-kpi-item-label">Retention Rate</span>
                      <span className="rep-compare-kpi-item-value">
                        {(() => {
                          const syData = data?.schoolYears?.[compareYearSecondary] || {};
                          const students = syData.totalStudents || 1;
                          const dropouts = syData.totalDropouts || 0;
                          return ((students - dropouts) / students * 100).toFixed(1) + '%';
                        })()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recharts Performance Comparison Chart */}
                <div className="rep-compare-chart-card">
                  <div className="rep-compare-chart-card-header">
                    <div>
                      <div className="rep-compare-chart-title">
                        <TrendingUp size={16} style={{ color: '#3B82F6' }} /> Performance Comparison
                      </div>
                      <div className="rep-compare-chart-subtitle">Grade-level enrollment distributions</div>
                    </div>
                    <div className="rep-compare-chart-legend">
                      <div className="rep-compare-chart-legend-item">
                        <div className="rep-compare-chart-legend-color" style={{ backgroundColor: '#3B82F6' }}></div>
                        {getShortYear(compareYearPrimary)}
                      </div>
                      <div className="rep-compare-chart-legend-item">
                        <div className="rep-compare-chart-legend-color" style={{ backgroundColor: '#8B5CF6' }}></div>
                        {getShortYear(compareYearSecondary)}
                      </div>
                    </div>
                  </div>
                  <div style={{ flex: 1, minHeight: '260px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getGradeComparisonChartData(compareYearPrimary, compareYearSecondary)} margin={{ top: 10, right: 10, left: -25, bottom: 0 }} barGap={6}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10}} />
                        <Tooltip contentStyle={{backgroundColor: '#0F172A', borderColor: 'rgba(255,255,255,0.1)', color: '#fff'}} />
                        <Bar dataKey={compareYearPrimary} fill="#3B82F6" radius={[3, 3, 0, 0]} isAnimationActive={true} animationDuration={800} />
                        <Bar dataKey={compareYearSecondary} fill="#8B5CF6" radius={[3, 3, 0, 0]} isAnimationActive={true} animationDuration={800} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* Dynamic Context Drivers Row */}
              <div className="rep-compare-context-row">
                
                {/* Primary Context */}
                <div className="rep-compare-context-card primary">
                  <h4 className="rep-compare-context-card-title" style={{ color: '#F97316' }}>
                    <GraduationCap size={16} /> {getShortYear(compareYearPrimary)} Context
                  </h4>
                  <div className="rep-compare-context-list">
                    <div className="rep-compare-context-item">
                      <h5>Enrollment Drivers</h5>
                      <p>{getYearlyContext(compareYearPrimary).drivers}</p>
                    </div>
                    <div className="rep-compare-context-item">
                      <h5>Staffing & Operations</h5>
                      <p>{getYearlyContext(compareYearPrimary).operations}</p>
                    </div>
                    <div className="rep-compare-context-item">
                      <h5>Efficiency & Retention</h5>
                      <p>{getYearlyContext(compareYearPrimary).efficiency}</p>
                    </div>
                  </div>
                </div>

                {/* Secondary Context */}
                <div className="rep-compare-context-card secondary">
                  <h4 className="rep-compare-context-card-title" style={{ color: '#CBD5E1' }}>
                    <GraduationCap size={16} /> {getShortYear(compareYearSecondary)} Context
                  </h4>
                  <div className="rep-compare-context-list">
                    <div className="rep-compare-context-item">
                      <h5>Enrollment Drivers</h5>
                      <p>{getYearlyContext(compareYearSecondary).drivers}</p>
                    </div>
                    <div className="rep-compare-context-item">
                      <h5>Staffing & Operations</h5>
                      <p>{getYearlyContext(compareYearSecondary).operations}</p>
                    </div>
                    <div className="rep-compare-context-item">
                      <h5>Efficiency & Retention</h5>
                      <p>{getYearlyContext(compareYearSecondary).efficiency}</p>
                    </div>
                  </div>
                </div>

                {/* Multi-Year Summary */}
                <div className="rep-compare-context-card summary">
                  <h4 className="rep-compare-context-card-title" style={{ color: '#EA580C' }}>
                    <TrendingUp size={16} /> Multi-Year Summary
                  </h4>
                  <p style={{ fontSize: '13px', color: '#E2E8F0', lineHeight: 1.6, margin: 0 }}>
                    {getMultiYearSummaryText(compareYearPrimary, compareYearSecondary)}
                  </p>
                </div>

              </div>

              {/* Executive Summary Row */}
              <div className="rep-compare-exec-row">
                <div className="rep-compare-exec-card primary">
                  <h4 className="rep-compare-exec-card-title" style={{ color: '#3B82F6' }}>
                    <ClipboardList size={14} /> Executive Summary ({getShortYear(compareYearPrimary)})
                  </h4>
                  <p>{getYearExecutiveSummary(compareYearPrimary)}</p>
                </div>
                <div className="rep-compare-exec-card secondary">
                  <h4 className="rep-compare-exec-card-title" style={{ color: '#8B5CF6' }}>
                    <ClipboardList size={14} /> Executive Summary ({getShortYear(compareYearSecondary)})
                  </h4>
                  <p>{getYearExecutiveSummary(compareYearSecondary)}</p>
                </div>
              </div>

              {/* Monthly Performance Breakdown Section */}
              <div className="rep-compare-monthly-section">
                <div className="rep-compare-monthly-header-row">
                  <div className="rep-compare-monthly-title">
                    <h3>Monthly Performance Breakdown</h3>
                    <p>Track monthly trends, highlights, and operational warnings</p>
                  </div>
                  <div className="rep-compare-monthly-tabs">
                    <button 
                      className={`rep-compare-monthly-tab ${compareYearMonthlyTab === compareYearPrimary ? 'active' : ''}`}
                      onClick={() => setCompareYearMonthlyTab(compareYearPrimary)}
                    >
                      {getShortYear(compareYearPrimary)}
                    </button>
                    <button 
                      className={`rep-compare-monthly-tab ${compareYearMonthlyTab === compareYearSecondary ? 'active' : ''}`}
                      onClick={() => setCompareYearMonthlyTab(compareYearSecondary)}
                    >
                      {getShortYear(compareYearSecondary)}
                    </button>
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

    </div>
  );
};

export default AdminDashboard;
