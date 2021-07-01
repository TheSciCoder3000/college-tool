import React from 'react'
import { useRef, useLayoutEffect } from 'react'

const ProxyItem = ({ onSubmitCreation, removeProxy }) => {
    const proxyInput = useRef()
    useLayoutEffect(() => {
        setTimeout(() => proxyInput.current.focus(), 10)
    }, [])
    return (
        <div className="Folder proxy-folder-note" id="proxy-folder-creation">
            <form action="POST" onSubmit={onSubmitCreation}>
            <input onBlur={removeProxy} ref={proxyInput} id='proxy-input' type="text" />
            </form>
        </div>
    )
}

export default ProxyItem
