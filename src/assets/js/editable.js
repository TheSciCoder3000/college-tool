function placeCaretAtEnd(el) {
    if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
        var range = document.createRange()
        range.selectNodeContents(el)
        range.collapse(false)
        var sel = window.getSelection()
        sel.removeAllRanges()
        sel.addRange(range)
    } else if (typeof document.body.createdTextRange != "undefined") {
        var textRange = document.body.createdTextRange()
        textRange.moveToElementText(el)
        textRange.collapse(false)
        textRange.select()
    }
}

function getCaretPosition(editableDiv) {
  var caretPos = 0,
    sel, range;
  if (window.getSelection) {
    sel = window.getSelection();
    if (sel.rangeCount) {
      range = sel.getRangeAt(0);
      if (range.commonAncestorContainer.parentNode === editableDiv) {
        caretPos = range.endOffset;
      }
    }
  } else if (document.selection && document.selection.createRange) {
    range = document.selection.createRange();
    if (range.parentElement() === editableDiv) {
      var tempEl = document.createElement("span");
      editableDiv.insertBefore(tempEl, editableDiv.firstChild);
      var tempRange = range.duplicate();
      tempRange.moveToElementText(tempEl);
      tempRange.setEndPoint("EndToEnd", range);
      caretPos = tempRange.text.length;
    }
  }
  return caretPos;
}

function setCaret(el, caretPos) {
  var range = document.createRange();
  var sel = window.getSelection();
  range.setStart(el.childNodes[0], caretPos);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
  el.focus();
}

function getLastOfLastNoteChild(note) {
    let childCont = note.querySelector('.child-note-cont')
    if (!childCont) return note
    
    while (childCont.querySelector('.child-note-cont')) childCont = childCont.querySelector('.child-note-cont').lastChild
    return childCont
}

function setNestedDict(notes, parents, propName, newText) {
  // Initialize variables
  let noteCopy = [...notes]
  let parentLen = parents.length
  let schema = noteCopy

  // Loop through parent notes until reaching curr note
  for (let i = 0; i < parentLen; i++) {
    let temp = schema.find(note => note.id === parents[i]) 
    schema = i !== parentLen-1 ? temp.insideNote : temp
  }

  if (parentLen === 0) return newText

  // set note property to new value
  schema[propName] = newText

  // return the the noteCopy
  return noteCopy
}

function getNestedDict(notes, parents, propName) {
  // Initialize variables
  let noteCopy = [...notes]
  let parentLen = parents.length
  let schema = noteCopy

  // Loop through parent notes until reaching curr note
  for (let i = 0; i < parentLen; i++) {
    let temp = schema.find(note => note.id === parents[i]) 
    schema = i !== parentLen-1 ? temp.insideNote : temp
  }
  if (parentLen === 0) return schema

  // return the the noteCopy
  return schema[propName]
}

function getAndInsertDict(notes, action, propName) {
  let noteCopy = [...notes]
  let parentLen = action.data.path.length
  let schema = noteCopy

  // Loop through parent notes until reaching curr note
  for (let i = 0; i < parentLen; i++) {
    let temp = schema.find(note => note.id === action.data.path[i]) 
    schema = i !== parentLen-1 ? temp.insideNote : temp
  }
  if (parentLen === 0) return schema

  schema[propName].splice(action.data.indx, 0, {
    id: Math.random().toString(16).slice(-8),
    content: "",
    insideNote: null
  })

  // return the the noteCopy
  return schema[propName]

}

export { placeCaretAtEnd, getLastOfLastNoteChild, setCaret, getCaretPosition, setNestedDict, getNestedDict, getAndInsertDict }