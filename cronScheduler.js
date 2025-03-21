/**
 * Cron job scheduler w/o Libraries
 * 
 * A modular, non-blocking cron scheduler that supports various time intervals
 */

// File: cronScheduler.js

const fs = require('fs');
const path = require('path');

class CronScheduler {
  constructor(options = {}) {
    this.tasks = new Map();
    this.taskCounter = 0;
    
    // Configuration
    this.logPath = options.logPath || path.join(process.cwd(), 'logs');
    this.logEnabled = options.logEnabled !== false;
    
    // Ensure log directory exists
    if (this.logEnabled && !fs.existsSync(this.logPath)) {
      fs.mkdirSync(this.logPath, { recursive: true });
    }
    
    this.log('CronScheduler initialized');
  }

  /**
   * Parameters specified
   * @param {Object} task - The task to be scheduled
   * @param {Function} task.execute - The function to execute
   * @param {string} task.name - Name of the task (optional)
   * @param {Object} frequency - The frequency configuration
   * @param {number} [frequency.minutes] - Run every X minutes
   * @param {number} [frequency.hours] - Run every X hours
   * @param {number} [frequency.days] - Run every X days
   * @param {boolean} [runImmediately=false] - Whether to run the task immediately
   * @returns {number} - Task ID that can be used to cancel the task
   */

  schedule(task, frequency, runImmediately = false) {
    if (!task || typeof task.execute !== 'function') {
      throw new Error('Task must have an execute method');
    }

    // Validate and normalize frequency
    const normalizedFrequency = this.normalizeFrequency(frequency);
    const intervalMs = normalizedFrequency.intervalMs;
    
    if (intervalMs <= 0) {
      throw new Error('Invalid frequency: interval must be greater than 0');
    }

    const taskId = ++this.taskCounter;
    const taskName = task.name || `task-${taskId}`;
    
    this.log(`Scheduling task: ${taskName} to run every ${normalizedFrequency.description}`);

    // Create the task object
    const scheduledTask = {
      id: taskId,
      name: taskName,
      task: task.execute,
      frequency: normalizedFrequency,
      intervalId: null,
      lastRun: null,
      nextRun: null,
      status: 'scheduled',
      runCount: 0,
      errorCount: 0
    };

    // Function to execute the task and handle errors
    const executeTask = async () => {
      try {
        scheduledTask.status = 'running';
        scheduledTask.lastRun = new Date();
        
        this.log(`Running task: ${taskName}`);
        
        // Execute the task non-blocking using Promise
        await Promise.resolve().then(() => task.execute());
        
        scheduledTask.runCount++;
        scheduledTask.status = 'idle';
        scheduledTask.nextRun = new Date(Date.now() + intervalMs);
        
        this.log(`Task ${taskName} completed successfully. Next run at: ${scheduledTask.nextRun}`);
      } catch (error) {
        scheduledTask.errorCount++;
        scheduledTask.status = 'error';
        scheduledTask.nextRun = new Date(Date.now() + intervalMs);
        
        this.log(`Error in task ${taskName}: ${error.message}`, 'error');
        console.error(`Error in scheduled task ${taskName}:`, error);
      }
    };

    // Schedule the task
    scheduledTask.intervalId = setInterval(executeTask, intervalMs);
    scheduledTask.nextRun = new Date(Date.now() + intervalMs);
    
    // Store the task
    this.tasks.set(taskId, scheduledTask);
    
    // Run immediately if requested
    if (runImmediately) {
      executeTask();
    }
    
    return taskId;
  }

  /**
   * Cancel a scheduled task
   * @param {number} taskId - The ID of the task to cancel
   * @returns {boolean} - Whether the task was successfully cancelled
   */
  cancel(taskId) {
    const task = this.tasks.get(taskId);
    
    if (!task) {
      this.log(`Attempted to cancel non-existent task ID: ${taskId}`, 'warn');
      return false;
    }
    
    clearInterval(task.intervalId);
    this.tasks.delete(taskId);
    this.log(`Task cancelled: ${task.name}`);
    
    return true;
  }

  /**
   * List all scheduled tasks
   * @returns {Array} - Array of task details
   */
  listTasks() {
    const taskList = [];
    
    for (const task of this.tasks.values()) {
      taskList.push({
        id: task.id,
        name: task.name,
        status: task.status,
        frequency: task.frequency.description,
        lastRun: task.lastRun,
        nextRun: task.nextRun,
        runCount: task.runCount,
        errorCount: task.errorCount
      });
    }
    
    return taskList;
  }

  /**
   * Validate and normalize frequency specification
   * @param {Object} frequency - The frequency configuration
   * @returns {Object} - Normalized frequency with intervalMs and description
   */
  normalizeFrequency(frequency) {
    if (!frequency || typeof frequency !== 'object') {
      throw new Error('Frequency must be an object');
    }

    const { minutes, hours, days } = frequency;
    
    // Calculate interval in milliseconds
    let intervalMs = 0;
    let description = '';
    
    if (typeof minutes === 'number' && minutes > 0) {
      intervalMs += minutes * 60 * 1000;
      description += `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    
    if (typeof hours === 'number' && hours > 0) {
      intervalMs += hours * 60 * 60 * 1000;
      description += description ? ' ' : '';
      description += `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    
    if (typeof days === 'number' && days > 0) {
      intervalMs += days * 24 * 60 * 60 * 1000;
      description += description ? ' ' : '';
      description += `${days} day${days !== 1 ? 's' : ''}`;
    }
    
    if (intervalMs === 0) {
      throw new Error('Frequency must specify at least one valid time unit (minutes, hours, or days)');
    }
    
    return { intervalMs, description };
  }

  /**
   * Log a message
   * @param {string} message - The message to log
   * @param {string} [level='info'] - Log level
   */
  log(message, level = 'info') {
    if (!this.logEnabled) return;
    
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
    
    // Console output
    if (level === 'error') {
      console.error(logEntry.trim());
    } else if (level === 'warn') {
      console.warn(logEntry.trim());
    } else {
      console.log(logEntry.trim());
    }
    
    // File logging
    try {
      const logFile = path.join(this.logPath, `cron-${new Date().toISOString().split('T')[0]}.log`);
      fs.appendFileSync(logFile, logEntry);
    } catch (error) {
      console.error(`Failed to write to log file: ${error.message}`);
    }
  }
  
  /**
   * Gracefully shutdown the scheduler
   */
  shutdown() {
    this.log('Shutting down CronScheduler');
    
    for (const [taskId, task] of this.tasks.entries()) {
      clearInterval(task.intervalId);
      this.log(`Cancelled task: ${task.name}`);
    }
    
    this.tasks.clear();
    this.log('All tasks cancelled, shutdown complete');
  }
}

module.exports = CronScheduler;