import { useEffect, useMemo, useState } from 'react';
import { authService, jobsService, coursesService, adminService } from './services/api';

const defaultUser = () => {
  const stored = localStorage.getItem('user');
  return stored ? JSON.parse(stored) : null;
};

const routeMap = {
  home: '/',
  jobs: '/jobs',
  courses: '/courses',
  login: '/login',
  signup: '/signup',
  dashboard: '/dashboard',
  admin: '/admin',
};

const navItems = [
  { label: 'Home', href: routeMap.home },
  { label: 'Jobs', href: routeMap.jobs },
  { label: 'Courses', href: routeMap.courses },
  { label: 'Dashboard', href: routeMap.dashboard },
  { label: 'Admin', href: routeMap.admin },
];

const formatLabel = (value) => value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

function App() {
  const [currentPage, setCurrentPage] = useState(window.location.pathname || '/');
  const [user, setUser] = useState(defaultUser());
  const [jobs, setJobs] = useState([]);
  const [courses, setCourses] = useState([]);
  const [pending, setPending] = useState({ pendingJobs: [], pendingCourses: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onPopState = () => setCurrentPage(window.location.pathname || '/');
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const syncUser = async () => {
      if (!user) {
        return;
      }
      try {
        const response = await authService.me();
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
      } catch (error) {
        console.error(error);
      }
    };

    syncUser();
  }, [user?.id]);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await jobsService.getAll();
        setJobs(response.jobs || []);
      } catch (error) {
        console.error(error);
      }
    };

    const loadCourses = async () => {
      try {
        const response = await coursesService.getAll();
        setCourses(response.courses || []);
      } catch (error) {
        console.error(error);
      }
    };

    loadJobs();
    loadCourses();
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      return;
    }

    const loadPending = async () => {
      try {
        const response = await adminService.getPending();
        setPending(response);
      } catch (error) {
        console.error(error);
      }
    };

    loadPending();
  }, [user?.role]);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPage(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const renderPage = () => {
    if (currentPage === '/login') {
      return <LoginPage onLogin={setUser} navigate={navigate} setError={setError} />;
    }

    if (currentPage === '/signup') {
      return <SignupPage onLogin={setUser} navigate={navigate} setError={setError} />;
    }

    if (currentPage === '/jobs') {
      return <JobsPage jobs={jobs} user={user} setJobs={setJobs} navigate={navigate} />;
    }

    if (currentPage === '/courses') {
      return <CoursesPage courses={courses} user={user} setCourses={setCourses} navigate={navigate} />;
    }

    if (currentPage === '/dashboard') {
      return <DashboardPage user={user} jobs={jobs} courses={courses} navigate={navigate} />;
    }

    if (currentPage === '/admin') {
      return <AdminPage user={user} pending={pending} setPending={setPending} navigate={navigate} />;
    }

    return <HomePage user={user} jobs={jobs} courses={courses} navigate={navigate} />;
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand" onClick={() => navigate('/')}>
          <span className="brand-mark">S</span>
          SkillLaunch
        </div>

        <nav className="main-nav">
          {navItems.map((item) => (
            <button
              key={item.href}
              className={currentPage === item.href ? 'nav-link active' : 'nav-link'}
              onClick={() => navigate(item.href)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="auth-group">
          {user ? (
            <>
              <span className="user-badge">{user.name}</span>
              <button className="button secondary" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button className="button secondary" onClick={() => navigate('/login')}>Login</button>
              <button className="button primary" onClick={() => navigate('/signup')}>Sign up</button>
            </>
          )}
        </div>
      </header>

      {error && <div className="alert error">{error}</div>}
      <main>{renderPage()}</main>
    </div>
  );
}

function HomePage({ user, jobs, courses, navigate }) {
  const featuredJobs = jobs.slice(0, 3);
  const featuredCourses = courses.slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Empowering local communities</span>
          <h1>Discover jobs, training, and career pathways in your area.</h1>
          <p>
            Connect job seekers, employers, and training providers through one local skill development and employment platform.
          </p>
          <div className="cta-row">
            <button className="button primary" onClick={() => navigate('/jobs')}>Explore jobs</button>
            <button className="button secondary" onClick={() => navigate('/courses')}>View courses</button>
          </div>
        </div>
        <div className="hero-panel">
          <div className="stat-card">
            <strong>{jobs.length}</strong>
            <span>Open positions</span>
          </div>
          <div className="stat-card">
            <strong>{courses.length}</strong>
            <span>Skill programs</span>
          </div>
          <div className="stat-card">
            <strong>{user ? 'Ready' : 'Join'}</strong>
            <span>{user ? 'Logged in' : 'Get started'}</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <span className="eyebrow">Featured roles</span>
            <h2>Latest job opportunities</h2>
          </div>
          <button className="button secondary" onClick={() => navigate('/jobs')}>See all</button>
        </div>
        <div className="card-grid">
          {featuredJobs.map((job) => (
            <article key={job.id} className="info-card">
              <div className="card-topline">
                <span className="tag">{job.category}</span>
                <span className="muted">{job.type}</span>
              </div>
              <h3>{job.title}</h3>
              <p className="muted">{job.company}</p>
              <p>{job.location}</p>
              <div className="card-footer">
                <strong>{job.salary}</strong>
                <button className="button small primary" onClick={() => navigate('/jobs')}>View job</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section alt">
        <div className="section-header">
          <div>
            <span className="eyebrow">Skill building</span>
            <h2>Popular training programs</h2>
          </div>
          <button className="button secondary" onClick={() => navigate('/courses')}>See all</button>
        </div>
        <div className="card-grid">
          {featuredCourses.map((course) => (
            <article key={course.id} className="info-card">
              <div className="card-topline">
                <span className="tag">{course.category}</span>
                <span className="muted">{course.duration}</span>
              </div>
              <h3>{course.title}</h3>
              <p className="muted">{course.provider}</p>
              <p>{course.location}</p>
              <div className="card-footer">
                <strong>{course.fee}</strong>
                <button className="button small primary" onClick={() => navigate('/courses')}>Learn more</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function LoginPage({ onLogin, navigate, setError }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(form);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      onLogin(response.user);
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <h2>Login</h2>
        <label>
          Email
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </label>
        <label>
          Password
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </label>
        <button className="button primary full" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p className="helper-text">
          Need an account? <button type="button" className="text-button" onClick={() => navigate('/signup')}>Create one</button>
        </p>
      </form>
    </section>
  );
}

function SignupPage({ onLogin, navigate, setError }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'job_seeker', location: '', skills: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...form,
        skills: form.skills ? form.skills.split(',').map((item) => item.trim()) : [],
      };
      const response = await authService.signup(payload);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      onLogin(response.user);
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <h2>Create account</h2>
        <label>
          Full name
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </label>
        <label>
          Password
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </label>
        <label>
          Role
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="job_seeker">Job Seeker</option>
            <option value="employer">Employer</option>
            <option value="training_provider">Training Provider</option>
          </select>
        </label>
        <label>
          Location
          <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </label>
        <label>
          Skills (comma separated)
          <input type="text" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
        </label>
        <button className="button primary full" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>
    </section>
  );
}

function JobsPage({ jobs, user, setJobs, navigate }) {
  const [form, setForm] = useState({
    title: '',
    company: '',
    location: '',
    category: '',
    type: 'Full-time',
    salary: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await jobsService.create(form);
      setJobs((current) => [response.job, ...current]);
      setForm({ title: '', company: '', location: '', category: '', type: 'Full-time', salary: '', description: '' });
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApply = async (jobId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await jobsService.apply(jobId);
      alert('Application submitted successfully.');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <section className="page-wrap">
      <div className="section-header">
        <div>
          <span className="eyebrow">Opportunities</span>
          <h2>Available jobs</h2>
        </div>
      </div>

      <div className="split-layout">
        <div className="job-list column-card">
          {jobs.map((job) => (
            <article key={job.id} className="listing-card">
              <div className="card-topline">
                <span className="tag">{job.category}</span>
                <span className="muted">{job.type}</span>
              </div>
              <h3>{job.title}</h3>
              <p className="muted">{job.company}</p>
              <p>{job.location}</p>
              <p>{job.description}</p>
              <div className="card-footer">
                <strong>{job.salary}</strong>
                <button className="button primary small" onClick={() => handleApply(job.id)}>Apply now</button>
              </div>
            </article>
          ))}
        </div>

        {user && (user.role === 'employer' || user.role === 'admin') && (
          <form className="column-card form-card" onSubmit={handleSubmit}>
            <h3>Post a new job</h3>
            <label>
              Job title
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </label>
            <label>
              Company
              <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
            </label>
            <label>
              Location
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
            </label>
            <label>
              Category
              <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </label>
            <label>
              Type
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Internship</option>
              </select>
            </label>
            <label>
              Salary
              <input type="text" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
            </label>
            <label>
              Description
              <textarea rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </label>
            <button className="button primary full" disabled={isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Publish job'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function CoursesPage({ courses, user, setCourses, navigate }) {
  const [form, setForm] = useState({
    title: '',
    provider: '',
    location: '',
    duration: '',
    fee: '',
    category: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await coursesService.create(form);
      setCourses((current) => [response.course, ...current]);
      setForm({ title: '', provider: '', location: '', duration: '', fee: '', category: '', description: '' });
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnroll = async (courseId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await coursesService.enroll(courseId);
      alert('You have successfully enrolled.');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <section className="page-wrap">
      <div className="section-header">
        <div>
          <span className="eyebrow">Learning pathways</span>
          <h2>Skill development programs</h2>
        </div>
      </div>

      <div className="split-layout">
        <div className="job-list column-card">
          {courses.map((course) => (
            <article key={course.id} className="listing-card">
              <div className="card-topline">
                <span className="tag">{course.category}</span>
                <span className="muted">{course.duration}</span>
              </div>
              <h3>{course.title}</h3>
              <p className="muted">{course.provider}</p>
              <p>{course.location}</p>
              <p>{course.description}</p>
              <div className="card-footer">
                <strong>{course.fee}</strong>
                <button className="button primary small" onClick={() => handleEnroll(course.id)}>Enroll</button>
              </div>
            </article>
          ))}
        </div>

        {user && (user.role === 'training_provider' || user.role === 'admin') && (
          <form className="column-card form-card" onSubmit={handleSubmit}>
            <h3>Add a course</h3>
            <label>
              Course title
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </label>
            <label>
              Provider
              <input type="text" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} required />
            </label>
            <label>
              Location
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
            </label>
            <label>
              Duration
              <input type="text" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            </label>
            <label>
              Fee
              <input type="text" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} />
            </label>
            <label>
              Category
              <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </label>
            <label>
              Description
              <textarea rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </label>
            <button className="button primary full" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Publish course'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function DashboardPage({ user, jobs, courses }) {
  if (!user) {
    return (
      <section className="page-wrap centered">
        <div className="empty-state">
          <h2>Please log in to access your dashboard.</h2>
        </div>
      </section>
    );
  }

  const roleLabel = formatLabel(user.role);
  const jobCount = jobs.filter((job) => job.postedBy === user.id).length;
  const courseCount = courses.filter((course) => course.providerId === user.id).length;

  return (
    <section className="page-wrap">
      <div className="profile-summary">
        <div>
          <span className="eyebrow">Welcome back</span>
          <h2>{user.name}</h2>
        </div>
        <span className="tag large">{roleLabel}</span>
      </div>

      <div className="stats-grid">
        <div className="mini-stat">
          <strong>{jobCount}</strong>
          <span>Jobs posted</span>
        </div>
        <div className="mini-stat">
          <strong>{courseCount}</strong>
          <span>Courses added</span>
        </div>
        <div className="mini-stat">
          <strong>{user.skills?.length || 0}</strong>
          <span>Skills listed</span>
        </div>
      </div>

      <div className="dashboard-card">
        <h3>Your profile</h3>
        <ul className="detail-list">
          <li><strong>Email:</strong> {user.email}</li>
          <li><strong>Location:</strong> {user.location}</li>
          <li><strong>Skills:</strong> {(user.skills || []).join(', ') || 'No skills listed yet.'}</li>
        </ul>
      </div>
    </section>
  );
}

function AdminPage({ user, pending, setPending, navigate }) {
  if (!user || user.role !== 'admin') {
    return (
      <section className="page-wrap centered">
        <div className="empty-state">
          <h2>Admin access required.</h2>
        </div>
      </section>
    );
  }

  const approveJob = async (jobId) => {
    try {
      const response = await adminService.approveJob(jobId);
      setPending((current) => ({
        ...current,
        pendingJobs: current.pendingJobs.filter((job) => job.id !== jobId),
      }));
      alert(response.message);
    } catch (error) {
      alert(error.message);
    }
  };

  const approveCourse = async (courseId) => {
    try {
      const response = await adminService.approveCourse(courseId);
      setPending((current) => ({
        ...current,
        pendingCourses: current.pendingCourses.filter((course) => course.id !== courseId),
      }));
      alert(response.message);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <section className="page-wrap">
      <div className="section-header">
        <div>
          <span className="eyebrow">Admin panel</span>
          <h2>Pending moderation</h2>
        </div>
      </div>

      <div className="stack-grid">
        <div className="dashboard-card">
          <h3>Pending jobs</h3>
          {pending.pendingJobs.length === 0 ? (
            <p className="muted">No pending job submissions.</p>
          ) : (
            pending.pendingJobs.map((job) => (
              <div key={job.id} className="mini-panel">
                <div>
                  <strong>{job.title}</strong>
                  <p className="muted">{job.company}</p>
                </div>
                <button className="button primary small" onClick={() => approveJob(job.id)}>Approve</button>
              </div>
            ))
          )}
        </div>

        <div className="dashboard-card">
          <h3>Pending courses</h3>
          {pending.pendingCourses.length === 0 ? (
            <p className="muted">No pending course submissions.</p>
          ) : (
            pending.pendingCourses.map((course) => (
              <div key={course.id} className="mini-panel">
                <div>
                  <strong>{course.title}</strong>
                  <p className="muted">{course.provider}</p>
                </div>
                <button className="button primary small" onClick={() => approveCourse(course.id)}>Approve</button>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default App;
