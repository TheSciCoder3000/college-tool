import Viewer from "../dashboard/viewer";
import SidePanel from "../dashboard/SidePanel";

import React, { useState } from 'react'
import { AnimatePresence } from "framer-motion";

const DashRoute = () => {
    document.onkeydown = null
    console.log('rendering')
    const [ShowSidePanel, setShowSidePanel] = useState(false)
    return (
        <>
            {/* tool viewer*/}
            <Viewer showSidePanel={setShowSidePanel} />

            {/* side panel */}
            <AnimatePresence>
                {ShowSidePanel && (<SidePanel />)}
            </AnimatePresence>
        </>
    )
}

export default DashRoute
