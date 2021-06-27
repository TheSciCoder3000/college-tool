import React, { useState, useMemo, useEffect } from 'react'
import { setFolderOpen } from '../Notes/store'
import File from './File'
import Folder from './Folder'
import StartWatcher, { WATCHER_EVENTS } from './watcher'

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
        </div>
    )
}

export default FileFolder
