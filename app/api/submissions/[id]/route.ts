import { NextRequest, NextResponse } from 'next/server';
import store from '@/lib/store';
import { getUserFromRequest } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = getUserFromRequest(req);

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { action, feedback } = await req.json();

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Use "approve" or "reject"' },
        { status: 400 }
      );
    }

    const submission = await store.getSubmissionById(parseInt(id));

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    const newStatus =
      action === 'approve' ? 'approved' : 'rejected';

    const updated = await store.updateSubmission(parseInt(id), {
      status: newStatus,
      feedback: feedback || null,
      approved_by: user.userId,
    });

    if (action === 'approve' && !submission.auto_verified) {
      const task = await store.getTaskById(submission.task_id);
      const submitter = await store.getUserById(submission.user_id);

      if (task && submitter) {
        const newPoints = submitter.points + task.points;
        await store.updateUserPoints(submission.user_id, newPoints);
      }
    }

    if (
      action === 'reject' &&
      submission.status === 'approved'
    ) {
      const task = await store.getTaskById(submission.task_id);
      const submitter = await store.getUserById(submission.user_id);

      if (task && submitter) {
        const newPoints = Math.max(
          0,
          submitter.points - task.points
        );

        await store.updateUserPoints(
          submission.user_id,
          newPoints
        );
      }
    }

    return NextResponse.json({
      submission: updated,
      message:
        action === 'approve'
          ? 'Submission approved and points awarded!'
          : 'Submission rejected.',
    });
  } catch (error) {
    console.error('Review submission error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}