import React, { useState, useEffect, useRef, FormEvent } from 'react'
import { ContextMenuTrigger } from 'react-contextmenu'
import { removeItem } from '../Notes/store/Utils'
import { useHotKeys } from '../compUtils'
import { useDispatch } from 'react-redux'
import { AddTab, RemoveItem, UpdateFolderNoteItem } from '../../redux/ReduxActions'

interface FileProps {
    fileData: {
        _id: string
        name: string
        type: string
        parentFolder: string
    }
}

// Shared with the main folder tree
export const NOTE_CONTEXT_ACTION = {
    OPEN_NOTE: 'open-note',
    DELETE_NOTE: 'delete-note', 
    RENAME_NOTE: 'rename-note'
}

const File: React.FC<FileProps> = ({ fileData }) => {
    // ============================================= State Initialization =============================================
    const dispatch = useDispatch()
    const [fileName, setFileName] = useState(fileData.name)
    useEffect(() => setFileName(fileData.name), [fileData])
    
    const openNote = (noteId: string) => AddTab(dispatch, noteId)                                                  // Use openNote context to open notes from component to the note viewer


    // ============================================= SHARED FUNCTIONS =============================================
    // Handling click events for notes
    const itemSelectClass = 'item-selected'
    const noteCont = useRef<HTMLDivElement>(null)
    const clickHandler = (e: React.MouseEvent) => {
        console.log(noteCont)
        if (!e.ctrlKey) document.querySelectorAll(`.${itemSelectClass}`).forEach(folderEl => folderEl.classList.remove(itemSelectClass))
        noteCont.current?.classList.toggle(itemSelectClass)
    }


    const filenameEl = useRef<HTMLDivElement>(null)
    const NoteRenameInput = useRef<HTMLFormElement>(null)
    const contextMenuHandler = (action: Object, noteid: string) => {
        switch (action) {
            case NOTE_CONTEXT_ACTION.OPEN_NOTE:
                openNote(fileData._id)
                break;
            case NOTE_CONTEXT_ACTION.DELETE_NOTE:
                // removeItem(fileData._id, fileData.type, fileData.parentFolder)
                RemoveItem(dispatch, { itemId: fileData._id, type: fileData.type, parentId: fileData.parentFolder })
                break;
            case NOTE_CONTEXT_ACTION.RENAME_NOTE:
                if (!filenameEl.current || !NoteRenameInput.current) return
                filenameEl.current.style.display = 'none'
                NoteRenameInput.current.style.display = 'block'

                NoteRenameInput.current.querySelector('input')!.value = fileName
                NoteRenameInput.current.querySelector('input')?.focus()
                break;
            default:
                console.error(`ERROR: ${action} is not a registred context menu handler action`)
        }
    }


    // ============================================= COMPONENT BASED FUNCTIONS =============================================
    // Handles note input form submission
    const onNoteInputSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!filenameEl.current || !NoteRenameInput.current) return
        // Hide input, show note name
        filenameEl.current.style.display = 'block'
        NoteRenameInput.current.style.display = 'none'

        // Update the database with the new name, re-render component then sync name changes with the tabs
        let newName = NoteRenameInput.current.querySelector('input')!.value
        UpdateFolderNoteItem(dispatch, { id: fileData._id, property: 'name', newValue: newName })
    }

    // Removes Input component when unfocused
    const onRenameInputBlur = () => {
        if (!filenameEl.current || !NoteRenameInput.current) return
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
        OPEN_NOTE: (e: KeyboardEvent) => { if (e && document.getElementById(fileData._id)?.classList.contains(itemSelectClass)) contextMenuHandler(NOTE_CONTEXT_ACTION.OPEN_NOTE, fileData._id) },
        DELETE_NOTE: (e: KeyboardEvent) => { if (e && document.getElementById(fileData._id)?.classList.contains(itemSelectClass)) contextMenuHandler(NOTE_CONTEXT_ACTION.DELETE_NOTE, fileData._id) },
        RENAME_NOTE: (e: KeyboardEvent) => { if (e && document.getElementById(fileData._id)?.classList.contains(itemSelectClass)) contextMenuHandler(NOTE_CONTEXT_ACTION.RENAME_NOTE, fileData._id) }
    }
    // Add event listeners to document using custom made HotKeys hook
    useHotKeys(keyMap, handlers)                                                    // ISSUE: inefficent design due to repeated event listener assignment every re-render


    return (
        // @ts-ignore
        <ContextMenuTrigger id="note-context-menu" noteid={fileData._id} onClickHandler={contextMenuHandler} collect={(props) => {return props}}>
            <div ref={noteCont} id={fileData._id} className="File" onDoubleClick={() => openNote(fileData._id)} onClick={clickHandler} >
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
