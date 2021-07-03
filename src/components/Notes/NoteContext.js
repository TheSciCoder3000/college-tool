import React, { useReducer, useContext, useEffect, useState } from "react";
import produce, { original } from "immer";
import { getDocNotes } from "./NoteData";

// CONTEXTS
export const NoteContext = React.createContext()
const UpdateNoteContext = React.createContext()

// HOOKS
export function useNote() {
    return useContext(NoteContext)
}

export function useUpdateNote() {
    return useContext(UpdateNoteContext)
}

// REDUCER FUNCTION
export const NOTE_ACTION = {
    ADD_NOTE:'add-note',
    REMOVE_NOTE: 'remove-note',
    UPDATE_NOTE: 'update-note',
    MAKE_CHILD_NOTE: 'make-child-note',
    ARRANGE_NOTE: 'arrange-note',
    ROOT_UPDATE: 'root-update'
}
function reducer(note, action) {
    switch (action.type) {
        case NOTE_ACTION.ADD_NOTE:
            const noteCopy = produce(note, draft => {
                // Initialize variables
                let path = action.data.path
                let draftRef = draft

                // loop through the parents until reaching the desired note container
                for (let i = 0; i < action.data.path.length; i+=2) draftRef = draftRef[path[i]][path[i+1]]

                // insert note in the desired indx
                draftRef.splice(action.data.indx, 0, {
                    id: Math.random().toString(16).slice(-8),
                    content: '',
                    insideNote: null
                })
            })
            return noteCopy     // return the edited copy
        case NOTE_ACTION.REMOVE_NOTE:
            let noteCopy2 = produce(note, draft => {
                // Initialize Root variables
                let path = action.data.path
                let draftRef = draft
                let noteIndx = action.data.indx

                if (action.data.isFirstChild && !action.data.isLastChild) {
                    let NoteTextAppend = draft

                    // Assigning the note container and note parent
                    for (let i = 0; i < path.length; i+=2) {
                        if (i === path.length-2) NoteTextAppend = draftRef[path[i]]
                        draftRef = draftRef[path[i]][path[i+1]]
                    }

                    // add text to notetextappend.content
                    NoteTextAppend.content += draftRef[noteIndx].content
                    
                    // if draftRef insideNote exists replace draftRef by its children
                    if (draftRef[noteIndx].insideNote)  draftRef.splice(noteIndx, 1, ...draftRef[noteIndx].insideNote)
                    // else remove draftRef
                    else draftRef.splice(noteIndx, 1)

                } else if (action.data.isLastChild && path.length > 0) {
                    // Initialize variables
                    let insertPath = path.length === 0 ? [] : path.slice(0, -2)      // [noteIndx, 'insideNote']
                    let notePath = path.length === 0 ? [noteIndx] : path.slice(-2)

                    // loop through parents of insert path until reaching the desired note container
                    for (let i = 0; i < insertPath.length; i+=2) draftRef = draftRef[insertPath[i]][insertPath[i+1]]

                    // Initialize variable referencing to the note
                    let noteRef = draftRef[notePath[0]].insideNote

                    // Insert the note to the container
                    if (noteRef) draftRef.splice(path.slice(-2)[0]+1, 0, {...noteRef[noteIndx]})

                    // delete the note
                    noteRef.splice(noteIndx, 1)
                    draftRef[notePath[0]].insideNote = noteRef < 1 ? null : noteRef
                } else {
                    // Assigning the note container and note parent
                    for (let i = 0; i < path.length; i+=2) draftRef = draftRef[path[i]][path[i+1]]

                    // Retrieve the last child of previous note if it exist
                    let NoteTextAppend = draftRef[noteIndx-1]
                    let NoteTextAppendInside = NoteTextAppend.insideNote
                    while (NoteTextAppendInside) {
                        NoteTextAppend = [].slice.call(NoteTextAppend.insideNote).pop()
                        NoteTextAppendInside = NoteTextAppend.insideNote
                    }
                 
                    // add text to notetextappend.content
                    NoteTextAppend.content += draftRef[noteIndx].content

                    // if draftRef insideNote exists replace draftRef by its children
                    if (draftRef[noteIndx].insideNote) draftRef.splice(noteIndx, 1, ...draftRef[noteIndx].insideNote)
                    // else delete the note
                    else draftRef.splice(noteIndx, 1)

                }
                return draft

            })
            return noteCopy2
        case NOTE_ACTION.UPDATE_NOTE:
            return produce(note, draft => {
                // Initialize variables
                let path = action.data.path
                let draftRef = draft

                // loop through the parents until reaching the desired note container
                for (let i = 0; i < action.data.path.length; i+=2) 
                        draftRef = path[i+1]
                        ? draftRef[path[i]][path[i+1]]
                        : draftRef[path[i]]

                // Update content
                draftRef.content = action.data.newValue
            })
        case NOTE_ACTION.MAKE_CHILD_NOTE: 
            return produce(note, draft => {
                // let pathToNote, pathToPrevNote
                let contPath = action.data.contPath
                let noteIndx = action.data.indx
                let noteCont = draft

                // loop through path notes and assign the path to note and prevNote
                for (let i = 0; i < contPath.length; i+=2) {
                    noteCont = noteCont[contPath[i]][contPath[i+1]]
                }

                let prevNote = noteCont[noteIndx-1]
                let currNote = noteCont[noteIndx]

                // if prevNote.insideNote is null then assign [{...note}]
                if (!prevNote.insideNote) prevNote.insideNote = [{...currNote}]
                // else push {...note} to prevNote.insideNote
                else prevNote.insideNote.push({...currNote})

                // delete note
                noteCont.splice(noteIndx, 1)
            })
        case NOTE_ACTION.ARRANGE_NOTE:
            return produce(note, draft => {
                // Initialize variables
                let contPath = action.data.contPath
                let noteContPath = action.data.notePath.slice(0, -1)
                let noteIndx = action.data.notePath.slice(-1)[0]
                let insertIndx = action.data.insertIndx
                let noteData = action.data.noteData

                let noteRef = draft
                let contRef = draft

                noteContPath.forEach(location => {noteRef = noteRef[location]})
                contPath.forEach(location => {contRef = contRef[location]})

                noteRef.splice(noteIndx, 1)
                contRef.splice(insertIndx, 0, noteData)

            })
        case NOTE_ACTION.ROOT_UPDATE:
            return action.data.note
        default:
            console.log('ERROR: something went wrong in the reducer function')
            return note
    }
}

// Note Provider Component
export function NoteProvider({ noteID, notes, setUnsync, children, updateNoteFile }) {
    const [id, setId] = useState(noteID)
    useEffect(() => setId(noteID), [noteID])
    const [note, setNote] = useReducer(reducer, notes)
    useEffect(() => {
        if (id === noteID) {
            setUnsync({ state: notes !== note, data: note })
        }
    }, [notes, note])

    // Update note state when notes prop is different
    useEffect(() => {
        setNote({ type: NOTE_ACTION.ROOT_UPDATE, data: {note: notes} })
    }, [notes])

    // adding on key down event listeners for shortcuts
    document.onkeydown = (e) => {
        if (e.ctrlKey) {
            switch(e.keyCode) {
                case 83:
                    e.preventDefault()
                    updateNoteFile(id, note)
                    break;
                // case 113:
                //     e.preventDefault()
                //     console.log('renaming...')
                    
                //     break;
            }
        }
    }

    document.onclick = e => {
        let substrings = ['folder-cont', 'folder-img', 'folder-name', 'filename']
        if (!substrings.some(function(v) { return e.target.classList.value.indexOf(v) >= 0; })) 
            document.querySelectorAll('.item-selected').forEach(folder => folder.classList.remove('item-selected'))
    }
     

    return (
        <NoteContext.Provider value={note}>
            <UpdateNoteContext.Provider value={setNote}>
                {children}
            </UpdateNoteContext.Provider>
        </NoteContext.Provider>
    )
}