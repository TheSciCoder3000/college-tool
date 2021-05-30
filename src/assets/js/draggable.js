const draggableGhostClone = (e, taskElmnt, pos) => {
    e = e || window.event
    e.preventDefault()

    // create clone
    var element = taskElmnt // document.getElementById(`task-${task.id}`)
    element.classList.add('dragging')

    var ghost = element.cloneNode(true)
    ghost.style.position = 'absolute'                   // Set position absolute to overlay
    ghost.style.width = `${element.offsetWidth}px`      // Set fixed width
    ghost.style.top = `${element.offsetTop}px`                      // set X and Y to overlay directly above the task component
    ghost.style.left = `${element.offsetLeft}px`
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

const displayIndicator = (container, afterElement) => {
    // Display insert indicator
    const indiContainer = document.createElement('DIV')
    indiContainer.classList.add('indicator-container')

    const indicator = document.createElement('DIV')
    indicator.classList.add('indicator')
    indiContainer.appendChild(indicator)

    if (afterElement.element) {
        let indiExist = document.querySelector('.indicator-container')
        if (indiExist) indiExist.remove()
        container.insertBefore(indiContainer, afterElement.element)
    } else {
        container.appendChild(indiContainer)
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

export { draggableGhostClone, followCursor, displayIndicator, findParentBySelector }