const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const app = express();
const port = process.env.PORT || 5000;
const jwtSecret = process.env.JWT_SECRET || 'dev-secret';

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

const demoUsers = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@skillportal.local',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    location: 'City Center',
    skills: ['Project Management', 'Operations'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Asha Patel',
    email: 'seeker@skillportal.local',
    password: bcrypt.hashSync('seeker123', 10),
    role: 'job_seeker',
    location: 'North Town',
    skills: ['Customer Service', 'Data Entry', 'Communication'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Rakesh Singh',
    email: 'employer@skillportal.local',
    password: bcrypt.hashSync('employer123', 10),
    role: 'employer',
    location: 'Industrial Area',
    skills: ['Hiring', 'Operations'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    name: 'Nisha Verma',
    email: 'trainer@skillportal.local',
    password: bcrypt.hashSync('trainer123', 10),
    role: 'training_provider',
    location: 'Tech Park',
    skills: ['Training', 'Mentoring'],
    createdAt: new Date().toISOString(),
  },
];

const demoJobs = [
  {
    id: 1,
    title: 'Customer Support Executive',
    company: 'CityCare Services',
    location: 'North Town',
    type: 'Full-time',
    category: 'Customer Service',
    salary: '₹18,000 - ₹25,000',
    description: 'Provide customer support, handle calls and resolve service issues.',
    isApproved: true,
    postedBy: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Junior Data Entry Clerk',
    company: 'Metro Ledger',
    location: 'Central Market',
    type: 'Contract',
    category: 'Administration',
    salary: '₹15,000 - ₹20,000',
    description: 'Assist in data processing, documentation, and record keeping.',
    isApproved: true,
    postedBy: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'Warehouse Associate',
    company: 'LogiFlex',
    location: 'Industrial Area',
    type: 'Full-time',
    category: 'Logistics',
    salary: '₹20,000 - ₹28,000',
    description: 'Sort goods, manage inventory, and support warehouse operations.',
    isApproved: false,
    postedBy: 3,
    createdAt: new Date().toISOString(),
  },
];

const demoCourses = [
  {
    id: 1,
    title: 'Digital Marketing Fundamentals',
    provider: 'SkillBridge Academy',
    location: 'City Center',
    duration: '6 weeks',
    fee: '₹4,500',
    category: 'Marketing',
    description: 'Learn SEO, social media marketing, and campaign planning.',
    isApproved: true,
    providerId: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Computer Skills for Employment',
    provider: 'Career Growth Training',
    location: 'West Gate',
    duration: '4 weeks',
    fee: '₹3,000',
    category: 'IT Skills',
    description: 'Build essential digital skills for office work and online job applications.',
    isApproved: true,
    providerId: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'Retail Sales Training',
    provider: 'Community Careers Hub',
    location: 'Town Square',
    duration: '3 weeks',
    fee: '₹2,200',
    category: 'Sales',
    description: 'Practice sales communication, customer engagement, and retail etiquette.',
    isApproved: false,
    providerId: 4,
    createdAt: new Date().toISOString(),
  },
];

const demoApplications = [
  {
    id: 1,
    jobId: 1,
    userId: 2,
    status: 'Applied',
    createdAt: new Date().toISOString(),
  },
];

const demoEnrollments = [
  {
    id: 1,
    courseId: 1,
    userId: 2,
    status: 'Enrolled',
    createdAt: new Date().toISOString(),
  },
];

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  location: user.location,
  skills: user.skills,
  createdAt: user.createdAt,
});

const generateToken = (user) => jwt.sign({ id: user.id, email: user.email, role: user.role }, jwtSecret, { expiresIn: '7d' });

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = demoUsers.find((entry) => entry.id === payload.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }
    req.user = sanitizeUser(user);
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

const requireRole = (allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have permission to perform this action.' });
  }
  next();
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Skill portal backend is running.' });
});

app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password, role, location, skills } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  const exists = demoUsers.some((user) => user.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }

  const nextId = demoUsers.length ? Math.max(...demoUsers.map((user) => user.id)) + 1 : 1;
  const user = {
    id: nextId,
    name,
    email,
    password: await bcrypt.hash(password, 10),
    role: role || 'job_seeker',
    location: location || 'Unknown',
    skills: skills || [],
    createdAt: new Date().toISOString(),
  };

  demoUsers.push(user);
  const token = generateToken(user);

  res.status(201).json({
    token,
    user: sanitizeUser(user),
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = demoUsers.find((entry) => entry.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(404).json({ message: 'No account found with this email.' });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ message: 'Incorrect password.' });
  }

  res.json({
    token: generateToken(user),
    user: sanitizeUser(user),
  });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  const user = demoUsers.find((entry) => entry.id === req.user.id);
  res.json({ user: sanitizeUser(user) });
});

app.get('/api/jobs', (req, res) => {
  const jobs = demoJobs.map((job) => ({
    ...job,
    applicationCount: demoApplications.filter((application) => application.jobId === job.id).length,
  }));
  res.json({ jobs: jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) });
});

app.post('/api/jobs', requireAuth, requireRole(['employer', 'admin']), (req, res) => {
  const { title, company, location, type, category, salary, description } = req.body;

  if (!title || !company || !location || !description) {
    return res.status(400).json({ message: 'Required job fields are missing.' });
  }

  const job = {
    id: demoJobs.length ? Math.max(...demoJobs.map((entry) => entry.id)) + 1 : 1,
    title,
    company,
    location,
    type: type || 'Full-time',
    category: category || 'General',
    salary: salary || 'Not specified',
    description,
    postedBy: req.user.id,
    isApproved: req.user.role === 'admin',
    createdAt: new Date().toISOString(),
  };

  demoJobs.push(job);
  res.status(201).json({ job });
});

app.post('/api/jobs/:id/apply', requireAuth, (req, res) => {
  const jobId = Number(req.params.id);
  const job = demoJobs.find((entry) => entry.id === jobId);

  if (!job) {
    return res.status(404).json({ message: 'Job not found.' });
  }

  const alreadyApplied = demoApplications.some((application) => application.jobId === jobId && application.userId === req.user.id);
  if (alreadyApplied) {
    return res.status(409).json({ message: 'You already applied to this job.' });
  }

  const application = {
    id: demoApplications.length ? Math.max(...demoApplications.map((entry) => entry.id)) + 1 : 1,
    jobId,
    userId: req.user.id,
    status: 'Applied',
    createdAt: new Date().toISOString(),
  };

  demoApplications.push(application);
  res.status(201).json({ message: 'Application submitted successfully.', application });
});

app.get('/api/courses', (req, res) => {
  const courses = demoCourses.map((course) => ({
    ...course,
    enrollmentCount: demoEnrollments.filter((enrollment) => enrollment.courseId === course.id).length,
  }));
  res.json({ courses: courses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) });
});

app.post('/api/courses', requireAuth, requireRole(['training_provider', 'admin']), (req, res) => {
  const { title, provider, location, duration, fee, category, description } = req.body;

  if (!title || !provider || !location || !description) {
    return res.status(400).json({ message: 'Required course fields are missing.' });
  }

  const course = {
    id: demoCourses.length ? Math.max(...demoCourses.map((entry) => entry.id)) + 1 : 1,
    title,
    provider,
    location,
    duration: duration || 'Not specified',
    fee: fee || 'Free',
    category: category || 'General',
    description,
    providerId: req.user.id,
    isApproved: req.user.role === 'admin',
    createdAt: new Date().toISOString(),
  };

  demoCourses.push(course);
  res.status(201).json({ course });
});

app.post('/api/courses/:id/enroll', requireAuth, (req, res) => {
  const courseId = Number(req.params.id);
  const course = demoCourses.find((entry) => entry.id === courseId);

  if (!course) {
    return res.status(404).json({ message: 'Course not found.' });
  }

  const alreadyEnrolled = demoEnrollments.some((enrollment) => enrollment.courseId === courseId && enrollment.userId === req.user.id);
  if (alreadyEnrolled) {
    return res.status(409).json({ message: 'You are already enrolled in this course.' });
  }

  const enrollment = {
    id: demoEnrollments.length ? Math.max(...demoEnrollments.map((entry) => entry.id)) + 1 : 1,
    courseId,
    userId: req.user.id,
    status: 'Enrolled',
    createdAt: new Date().toISOString(),
  };

  demoEnrollments.push(enrollment);
  res.status(201).json({ message: 'Enrollment successful.', enrollment });
});

app.get('/api/admin/pending', requireAuth, requireRole(['admin']), (req, res) => {
  const pendingJobs = demoJobs.filter((job) => !job.isApproved);
  const pendingCourses = demoCourses.filter((course) => !course.isApproved);

  res.json({ pendingJobs, pendingCourses });
});

app.patch('/api/admin/jobs/:id/approve', requireAuth, requireRole(['admin']), (req, res) => {
  const jobId = Number(req.params.id);
  const job = demoJobs.find((entry) => entry.id === jobId);

  if (!job) {
    return res.status(404).json({ message: 'Job not found.' });
  }

  job.isApproved = true;
  res.json({ message: 'Job approved successfully.', job });
});

app.patch('/api/admin/courses/:id/approve', requireAuth, requireRole(['admin']), (req, res) => {
  const courseId = Number(req.params.id);
  const course = demoCourses.find((entry) => entry.id === courseId);

  if (!course) {
    return res.status(404).json({ message: 'Course not found.' });
  }

  course.isApproved = true;
  res.json({ message: 'Course approved successfully.', course });
});

app.get('/api/users/:id', requireAuth, (req, res) => {
  const userId = Number(req.params.id);
  const user = demoUsers.find((entry) => entry.id === userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  res.json({ user: sanitizeUser(user) });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

app.listen(port, () => {
  console.log(`Skill portal API running on http://localhost:${port}`);
});
