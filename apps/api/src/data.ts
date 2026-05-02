export const dashboardSnapshot = {
  profile: {
    name: 'Ava Brooks',
    cohort: 'Grade 11A',
    track: 'Science + Design',
    attendance: '97%',
    gpa: '3.9'
  },
  stats: [
    { label: 'Active students', value: '1,248', delta: '+4.8% this month' },
    { label: 'Attendance rate', value: '96.2%', delta: '+1.1% from last week' },
    { label: 'Pending fees', value: '$18.4K', delta: '-12% overdue balance' },
    { label: 'Open tasks', value: '37', delta: '5 need urgent attention' }
  ],
  schedule: [
    { time: '08:30', title: 'Homeroom check-in', room: 'C-104', status: 'Now' },
    { time: '09:20', title: 'Physics lab', room: 'Lab 2', status: 'Next' },
    { time: '11:00', title: 'Math workshop', room: 'B-201', status: 'Later' }
  ],
  grades: [
    { subject: 'Physics', score: '94', trend: '+3' },
    { subject: 'Mathematics', score: '91', trend: '+1' },
    { subject: 'Literature', score: '88', trend: '0' }
  ],
  tasks: [
    { title: 'Upload chemistry worksheet', due: 'Today, 5:00 PM', level: 'High' },
    { title: 'Review project feedback', due: 'Tomorrow', level: 'Medium' },
    { title: 'Complete fee receipt check', due: 'Friday', level: 'Low' }
  ],
  announcements: [
    { title: 'Orientation week schedule is live', audience: 'Students', time: '2h ago' },
    { title: 'Parent portal billing updates added', audience: 'Parents', time: 'Today' },
    { title: 'Exam timetable draft ready for review', audience: 'Teachers', time: 'Yesterday' }
  ],
  modules: [
    { title: 'Admissions', description: 'Streamlined onboarding with smart document capture.', status: 'Ready' },
    { title: 'Attendance', description: 'One-tap live marking with instant parent notifications.', status: 'Live' },
    { title: 'Analytics', description: 'Python-backed reporting for trends, risks, and insights.', status: 'Building' }
  ],
  attendance: [
    { name: 'Ava Brooks', className: 'Grade 11A', status: 'Present' },
    { name: 'Noah Patel', className: 'Grade 11A', status: 'Late' },
    { name: 'Mia Carter', className: 'Grade 10C', status: 'Present' }
  ]
};
