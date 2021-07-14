import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { useOpenNote } from '../Notes/Note'
import { ContextMenuTrigger } from 'react-contextmenu'
import { removeItem, updateItem } from '../Notes/store/Utils'
import { useHotKeys } from '../compUtils'

// Shared with the main folder tree
export const NOTE_CONTEXT_ACTION = {
    OPEN_NOTE: 'open-note',
    DELETE_NOTE: 'delete-note', 
    RENAME_NOTE: 'rename-note'
}

const File = ({ fileData, setParentFiles }) => {
    // ============================================= State Initialization =============================================
    const [fileName, setFileName] = useState(fileData.name)
    useEffect(() => setFileName(fileData.name), [fileData])
    
    const openNote = useOpenNote()                                                  // Use openNote context to open notes from component to the note viewer


    // ============================================= SHARED FUNCTIONS =============================================
    // Handling click events for notes
    const itemSelectClass = 'item-selected'
    const noteCont = useRef()
    const clickHandler = (e) => {
        console.log(noteCont)
        if (!e.ctrlKey) document.querySelectorAll(`.${itemSelectClass}`).forEach(folderEl => folderEl.classList.remove(itemSelectClass))
        noteCont.current.classList.toggle(itemSelectClass)
    }


    const filenameEl = useRef()
    const NoteRenameInput = useRef()
    const contextMenuHandler = (action, noteid) => {
        switch (action) {
            case NOTE_CONTEXT_ACTION.OPEN_NOTE:
                openNote(fileData._id, fileData.name)
                break;
            case NOTE_CONTEXT_ACTION.DELETE_NOTE:
                removeItem(fileData._id, fileData.type, fileData.parentFolder, setParentFiles)
                break;
            case NOTE_CONTEXT_ACTION.RENAME_NOTE:
                filenameEl.current.style.display = 'none'
                NoteRenameInput.current.style.display = 'block'
                NoteRenameInput.current.querySelector('input').value = fileName
                NoteRenameInput.current.querySelector('input').focus()
                break;
            default:
                console.error(`ERROR: ${action} is not a registred context menu handler action`)
        }
    }


    // ============================================= COMPONENT BASED FUNCTIONS =============================================
    // Handles note input form submission
    const onNoteInputSubmit = (e) => {
        e.preventDefault()

        // Hide input, show note name
        filenameEl.current.style.display = 'block'
        NoteRenameInput.current.style.display = 'none'

        // Update the database with the new name, re-render component then sync name changes with the tabs
        let newName = NoteRenameInput.current.querySelector('input').value
        updateItem({...fileData}, 'name', newName, setParentFiles)
    }

    // Removes Input component when unfocused
    const onRenameInputBlur = () => {
        filenameEl.current.style.display = 'block'
        NoteRenameInput.current.style.display = 'none'
    }


    // ============================================= KEYMAP SETUP =============================================
    const keyMap = {
        OPEN_NOTE: 'Ctrl+o',
        DELETE_NOTE: 'Delete',
        RENAME_NOTE: 'F2'
    }
    const handlers = {
        OPEN_NOTE: e => { if (e && document.getElementById(fileData._id).classList.contains(itemSelectClass)) contextMenuHandler(NOTE_CONTEXT_ACTION.OPEN_NOTE, fileData._id) },
        DELETE_NOTE: e => { if (e && document.getElementById(fileData._id).classList.contains(itemSelectClass)) contextMenuHandler(NOTE_CONTEXT_ACTION.DELETE_NOTE, fileData._id) },
        RENAME_NOTE: e => { if (e && document.getElementById(fileData._id).classList.contains(itemSelectClass)) contextMenuHandler(NOTE_CONTEXT_ACTION.RENAME_NOTE, fileData._id) }
    }
    // Add event listeners to document using custom made HotKeys hook
    useHotKeys(keyMap, handlers)                                                    // ISSUE: inefficent design due to repeated event listener assignment every re-render


    return (
        <ContextMenuTrigger id="note-context-menu" noteid={fileData._id} onClickHandler={contextMenuHandler} collect={(props) => {return props}}>
            <div ref={noteCont} id={fileData._id} className="File" onDoubleClick={() => openNote(fileData._id, fileData.name)} onClick={clickHandler} >
                <div ref={filenameEl} className="filename">{fileName}</div>

                <form className="folder-name-form" ref={NoteRenameInput} action="POST" onSubmit={onNoteInputSubmit}>
                        <input type="text" 
                               onKeyDown={e => e.code === 'Escape' && (onRenameInputBlur())}
                               onBlur={onRenameInputBlur} />
                </form>
            </div>
        </ContextMenuTrigger>
    )
}

export default File
