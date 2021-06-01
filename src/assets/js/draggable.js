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
        console.log('adding child indicator')
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
        if(a[i] == b) return true;
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

        console.log({element: child.lastChild, childPos: childIndx+1, offset: offset})

        if (offset > 0 && offset < result.offset) return {element: child.lastChild, childPos: childIndx+1, offset: offset}
        return result

    }, {element: parentNote, childPos: 0, offset: Number.POSITIVE_INFINITY})
}

export { draggableGhostClone, followCursor, displayIndicator, findParentBySelector, getChildContCount, noteChildAnalysis }