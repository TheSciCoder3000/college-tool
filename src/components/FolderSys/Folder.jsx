import React from 'react'
import { useState, useMemo, useEffect, useRef } from 'react'
import File from './File'
import { isFolderOpen, setFolderOpen } from '../Notes/store'

import ChevronRight from '../../assets/img/folder-right.svg'
import ChevronDown from '../../assets/img/folder-down.svg'

const fs = window.require('fs')
const pathModule = window.require('path')


const Folder = ({ folderData }) => {
    // Initialize states
    const [folderName, setFolderName] = useState(folderData.name)
    useEffect(() => setFolderName(folderData.name), [folderData.name])

    const path = folderData.path

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
        // if ctrl key is
        if (!e.ctrlKey) {
            document.querySelectorAll('.select-folder').forEach(folderEl => folderEl.classList.remove('select-folder'))     // unselect all folders
            setOpen(openState => !openState)                                                                                // open/close folders
        }

        folderCont.current.classList.toggle('select-folder')
    }

    return (
        <div className="Folder">
            <div ref={folderCont} className="folder-cont"
                 onClick={folderClickHandler} >
                <div className="folder-icon">
                    <img className="folder-img" src={open ? ChevronDown : ChevronRight} alt="folder-right" />
                </div>
                <div className="folder-name">{folderName}</div>
            </div>
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
