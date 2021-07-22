import React, { useState, useEffect, useContext } from 'react'
import { getOpenFolders } from '../Notes/store/Utils'
import File, { NOTE_CONTEXT_ACTION } from './File'
import Folder, { CONTEXT_MENU_ACTIONS } from './Folder'
import  { ContextMenu, MenuItem } from 'react-contextmenu'
import ProxyItem from './ProxyItem'
import { useWhyDidYouUpdate } from '../compUtils'
import { useOpenNote } from '../Notes/Note'

import { motion } from 'framer-motion'
import { NotesVariants } from '../../AnimationVariants'
import { AddItem } from '../../redux/ReduxActions'
import { useDispatch, useSelector } from 'react-redux'
import { selectFolderTree } from '../../redux/ReduxSelectors'
import { NotesAndFolderItem } from '../../redux/Reducers/NotesAndFolders'


export interface OpenFoldersObj {
    [key: string]: boolean
}
interface ProxyInputObj {
    item: string | null
}
interface ContextMenuData {
    action: any
    noteid: string
    onClickHandler: (action: any, noteid: string) => void
}

type displayFolderType = React.Dispatch<React.SetStateAction<OpenFoldersObj>>
const DisplayFolders = React.createContext<displayFolderType|null>(null)
export function useDisplayFolders() {
    return useContext(DisplayFolders)
}


const FileFolder = () => {
    console.log('rendering files folder')
    // ============================================= State Initialization =============================================
    const dispatch = useDispatch()
    const files = useSelector(selectFolderTree)
    // const [files, setFiles] = useState<NotesAndFolderItem[]>()
    // useEffect(() => { if (!files) findFolderFiles('root-folder', setFiles) }, [])       // fetch files data from the database

    const [proxyInput, setProxyInput] = useState<ProxyInputObj>({item: null})
    const openNote = useOpenNote()

    const [showFolders, setShowFolders] = useState(true)
    const [openFolders, setOpenFolders] = useState<OpenFoldersObj>({})
    // Used to only display the folder tree once all folders are openned
    useEffect(() => {
        if (!openFolders) getOpenFolders(setOpenFolders)                                // On render, get an object of open folders w/ values set to false
        else if (!Object.values(openFolders).includes(false)) {                         // if there are no unopenned folders
            setShowFolders(true)                                                            // Then show the entire folder tree
        }
    }, [openFolders])
    

    // DEV DEBUGGING LOG
    useWhyDidYouUpdate('FileFolder', { files, proxyInput, openNote, showFolders, openFolders })



    const onSubmitCreation = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        let itemId = `${new Date().toISOString()}-${Math.random().toString(16).slice(-4)}`
        let itemName: string|null|undefined = document.getElementById('proxy-folder-creation')?.querySelector('input')?.value
        let itemType = {...proxyInput}
        if (itemName === '' || !itemName) return
        
        setProxyInput({item: null})

        // console.log(`creating item ${itemName} as ${itemType.item}`)
        if (!itemType.item) return console.error('ERROR: item type is null')
        AddItem(dispatch, { itemId, itemName, parentId: 'root-folder', type: itemType.item })
    }


    // ============================================= SHARED FUNCTIONS =============================================
    // link the clickHandler to the contextMenuHandler
    const handleContextMenu = (e: React.MouseEvent, { action, noteid, onClickHandler }: ContextMenuData) => onClickHandler(action, noteid)

    return (
        <>
            <motion.div className="folder-sidepanel"
                variants={NotesVariants.FolderTree}
                initial='hidden'
                animate='visible'
                exit='exit'
            >
                <div className="folder-header">
                    <h1>Notes</h1>
                    <div style={{display: 'flex', justifyContent: 'center'}} className="root-folder-btns">
                        <button className="add-file" onClick={() => setProxyInput({ item: 'note' })}>File</button>
                        <button className="add-folder" onClick={() => setProxyInput({ item: 'folder' })}>Folder</button>
                    </div>
                </div>

                {!showFolders && (
                    <div className="loading-folders">
                        <h5>Loading...</h5>
                    </div>
                )}

                <div className={showFolders ? "folder-tree" : "folder-tree no-display"}>
                    {proxyInput.item && (<ProxyItem onSubmitCreation={onSubmitCreation} removeProxy={() => setProxyInput({ item: null })} />)}
                    {files && (
                        files.map((file) => {
                            if (file.type == 'folder') {
                                return (
                                    <DisplayFolders.Provider key={`folder-${file._id}`} value={setOpenFolders}>
                                        <Folder folderData={file} />
                                    </DisplayFolders.Provider>
                                )
                            }
                            return (
                                <File key={`file-${file._id}`} fileData={file} />
                            )
                        })
                    )}
                </div>

            </motion.div>
            {/* Context menu for folders */}
            <ContextMenu id="folder-context-menu" className="folder-context-menu-cont">
                <MenuItem className="folder-cotext-menu-item" data={{ action: CONTEXT_MENU_ACTIONS.ADD_FILE }} onClick={handleContextMenu} >
                    <div className="context-menu-item-name">
                        New File
                    </div>
                    <div className="context-menu-item-shortcut">
                        Shift + a
                    </div>
                </MenuItem>
                <MenuItem className="folder-cotext-menu-item" data={{ action: CONTEXT_MENU_ACTIONS.ADD_FOLDER }} onClick={handleContextMenu} >
                    <div className="context-menu-item-name">
                        New Folder
                    </div>
                    <div className="context-menu-item-shortcut">
                        Ctrl + Shift + a
                    </div>
                </MenuItem>
                <MenuItem divider className="folder-context-menu-divider" />
                <MenuItem className="folder-cotext-menu-item" data={{ action: CONTEXT_MENU_ACTIONS.RENAME }} onClick={handleContextMenu} >
                    <div className="context-menu-item-name">
                        Rename
                    </div>
                    <div className="context-menu-item-shortcut">
                        F2
                    </div>
                </MenuItem>
                <MenuItem className="folder-cotext-menu-item" data={{ action: CONTEXT_MENU_ACTIONS.DELETE }} onClick={handleContextMenu} >
                    <div className="context-menu-item-name">
                        Delete
                    </div>
                    <div className="context-menu-item-shortcut">
                        Delete
                    </div>
                </MenuItem>
                <MenuItem className="folder-cotext-menu-item" data={{ action: 'view-db' }} onClick={handleContextMenu} >
                    <div className="context-menu-item-name">
                        view db
                    </div>
                </MenuItem>
            </ContextMenu>
            
            {/* Context menu for files or notes */}
            <ContextMenu id="note-context-menu" className="folder-context-menu-cont">
                <MenuItem className="folder-cotext-menu-item" data={{ action: NOTE_CONTEXT_ACTION.OPEN_NOTE }} onClick={handleContextMenu} >
                    <div className="context-menu-item-name">
                        Open Note
                    </div>
                    <div className="context-menu-item-shortcut">
                        
                    </div>
                </MenuItem>
                <MenuItem divider className="folder-context-menu-divider" />
                <MenuItem className="folder-cotext-menu-item" data={{ action: NOTE_CONTEXT_ACTION.RENAME_NOTE }} onClick={handleContextMenu} >
                    <div className="context-menu-item-name">
                        Rename Note
                    </div>
                    <MenuItem divider className="folder-context-menu-divider" />
                    <div className="context-menu-item-shortcut">
                        F2
                    </div>
                </MenuItem>
                <MenuItem className="folder-cotext-menu-item" data={{ action: NOTE_CONTEXT_ACTION.DELETE_NOTE }} onClick={handleContextMenu} >
                    <div className="context-menu-item-name">
                        Delete Note
                    </div>
                    <MenuItem divider className="folder-context-menu-divider" />
                    <div className="context-menu-item-shortcut">
                        Delete
                    </div>
                </MenuItem>
            </ContextMenu>            
        </>
    )
}

export default React.memo(FileFolder)
