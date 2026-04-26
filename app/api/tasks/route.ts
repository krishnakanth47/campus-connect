import { NextRequest, NextResponse } from 'next/server';
import store from '@/lib/store';
import { getUserFromRequest } from '@/lib/auth';

// GET all tasks
export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tasks = await store.getAllTasks();
    
    // For ambassadors, also include submission status
    if (user.role === 'ambassador') {
      const submissions = await store.getSubmissionsByUser(user.userId);
      const tasksWithStatus = tasks.map(task => {
        const submission = submissions.find(s => s.task_id === task.id);
        return {
          ...task,
          submission_status: submission?.status || null,
          submission_id: submission?.id || null,
        };
      });
      return NextResponse.json({ tasks: tasksWithStatus });
    }

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create task (admin only)
export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { title, description, points, deadline, required_keyword, proof_type } = await req.json();

    if (!title || !description || !points || !deadline || !proof_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const task = await store.createTask({
      title,
      description,
      points: parseInt(points),
      deadline,
      required_keyword: required_keyword || null,
      proof_type,
      created_by: user.userId,
      is_active: true,
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
