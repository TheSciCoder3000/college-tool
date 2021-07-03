import React, { useCallback } from 'react'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useOpenNote, useRemovedFiles, useRenamedFile } from '../Notes/Note'
import { ContextMenuTrigger } from 'react-contextmenu'
import { removeItem, updateItem } from '../Notes/store/Utils'
import { useHotKeys } from '../compUtils'

export const NOTE_CONTEXT_ACTION = {
    OPEN_NOTE: 'open-note',
    DELETE_NOTE: 'delete-note', 
    RENAME_NOTE: 'rename-note'
}

const File = ({ fileData, setParentFiles }) => {
    // initialize states
    const [fileName, setFileName] = useState(fileData.name)
    useEffect(() => setFileName(fileData.name), [fileData])
    
    const openNote = useOpenNote()

    const dbClick = (e) => {
        openNote(fileData._id, fileData.name)
    }

    // Handling click events for notes
    const itemSelectClass = 'item-selected'
    const noteCont = useRef()
    const clickHandler = (e) => {
        console.log(noteCont)
        if (!e.ctrlKey) document.querySelectorAll(`.${itemSelectClass}`).forEach(folderEl => folderEl.classList.remove(itemSelectClass))
        noteCont.current.classList.toggle(itemSelectClass)
    }


    const filenameEl = useRef()
    const folderRenameInput = useRef()
    const checkRemovedFiles = useRemovedFiles()
    const checkRenamedFile = useRenamedFile()
    const contextMenuHandler = (action, noteid) => {
        switch (action) {
            case NOTE_CONTEXT_ACTION.OPEN_NOTE:
                openNote(fileData._id, fileData.name)
                break;
            case NOTE_CONTEXT_ACTION.DELETE_NOTE:
                removeItem(fileData._id, fileData.type, fileData.parentFolder, setParentFiles).then(checkRemovedFiles)
                break;
            case NOTE_CONTEXT_ACTION.RENAME_NOTE:
                filenameEl.current.style.display = 'none'
                folderRenameInput.current.style.display = 'block'
                folderRenameInput.current.querySelector('input').value = fileName
                folderRenameInput.current.querySelector('input').focus()
                break;
        }
    }

    const onFolderInputSubmit = (e) => {
        e.preventDefault()

        filenameEl.current.style.display = 'block'
        folderRenameInput.current.style.display = 'none'

        let newName = folderRenameInput.current.querySelector('input').value
        updateItem({...fileData}, 'name', newName, setParentFiles).then(() => checkRenamedFile({id: fileData._id, name: newName }))
    }

    const onRenameInputBlur = () => {
        filenameEl.current.style.display = 'block'
        folderRenameInput.current.style.display = 'none'
    }

    // Note HotKeys 
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
    useHotKeys(keyMap, handlers)


    return (
        <ContextMenuTrigger id="note-context-menu" noteid={fileData._id} onClickHandler={contextMenuHandler} collect={(props) => {return props}}>
            <div ref={noteCont} id={fileData._id} className="File" onDoubleClick={dbClick} onClick={clickHandler} >
                <div ref={filenameEl} className="filename">{fileName}</div>
                <form className="folder-name-form" ref={folderRenameInput} action="POST" onSubmit={onFolderInputSubmit}>
                        <input type="text" 
                               onBlur={onRenameInputBlur} />
                </form>
            </div>
        </ContextMenuTrigger>
    )
}

export default File
