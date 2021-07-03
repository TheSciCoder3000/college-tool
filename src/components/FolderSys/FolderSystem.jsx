import React, { useState, useMemo, useEffect, useRef, useContext } from 'react'
import { findFolderFiles, getOpenFolders } from '../Notes/store/Utils'
import File, { NOTE_CONTEXT_ACTION } from './File'
import Folder, { CONTEXT_MENU_ACTIONS } from './Folder'
import  { ContextMenu, MenuItem } from 'react-contextmenu'
import { useWhyDidYouUpdate } from '../compUtils'

const fs = window.require('fs')
const pathModule = window.require('path')
const { app } = window.require('@electron/remote')
var watcher = null;

const DisplayFolders = React.createContext()
export function useDisplayFolders() {
    return useContext(DisplayFolders)
}

const FileFolder = () => {
    // initialize files
    const [files, setFiles] = useState()
    useEffect(() => {
        if (!files) findFolderFiles('root-folder', setFiles)
    }, [])

    const [showFolders, setShowFolders] = useState(false)
    const [openFolders, setOpenFolders] = useState()
    useEffect(() => {
        if (!openFolders) getOpenFolders(setOpenFolders)
        else if (!Object.values(openFolders).includes(false)) {
            setShowFolders(true)
        }
    }, [openFolders])
    

    // DEV DEBUGGING LOG
    // useWhyDidYouUpdate('FileFolder', { files, showFolders, openFolders })

    const handleContextMenu = (e, { action, noteid, onClickHandler }) => {
        onClickHandler(action, noteid)
    }

    return (
        <div className="folder-sidepanel">
            <div className="folder-header">
                <h1>Notes</h1>
            </div>

            {!showFolders && (
                <div className="loading-folders">
                    <h5>Loading...</h5>
                </div>
            )}

            <div className={showFolders ? "folder-tree" : "folder-tree no-display"}>
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
        </div>
    )
}

export default FileFolder
