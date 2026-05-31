import '../../styles/TaskList.css'
import React, { useContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AuthContext } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import type { RootState, AppDispatch } from '../../store'
import { setActiveTask, clearActiveTask, setTasks, resetConcentration } from '../../store/slices/studyPlannerSlice'
import type { Task } from '../../types'

/**
 * TaskList - maneja tareas de estudio con Supabase
 * Usa actualizaciones instantáneas para mejorar la experiencia
 * React.memo evita renderizados innecesarios
 */

interface TaskListProps {
  onStartPomodoro?: () => void
}

const TaskList = React.memo(({ onStartPomodoro }: TaskListProps) => {
  const context = useContext(AuthContext)
  const user = context?.user

  const dispatch = useDispatch<AppDispatch>()
  const activeTaskId = useSelector((state: RootState) => state.studyPlanner.activeTaskId)

  const [tasks, setLocalTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskPomodoros, setNewTaskPomodoros] = useState(1)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.uid) return

    // Initial fetch llama tabla de tasks
    void (async () => {
      const { data, error } = await supabase
        .from('study_tasks')
        .select('*')
        .eq('user_id', user.uid)
        .order('created_at', { ascending: false })
      if (error) setError('Could not load tasks. Please try again.')
      if (data) {
        setLocalTasks(data as Task[])
        dispatch(setTasks(data as Task[]))
      }
      setLoading(false)
    })()

    const channel = supabase
      .channel(`study_tasks_${user.uid}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_tasks',
          filter: `user_id=eq.${user.uid}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setLocalTasks((prev) => {
              const alreadyExists = prev.some((t) => t.id === (payload.new as Task).id)
              if (alreadyExists) return prev
              return [payload.new as Task, ...prev]
            })
          }
          if (payload.eventType === 'UPDATE') {
            setLocalTasks((prev) =>
              prev.map((t) =>
                t.id === (payload.new as Task).id ? (payload.new as Task) : t
              )
            )
          }
          if (payload.eventType === 'DELETE') {
            setLocalTasks((prev) => prev.filter((t) => t.id !== (payload.old as Task).id))
          }
        }
      )
      .subscribe()

    // Cleanup: remove channel when component unmounts or user changes
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [user?.uid])

  useEffect(() => {
    dispatch(setTasks(tasks))
  }, [tasks, dispatch])

  const handleAddTask = async () => {
    if (newTaskTitle.trim() === '') return
    const { error } = await supabase
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
    if (error) {
      setError('Could not add task.')
    } else {
      setNewTaskTitle('')
      dispatch(resetConcentration())
    }
  }

  const handleToggleComplete = async (task: Task) => {
    if (task.completed) {
      // Uncheck: reset progress entirely
      setLocalTasks(prev =>
        prev.map(t => t.id === task.id ? { ...t, completed: false, completed_pomodoros: 0 } : t)
      )
      await supabase
        .from('study_tasks')
        .update({ completed: false, completed_pomodoros: 0 })
        .eq('id', task.id)
    } else {
      // Check: increment by 1; mark done only when it reaches the goal
      const newCount    = task.completed_pomodoros + 1
      const willFinish  = newCount >= task.estimated_pomodoros
      setLocalTasks(prev =>
        prev.map(t => t.id === task.id
          ? { ...t, completed: willFinish, completed_pomodoros: newCount }
          : t
        )
      )
      await supabase
        .from('study_tasks')
        .update({ completed: willFinish, completed_pomodoros: newCount })
        .eq('id', task.id)
      if (willFinish && task.id === activeTaskId) dispatch(clearActiveTask())
    }
    dispatch(resetConcentration())
  }

  const handleDeleteTask = async (taskId: string) => {
    if (taskId === activeTaskId) {
      dispatch(clearActiveTask())
    }
    dispatch(resetConcentration())
    setLocalTasks((prev) => prev.filter((t) => t.id !== taskId))
    await supabase.from('study_tasks').delete().eq('id', taskId)
  }

  return (
    <div className="tasklist-container">
      <h2 className="tasklist-title">Study Tasks</h2>
      <p className="tasklist-subtitle">Add all the tasks you're planning to do today</p>

      {loading ? <p className="tasklist-empty">Loading tasks...</p> : null}

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
              onChange={() => void handleToggleComplete(task)}
              aria-label={`Mark ${task.title} as complete`}
            />
            <span className={`tasklist-item-title${task.completed ? ' completed' : ''}`}>
              {task.title}
            </span>
            <button
              className={`tasklist-btn-start${task.id === activeTaskId ? ' active' : ''}`}
              type="button"
              onClick={() => {
                if (task.id === activeTaskId) {
                  dispatch(clearActiveTask())
                } else {
                  dispatch(setActiveTask({ id: task.id, title: task.title }))
                  if (onStartPomodoro) onStartPomodoro()
                }
              }}
              aria-label={
                task.id === activeTaskId
                  ? 'Stop working on this task'
                  : `Start working on ${task.title}`
              }
            >
              {task.id === activeTaskId ? 'Working' : 'Start'}
            </button>
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
