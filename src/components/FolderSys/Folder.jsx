import React, { useState, useMemo, useEffect, useRef, memo, useCallback } from 'react'
import File from './File'
import { ContextMenuTrigger } from 'react-contextmenu'
import { useHotKeys } from '../compUtils'

import ChevronRight from '../../assets/img/folder-right.svg'
import ChevronDown from '../../assets/img/folder-down.svg'
import { addItem, viewDB, findFolderFiles, removeItem, updateItem } from '../Notes/store/Utils'
import ProxyItem from './ProxyItem';
import { useDisplayFolders } from './FolderSystem'
import { useRemovedFiles } from '../Notes/Note'


// Shared with the main folder system component
export const CONTEXT_MENU_ACTIONS = {
    ADD_FILE: 'add-file',
    ADD_FOLDER: 'add-folder',
    RENAME:'rename',
    DELETE: 'delete'
}


const Folder = ({ folderData, setParentFiles }) => {
    // ============================================= State Initialization =============================================
    const [folderName, setFolderName] = useState(folderData.name)
    useEffect(() => setFolderName(folderData.name), [folderData.name])

    const [open, setOpen] = useState(folderData.open)
    useEffect(() => updateItem({...folderData}, 'open', open), [open])

    const setDisplayFolder = useDisplayFolders()                                        // Used to update the openned folders obj of the main folder comp
    const [files, setFiles] = useState()
    useEffect(() => {
        if (!files) findFolderFiles(folderData._id, setFiles)                           // On render, fetch data files from database
        else setDisplayFolder(folders => {                                              // Once data retrieved, update opnned folders state
                if (Object.keys(folders).includes(folderData._id)) {
                    let foldersCopy = {...folders}
                    foldersCopy[folderData._id] = true
                    return foldersCopy
                } else return folders
            })
    }, [files])
    

    // ============================================= SHARED FUNCTIONS =============================================
    // Handling context menu actions
    const [allowOpen, setAllowOpen] = useState(true)                        // Used to prevent the folder from openning when the input is clicked
    const [proxyInput, setProxyInput] = useState(false)                     // Used to render/unmount the proxyInput for folder/note creation
    const folderRenameInput = useRef()                                      // Ref to the input field used in renaming a folder
    const folderNameEl = useRef()                                           // Ref to the element that contains the name of the folder
    const folderChildrenEl = useRef()                                       // Ref to the element that contains the child folders/notes
    const createItem = useRef()                                             // Holds ref to type of item being created
    const checkRemovedFiles = useRemovedFiles()                             // Used context to sync deletion of files with the tabs

    const contextMenuHandler = (action, noteid) => {
        switch (action) {
            case CONTEXT_MENU_ACTIONS.ADD_FILE:
                setOpen(true)
                setProxyInput(true)
                createItem.current = 'note'
                break;
            case CONTEXT_MENU_ACTIONS.ADD_FOLDER:
                setOpen(true)
                setProxyInput(true)
                createItem.current = 'folder'
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
                // removes the folder/note
                removeItem(folderData._id, folderData.type, folderData.parentFolder, setParentFiles).then(checkRemovedFiles)
                break;
            case 'view-db':
                viewDB()
                break;
        }
    }


    // ============================================= COMPONENT BASED FUNCTIONS =============================================
    // Handling click events on a folder
    const itemSelectClass = 'item-selected'
    const folderCont = useRef()                                             // Ref to the Main Folder container
    const folderClickHandler = (e) => {
        if (!allowOpen) return                                              // Makes sure folder does not open/close when renaming

        // if ctrl key is not pressed
        if (!e.ctrlKey) {
            document.querySelectorAll(`.${itemSelectClass}`).forEach(folderEl => folderEl.classList.remove(itemSelectClass))     // unselect all folders
            setOpen(openState => !openState)                                                                                     // open/close folders
        }

        folderCont.current.classList.toggle(itemSelectClass)
    }
    
    // Handler for creating folders/notes on submit
    const onSubmitCreation = (e) => {
        e.preventDefault()

        let proxyFolder = document.getElementById('proxy-folder-creation')
        let itemName = proxyFolder.querySelector('input').value
        if (itemName === '' || !itemName) return
        setProxyInput(false)

        // add an item to the database
        addItem(folderData._id, createItem.current, itemName,  setFiles)
    }

    // Handler for onFolderInput submit
    const onFolderInputSubmit = (e) => {
        // Initialization
        e.preventDefault()
        let folderInputEl = folderRenameInput.current.querySelector('input')
        if (folderInputEl.value === '' || !folderInputEl.value) return console.error('INVALID FOLDER NAME')

        // styling
        folderRenameInput.current.style.display = 'none'
        folderNameEl.current.style.display = 'block'

        // rename directory
        if (folderInputEl.value === folderName) return console.log('same name')
        updateItem({ ...folderData }, 'name', folderInputEl.value, setParentFiles)
        setAllowOpen(true)
    }

    // Handle on blur for rename input
    const onRenameInputBlur = () => {
        folderRenameInput.current.style.display = 'none'
        folderNameEl.current.style.display = 'block'
        setAllowOpen(true)
    }


    // ============================================= KEYMAP SETUP =============================================
    const keyMap = {
        ADD_FILE: 'A',
        ADD_FOLDER: 'Ctrl+A',
        RENAME: 'F2',
        DELETE: 'Delete'
    }
    const handlers = {
        ADD_FILE: e => { if (e && document.getElementById(folderData._id).classList.contains(itemSelectClass)) contextMenuHandler(CONTEXT_MENU_ACTIONS.ADD_FILE, folderData._id) },
        ADD_FOLDER: e => { if (e && document.getElementById(folderData._id).classList.contains(itemSelectClass)) contextMenuHandler(CONTEXT_MENU_ACTIONS.ADD_FOLDER, folderData._id) },
        RENAME: e => { if (e && document.getElementById(folderData._id).classList.contains(itemSelectClass)) contextMenuHandler(CONTEXT_MENU_ACTIONS.RENAME, folderData._id) },
        DELETE: e => { if (e && document.getElementById(folderData._id).classList.contains(itemSelectClass)) contextMenuHandler(CONTEXT_MENU_ACTIONS.DELETE, folderData._id) }
    }
    // Add event listeners to document using custom made HotKeys hook
    useHotKeys(keyMap, handlers)                                                // ISSUE: inefficent design due to repeated event listener assignment every re-render


    return (
        <div className="Folder">
            <ContextMenuTrigger id="folder-context-menu" noteid={folderData._id} onClickHandler={contextMenuHandler} collect={(props) => {return props}}>
                <div ref={folderCont} id={folderData._id} className="folder-cont"
                    onClick={folderClickHandler} >
                    <div className="folder-icon">
                        <img className="folder-img" src={open ? ChevronDown : ChevronRight} alt="folder-right" />
                    </div>
                    <div ref={folderNameEl} className="folder-name">{folderName}</div>
                    <form className="folder-name-form" ref={folderRenameInput} action="POST" onSubmit={onFolderInputSubmit}>
                        <input type="text"
                               onKeyDown={e => e.code === 'Escape' && (onRenameInputBlur())} 
                               onBlur={onRenameInputBlur} />
                    </form>
                </div>
            </ContextMenuTrigger>

            <div ref={folderChildrenEl} className={open ? "folder-children" : "folder-children closed"}>
                {proxyInput && (<ProxyItem onSubmitCreation={onSubmitCreation} removeProxy={() => setProxyInput(false)} />)}
                {files && (
                    files.map((file) => {
                        if (file.type == 'folder') return (
                            <Folder key={`folder-${file._id}`} folderData={file} setParentFiles={setFiles} />
                        )
                        return (
                            <File key={`file-${file._id}`} fileData={file} setParentFiles={setFiles} />
                        )
                    })
                )}
            </div>
        </div>
    )
}

export default memo(Folder)
