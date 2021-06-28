import React, { useState, useMemo, useEffect, useRef } from 'react'
import { setFolderOpen } from '../Notes/store'
import File from './File'
import Folder, { CONTEXT_MENU_ACTIONS } from './Folder'
import StartWatcher, { WATCHER_EVENTS } from './watcher'
import  { ContextMenu, MenuItem } from 'react-contextmenu'

const fs = window.require('fs')
const pathModule = window.require('path')
const { app } = window.require('@electron/remote')
var watcher = null;

const FileFolder = () => {
    const path = pathModule.join(app.getPath('userData'), 'NotesHome')

    // if userData folder does not exist then create folder
    if (!fs.existsSync(path)) fs.mkdir(path, (error) => { if (error) console.error(error) })
    const [fileSync, setFileSync] = useState(true)

    // initialize files
    let files = useMemo(() => fs
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
        }), [fileSync, path])
    
    // initializing the file watcher
    useEffect(() => {
        if (watcher) watcher.close()
        watcher = StartWatcher(path, (event, data) => {
            switch(event){
                case WATCHER_EVENTS.FOLDER_DELETED:
                    setFolderOpen(data.folderPath, false, true)
                    break;
            }
            setFileSync(syncState => !syncState)
        })

        // cleanup function
        return () => {
            // close watcher if component is unmounted
            if (watcher) watcher.close()
            watcher = null
        }
    }, [path])


    const handleContextMenu = (e, { action, path, onClickHandler }) => {
        onClickHandler(action, path)
    }

    return (
        <div className="folder-sidepanel">
            <div className="folder-header">
                <h1>Notes</h1>
            </div>
            <div className="folder-tree">
                {files && (
                    files.map((file) => {
                        if (file.type == 'folder') {
                            return (
                                <Folder key={`folder-${file.name}`} folderData={file} />
                            )
                        }
                        return (
                            <File key={`file-${file.name}`} fileData={file} />
                        )
                    })
                )}
            </div>
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
            </ContextMenu>
        </div>
    )
}

export default FileFolder
