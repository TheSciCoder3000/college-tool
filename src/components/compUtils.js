import { useRef, useEffect } from 'react'

export function useWhyDidYouUpdate(name, props) {
    console.log('running why did you update')
    // Get a mutable ref object where we can store props ...
    // ... for comparison next time this hook runs.
    const previousProps = useRef();
  
    useEffect(() => {
        if (previousProps.current) {
            // Get all keys from previous and current props
            const allKeys = Object.keys({ ...previousProps.current, ...props });
            // Use this object to keep track of changed props
            const changesObj = {};
            // Iterate through keys
            allKeys.forEach((key) => {
                // If previous is different from current
                if (previousProps.current[key] !== props[key]) {
                    // Add to changesObj
                    changesObj[key] = {
                        from: previousProps.current[key],
                        to: props[key],
                    };
                }
            });
  
            // If changesObj not empty then output to console
            if (Object.keys(changesObj).length) {
                console.log("[why-did-you-update]", name, changesObj)
            }
            
        } else {
            console.log(`[why-did-you-update] initial render`)
        }
  
        // Finally update previousProps.current with current props for next hook call
        previousProps.current = props;
    });
}


export function useKey(key, cb) {
    // const callbackRef = useRef(cb)
    // useEffect(() => callbackRef = cb, [cb])

    useEffect(() => {
        function handler (e) {
            let keys = key.split('+')
            let BoolKeys = keys.slice(0, -1)
            if (e.key === keys.slice(-1)[0] && (BoolKeys.includes('Ctrl') === e.ctrlKey) ) cb(e)
        }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [key])
}


export function useHotKeys(keyMaps, handlers) {
    let actions = Object.keys(keyMaps)
    useEffect(() => {
        function evalKeySeq(e, keySeq) {
            let keys = keySeq.split('+')
            let BoolKeys = keys.slice(0, -1)
            return (e.key === keys.slice(-1)[0] && (BoolKeys.includes('Ctrl') === e.ctrlKey) )
        }
        function hotKeyHandler(e) {
            actions.forEach(action => {
                let keySeq = keyMaps[action]
                let keyHandler = handlers[action]
                if (evalKeySeq(e, keySeq)) keyHandler(e)
            });
        }
        document.addEventListener('keydown', hotKeyHandler)
        return () => document.removeEventListener('keydown', hotKeyHandler)
    })
}