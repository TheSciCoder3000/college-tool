import React, { useState, useEffect, useContext } from 'react'
import { addItem, findFolderFiles, getOpenFolders } from '../Notes/store/Utils'
import File, { NOTE_CONTEXT_ACTION } from './File'
import Folder, { CONTEXT_MENU_ACTIONS } from './Folder'
import  { ContextMenu, MenuItem } from 'react-contextmenu'
import ProxyItem from './ProxyItem'
import { useWhyDidYouUpdate } from '../compUtils'
import { useOpenNote } from '../Notes/Note'

import { motion } from 'framer-motion'
import { NotesVariants } from '../../AnimationVariants'


const DisplayFolders = React.createContext()
export function useDisplayFolders() {
    return useContext(DisplayFolders)
}


const FileFolder = () => {
    // ============================================= State Initialization =============================================
    const [files, setFiles] = useState()
    useEffect(() => { if (!files) findFolderFiles('root-folder', setFiles) }, [])       // fetch files data from the database

    const [proxyInput, setProxyInput] = useState(null)
    const openNote = useOpenNote()

    const [showFolders, setShowFolders] = useState(false)
    const [openFolders, setOpenFolders] = useState()
    // Used to only display the folder tree once all folders are openned
    useEffect(() => {
        if (!openFolders) getOpenFolders(setOpenFolders)                                // On render, get an object of open folders w/ values set to false
        else if (!Object.values(openFolders).includes(false)) {                         // if there are no unopenned folders
            setShowFolders(true)                                                            // Then show the entire folder tree
        }
    }, [openFolders])
    

    // DEV DEBUGGING LOG
    // useWhyDidYouUpdate('FileFolder', { files, showFolders, openFolders })



    const onSubmitCreation = (e) => {
        e.preventDefault()

        let itemName = document.getElementById('proxy-folder-creation').querySelector('input').value
        let itemType = {...proxyInput}
        if (itemName === '' || !itemName) return
        
        setProxyInput(null)

        addItem('root-folder', itemType.item, itemName, setFiles).then(result => { if (result.type == 'note') openNote(result._id, result.name) })
    }


    // ============================================= SHARED FUNCTIONS =============================================
    // link the clickHandler to the contextMenuHandler
    const handleContextMenu = (e, { action, noteid, onClickHandler }) => onClickHandler(action, noteid)

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
                    {proxyInput && (<ProxyItem onSubmitCreation={onSubmitCreation} removeProxy={() => setProxyInput(null)} />)}
                    {files && (
                        files.map((file) => {
                            if (file.type == 'folder') {
                                return (
                                    <DisplayFolders.Provider key={`folder-${file._id}`} value={setOpenFolders}>
                                        <Folder folderData={file} setParentFiles={setFiles} />
                                    </DisplayFolders.Provider>
                                )
                            }
                            return (
                                <File key={`file-${file._id}`} fileData={file} setParentFiles={setFiles} />
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

export default FileFolder
