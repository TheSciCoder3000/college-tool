import React from 'react'
import NoteRow from './NoteRow'

import { useNote } from './NoteContext'
import { useState, useEffect } from 'react'

const NoteDoc = () => {
    let theNotes = useNote()
    console.log(theNotes)
    const [ChildNotes, setChildNotes] = useState(theNotes)
    useEffect(() => {
        setChildNotes(theNotes)
    }, [theNotes])
    return (
        <div className="doc-page">
            {theNotes.map((note, indx) => (
                <NoteRow key={note.id}
                        indx={indx}
                        noteData={note} />
            ))}
        </div>
    )
}

export default NoteDoc
