import React from 'react'
import NoteRow from './NoteRow'

import { useNote } from './NoteContext'
// import { useState, useEffect } from 'react'

const NoteDoc = () => {
    let theNotes = useNote()
    return (
        <div className="doc-page" 
             data-testid="note-doc" >
            {theNotes.map((note, indx) => (
                <NoteRow key={note.id}
                        indx={indx}
                        noteData={note}
                        path={[indx]} />
            ))}
        </div>
    )
}

export default NoteDoc
