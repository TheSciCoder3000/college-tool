import React from 'react'
import { useState, useMemo } from 'react'
import File from './File'

import ChevronRight from '../../assets/img/folder-right.svg'
import ChevronDown from '../../assets/img/folder-down.svg'

const fs = window.require('fs')
const pathModule = window.require('path')


const Folder = ({ folderData }) => {
    const [folderName, setFolderName] = useState(folderData.name)
    const [open, setOpen] = useState(false)

    const [path, setPath] = useState(folderData.path)

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
          }), [path])

    return (
        <div className="Folder">
            <div className="folder-cont"
                 onClick={() => setOpen(openState => !openState)} >
                <div className="folder-icon">
                    <img src={open ? ChevronDown : ChevronRight} alt="folder-right" />
                </div>
                <div className="folder-name">{folderName}</div>
            </div>
            {open && ( 
                <div className="folder-children">
                    {files && (
                        files.map((file, fileIndx) => {
                            if (file.type == 'folder') return (
                                <Folder key={fileIndx} folderData={file} />
                            )
                            return (
                                <File key={fileIndx} fileData={file} />
                            )
                        })
                    )}
                </div>
            )}
        </div>
    )
}

export default Folder
