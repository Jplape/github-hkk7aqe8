import { http, HttpResponse } from 'msw';
import type { Task } from '../../types';

export const handlers = [
  http.post('/api/tasks', async ({ request }) => {
    const task = (await request.json()) as Task;
    return HttpResponse.json(
      { ...task, id: 'task-123' },
      { status: 201 }
    );
  }),

  http.get('/api/tasks', () => {
    return HttpResponse.json(
      [{ id: 'task-1', title: 'Test Task', completed: false }],
      { status: 200 }
    );
  }),

  http.put('/api/tasks/:id', async ({ params, request }) => {
    const task = (await request.json()) as Task;
    return HttpResponse.json(
      { ...task, id: params.id },
      { status: 200 }
    );
  }),

  http.delete('/api/tasks/:id', () => {
    return new HttpResponse(null, { status: 204 });
  })
];