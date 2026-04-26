// GitHub Profile Analyzer with caching

interface GitHubRepo {
  name: string;
  description: string | null;
  stargazers_count: number;
  updated_at: string;
  pushed_at: string;
  fork: boolean;
  language: string | null;
  has_readme?: boolean;
  open_issues_count: number;
  topics?: string[];
}

interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  bio: string | null;
}

interface GitHubAnalysis {
  score: number;
  username: string;
  avatar: string;
  name: string;
  stats: {
    totalRepos: number;
    totalStars: number;
    followers: number;
    recentCommits: number;
    avgActivity: number;
  };
  strengths: string[];
  improvements: string[];
  archivalSuggestions: string[];
  breakdown: {
    activityScore: number;
    repoScore: number;
    socialScore: number;
    qualityScore: number;
    consistencyScore: number;
  };
  cached?: boolean;
  cachedAt?: string;
}

// In-memory cache for GitHub data (1 hour TTL)
const githubCache = new Map<string, { data: GitHubAnalysis; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Pre-loaded demo users data to avoid rate limits during demos
const DEMO_USERS: Record<string, GitHubAnalysis> = {
  torvalds: {
    score: 98,
    username: 'torvalds',
    avatar: 'https://avatars.githubusercontent.com/u/1024025',
    name: 'Linus Torvalds',
    stats: { totalRepos: 8, totalStars: 198000, followers: 230000, recentCommits: 42, avgActivity: 95 },
    strengths: [
      'Creator of Linux kernel — legendary open source contributions',
      'Exceptional commit consistency across decades',
      'Repositories have massive global impact and adoption',
      'Strong community presence with 230K+ followers',
      'High-quality documentation and project management'
    ],
    improvements: [
      'Consider adding more public repositories to showcase diverse work',
      'Adding topics/tags to repositories would improve discoverability'
    ],
    archivalSuggestions: [],
    breakdown: { activityScore: 20, repoScore: 25, socialScore: 25, qualityScore: 18, consistencyScore: 10 },
    cached: true,
    cachedAt: new Date().toISOString(),
  },
  mojombo: {
    score: 82,
    username: 'mojombo',
    avatar: 'https://avatars.githubusercontent.com/u/1',
    name: 'Tom Preston-Werner',
    stats: { totalRepos: 62, totalStars: 12000, followers: 24000, recentCommits: 8, avgActivity: 65 },
    strengths: [
      'GitHub co-founder with exceptional historical contributions',
      'Creator of Jekyll static site generator',
      'Large public repository collection with diverse languages',
      'Strong follower base demonstrating community trust',
      'Quality-focused repositories with good documentation'
    ],
    improvements: [
      'Recent commit activity could be increased for better engagement score',
      'Some older repositories may benefit from updated README files',
      'Consider adding CI/CD configurations to improve project quality'
    ],
    archivalSuggestions: ['grit', 'bert', 'toml'],
    breakdown: { activityScore: 12, repoScore: 22, socialScore: 20, qualityScore: 18, consistencyScore: 10 },
    cached: true,
    cachedAt: new Date().toISOString(),
  },
  octocat: {
    score: 71,
    username: 'octocat',
    avatar: 'https://avatars.githubusercontent.com/u/583231',
    name: 'The Octocat',
    stats: { totalRepos: 8, totalStars: 3500, followers: 16000, recentCommits: 3, avgActivity: 40 },
    strengths: [
      'Official GitHub mascot account with high visibility',
      'Well-maintained hello-world reference repository',
      'Good follower reach for ambassador purposes',
      'Clean, minimal repository setup ideal for demonstrations'
    ],
    improvements: [
      'Very low recent commit activity — consider contributing to open source projects',
      'Limited repository diversity — add projects in multiple languages',
      'Profile bio could be more descriptive for professional branding',
      'Consider adding portfolio-style repositories to showcase skills'
    ],
    archivalSuggestions: ['test-repo1', 'octocat.github.io'],
    breakdown: { activityScore: 5, repoScore: 18, socialScore: 18, qualityScore: 20, consistencyScore: 10 },
    cached: true,
    cachedAt: new Date().toISOString(),
  },
};

async function fetchGitHubData(username: string): Promise<GitHubAnalysis> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'CampusConnect-App/1.0',
  };

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  // Fetch user data
  const userRes = await fetch(`https://api.github.com/users/${username}`, { headers });
  if (!userRes.ok) {
    if (userRes.status === 404) throw new Error(`GitHub user "${username}" not found`);
    if (userRes.status === 403) throw new Error('GitHub API rate limit exceeded. Please try again later or use a demo account.');
    throw new Error(`GitHub API error: ${userRes.status}`);
  }

  const user: GitHubUser = await userRes.json();

  // Fetch repositories
  const reposRes = await fetch(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
    { headers }
  );
  const repos: GitHubRepo[] = reposRes.ok ? await reposRes.json() : [];

  // Calculate metrics
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

  const ownRepos = repos.filter(r => !r.fork);
  const totalStars = ownRepos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const recentlyUpdated = ownRepos.filter(r => new Date(r.pushed_at) > thirtyDaysAgo);
  const recentCommits = recentlyUpdated.length * 3; // Approximate

  // Quality metrics
  const reposWithDescription = ownRepos.filter(r => r.description && r.description.length > 10);
  const staleRepos = ownRepos.filter(r => new Date(r.pushed_at) < sixMonthsAgo && !r.fork);
  const lowQualityStale = staleRepos.filter(r => 
    !r.description || r.stargazers_count < 2
  );

  // Scoring (out of 100)
  const activityScore = Math.min(20, Math.floor((recentCommits / 30) * 20));
  const repoScore = Math.min(25, Math.floor((Math.min(ownRepos.length, 50) / 50) * 15) + Math.min(10, Math.floor(totalStars / 500)));
  const socialScore = Math.min(25, Math.floor((Math.log10(Math.max(user.followers, 1)) / Math.log10(10000)) * 25));
  const qualityScore = Math.min(20, Math.floor((reposWithDescription.length / Math.max(ownRepos.length, 1)) * 20));
  const consistencyScore = Math.min(10, recentlyUpdated.length > 0 ? 10 : Math.floor(recentlyUpdated.length * 2));

  const score = activityScore + repoScore + socialScore + qualityScore + consistencyScore;

  // Generate strengths
  const strengths: string[] = [];
  if (ownRepos.length >= 10) strengths.push(`Active repository portfolio with ${ownRepos.length} projects`);
  if (totalStars > 100) strengths.push(`Strong community recognition with ${totalStars} total stars`);
  if (user.followers > 50) strengths.push(`Good network reach with ${user.followers} followers`);
  if (recentCommits > 10) strengths.push(`High recent activity — ${recentCommits}+ commits in last 30 days`);
  if (reposWithDescription.length > 5) strengths.push(`Well-documented projects (${reposWithDescription.length} repos with descriptions)`);
  if (strengths.length === 0) strengths.push('GitHub profile is active and set up correctly');

  // Generate improvements
  const improvements: string[] = [];
  if (recentCommits < 5) improvements.push('Increase commit frequency — aim for at least 5-10 commits per month');
  if (ownRepos.length < 5) improvements.push('Create more public repositories to showcase your skills');
  if (reposWithDescription.length < ownRepos.length * 0.5) improvements.push('Add descriptions to all repositories for better discoverability');
  if (user.followers < 10) improvements.push('Engage with the GitHub community by starring, forking, and contributing to popular repos');
  if (totalStars < 10) improvements.push('Create impactful projects that solve real problems to earn community stars');
  if (!user.bio) improvements.push('Add a professional bio to your GitHub profile');

  // Archival suggestions
  const archivalSuggestions = lowQualityStale.slice(0, 5).map(r => r.name);

  return {
    score: Math.min(100, score),
    username: user.login,
    avatar: user.avatar_url,
    name: user.name || user.login,
    stats: {
      totalRepos: ownRepos.length,
      totalStars,
      followers: user.followers,
      recentCommits,
      avgActivity: Math.round((recentlyUpdated.length / Math.max(ownRepos.length, 1)) * 100),
    },
    strengths,
    improvements,
    archivalSuggestions,
    breakdown: {
      activityScore,
      repoScore,
      socialScore,
      qualityScore,
      consistencyScore,
    },
    cached: false,
    cachedAt: new Date().toISOString(),
  };
}

export async function analyzeGitHubProfile(username: string): Promise<GitHubAnalysis> {
  const lowerUsername = username.toLowerCase();

  // Check demo users first
  if (DEMO_USERS[lowerUsername]) {
    return DEMO_USERS[lowerUsername];
  }

  // Check cache
  const cached = githubCache.get(lowerUsername);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { ...cached.data, cached: true };
  }

  // Fetch fresh data
  const data = await fetchGitHubData(username);
  
  // Cache the result
  githubCache.set(lowerUsername, { data, timestamp: Date.now() });
  
  return data;
}

export type { GitHubAnalysis };
