import React, { useState, useEffect, useRef, memo, FormEvent } from 'react'
import File from './File'
import { ContextMenuTrigger } from 'react-contextmenu'
import { useHotKeys } from '../compUtils'

import ChevronRight from '../../assets/img/folder-right.svg'
import ChevronDown from '../../assets/img/folder-down.svg'
import { viewDB, removeItem } from '../Notes/store/Utils'
import ProxyItem from './ProxyItem';
import { OpenFoldersObj, useDisplayFolders } from './FolderSystem'
import { useOpenNote } from '../Notes/Note'
import { useDispatch, useSelector } from 'react-redux'
import { AddItem, RemoveItem, UpdateFolderNoteItem } from '../../redux/ReduxActions'
import { NotesAndFolderItem } from '../../redux/Reducers/NotesAndFolders'
import { selectFilesOf } from '../../redux/ReduxSelectors'
import { RootState } from '../../redux/store'

interface FolderProps {
    folderData: NotesAndFolderItem
}


// Shared with the main folder system component
export const CONTEXT_MENU_ACTIONS = {
    ADD_FILE: 'add-file',
    ADD_FOLDER: 'add-folder',
    RENAME:'rename',
    DELETE: 'delete'
}


const Folder: React.FC<FolderProps> = ({ folderData }) => {
    // ============================================= State Initialization =============================================
    const dispatch = useDispatch()
    const [folderName, setFolderName] = useState(folderData.name)
    useEffect(() => setFolderName(folderData.name), [folderData.name])

    const [open, setOpen] = useState(folderData.open)
    useEffect(() => UpdateFolderNoteItem(dispatch, { id: folderData._id, property: 'open', newValue: open }), [open])

    const setDisplayFolder = useDisplayFolders()                                        // Used to update the openned folders obj of the main folder comp
    const files = useSelector((state: RootState) => selectFilesOf(state, folderData._id))
    // const [files, setFiles] = useState<NotesAndFolderItem[]>()
    // useEffect(() => {
    //     if (!files) findFolderFiles(folderData._id)                           // On render, fetch data files from database
    //     else if (setDisplayFolder) setDisplayFolder((folders: OpenFoldersObj): OpenFoldersObj => {                                              // Once data retrieved, update opnned folders state
    //         let foldersCopy: OpenFoldersObj = {...folders}
    //         if (Object.keys(folders).includes(folderData._id)) {
    //             foldersCopy[folderData._id] = true
    //             return foldersCopy
    //         }
    //         return foldersCopy
    //         })
    // }, [files])
    

    // ============================================= SHARED FUNCTIONS =============================================
    // Handling context menu actions
    const [allowOpen, setAllowOpen] = useState(true)                        // Used to prevent the folder from openning when the input is clicked
    const [proxyInput, setProxyInput] = useState(false)                     // Used to render/unmount the proxyInput for folder/note creation
    const folderRenameInput = useRef<HTMLFormElement>(null)                 // Ref to the input field used in renaming a folder
    const folderNameEl = useRef<HTMLDivElement>(null)                       // Ref to the element that contains the name of the folder
    const folderChildrenEl = useRef<HTMLDivElement>(null)                   // Ref to the element that contains the child folders/notes
    const createItem = useRef<string|null|undefined>(null)                  // Holds ref to type of item being created

    const contextMenuHandler = (action: string, noteid: string) => {
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
                if (!folderRenameInput.current || !folderNameEl.current) return
                folderRenameInput.current.style.display = 'block'
                folderNameEl.current.style.display = 'none'

                folderRenameInput.current.querySelector('input')!.value = folderName         // Set the value of the input to the folder name
                folderRenameInput.current.querySelector('input')?.focus()                    // focus on the input
                break;
            case CONTEXT_MENU_ACTIONS.DELETE:
                // removes the folder/note
                // removeItem(folderData._id, folderData.type, folderData.parentFolder)
                console.log('removing folder')
                RemoveItem(dispatch, {itemId: folderData._id, type: folderData.type, parentId: folderData.parentFolder})
                break;
            case 'view-db':
                viewDB()
                break;
            default:
                console.error(`ERROR: ${action} is not a registered context menu action`)
        }
    }


    // ============================================= COMPONENT BASED FUNCTIONS =============================================
    // Handling click events on a folder
    const itemSelectClass = 'item-selected'
    const folderCont = useRef<HTMLDivElement>(null)                                             // Ref to the Main Folder container
    const folderClickHandler = (e: React.MouseEvent) => {
        if (!allowOpen) return                                              // Makes sure folder does not open/close when renaming

        // if ctrl key is not pressed
        if (!e.ctrlKey) {
            document.querySelectorAll(`.${itemSelectClass}`).forEach(folderEl => folderEl.classList.remove(itemSelectClass))     // unselect all folders
            setOpen(openState => !openState)                                                                                     // open/close folders
        }

        if (folderCont.current) folderCont.current.classList.toggle(itemSelectClass)
    }
    
    // Handler for creating folders/notes on submit
    const openNote = useOpenNote()
    const onSubmitCreation = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!createItem.current) return

        let itemId = `${new Date().toISOString()}-${Math.random().toString(16).slice(-4)}`
        let proxyFolder = document.getElementById('proxy-folder-creation')
        if (!proxyFolder) return
        let itemName = proxyFolder.querySelector('input')?.value
        if (itemName === '' || !itemName) return
        setProxyInput(false)

        // add an item to the database
        console.log(`creating item ${itemName} as ${createItem.current} in ${folderData._id}`)
        AddItem(dispatch, { itemId, itemName, parentId: folderData._id, type: createItem.current })
    }

    // Handler for onFolderInput submit
    const onFolderInputSubmit = (e: FormEvent<HTMLFormElement>) => {
        // Initialization
        e.preventDefault()
        if (!folderRenameInput.current || !folderNameEl.current) return console.error('ERROR: ELEMENTS ARE NULL')

        let folderInputEl = folderRenameInput.current?.querySelector('input')
        if (folderInputEl?.value === '' || !folderInputEl?.value) return console.error('INVALID FOLDER NAME')

        // styling
        folderRenameInput.current.style.display = 'none'
        folderNameEl.current.style.display = 'block'

        // rename directory
        if (folderInputEl.value === folderName) return console.log('same name')
        UpdateFolderNoteItem(dispatch, { id: folderData._id, property: 'name', newValue: folderInputEl.value })
        setAllowOpen(true)
    }

    // Handle on blur for rename input
    const onRenameInputBlur = () => {
        if (!folderRenameInput.current || !folderNameEl.current) return console.error('ERROR: ELEMENTS ARE NULL')
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
        ADD_FILE: (e: KeyboardEvent) => { if (e && document.getElementById(folderData._id)?.classList.contains(itemSelectClass)) contextMenuHandler(CONTEXT_MENU_ACTIONS.ADD_FILE, folderData._id) },
        ADD_FOLDER: (e: KeyboardEvent) => { if (e && document.getElementById(folderData._id)?.classList.contains(itemSelectClass)) contextMenuHandler(CONTEXT_MENU_ACTIONS.ADD_FOLDER, folderData._id) },
        RENAME: (e: KeyboardEvent) => { if (e && document.getElementById(folderData._id)?.classList.contains(itemSelectClass)) contextMenuHandler(CONTEXT_MENU_ACTIONS.RENAME, folderData._id) },
        DELETE: (e: KeyboardEvent) => { if (e && document.getElementById(folderData._id)?.classList.contains(itemSelectClass)) contextMenuHandler(CONTEXT_MENU_ACTIONS.DELETE, folderData._id) }
    }
    // Add event listeners to document using custom made HotKeys hook
    useHotKeys(keyMap, handlers)                                                // ISSUE: inefficent design due to repeated event listener assignment every re-render


    return (
        <div className="Folder">
            {/*@ts-ignore */}
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
                        if (file.type === 'folder') return (
                            <Folder key={`folder-${file._id}`} folderData={file} />
                        )
                        return (
                            <File key={`file-${file._id}`} fileData={file} />
                        )
                    })
                )}
            </div>
        </div>
    )
}

export default memo(Folder)
