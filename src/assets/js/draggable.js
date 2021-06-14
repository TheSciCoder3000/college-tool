const draggableGhostClone = (e, taskElmnt, pos) => {
    e = e || window.event
    e.preventDefault()

    // create clone
    var elBBx = taskElmnt.getBoundingClientRect() // document.getElementById(`task-${task.id}`)
    taskElmnt.classList.add('dragging')

    var ghost = taskElmnt.cloneNode(true)
    ghost.style.position = 'absolute'                   // Set position absolute to overlay
    ghost.style.width = `${elBBx.width}px`      // Set fixed width
    ghost.style.top = `${elBBx.y}px`                      // set X and Y to overlay directly above the task component
    ghost.style.left = `${elBBx.x}px`
    ghost.style.margin = '0'                            // Set margin 0 to prevent offset bugs
    ghost.querySelector('.handles-icon').style.cursor = 'grabbing'
    ghost.id = `note-${taskElmnt.getAttribute('note')}-clone`                  // Set unique id from the original task component
    ghost.style.opacity = 0.5                           // 50% opacity

    ghost.querySelector('.add-icon').style.opacity = '0'

    // add into document
    document.body.appendChild(ghost)

    // Update ghost position dictionary
    pos.pos3 = e.clientX
    pos.pos4 = e.clientY
}

const followCursor = (e, pos, taskCloneElmnt) => {
    // Move the ghost task component to follow cursor/mouse
    var elmnt = taskCloneElmnt
    pos.pos1 = pos.pos3 - e.clientX
    pos.pos2 = pos.pos4 - e.clientY
    pos.pos3 = e.clientX
    pos.pos4 = e.clientY
    elmnt.style.top = `${elmnt.offsetTop - pos.pos2}px`
    elmnt.style.left = `${elmnt.offsetLeft - pos.pos1}px`
}

const displayIndicator = (container, afterElement, indicatorStyle) => {
    // Display insert indicator
    const indiContainer = document.createElement('DIV')
    indiContainer.classList.add('indicator-container')

    const absIndiContainer = document.createElement('DIV')
    absIndiContainer.classList.add('abs-indicator')

    for (let i = 0; i < indicatorStyle.childPos; i++) {
        const childIndicator = document.createElement('DIV')
        childIndicator.classList.add('extra-child-indicator')
        absIndiContainer.appendChild(childIndicator)
    }

    const indicator = document.createElement('DIV')
    indicator.classList.add('indicator')
    absIndiContainer.appendChild(indicator)

    indiContainer.appendChild(absIndiContainer)

    let indiExist = document.querySelector('.indicator-container')
    if (indiExist) indiExist.remove()

    // display indicator
    if (afterElement.element) {     // If element exists insert before element
        container.insertBefore(indiContainer, afterElement.element)
    } else if(document.querySelector('.doc-page').lastChild.classList.contains('dragging')) {
        let mainContainer = document.querySelector('.doc-page')
        mainContainer.insertBefore(indiContainer, mainContainer.lastChild)
    } else {                        // Else append to the end
        // container.appendChild(indiContainer)
        let mainContainer = document.querySelector('.doc-page')
        mainContainer.appendChild(indiContainer)
    }
}

function collectionHas(a, b) { //helper function (see below)
    for(var i = 0, len = a.length; i < len; i ++) {
        if(a[i] === b) return true;
    }
    return false;
}

function findParentBySelector(elm, selector) {
    var all = document.querySelectorAll(selector);
    var cur = elm.parentNode;
    while(cur && !collectionHas(all, cur)) { //keep going up until you find a match
        cur = cur.parentNode; //go up
    }
    return cur; //will return null if not found
}

function getChildContCount(noteElement) {
    let childContCount = 0
    let container = noteElement.querySelector('.child-note-cont')
    while (container) {
        childContCount += 1
        container = container.querySelector('.child-note-cont')
    }
    return childContCount
}

function noteChildAnalysis(parentNote, x) {
    if (!parentNote) return {childPos: 0}
    let filteredLastChilds = parentNote.querySelector('.child-note-cont') ? [parentNote.querySelector('.child-note-cont').lastChild] : null
    if (!filteredLastChilds) return {chilldPos: 0} 
    while (filteredLastChilds[filteredLastChilds.length - 1].querySelector('.child-note-cont')) {
        filteredLastChilds.push(filteredLastChilds[filteredLastChilds.length - 1].querySelector('.child-note-cont').lastChild)
    }

    // Return last child data with the min offset
    return filteredLastChilds.reduce((result, child, childIndx) => {
        let box = child.lastChild.getBoundingClientRect()
        let offset = x - (box.left*1.05)

        if (offset > 0 && offset < result.offset) return {element: child.lastChild, childPos: childIndx+1, offset: offset}
        return result

    }, {element: parentNote, childPos: 0, offset: Number.POSITIVE_INFINITY})
}

function useDraggableHook(id, arrangementHandler) {
    var pos = {
        pos1: 0,
        pos2: 0,
        pos3: 0,
        pos4: 0,
    }

    function mouseDown(e) {
        draggableGhostClone(e, document.getElementById(`note-${id}`), pos)
        document.onmousemove = dragMouse
        document.onmouseup = mouseUp
    }

    function dragMouse(e) {
        e = e || window.event
        e.preventDefault()

        // Move the ghost task component to follow cursor/mouse
        followCursor(e, pos, document.getElementById(`note-${id}-clone`))

        // Cancel arrangement tracking if cursor inside task component
        let bbx = document.getElementById(`note-${id}`).getBoundingClientRect()
        if(e.clientY > bbx.top && e.clientY < bbx.bottom) {
            if (document.querySelector('.indicator-container')) document.querySelector('.indicator-container').remove()
            return
        }

        // Detect which component it's closest to
        const taskContainer = document.querySelector('.doc-page')
        var [afterElement, indicatorStyle] = getDragAfterElement(taskContainer, e.clientX, e.clientY)

        // Display insert indicator
        if (document.querySelector('.indicator-container') 
            && afterElement.element === document.querySelector('.indicator-container').nextSibling 
            && document.querySelectorAll('.extra-child-indicator').length === indicatorStyle.childPos) return
        displayIndicator(afterElement.element ? afterElement.element.parentNode : null, afterElement, indicatorStyle)
    }

    function getDragAfterElement(container, x, y) {
        // select all task components inside the container except the component that is currently being dragged
        var draggebleElements = [...container.querySelectorAll('.note-row:not(.dragging)')]

        // Filter child notes of dragg
        draggebleElements = draggebleElements.filter((el) => {
            let parent = findParentBySelector(el, '.note-row')
            return parent ? !(parent.classList.contains('dragging')) : true
        })

        // Compute closest component based on offset
        let AfterElementData = draggebleElements.reduce((closest, child) => {
            var box = child.getBoundingClientRect()
            const offset = y - box.top
            const x_offset = ((box.left*(1.05)) - x)

            // skip child if not within x range
            if (x_offset < 0) {
                let indiType = 'horizontal'
                if (Math.abs(offset) < closest.offset && y < box.bottom) {
                    return { offset: offset, element: child, type: indiType }
                } else {
                    return {...closest, type: indiType}
                }    
            } else {
                let indiType = 'vertical'
                box = child.getBoundingClientRect()
                if(y > box.top && y < box.bottom && !findParentBySelector(child, '.note-row')) return {offset: x_offset, element: child, type: indiType}
                return {...closest, type: indiType}
            }

        }, { offset: Number.POSITIVE_INFINITY, element: null, type: 'horizontal' })

        let indicatorStyle = {childPos: 0}
        if (AfterElementData.element) {
            if (!AfterElementData.element.previousSibling) return [AfterElementData, {childPos: 0}]

            let prevAfterElement = AfterElementData.element.previousSibling.classList.contains('indicator-container') 
                                ? AfterElementData.element.previousSibling.previousSibling
                                : AfterElementData.element.previousSibling
            indicatorStyle = noteChildAnalysis(prevAfterElement, x)
        } else {
            let lastNoteElement = container.lastChild
            if (lastNoteElement === document.querySelector('.indicator-container')) {
                lastNoteElement = lastNoteElement.previousSibling
            } else if (lastNoteElement === document.getElementById(`note-${id}`)) {
                lastNoteElement = lastNoteElement.previousSibling.previousSibling
            }
            indicatorStyle = noteChildAnalysis(lastNoteElement, x)
        }
        
        return [AfterElementData, indicatorStyle]
    }

    function mouseUp(e) {
        var elmnt = document.getElementById(`note-${id}-clone`)

        // Remove Event Handlers
        document.onmousemove = null
        document.onmouseup = null

        // Remove the ghost task component
        elmnt.parentNode.removeChild(elmnt)

        // Reset class list of the dragged component
        var mainElmnt = document.getElementById(`note-${id}`)
        mainElmnt.classList.remove('dragging')

        // The handler argument will be used to update changes to the root note
        let indicatorCont = document.querySelector('.indicator-container')
        let childPos = indicatorCont.querySelectorAll('.extra-child-indicator').length - 1
        let indiContParent = indicatorCont.parentNode
        let indicatorIndx = Array.prototype.indexOf.call(indiContParent.children, indicatorCont)

        if (childPos !== -1) {
            indiContParent = indicatorCont.previousSibling
            for (let i = 0; i < childPos + 1; i++) indiContParent = indiContParent.lastChild.querySelector('.child-note-cont')
            indicatorIndx = indiContParent.children.length
        }

        arrangementHandler(indiContParent, indicatorIndx)
        indicatorCont.remove()
    }

    return mouseDown

}

export { draggableGhostClone, followCursor, displayIndicator, findParentBySelector, getChildContCount, noteChildAnalysis, useDraggableHook }