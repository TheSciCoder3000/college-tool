import React from 'react'
import { useState, useEffect } from 'react'
import { useOpenNote } from '../Notes/Note'

const File = ({ fileData }) => {
    // initialize states
    const [fileName, setFileName] = useState(fileData.name)
    useEffect(() => setFileName(fileData.name), [fileData])
    
    const openNote = useOpenNote()

    const dbClick = (e) => {
        console.log(`file ${fileName} was clicked`)
        openNote(fileData.path, fileData.name)
    }

    return (
        <div className="File" onDoubleClick={dbClick} >
            {fileName}
        </div>
    )
}

export default File
