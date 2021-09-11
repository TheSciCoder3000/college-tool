import React from 'react'
import { NoteProvider } from './NoteContext'

interface NoteViewerProps {
    tabs: any[]
    activeTab: string | null
    updateNoteFile: any
}

const NoteViewer: React.FC<NoteViewerProps> = ({ tabs, activeTab, updateNoteFile }) => {
    return (
        <div className="doc-body">
                {tabs.length > 0 && (
                    tabs.map(tab =>
                        <NoteProvider key={tab._id} 
                                        noteID={tab._id} 
                                        notes={tab.notes}
                                        hidden={tab._id === activeTab ? false : true}
                                        updateNoteFile={updateNoteFile} />
                ))}
        </div>
    )
}

export default NoteViewer
