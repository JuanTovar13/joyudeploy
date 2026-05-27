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

  return <div>MiniJournal placeholder</div>
}

export default MiniJournal
