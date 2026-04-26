// In-memory data store for demo mode (when PostgreSQL is unavailable)
// This makes the app fully functional without any database setup

import { hashPassword } from './auth';
import { getBadgeForPoints } from './badges';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'ambassador';
  github_username: string | null;
  github_score: number | null;
  points: number;
  badge: string;
  created_at: string;
  avatar?: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  points: number;
  deadline: string;
  required_keyword: string | null;
  proof_type: 'screenshot' | 'link' | 'file';
  created_by: number;
  created_at: string;
  is_active: boolean;
}

export interface Submission {
  id: number;
  user_id: number;
  task_id: number;
  proof: string;
  proof_type: 'screenshot' | 'link' | 'file';
  status: 'pending' | 'approved' | 'rejected';
  feedback: string | null;
  approved_by: number | null;
  submitted_at: string;
  reviewed_at: string | null;
  auto_verified: boolean;
}

// Generate a future date helper
function futureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString();
}

function pastDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

// Initialize in-memory store
class InMemoryStore {
  private users: User[] = [];
  private tasks: Task[] = [];
  private submissions: Submission[] = [];
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    this.initialized = true;

    const adminPass = await hashPassword('password123');
    const userPass = await hashPassword('password123');

    this.users = [
      {
        id: 1,
        name: 'Admin User',
        email: 'admin@campusconnect.com',
        password: adminPass,
        role: 'admin',
        github_username: 'torvalds',
        github_score: 98,
        points: 0,
        badge: 'none',
        created_at: pastDate(90),
        avatar: 'A',
      },
      {
        id: 2,
        name: 'Aryan Sharma',
        email: 'aryan@example.com',
        password: userPass,
        role: 'ambassador',
        github_username: 'torvalds',
        github_score: 98,
        points: 1250,
        badge: 'platinum',
        created_at: pastDate(60),
        avatar: 'AS',
      },
      {
        id: 3,
        name: 'Priya Patel',
        email: 'priya@example.com',
        password: userPass,
        role: 'ambassador',
        github_username: 'mojombo',
        github_score: 82,
        points: 890,
        badge: 'gold',
        created_at: pastDate(55),
        avatar: 'PP',
      },
      {
        id: 4,
        name: 'Rahul Verma',
        email: 'rahul@example.com',
        password: userPass,
        role: 'ambassador',
        github_username: 'octocat',
        github_score: 71,
        points: 650,
        badge: 'gold',
        created_at: pastDate(50),
        avatar: 'RV',
      },
      {
        id: 5,
        name: 'Sneha Gupta',
        email: 'sneha@example.com',
        password: userPass,
        role: 'ambassador',
        github_username: null,
        github_score: null,
        points: 420,
        badge: 'silver',
        created_at: pastDate(45),
        avatar: 'SG',
      },
      {
        id: 6,
        name: 'Karan Singh',
        email: 'karan@example.com',
        password: userPass,
        role: 'ambassador',
        github_username: null,
        github_score: null,
        points: 310,
        badge: 'silver',
        created_at: pastDate(40),
        avatar: 'KS',
      },
      {
        id: 7,
        name: 'Neha Joshi',
        email: 'neha@example.com',
        password: userPass,
        role: 'ambassador',
        github_username: null,
        github_score: null,
        points: 180,
        badge: 'bronze',
        created_at: pastDate(35),
        avatar: 'NJ',
      },
      {
        id: 8,
        name: 'Demo User',
        email: 'user@campusconnect.com',
        password: userPass,
        role: 'ambassador',
        github_username: 'octocat',
        github_score: 71,
        points: 250,
        badge: 'silver',
        created_at: pastDate(30),
        avatar: 'DU',
      },
    ];

    this.tasks = [
      {
        id: 1,
        title: 'Share Campus Connect on LinkedIn',
        description: 'Create a professional LinkedIn post about Campus Connect highlighting its key features. Include the hashtags #CampusConnect #AmbassadorProgram and share with your network.',
        points: 150,
        deadline: futureDate(7),
        required_keyword: 'CampusConnect',
        proof_type: 'link',
        created_by: 1,
        created_at: pastDate(10),
        is_active: true,
      },
      {
        id: 2,
        title: 'Recruit 3 New Ambassadors',
        description: 'Recruit at least 3 new campus ambassadors from your college. Submit a screenshot showing their registration confirmation emails.',
        points: 300,
        deadline: futureDate(14),
        required_keyword: null,
        proof_type: 'screenshot',
        created_by: 1,
        created_at: pastDate(8),
        is_active: true,
      },
      {
        id: 3,
        title: 'Host a Campus Workshop',
        description: 'Organize and conduct a workshop at your campus introducing students to tech communities and ambassador programs. Upload documentation (photos/attendance sheet).',
        points: 500,
        deadline: futureDate(21),
        required_keyword: null,
        proof_type: 'file',
        created_by: 1,
        created_at: pastDate(6),
        is_active: true,
      },
      {
        id: 4,
        title: 'GitHub Profile Optimization',
        description: 'Analyze your GitHub profile using our analyzer tool and implement at least 3 of the suggested improvements. Submit before and after screenshots.',
        points: 200,
        deadline: futureDate(10),
        required_keyword: null,
        proof_type: 'screenshot',
        created_by: 1,
        created_at: pastDate(5),
        is_active: true,
      },
      {
        id: 5,
        title: 'Create YouTube Tutorial Video',
        description: 'Record a 5-10 minute tutorial video showing how to use Campus Connect platform. Upload to YouTube and submit the link. Include #CampusConnect in the title.',
        points: 400,
        deadline: futureDate(15),
        required_keyword: 'CampusConnect',
        proof_type: 'link',
        created_by: 1,
        created_at: pastDate(4),
        is_active: true,
      },
      {
        id: 6,
        title: 'Write a Blog Post',
        description: 'Write a detailed blog post (minimum 800 words) about your ambassador experience or tech journey. Publish on Medium, Dev.to, or personal blog.',
        points: 250,
        deadline: futureDate(12),
        required_keyword: null,
        proof_type: 'link',
        created_by: 1,
        created_at: pastDate(3),
        is_active: true,
      },
    ];

    this.submissions = [
      {
        id: 1,
        user_id: 2,
        task_id: 1,
        proof: 'https://linkedin.com/posts/aryan-sharma-CampusConnect-2024',
        proof_type: 'link',
        status: 'approved',
        feedback: 'Excellent post! Great engagement from your network.',
        approved_by: 1,
        submitted_at: pastDate(7),
        reviewed_at: pastDate(6),
        auto_verified: true,
      },
      {
        id: 2,
        user_id: 2,
        task_id: 2,
        proof: 'screenshot_recruit_aryan.png',
        proof_type: 'screenshot',
        status: 'approved',
        feedback: 'Well done! All 3 recruits confirmed.',
        approved_by: 1,
        submitted_at: pastDate(5),
        reviewed_at: pastDate(4),
        auto_verified: false,
      },
      {
        id: 3,
        user_id: 3,
        task_id: 1,
        proof: 'https://linkedin.com/posts/priya-patel-ambassador',
        proof_type: 'link',
        status: 'approved',
        feedback: 'Great post with professional branding.',
        approved_by: 1,
        submitted_at: pastDate(6),
        reviewed_at: pastDate(5),
        auto_verified: true,
      },
      {
        id: 4,
        user_id: 4,
        task_id: 3,
        proof: 'workshop_rahul_2024.pdf',
        proof_type: 'file',
        status: 'approved',
        feedback: 'Impressive workshop documentation!',
        approved_by: 1,
        submitted_at: pastDate(4),
        reviewed_at: pastDate(3),
        auto_verified: false,
      },
      {
        id: 5,
        user_id: 5,
        task_id: 6,
        proof: 'https://dev.to/sneha-gupta/my-ambassador-journey',
        proof_type: 'link',
        status: 'pending',
        feedback: null,
        approved_by: null,
        submitted_at: pastDate(1),
        reviewed_at: null,
        auto_verified: false,
      },
      {
        id: 6,
        user_id: 6,
        task_id: 4,
        proof: 'github_before_after.png',
        proof_type: 'screenshot',
        status: 'pending',
        feedback: null,
        approved_by: null,
        submitted_at: pastDate(2),
        reviewed_at: null,
        auto_verified: false,
      },
      {
        id: 7,
        user_id: 8,
        task_id: 1,
        proof: 'https://linkedin.com/posts/demo-user-campus',
        proof_type: 'link',
        status: 'rejected',
        feedback: 'The post does not include the required hashtag #CampusConnect. Please resubmit.',
        approved_by: 1,
        submitted_at: pastDate(3),
        reviewed_at: pastDate(2),
        auto_verified: false,
      },
      {
        id: 8,
        user_id: 3,
        task_id: 5,
        proof: 'https://youtube.com/watch?v=CampusConnect-tutorial-priya',
        proof_type: 'link',
        status: 'approved',
        feedback: 'Outstanding tutorial! Very professional.',
        approved_by: 1,
        submitted_at: pastDate(3),
        reviewed_at: pastDate(2),
        auto_verified: false,
      },
    ];
  }

  // User operations
  async getUserByEmail(email: string): Promise<User | null> {
    await this.initialize();
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async getUserById(id: number): Promise<User | null> {
    await this.initialize();
    return this.users.find(u => u.id === id) || null;
  }

  async getAllAmbassadors(): Promise<User[]> {
    await this.initialize();
    return this.users.filter(u => u.role === 'ambassador').sort((a, b) => b.points - a.points);
  }

  async getAllUsers(): Promise<User[]> {
    await this.initialize();
    return [...this.users];
  }

  async createUser(data: Omit<User, 'id' | 'created_at' | 'points' | 'badge'>): Promise<User> {
    await this.initialize();
    const newUser: User = {
      ...data,
      id: this.users.length + 1,
      points: 0,
      badge: 'none',
      created_at: new Date().toISOString(),
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateUserPoints(userId: number, points: number): Promise<User | null> {
    await this.initialize();
    const user = this.users.find(u => u.id === userId);
    if (!user) return null;
    user.points = points;
    user.badge = getBadgeForPoints(points);
    return user;
  }

  async updateUserGitHub(userId: number, github_username: string, github_score: number): Promise<User | null> {
    await this.initialize();
    const user = this.users.find(u => u.id === userId);
    if (!user) return null;
    user.github_username = github_username;
    user.github_score = github_score;
    return user;
  }

  // Task operations
  async getAllTasks(): Promise<Task[]> {
    await this.initialize();
    return [...this.tasks].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getActiveTask(): Promise<Task[]> {
    await this.initialize();
    return this.tasks.filter(t => t.is_active);
  }

  async getTaskById(id: number): Promise<Task | null> {
    await this.initialize();
    return this.tasks.find(t => t.id === id) || null;
  }

  async createTask(data: Omit<Task, 'id' | 'created_at'>): Promise<Task> {
    await this.initialize();
    const newTask: Task = {
      ...data,
      id: this.tasks.length + 1,
      created_at: new Date().toISOString(),
    };
    this.tasks.push(newTask);
    return newTask;
  }

  async updateTask(id: number, data: Partial<Task>): Promise<Task | null> {
    await this.initialize();
    const task = this.tasks.find(t => t.id === id);
    if (!task) return null;
    Object.assign(task, data);
    return task;
  }

  async deleteTask(id: number): Promise<boolean> {
    await this.initialize();
    const idx = this.tasks.findIndex(t => t.id === id);
    if (idx === -1) return false;
    this.tasks.splice(idx, 1);
    return true;
  }

  // Submission operations
  async getAllSubmissions(): Promise<Submission[]> {
    await this.initialize();
    return [...this.submissions].sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
  }

  async getSubmissionsByUser(userId: number): Promise<Submission[]> {
    await this.initialize();
    return this.submissions.filter(s => s.user_id === userId);
  }

  async getSubmissionsByTask(taskId: number): Promise<Submission[]> {
    await this.initialize();
    return this.submissions.filter(s => s.task_id === taskId);
  }

  async getSubmissionById(id: number): Promise<Submission | null> {
    await this.initialize();
    return this.submissions.find(s => s.id === id) || null;
  }

  async createSubmission(data: Omit<Submission, 'id' | 'submitted_at'>): Promise<Submission> {
    await this.initialize();
    const newSub: Submission = {
      ...data,
      id: this.submissions.length + 1,
      submitted_at: new Date().toISOString(),
    };
    this.submissions.push(newSub);
    return newSub;
  }

  async updateSubmission(id: number, data: Partial<Submission>): Promise<Submission | null> {
    await this.initialize();
    const sub = this.submissions.find(s => s.id === id);
    if (!sub) return null;
    Object.assign(sub, data, { reviewed_at: new Date().toISOString() });
    return sub;
  }

  async hasUserSubmittedTask(userId: number, taskId: number): Promise<boolean> {
    await this.initialize();
    return this.submissions.some(s => s.user_id === userId && s.task_id === taskId && s.status !== 'rejected');
  }

  // Analytics
  async getAnalytics() {
    await this.initialize();
    const ambassadors = this.users.filter(u => u.role === 'ambassador');
    const activeAmbassadors = ambassadors.filter(u => {
      const userSubs = this.submissions.filter(s => s.user_id === u.id);
      return userSubs.length > 0;
    });
    const approvedSubs = this.submissions.filter(s => s.status === 'approved');
    const totalPoints = ambassadors.reduce((sum, u) => sum + u.points, 0);
    const avgEngagement = ambassadors.length > 0 
      ? Math.round(ambassadors.reduce((sum, u) => sum + (u.github_score || 0), 0) / ambassadors.length) 
      : 0;

    const taskCompletionMap = new Map<number, number>();
    approvedSubs.forEach(s => {
      taskCompletionMap.set(s.task_id, (taskCompletionMap.get(s.task_id) || 0) + 1);
    });

    const topPerformers = ambassadors
      .sort((a, b) => b.points - a.points)
      .slice(0, 5);

    return {
      totalAmbassadors: ambassadors.length,
      activeAmbassadors: activeAmbassadors.length,
      totalTasksCompleted: approvedSubs.length,
      avgEngagementScore: avgEngagement,
      totalPointsDistributed: totalPoints,
      completionRate: this.submissions.length > 0 
        ? Math.round((approvedSubs.length / this.submissions.length) * 100)
        : 0,
      topPerformers,
      taskStats: this.tasks.map(t => ({
        task: t,
        submissions: this.submissions.filter(s => s.task_id === t.id).length,
        approved: this.submissions.filter(s => s.task_id === t.id && s.status === 'approved').length,
      })),
      pendingSubmissions: this.submissions.filter(s => s.status === 'pending').length,
    };
  }
}

// Singleton instance
const store = new InMemoryStore();
export default store;
