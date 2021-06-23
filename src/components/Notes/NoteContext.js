import React, { useReducer, useContext } from "react";
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
    MAKE_CHILD_NOTE: 'make-child-note'
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
        default:
            console.log('ERROR: something went wrong in the reducer function')
            return note
    }
}

// Note Provider Component
export function NoteProvider({ children }) {
    const [note, setNote] = useReducer(reducer, getDocNotes())

    function setMidNote(action) {
        setNote(action)
    }

    return (
        <NoteContext.Provider value={note}>
            <UpdateNoteContext.Provider value={setMidNote}>
                {children}
            </UpdateNoteContext.Provider>
        </NoteContext.Provider>
    )
}