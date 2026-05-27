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

  return (
    <div className="minijournal-container">
      <h2 className="minijournal-title">My Notes 📝</h2>
      <div className="minijournal-form">
        <textarea
          className="minijournal-textarea"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddNote() } }}
          placeholder="Write a note..."
          maxLength={200}
          aria-label="Write a new note"
          rows={3}
        />
        <button
          type="button"
          className="minijournal-btn-add"
          onClick={handleAddNote}
          aria-label="Add note"
        >
          Add
        </button>
      </div>
      {notes.length === 0 ? (
        <p className="minijournal-empty">No notes yet. Start writing! ✨</p>
      ) : (
        <ul className="minijournal-list" role="list">
          {notes.map((note) => (
            <li key={note.id} className="minijournal-item" role="listitem">
              <span className="minijournal-item-text">{note.text}</span>
              <button
                type="button"
                className="minijournal-btn-delete"
                onClick={() => handleDeleteNote(note.id)}
                aria-label="Delete note"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default MiniJournal
