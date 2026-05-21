export const mockData = {
  schoolYear: "S.Y. 2025-2026",
  users: [
    {
      id: "T101",
      name: "Maria Santos",
      role: "Teacher",
      gradeLevel: "Grade 1",
      section: "Mabini",
      username: "teacher_maria",
      password: "password123"
    },
    {
      id: "S201",
      name: "Juan Dela Cruz",
      role: "Student",
      gradeLevel: "Grade 1",
      section: "Mabini",
      username: "student_juan",
      password: "password123"
    }
  ],
  classrooms: [
    {
      gradeLevel: "Kinder",
      section: "Rizal",
      adviser: "TBD",
      totalSeats: 30,
      bosyEnrollment: 28,
      dropouts: 0,
      repeaters: 1
    },
    {
      gradeLevel: "Kinder",
      section: "Silang",
      adviser: "TBD",
      totalSeats: 30,
      bosyEnrollment: 25,
      dropouts: 0,
      repeaters: 0
    },
    {
      gradeLevel: "Grade 1",
      section: "Mabini",
      adviser: "Maria Santos",
      totalSeats: 40,
      bosyEnrollment: 38,
      dropouts: 1,
      repeaters: 2
    },
    {
      gradeLevel: "Grade 1",
      section: "Del Pilar",
      adviser: "TBD",
      totalSeats: 40,
      bosyEnrollment: 35,
      dropouts: 0,
      repeaters: 1
    },
    {
      gradeLevel: "Grade 2",
      section: "Bonifacio",
      adviser: "TBD",
      totalSeats: 40,
      bosyEnrollment: 35,
      dropouts: 0,
      repeaters: 0
    },
    {
      gradeLevel: "Grade 2",
      section: "Malvar",
      adviser: "TBD",
      totalSeats: 40,
      bosyEnrollment: 32,
      dropouts: 0,
      repeaters: 0
    },
    {
      gradeLevel: "Grade 3",
      section: "Luna",
      adviser: "TBD",
      totalSeats: 40,
      bosyEnrollment: 42,
      dropouts: 0,
      repeaters: 1
    },
    {
      gradeLevel: "Grade 3",
      section: "Lopez-Jaena",
      adviser: "TBD",
      totalSeats: 40,
      bosyEnrollment: 38,
      dropouts: 0,
      repeaters: 0
    },
    {
      gradeLevel: "Grade 4",
      section: "Jacinto",
      adviser: "TBD",
      totalSeats: 40,
      bosyEnrollment: 39,
      dropouts: 0,
      repeaters: 0
    },
    {
      gradeLevel: "Grade 4",
      section: "Tandang Sora",
      adviser: "TBD",
      totalSeats: 40,
      bosyEnrollment: 36,
      dropouts: 0,
      repeaters: 0
    },
    {
      gradeLevel: "Grade 5",
      section: "Aguinaldo",
      adviser: "TBD",
      totalSeats: 40,
      bosyEnrollment: 41,
      dropouts: 0,
      repeaters: 0
    },
    {
      gradeLevel: "Grade 5",
      section: "Dagohoy",
      adviser: "TBD",
      totalSeats: 40,
      bosyEnrollment: 39,
      dropouts: 0,
      repeaters: 0
    },
    {
      gradeLevel: "Grade 6",
      section: "Quezon",
      adviser: "TBD",
      totalSeats: 40,
      bosyEnrollment: 36,
      dropouts: 0,
      repeaters: 0
    },
    {
      gradeLevel: "Grade 6",
      section: "Osmeña",
      adviser: "TBD",
      totalSeats: 40,
      bosyEnrollment: 34,
      dropouts: 0,
      repeaters: 0
    }
  ],
  students: [
    {
      id: "S201",
      lrn: "109876543210",
      name: "Juan Dela Cruz",
      gender: "Male",
      gradeLevel: "Grade 1",
      section: "Mabini",
      status: "Enrolled",
      grades: {
        Math: { q1: 72, q2: 75, q3: null, q4: null },
        Science: { q1: 82, q2: 85, q3: null, q4: null },
        English: { q1: 90, q2: 92, q3: null, q4: null },
        Filipino: { q1: 88, q2: 87, q3: null, q4: null },
        MAPEH: { q1: 89, q2: 91, q3: null, q4: null },
        Makabayan: { q1: 86, q2: 89, q3: null, q4: null }
      }
    },
    {
      id: "S202",
      lrn: "109876543211",
      name: "Ana Reyes",
      gender: "Female",
      gradeLevel: "Grade 1",
      section: "Mabini",
      status: "Enrolled",
      grades: {
        Math: { q1: 90, q2: 92, q3: null, q4: null },
        Science: { q1: 88, q2: 90, q3: null, q4: null },
        English: { q1: 95, q2: 94, q3: null, q4: null },
        Filipino: { q1: 92, q2: 91, q3: null, q4: null },
        MAPEH: { q1: 93, q2: 91, q3: null, q4: null },
        Makabayan: { q1: 89, q2: 90, q3: null, q4: null }
      }
    },
    {
      id: "S203",
      lrn: "109876543212",
      name: "Pedro Penduko",
      gender: "Male",
      gradeLevel: "Grade 1",
      section: "Mabini",
      status: "Dropped",
      grades: {
        Math: { q1: 75, q2: null, q3: null, q4: null },
        Science: { q1: 78, q2: null, q3: null, q4: null },
        English: { q1: 74, q2: null, q3: null, q4: null },
        Filipino: { q1: 76, q2: null, q3: null, q4: null },
        MAPEH: { q1: 81, q2: null, q3: null, q4: null },
        Makabayan: { q1: 80, q2: null, q3: null, q4: null }
      }
    },
    {
      id: "S204",
      lrn: "109876543213",
      name: "Maria Clara",
      gender: "Female",
      gradeLevel: "Grade 1",
      section: "Del Pilar",
      status: "Enrolled",
      grades: {
        Math: { q1: 85, q2: 88, q3: null, q4: null },
        Science: { q1: 90, q2: 92, q3: null, q4: null },
        English: { q1: 92, q2: 93, q3: null, q4: null },
        Filipino: { q1: 89, q2: 90, q3: null, q4: null },
        MAPEH: { q1: 91, q2: 92, q3: null, q4: null },
        Makabayan: { q1: 88, q2: 89, q3: null, q4: null }
      }
    },
    {
      id: "S205",
      lrn: "109876543214",
      name: "Crisostomo Ibarra",
      gender: "Male",
      gradeLevel: "Grade 1",
      section: "Del Pilar",
      status: "Enrolled",
      grades: {
        Math: { q1: 95, q2: 96, q3: null, q4: null },
        Science: { q1: 94, q2: 95, q3: null, q4: null },
        English: { q1: 93, q2: 94, q3: null, q4: null },
        Filipino: { q1: 92, q2: 93, q3: null, q4: null },
        MAPEH: { q1: 90, q2: 91, q3: null, q4: null },
        Makabayan: { q1: 94, q2: 95, q3: null, q4: null }
      }
    }
  ],
  announcements: [
    {
      id: 1,
      title: "Welcome to S.Y. 2025-2026!",
      date: "2025-08-01",
      content: "Welcome to the new school year at Valdez Elementary School. Let's make this year a great one!",
      target: "All"
    },
    {
      id: 2,
      title: "PTA Meeting for Grade 1",
      date: "2025-09-15",
      content: "There will be a PTA meeting for all Grade 1 parents on Friday at 3:00 PM.",
      target: "Grade 1"
    }
  ]
};
