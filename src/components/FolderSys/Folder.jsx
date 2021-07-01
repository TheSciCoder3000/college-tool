import React from 'react'
import ReactDOM from 'react-dom';
import { useState, useMemo, useEffect, useRef } from 'react'
import File from './File'
import { isFolderOpen, setFolderOpen } from '../Notes/store'
import { ContextMenuTrigger } from 'react-contextmenu'

import ChevronRight from '../../assets/img/folder-right.svg'
import ChevronDown from '../../assets/img/folder-down.svg'
import { addItem, viewDB, findFolderFiles, removeItem, updateItem } from '../Notes/store/Utils'
import ProxyItem from './ProxyItem';


export const CONTEXT_MENU_ACTIONS = {
    ADD_FILE: 'add-file',
    ADD_FOLDER: 'add-folder',
    RENAME:'rename',
    DELETE: 'delete'
}

const Folder = ({ folderData, setParentFiles }) => {
    // Initialize states
    const [folderName, setFolderName] = useState(folderData.name)
    useEffect(() => setFolderName(folderData.name), [folderData.name])

    const [open, setOpen] = useState(folderData.open)

    const [files, setFiles] = useState()
    useEffect(() => {
        if (!files) findFolderFiles(folderData._id, setFiles)
    }, [])
    

    const folderCont = useRef()                                             // Ref to the Main Folder container
    const folderClickHandler = (e) => {
        if (!allowOpen) return                                              // Makes sure folder does not open/close when renaming

        // if ctrl key is not pressed
        if (!e.ctrlKey) {
            document.querySelectorAll('.select-folder').forEach(folderEl => folderEl.classList.remove('select-folder'))     // unselect all folders
            setOpen(openState => {
                updateItem({...folderData}, 'open', !openState)
                return !openState
            })                                                                                // open/close folders
        }

        folderCont.current.classList.toggle('select-folder')
    }

    // Handling context menu actions
    const [allowOpen, setAllowOpen] = useState(true)                        // Used to prevent the folder from openning when the input is clicked
    const [proxyInput, setProxyInput] = useState(false)                     // Used to render/unmount the proxyInput for folder/note creation
    const folderRenameInput = useRef()                                      // Ref to the input field used in renaming a folder
    const folderNameEl = useRef()                                           // Ref to the element that contains the name of the folder
    const folderChildrenEl = useRef()                                       // Ref to the element that contains the child folders/notes
    const createItem = useRef()
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
                removeItem(folderData._id, folderData.type, folderData.parentFolder, setParentFiles)
                break;
            case 'view-db':
                viewDB()
                break;
        }
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
        if (folderInputEl.value === '' || !folderInputEl.value) return

        // styling
        folderRenameInput.current.style.display = 'none'
        folderNameEl.current.style.display = 'block'

        // rename directory
        updateItem({ ...folderData }, 'name', folderInputEl.value, setParentFiles)
    }

    // Handle on blur for rename input
    const onRenameInputBlur = () => {
        folderRenameInput.current.style.display = 'none'
        folderNameEl.current.style.display = 'block'
    }

    return (
        <div className="Folder">
            <ContextMenuTrigger id="folder-context-menu" noteid={folderData._id} onClickHandler={contextMenuHandler} collect={(props) => {return props}}>
                <div ref={folderCont} className="folder-cont"
                    onClick={folderClickHandler} >
                    <div className="folder-icon">
                        <img className="folder-img" src={open ? ChevronDown : ChevronRight} alt="folder-right" />
                    </div>
                    <div ref={folderNameEl} className="folder-name">{folderName}</div>
                    <form className="folder-name-form" ref={folderRenameInput} action="POST" onSubmit={onFolderInputSubmit}>
                        <input type="text" 
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

export default Folder
