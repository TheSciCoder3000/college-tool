import Viewer from "../dashboard/viewer";
import SidePanel from "../dashboard/SidePanel";

import React, { useState, useEffect } from 'react'
import { AnimatePresence, usePresence } from "framer-motion";

const DashRoute = () => {
    document.onkeydown = null
    console.log('rendering')
    const [isPresent, safeToRemove] = usePresence()
    const [ShowSidePanel, setShowSidePanel] = useState(false)
    useEffect(() => {
        if (!isPresent && !ShowSidePanel) safeToRemove()
    }, [ShowSidePanel, isPresent])
    return (
        <>
            {/* tool viewer*/}
            <Viewer showSidePanel={setShowSidePanel} />

            {/* side panel */}
            <AnimatePresence
                onExitComplete={() => {
                    if (!isPresent) safeToRemove()
                }}
            >
                {ShowSidePanel && (<SidePanel />)}
            </AnimatePresence>
        </>
    )
}

export default DashRoute
