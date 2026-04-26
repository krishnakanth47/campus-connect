import { NextRequest, NextResponse } from 'next/server';
import store from '@/lib/store';
import { getUserFromRequest } from '@/lib/auth';
import { getBadgeForPoints } from '@/lib/badges';

// GET submissions
export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let submissions;
    if (user.role === 'admin') {
      submissions = await store.getAllSubmissions();
    } else {
      submissions = await store.getSubmissionsByUser(user.userId);
    }

    // Enrich with user and task data
    const enriched = await Promise.all(
      submissions.map(async (sub) => {
        const [taskUser, task] = await Promise.all([
          store.getUserById(sub.user_id),
          store.getTaskById(sub.task_id),
        ]);
        return {
          ...sub,
          user: taskUser ? { id: taskUser.id, name: taskUser.name, email: taskUser.email, avatar: taskUser.avatar, badge: taskUser.badge } : null,
          task: task ? { id: task.id, title: task.title, points: task.points, required_keyword: task.required_keyword } : null,
        };
      })
    );

    return NextResponse.json({ submissions: enriched });
  } catch (error) {
    console.error('Get submissions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST submit proof
export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'ambassador') return NextResponse.json({ error: 'Ambassador access required' }, { status: 403 });

    const { task_id, proof, proof_type } = await req.json();

    if (!task_id || !proof) {
      return NextResponse.json({ error: 'Task ID and proof are required' }, { status: 400 });
    }

    // Check if already submitted
    const alreadySubmitted = await store.hasUserSubmittedTask(user.userId, parseInt(task_id));
    if (alreadySubmitted) {
      return NextResponse.json({ error: 'You have already submitted for this task' }, { status: 409 });
    }

    // Get task for auto-verification
    const task = await store.getTaskById(parseInt(task_id));
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    // Auto-verification: check keyword in link
    let autoVerified = false;
    let status: 'pending' | 'approved' = 'pending';

    if (task.required_keyword && proof_type === 'link') {
      const proofLower = proof.toLowerCase();
      const keywordLower = task.required_keyword.toLowerCase();
      if (proofLower.includes(keywordLower)) {
        autoVerified = true;
        status = 'approved';
      }
    }

    const submission = await store.createSubmission({
      user_id: user.userId,
      task_id: parseInt(task_id),
      proof,
      proof_type: proof_type || task.proof_type,
      status,
      feedback: autoVerified ? 'Auto-verified: keyword detected in submission URL' : null,
      approved_by: autoVerified ? 0 : null,
      reviewed_at: autoVerified ? new Date().toISOString() : null,
      auto_verified: autoVerified,
    });

    // If auto-approved, award points
    if (autoVerified) {
      const currentUser = await store.getUserById(user.userId);
      if (currentUser) {
        const newPoints = currentUser.points + task.points;
        await store.updateUserPoints(user.userId, newPoints);
      }
    }

    return NextResponse.json({
      submission,
      autoVerified,
      message: autoVerified
        ? `Auto-verified! ${task.points} points awarded automatically.`
        : 'Submission received. Pending admin review.',
    }, { status: 201 });
  } catch (error) {
    console.error('Submit error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
