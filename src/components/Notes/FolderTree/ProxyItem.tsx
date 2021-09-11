import React, { FormEvent } from 'react'
import { useRef, useLayoutEffect } from 'react'

interface ProxyItemProps {
    onSubmitCreation: (e: FormEvent<HTMLFormElement>) => void
    removeProxy: () => void
}

const ProxyItem: React.FC<ProxyItemProps> = ({ onSubmitCreation, removeProxy }) => {
    const proxyInput = useRef<HTMLInputElement>(null)
    useLayoutEffect(() => {
        setTimeout(() => proxyInput.current?.focus(), 10)
    }, [])
    return (
        <div className="Folder proxy-folder-note" id="proxy-folder-creation">
            <form action="POST" onSubmit={onSubmitCreation}>
                <input onBlur={removeProxy} 
                       ref={proxyInput} 
                       id='proxy-input' 
                       type="text" 
                       onKeyDown={e => e.code === 'Escape' && (removeProxy())} />
            </form>
        </div>
    )
}

export default ProxyItem
