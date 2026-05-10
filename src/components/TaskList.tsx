// Supabase table required: study_tasks
// Schema: id (uuid pk), title (text), completed (bool),
// estimated_pomodoros (int), completed_pomodoros (int default 0),
// created_at (timestamptz), user_id (text)

import '../styles/TaskList.css'
import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import type { Task } from '../types'

/**
 * TaskList - manages study tasks with full CRUD via Supabase
 * Uses optimistic updates for instant UI feedback before server confirmation
 * Wrapped in React.memo to avoid re-renders caused by the Pomodoro timer ticking
 */
// React.memo: task list only re-renders when tasks change,
// not when the timer ticks every second
const TaskList = React.memo(function TaskList() {
  const context = useContext(AuthContext)
  const user = context?.user

  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskPomodoros, setNewTaskPomodoros] = useState(1)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      const { data, error } = await supabase
        .from('study_tasks')
        .select('*')
        .eq('user_id', user?.uid)
        .order('created_at', { ascending: false })
      if (error) setError('Could not load tasks. Please try again.')
      if (data) setTasks(data as Task[])
      setLoading(false)
    })()
  }, [user?.uid])

  async function handleAddTask() {
    if (newTaskTitle.trim() === '') return
    const { data, error } = await supabase
      .from('study_tasks')
      .insert([
        {
          title: newTaskTitle.trim(),
          completed: false,
          estimated_pomodoros: newTaskPomodoros,
          completed_pomodoros: 0,
          created_at: new Date().toISOString(),
          user_id: user?.uid,
        },
      ])
      .select()
      .single()
    if (data) {
      setTasks((prev) => [data as Task, ...prev])
      setNewTaskTitle('')
    }
    if (error) setError('Could not add task.')
  }

  async function handleToggleComplete(taskId: string, currentStatus: boolean) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, completed: !currentStatus } : t,
      ),
    )
    await supabase
      .from('study_tasks')
      .update({ completed: !currentStatus })
      .eq('id', taskId)
  }

  async function handleDeleteTask(taskId: string) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    await supabase.from('study_tasks').delete().eq('id', taskId)
  }

  return (
    <div className="tasklist-container">
      <h2 className="tasklist-title">Study Tasks</h2>

      {loading ? (
        <p className="tasklist-empty">Loading tasks...</p>
      ) : null}

      {error ? (
        <p className="tasklist-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="tasklist-form">
        <input
          className="tasklist-input"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void handleAddTask()
          }}
          placeholder="Add a study task..."
          aria-label="New task title"
        />
        <input
          className="tasklist-input-number"
          type="number"
          min={1}
          max={10}
          value={newTaskPomodoros}
          onChange={(e) => setNewTaskPomodoros(Number(e.target.value))}
          aria-label="Estimated pomodoros"
        />
        <button
          className="tasklist-btn-add"
          type="button"
          onClick={() => void handleAddTask()}
          aria-label="Add task"
        >
          Add
        </button>
      </div>

      <ul className="tasklist-list" role="list">
        {tasks.map((task) => (
          <li key={task.id} className="tasklist-item" role="listitem">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => void handleToggleComplete(task.id, task.completed)}
              aria-label={`Mark ${task.title} as complete`}
            />
            <span
              className={`tasklist-item-title${task.completed ? ' completed' : ''}`}
            >
              {task.title}
            </span>
            <span
              className="tasklist-item-pomodoros"
              aria-label={`${task.completed_pomodoros} of ${task.estimated_pomodoros} pomodoros`}
            >
              {task.completed_pomodoros}/{task.estimated_pomodoros}
            </span>
            <button
              className="tasklist-btn-delete"
              type="button"
              onClick={() => void handleDeleteTask(task.id)}
              aria-label={`Delete task ${task.title}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
})

export default TaskList
