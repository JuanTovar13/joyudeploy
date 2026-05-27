import { useState, useEffect } from 'react'
import '../../styles/MiniJournal.css'

interface JournalNote {
  id: string
  text: string
  createdAt: string
}

const STORAGE_KEY = 'joyu_mini_journal'

const MiniJournal = () => {
  const [notes, setNotes] = useState<JournalNote[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as JournalNote[]) : []
    } catch {
      return []
    }
  })
  const [inputText, setInputText] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
  }, [notes])

  const handleAddNote = () => {
    if (inputText.trim() === '') return
    const newNote: JournalNote = {
      id: crypto.randomUUID(),
      text: inputText.trim().slice(0, 200),
      createdAt: new Date().toISOString(),
    }
    setNotes((prev) => [newNote, ...prev].slice(0, 5))
    setInputText('')
  }

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  return <div>MiniJournal placeholder</div>
}

export default MiniJournal
