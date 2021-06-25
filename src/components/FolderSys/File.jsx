import React from 'react'
import { useState } from 'react'

const File = ({ fileData }) => {
    const [fileName, setFileName] = useState(fileData.name)

    const dbClick = (e) => {
        console.log(`file ${fileName} was clicked`)
    }

    return (
        <div className="File" onDoubleClick={dbClick} >
            {fileName}
        </div>
    )
}

export default File
