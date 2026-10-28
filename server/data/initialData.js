export const initialSchoolData = {
  schoolInfo: {
    name: "School Timetable Management System",
    code: "SCH-2026",
    academicYear: "2026-2027",
    term: "Term 1",
    address: "Campus Grounds",
    contactEmail: "admin@school.edu",
    phone: ""
  },
  settings: {
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    periodsPerDay: 8,
    saturdayPeriods: 6,
    regularHours: {
      name: "Regular School Hours",
      startTime: "09:00 AM",
      endTime: "04:00 PM",
      periodTimings: [
        { period: 1, start: "09:00 AM", end: "09:45 AM", type: "class" },
        { period: 2, start: "09:45 AM", end: "10:30 AM", type: "class" },
        { period: "Break", start: "10:30 AM", end: "10:45 AM", type: "break", name: "Recess" },
        { period: 3, start: "10:45 AM", end: "11:30 AM", type: "class" },
        { period: 4, start: "11:30 AM", end: "12:15 PM", type: "class" },
        { period: "Lunch", start: "12:15 PM", end: "01:00 PM", type: "break", name: "Lunch Break" },
        { period: 5, start: "01:00 PM", end: "01:45 PM", type: "class" },
        { period: 6, start: "01:45 PM", end: "02:30 PM", type: "class" },
        { period: 7, start: "02:30 PM", end: "03:15 PM", type: "class" },
        { period: 8, start: "03:15 PM", end: "04:00 PM", type: "class" }
      ]
    }
  },
  classes: [],
  subjects: [],
  laboratories: [],
  teachers: [],
  requirements: [],
  timetable: [],
  specialTests: [],
  substitutions: [],
  leaves: []
};

// Optional Starter Template for quick testing if requested
export const starterTemplateData = {
  schoolInfo: {
    name: "Indhrametha Model Senior Secondary School",
    code: "IMSSS-CBSE-4102",
    academicYear: "2026-2027",
    term: "Term 2",
    address: "Kovil Campus, Education Enclave, Tamil Nadu",
    contactEmail: "admin@schooltimetable.edu",
    phone: "+91 44 2876 5432"
  },
  settings: {
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    periodsPerDay: 8,
    saturdayPeriods: 6,
    regularHours: {
      name: "Regular School Hours",
      startTime: "09:00 AM",
      endTime: "04:00 PM",
      periodTimings: [
        { period: 1, start: "09:00 AM", end: "09:45 AM", type: "class" },
        { period: 2, start: "09:45 AM", end: "10:30 AM", type: "class" },
        { period: "Break", start: "10:30 AM", end: "10:45 AM", type: "break", name: "Recess" },
        { period: 3, start: "10:45 AM", end: "11:30 AM", type: "class" },
        { period: 4, start: "11:30 AM", end: "12:15 PM", type: "class" },
        { period: "Lunch", start: "12:15 PM", end: "01:00 PM", type: "break", name: "Lunch Break" },
        { period: 5, start: "01:00 PM", end: "01:45 PM", type: "class" },
        { period: 6, start: "01:45 PM", end: "02:30 PM", type: "class" },
        { period: 7, start: "02:30 PM", end: "03:15 PM", type: "class" },
        { period: 8, start: "03:15 PM", end: "04:00 PM", type: "class" }
      ]
    }
  },
  classes: [
    { id: "C10A", name: "10-A", grade: "10", section: "A", room: "Room 101", classTeacherId: "T101", totalStudents: 38 },
    { id: "C10B", name: "10-B", grade: "10", section: "B", room: "Room 102", classTeacherId: "T102", totalStudents: 36 },
    { id: "C11A", name: "11-A", grade: "11", section: "A (Science)", room: "Room 201", classTeacherId: "T103", totalStudents: 40 },
    { id: "C12A", name: "12-A", grade: "12", section: "A (Science)", room: "Room 301", classTeacherId: "T104", totalStudents: 42 }
  ],
  subjects: [
    { id: "SUB-MAT", code: "MAT101", name: "Mathematics", department: "Mathematics", type: "Theory", weeklyPeriods: 6, color: "#3b82f6" },
    { id: "SUB-PHY", code: "PHY101", name: "Physics", department: "Science", type: "Theory", weeklyPeriods: 5, color: "#8b5cf6" },
    { id: "SUB-PHY-LAB", code: "PHY101L", name: "Physics Practical", department: "Science", type: "Lab", weeklyPeriods: 2, isConsecutive: true, labId: "LAB-PHY", color: "#6366f1" },
    { id: "SUB-CHE", code: "CHE101", name: "Chemistry", department: "Science", type: "Theory", weeklyPeriods: 5, color: "#ec4899" },
    { id: "SUB-CHE-LAB", code: "CHE101L", name: "Chemistry Practical", department: "Science", type: "Lab", weeklyPeriods: 2, isConsecutive: true, labId: "LAB-CHE", color: "#d946ef" },
    { id: "SUB-ENG", code: "ENG101", name: "English Core", department: "Languages", type: "Theory", weeklyPeriods: 5, color: "#f59e0b" },
    { id: "SUB-CSC-LAB", code: "CSC101L", name: "Computer Science Practical", department: "Computer Science", type: "Lab", weeklyPeriods: 2, isConsecutive: true, labId: "LAB-CSC1", color: "#0891b2" }
  ],
  laboratories: [
    {
      id: "LAB-CSC1",
      name: "Computer Science Lab 1",
      code: "CS-LAB-01",
      type: "Computer Science",
      capacity: 45,
      room: "Block A - 2nd Floor",
      assignedInstructorId: "T109",
      equipment: "45 PCs, High speed LAN, Projector",
      availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    },
    {
      id: "LAB-PHY",
      name: "C.V. Raman Physics Laboratory",
      code: "PHY-LAB-01",
      type: "Physics",
      capacity: 36,
      room: "Science Block - 1st Floor",
      assignedInstructorId: "T103",
      equipment: "Spectrometers, Optical benches",
      availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    },
    {
      id: "LAB-CHE",
      name: "Marie Curie Chemistry Laboratory",
      code: "CHE-LAB-01",
      type: "Chemistry",
      capacity: 36,
      room: "Science Block - 1st Floor",
      assignedInstructorId: "T104",
      equipment: "Fume hood, Digital balances, Reagent store",
      availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    }
  ],
  teachers: [
    {
      id: "T101",
      staffId: "STF-201",
      name: "Dr. Arvind Sharma",
      department: "Mathematics",
      subjects: ["Mathematics"],
      classes: ["10-A", "10-B", "12-A"],
      maxPeriodsPerDay: 5,
      maxPeriodsPerWeek: 24,
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      labCapability: false,
      preferredSlots: [1, 2, 3],
      unavailablePeriods: [],
      status: "active",
      email: "arvind.sharma@school.edu",
      phone: "+91 98401 23456"
    },
    {
      id: "T102",
      staffId: "STF-202",
      name: "Mrs. Radhika Krishnan",
      department: "Mathematics",
      subjects: ["Mathematics"],
      classes: ["10-B", "11-A"],
      maxPeriodsPerDay: 5,
      maxPeriodsPerWeek: 22,
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      labCapability: false,
      preferredSlots: [2, 3, 4],
      unavailablePeriods: [],
      status: "active",
      email: "radhika.k@school.edu",
      phone: "+91 98401 23457"
    },
    {
      id: "T103",
      staffId: "STF-203",
      name: "Mr. Suresh Verma",
      department: "Science",
      subjects: ["Physics", "Physics Practical"],
      classes: ["11-A", "12-A"],
      maxPeriodsPerDay: 5,
      maxPeriodsPerWeek: 22,
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      labCapability: true,
      preferredSlots: [3, 4, 5],
      unavailablePeriods: [],
      status: "active",
      email: "suresh.verma@school.edu",
      phone: "+91 98401 23458"
    },
    {
      id: "T104",
      staffId: "STF-204",
      name: "Dr. Sunita Rao",
      department: "Science",
      subjects: ["Chemistry", "Chemistry Practical"],
      classes: ["11-A", "12-A", "10-A"],
      maxPeriodsPerDay: 5,
      maxPeriodsPerWeek: 24,
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      labCapability: true,
      preferredSlots: [1, 2, 5, 6],
      unavailablePeriods: [],
      status: "active",
      email: "sunita.rao@school.edu",
      phone: "+91 98401 23459"
    },
    {
      id: "T105",
      staffId: "STF-205",
      name: "Mrs. Lakshmi Sundaram",
      department: "Languages",
      subjects: ["English Core"],
      classes: ["10-A", "10-B", "11-A", "12-A"],
      maxPeriodsPerDay: 5,
      maxPeriodsPerWeek: 24,
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      labCapability: false,
      preferredSlots: [2, 3, 5],
      unavailablePeriods: [],
      status: "active",
      email: "lakshmi.s@school.edu",
      phone: "+91 98401 23460"
    },
    {
      id: "T109",
      staffId: "STF-209",
      name: "Mr. K. Vigneshwaran",
      department: "Computer Science",
      subjects: ["Computer Science Practical"],
      classes: ["10-A", "10-B", "11-A", "12-A"],
      maxPeriodsPerDay: 5,
      maxPeriodsPerWeek: 22,
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      labCapability: true,
      preferredSlots: [5, 6, 7],
      unavailablePeriods: [],
      status: "active",
      email: "vignesh.k@school.edu",
      phone: "+91 98401 23464"
    }
  ],
  requirements: [
    { classId: "10-A", subjectId: "SUB-MAT", periodsPerWeek: 6, teacherId: "T101" },
    { classId: "10-A", subjectId: "SUB-PHY", periodsPerWeek: 4, teacherId: "T104" },
    { classId: "10-A", subjectId: "SUB-CHE", periodsPerWeek: 4, teacherId: "T104" },
    { classId: "10-A", subjectId: "SUB-ENG", periodsPerWeek: 5, teacherId: "T105" },
    { classId: "10-A", subjectId: "SUB-CSC-LAB", periodsPerWeek: 2, teacherId: "T109", labId: "LAB-CSC1", isConsecutive: true }
  ],
  timetable: [],
  specialTests: [],
  substitutions: [],
  leaves: []
};
