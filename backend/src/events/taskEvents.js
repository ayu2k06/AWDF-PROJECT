const { EventEmitter } = require('events');
const { createNotification, findUserById } = require('../services/memoryStore');

class TaskEventEmitter extends EventEmitter {}
const taskEvents = new TaskEventEmitter();

// Set max listeners to avoid warnings
taskEvents.setMaxListeners(20);

const notificationsEnabled = async (recipientId) => {
  const recipient = findUserById(recipientId);
  return recipient?.preferences?.notifications !== false;
};

// ===========================================================
// LISTENER: task-created
// This executes asynchronously AFTER the HTTP response is sent
// ===========================================================
taskEvents.on('task-created', async (data) => {
  const listenerStart = Date.now();
  console.log(`\n📬 [EventEmitter] task-created listener fired at ${new Date().toISOString()}`);
  console.log(`   API responded at: ${data.apiResponseTime}`);
  console.log(`   Listener started at: ${new Date(listenerStart).toISOString()}`);
  console.log(`   Task: "${data.task.title}" | User: ${data.userId}`);

  try {
    const recipientId = data.task.assignedTo || data.userId;
    if (!(await notificationsEnabled(recipientId))) return;
    const notification = createNotification({
      eventType: 'task-created',
      message: `Task "${data.task.title}" was created`,
      task: data.task._id,
      recipient: recipientId,
      metadata: {
        taskTitle: data.task.title,
        assignedTo: data.task.assignedTo || null,
        priority: data.task.priority,
        status: data.task.status,
        apiResponseTime: data.apiResponseTime,
        listenerExecutionTime: new Date(listenerStart).toISOString(),
        timingDifferenceMs: listenerStart - new Date(data.apiResponseTime).getTime(),
      },
    });
    console.log(`✅ [EventEmitter] Notification created (id: ${notification._id})`);
  } catch (err) {
    console.error(`❌ [EventEmitter] Failed to create notification: ${err.message}`);
  }
});

// LISTENER: task-updated
taskEvents.on('task-updated', async (data) => {
  console.log(`\n📬 [EventEmitter] task-updated listener fired at ${new Date().toISOString()}`);
  try {
    if (!(await notificationsEnabled(data.userId))) return;
    createNotification({
      eventType: 'task-updated',
      message: `Task "${data.task.title}" was updated`,
      task: data.task._id,
      recipient: data.userId,
      metadata: { changes: data.changes },
    });
  } catch (err) {
    console.error(`❌ [EventEmitter] task-updated notification failed: ${err.message}`);
  }
});

// LISTENER: task-completed
taskEvents.on('task-completed', async (data) => {
  console.log(`\n🎉 [EventEmitter] task-completed listener fired at ${new Date().toISOString()}`);
  try {
    if (!(await notificationsEnabled(data.userId))) return;
    createNotification({
      eventType: 'task-completed',
      message: `Task "${data.task.title}" was marked as completed! 🎉`,
      task: data.task._id,
      recipient: data.userId,
      metadata: { completedAt: new Date().toISOString() },
    });
  } catch (err) {
    console.error(`❌ [EventEmitter] task-completed notification failed: ${err.message}`);
  }
});

// LISTENER: task-deleted
taskEvents.on('task-deleted', async (data) => {
  console.log(`\n🗑️ [EventEmitter] task-deleted listener fired at ${new Date().toISOString()}`);
  try {
    if (!(await notificationsEnabled(data.userId))) return;
    createNotification({
      eventType: 'task-deleted',
      message: `Task "${data.taskTitle}" was deleted`,
      task: null,
      recipient: data.userId,
      metadata: { deletedTaskTitle: data.taskTitle },
    });
  } catch (err) {
    console.error(`❌ [EventEmitter] task-deleted notification failed: ${err.message}`);
  }
});

// Handle emitter errors to prevent process crashes
taskEvents.on('error', (err) => {
  console.error('[EventEmitter] Uncaught emitter error:', err.message);
});

module.exports = taskEvents;
