const { randomBytes } = require('crypto');

const users = new Map();
const tasks = new Map();
const projects = new Map();
const notifications = new Map();

const createRecord = (collection, values) => {
  const now = new Date();
  const record = {
    ...values,
    _id: randomBytes(12).toString('hex'),
    createdAt: now,
    updatedAt: now,
  };
  collection.set(record._id, record);
  return record;
};

const updateRecord = (collection, id, updates) => {
  const record = collection.get(id);
  if (!record) return null;
  Object.assign(record, updates, { updatedAt: new Date() });
  return record;
};

const createUser = (values) => createRecord(users, values);
const findUserByEmail = (email) => [...users.values()].find((user) => user.email === email) || null;
const findUserById = (id) => users.get(id) || null;
const updateUser = (id, updates) => updateRecord(users, id, updates);

const createProject = (values) => createRecord(projects, values);
const findProjectById = (id) => projects.get(id) || null;
const findProjectsByOwner = (owner) =>
  [...projects.values()].filter((project) => project.owner === owner);
const updateProject = (id, updates) => updateRecord(projects, id, updates);
const deleteProject = (id) => projects.delete(id);

const createTask = (values) => createRecord(tasks, values);
const findTaskById = (id) => tasks.get(id) || null;
const findTasks = (predicate = () => true) => [...tasks.values()].filter(predicate);
const updateTask = (id, updates) => updateRecord(tasks, id, updates);
const deleteTask = (id) => tasks.delete(id);
const unlinkProjectTasks = (projectId, owner) => {
  for (const task of tasks.values()) {
    if (task.project === projectId && task.createdBy === owner) {
      updateRecord(tasks, task._id, { project: null });
    }
  }
};

const createNotification = (values) => createRecord(notifications, values);
const findNotifications = (predicate = () => true) =>
  [...notifications.values()].filter(predicate);
const markNotificationsRead = (recipient, ids) => {
  for (const notification of notifications.values()) {
    if (notification.recipient === recipient && (!ids || ids.has(notification._id))) {
      notification.read = true;
      notification.updatedAt = new Date();
    }
  }
};

const clearMemoryStore = () => {
  users.clear();
  tasks.clear();
  projects.clear();
  notifications.clear();
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  createProject,
  findProjectById,
  findProjectsByOwner,
  updateProject,
  deleteProject,
  createTask,
  findTaskById,
  findTasks,
  updateTask,
  deleteTask,
  unlinkProjectTasks,
  createNotification,
  findNotifications,
  markNotificationsRead,
  clearMemoryStore,
};
