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

const displayIndicator = (container, afterElement, x) => {
    // Display insert indicator
    console.log(afterElement)
    const indiContainer = document.createElement('DIV')
    indiContainer.classList.add('indicator-container')

    const indicator = document.createElement('DIV')
    indicator.classList.add('indicator')
    indiContainer.appendChild(indicator)

    let indiExist = document.querySelector('.indicator-container')
    if (indiExist) indiExist.remove()

    if (afterElement.element) {
        container.insertBefore(indiContainer, afterElement.element)
    } else {
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

function noteChildAnalysis(parentNote) {
    return [...document.querySelectorAll('.child-note-cont')].reduce((test, child) => {
        return [...test, {
            element: child.lastChild, 
            offset: child.getBoundingClientRect().left
        }]
    }, [])
}

export { draggableGhostClone, followCursor, displayIndicator, findParentBySelector, getChildContCount, noteChildAnalysis }