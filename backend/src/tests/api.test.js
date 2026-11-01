const request = require('supertest');
const app = require('../app');

describe('Health Check', () => {
  test('GET /api/health returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
  });
});

describe('Auth - Registration', () => {
  test('POST /api/auth/register returns 422 with missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/register returns 422 with invalid email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'not-an-email',
      password: 'password123',
    });
    expect(res.statusCode).toBe(422);
  });

  test('POST /api/auth/register returns 422 with short password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: '123',
    });
    expect(res.statusCode).toBe(422);
  });

  test('POST /api/auth/register creates an account in memory', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Signup Test',
      email: 'signup-test@example.com',
      password: 'test-password-123',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.user.email).toBe('signup-test@example.com');
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(res.body.data.token).toBeTruthy();
  });
});

describe('Auth - Login', () => {
  test('POST /api/auth/login validates input before account lookup', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'not-an-email',
      password: '',
    });
    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
  });
});

describe('Readiness', () => {
  test('GET /api/ready reports the API is ready', async () => {
    const res = await request(app).get('/api/ready');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('ready');
  });
});

describe('AI deterministic fallback', () => {
  test('provides bounded, reviewable suggestions without an AI credential', () => {
    const { getDeterministicFallback } = require('../services/aiService');
    const suggestion = getDeterministicFallback('Fix critical login failure');
    expect(suggestion.priority).toBe('urgent');
    expect(suggestion.suggestedDeadlineDays).toBe(1);
    expect(suggestion.source).toBe('fallback');
    expect(suggestion.disclaimer).toMatch(/recommendations|review/i);
  });
});

describe('Task search safety', () => {
  test('escapes regex operators so search input is treated literally', () => {
    const { escapeRegex } = require('../controllers/taskController');
    expect(escapeRegex('release.*(urgent)')).toBe('release\\.\\*\\(urgent\\)');
  });
});

describe('Tasks - Authentication Required', () => {
  test('GET /api/tasks returns 401 without token', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/tasks returns 401 without token', async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'Test Task' });
    expect(res.statusCode).toBe(401);
  });

  test('DELETE /api/tasks/invalid-id returns 401 without token', async () => {
    const res = await request(app).delete('/api/tasks/123');
    expect(res.statusCode).toBe(401);
  });
});

describe('Not Found Handler', () => {
  test('GET /api/nonexistent returns 404', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('In-memory task and project flow', () => {
  test('supports account, project, task, stats, and notification operations', async () => {
    const email = `memory-${Date.now()}@example.com`;
    const registration = await request(app).post('/api/auth/register').send({
      name: 'Memory User',
      email,
      password: 'memory-password-123',
    });
    expect(registration.statusCode).toBe(201);
    const token = registration.body.data.token;
    const auth = { Authorization: `Bearer ${token}` };

    const login = await request(app).post('/api/auth/login').send({
      email,
      password: 'memory-password-123',
    });
    expect(login.statusCode).toBe(200);
    expect(login.body.data.user.passwordHash).toBeUndefined();

    const preferences = await request(app)
      .patch('/api/auth/me')
      .set(auth)
      .send({ preferences: { theme: 'light' } });
    expect(preferences.statusCode).toBe(200);
    expect(preferences.body.data.user.preferences).toEqual({ theme: 'light', notifications: true });

    const invalidPreferences = await request(app)
      .patch('/api/auth/me')
      .set(auth)
      .send({ preferences: { theme: 'invalid' } });
    expect(invalidPreferences.statusCode).toBe(422);

    const projectResponse = await request(app)
      .post('/api/projects')
      .set(auth)
      .send({ name: 'In-memory project' });
    expect(projectResponse.statusCode).toBe(201);
    const projectId = projectResponse.body.data.project._id;

    const taskResponse = await request(app)
      .post('/api/tasks')
      .set(auth)
      .send({ title: 'In-memory task', project: projectId });
    expect(taskResponse.statusCode).toBe(201);
    const taskId = taskResponse.body.data.task._id;

    const listResponse = await request(app).get('/api/tasks').set(auth);
    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.body.data.tasks[0].project.name).toBe('In-memory project');

    const updateResponse = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set(auth)
      .send({ status: 'completed' });
    expect(updateResponse.statusCode).toBe(200);

    const statsResponse = await request(app).get('/api/tasks/stats').set(auth);
    expect(statsResponse.body.data).toMatchObject({ total: 1, completed: 1, completionRate: 100 });

    await new Promise((resolve) => setTimeout(resolve, 20));
    const notificationResponse = await request(app).get('/api/notifications').set(auth);
    expect(notificationResponse.statusCode).toBe(200);
    expect(notificationResponse.body.data.notifications.length).toBeGreaterThan(0);

    const deleteProjectResponse = await request(app)
      .delete(`/api/projects/${projectId}`)
      .set(auth);
    expect(deleteProjectResponse.statusCode).toBe(200);
    const taskAfterProjectDelete = await request(app).get(`/api/tasks/${taskId}`).set(auth);
    expect(taskAfterProjectDelete.body.data.task.project).toBeNull();
  });
});

/**
 * DEMONSTRATION: Deliberately broken test
 * 
 * To demonstrate a failing CI run (Week 12 requirement):
 * 1. Create a branch: git checkout -b demo/failing-test
 * 2. Change the assertion below from 200 to 999 (wrong expected value)
 * 3. Push — GitHub Actions will show a red failing run
 * 4. Fix it back to 200 and push again — green passing run
 * 
 * This broken test is currently COMMENTED OUT to avoid breaking main branch.
 */
// test('DELIBERATELY BROKEN - wrong status code assertion', async () => {
//   const res = await request(app).get('/api/health');
//   expect(res.statusCode).toBe(999); // Wrong! Should be 200
// });
