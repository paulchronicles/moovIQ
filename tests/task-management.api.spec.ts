import { APIRequestContext, expect, test } from '@playwright/test';

/**
 * TASK-103/TASK-104 automation sketch, API-level.
 *
 * Written against the GET /tasks endpoint documented in the assessment's API
 * reference appendix. That doc has no `search`/`q` parameter despite TASK-103
 * requiring a search box, so the search-specific case is left as `fixme`
 * pending clarification of whether search is server-side or client-side.
 */

type TaskStatus = 'To Do' | 'In Progress' | 'Done';
type TaskPriority = 'Low' | 'Medium' | 'High';

type Task = {
  id?: string | number;
  title?: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
};

const apiBaseUrl = process.env.API_BASE_URL;
const statuses: TaskStatus[] = ['To Do', 'In Progress', 'Done'];
const priorities: TaskPriority[] = ['Low', 'Medium', 'High'];
const priorityRank: Record<TaskPriority, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

async function listTasks(request: APIRequestContext, params: Record<string, string> = {}) {
  const response = await request.get(`${apiBaseUrl}/tasks`, { params });
  expect(response.ok(), `GET /tasks with ${JSON.stringify(params)} should succeed`).toBe(true);

  const body = await response.json();
  expect(Array.isArray(body), 'GET /tasks should return an array').toBe(true);

  return body as Task[];
}

function hasTask(tasks: Task[], predicate: (task: Task) => boolean) {
  return tasks.some(predicate);
}

test.describe('TASK-103: Filter and search (API)', () => {
  test.skip(
    !apiBaseUrl,
    'Set API_BASE_URL to run this illustrative suite against a real Task Management API.',
  );

  test('GET /tasks?status=To Do returns only To Do tasks', async ({ request }) => {
    const allTasks = await listTasks(request);
    test.skip(!hasTask(allTasks, (task) => task.status === 'To Do'), 'Seed data must include a To Do task.');

    const tasks = await listTasks(request, { status: 'To Do' });

    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks.every((task) => task.status === 'To Do')).toBe(true);
  });

  test('GET /tasks?priority=High returns only High priority tasks', async ({ request }) => {
    const allTasks = await listTasks(request);
    test.skip(!hasTask(allTasks, (task) => task.priority === 'High'), 'Seed data must include a High priority task.');

    const tasks = await listTasks(request, { priority: 'High' });

    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks.every((task) => task.priority === 'High')).toBe(true);
  });

  test('combined status + priority filter returns the intersection', async ({ request }) => {
    const allTasks = await listTasks(request);
    const target = allTasks.find((task) => task.status === 'In Progress' && task.priority === 'Medium');

    test.skip(
      !target,
      'Seed data must include at least one In Progress/Medium task for this combination check.',
    );
    if (!target) {
      return;
    }

    const tasks = await listTasks(request, { status: target.status, priority: target.priority });

    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks.every((task) => task.status === target.status && task.priority === target.priority)).toBe(true);
  });

  test('a filter combination with no matches returns an empty list, not an error', async ({ request }) => {
    const allTasks = await listTasks(request);
    const noMatchCombination = statuses
      .flatMap((status) => priorities.map((priority) => ({ status, priority })))
      .find(
        ({ status, priority }) =>
          !hasTask(allTasks, (task) => task.status === status && task.priority === priority),
      );

    test.skip(
      !noMatchCombination,
      'Seed data has at least one task for every status/priority pair, so there is no no-match combination.',
    );
    if (!noMatchCombination) {
      return;
    }

    const tasks = await listTasks(request, {
      status: noMatchCombination.status,
      priority: noMatchCombination.priority,
    });

    expect(tasks).toEqual([]);
  });

  test.fixme(
    'search returns tasks matching a title substring, pending clarification: no `search`/`q` param is documented on GET /tasks.',
    async () => {},
  );
});

test.describe('TASK-104: Sort tasks (API, bonus)', () => {
  test.skip(
    !apiBaseUrl,
    'Set API_BASE_URL to run this illustrative suite against a real Task Management API.',
  );

  test('sortBy=dueDate returns dated tasks in ascending due-date order', async ({ request }) => {
    const tasks = await listTasks(request, { sortBy: 'dueDate' });
    const timestamps = tasks
      .filter((task) => task.dueDate)
      .map((task) => Date.parse(task.dueDate as string));

    test.skip(timestamps.length < 2, 'Seed data must include at least two dated tasks.');

    expect(timestamps.every((timestamp) => Number.isFinite(timestamp))).toBe(true);
    expect(timestamps).toEqual([...timestamps].sort((a, b) => a - b));
  });

  test('sortBy=priority orders by urgency, not alphabetically', async ({ request }) => {
    const tasks = await listTasks(request, { sortBy: 'priority' });
    const ranks = tasks.map((task) => priorityRank[task.priority]);

    test.skip(new Set(ranks).size < 2, 'Seed data must include at least two priority levels.');

    expect(ranks.every((rank) => Number.isFinite(rank))).toBe(true);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });
});
