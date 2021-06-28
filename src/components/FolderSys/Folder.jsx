import React from 'react'
import { useState, useMemo, useEffect, useRef } from 'react'
import File from './File'
import { isFolderOpen, setFolderOpen } from '../Notes/store'
import { ContextMenuTrigger } from 'react-contextmenu'

import ChevronRight from '../../assets/img/folder-right.svg'
import ChevronDown from '../../assets/img/folder-down.svg'

const fs = window.require('fs')
const pathModule = window.require('path')

export const CONTEXT_MENU_ACTIONS = {
    ADD_FILE: 'add-file',
    ADD_FOLDER: 'add-folder',
    RENAME:'rename',
    DELETE: 'delete'
}

const Folder = ({ folderData }) => {
    // Initialize states
    const [folderName, setFolderName] = useState(folderData.name)
    useEffect(() => setFolderName(folderData.name), [folderData.name])

    const path = folderData.path

    const [allowOpen, setAllowOpen] = useState(true)
    const [open, setOpen] = useState(isFolderOpen(path))
    const firstRender = useRef(true)
    useEffect(() => {
        if (!firstRender.current) setFolderOpen(path, open)
        else firstRender.current = false
    }, [open])
    const [fileSync, setFileSync] = useState(true)


    const files = useMemo(() => fs
        .readdirSync(path)
        .map(file => {
            const stat = fs.statSync(pathModule.join(path, file))

            return {
                name: file,
                type: stat.isFile() ? 'file' : 'folder',
                path: pathModule.join(path, file),
            }
        })
        .sort((a, b) => {
            if (a.type === b.type) {
              return a.name.localeCompare(b.name)
            }
            return a.type === 'folder' ? -1 : 1
        }), [fileSync, folderData])
    
    
    const folderCont = useRef()
    const folderClickHandler = (e) => {
        if (!allowOpen) return

        // if ctrl key is
        if (!e.ctrlKey) {
            document.querySelectorAll('.select-folder').forEach(folderEl => folderEl.classList.remove('select-folder'))     // unselect all folders
            setOpen(openState => !openState)                                                                                // open/close folders
        }

        folderCont.current.classList.toggle('select-folder')
    }

    // Handling context menu actions
    const folderRenameInput = useRef()
    const folderNameEl = useRef()
    const contextMenuHandler = (action, path) => {
        switch (action) {
            case CONTEXT_MENU_ACTIONS.ADD_FILE:
                console.log('create new file')
                break;
            case CONTEXT_MENU_ACTIONS.ADD_FOLDER:
                console.log('create new folder')
                break;
            case CONTEXT_MENU_ACTIONS.RENAME:
                setAllowOpen(state => !state)                                               // Prevent the folder from openning when input is clicked

                // Styling
                folderRenameInput.current.style.display = 'block'
                folderNameEl.current.style.display = 'none'

                folderRenameInput.current.querySelector('input').value = folderName         // Set the value of the input to the folder name
                folderRenameInput.current.querySelector('input').focus()                    // focus on the input
                break;
            case CONTEXT_MENU_ACTIONS.DELETE:
                // removes the directory
                fs.rmdirSync(path, { recursive: true })
                break;
        }
    }

    // Handler for onFolderInput submit
    const onFolderInputSubmit = (e) => {
        // Initialization
        e.preventDefault()
        let folderInputEl = folderRenameInput.current.querySelector('input')

        // styling
        folderInputEl.style.display = 'none'
        folderNameEl.current.style.display = 'block'
        folderNameEl.current.innerText = folderInputEl.value

        // rename directory
        let newPath = pathModule.join(pathModule.join(path, '..'), folderInputEl.value)
        fs.renameSync(path, newPath)
    }

    return (
        <div className="Folder">
            <ContextMenuTrigger id="folder-context-menu" path={path} onClickHandler={contextMenuHandler} collect={(props) => {return props}}>
                <div ref={folderCont} className="folder-cont"
                    onClick={folderClickHandler} >
                    <div className="folder-icon">
                        <img className="folder-img" src={open ? ChevronDown : ChevronRight} alt="folder-right" />
                    </div>
                    <div ref={folderNameEl} className="folder-name">{folderName}</div>
                    <form className="folder-name-form" ref={folderRenameInput} action="POST" onSubmit={onFolderInputSubmit}><input type="text" /></form>
                </div>
            </ContextMenuTrigger>
            {open && ( 
                <div className="folder-children">
                    {files && (
                        files.map((file) => {
                            if (file.type == 'folder') return (
                                <Folder key={`folder-${file.name}`} folderData={file} />
                            )
                            return (
                                <File key={`file-${file.name}`} fileData={file} />
                            )
                        })
                    )}
                </div>
            )}
        </div>
    )
}

export default Folder
