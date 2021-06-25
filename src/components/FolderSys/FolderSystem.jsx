import React from 'react'
import { useState, useMemo } from 'react'
import File from './File'
import Folder from './Folder'

const fs = window.require('fs')
const pathModule = window.require('path')

const { app } = window.require('@electron/remote')

const FileFolder = () => {
    const [path, setPath] = useState(app.getAppPath())

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

    console.log('files: ', files)

    return (
        <div className="folder-sidepanel">
            <div className="folder-header">
                <h1>Notes</h1>
            </div>
            <div className="folder-tree">
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
        </div>
    )
}

export default FileFolder
