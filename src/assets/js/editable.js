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
  if (el.textContent !== '') {
    var range = document.createRange();
    var sel = window.getSelection();
    range.setStart(el.childNodes[0], caretPos);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }
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


function createRange(node, chars, range) {
  if (!range) {
      range = document.createRange()
      range.selectNode(node);
      range.setStart(node, 0);
  }

  if (chars.count === 0) {
      range.setEnd(node, chars.count);
  } else if (node && chars.count >0) {
      if (node.nodeType === Node.TEXT_NODE) {
          if (node.textContent.length < chars.count) {
              chars.count -= node.textContent.length;
          } else {
              range.setEnd(node, chars.count);
              chars.count = 0;
          }
      } else {
         for (var lp = 0; lp < node.childNodes.length; lp++) {
              range = createRange(node.childNodes[lp], chars, range);

              if (chars.count === 0) {
                  break;
              }
          }
      }
  } 

  return range;
};

export function setCurrentCursorPosition(contendEditableEl, chars) {
  if (chars >= 0) {
      var selection = window.getSelection();

      let range = createRange(contendEditableEl, { count: chars });

      if (range) {
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
      }
  }
};


export function extractHTMLContentFromStartToCaret(contendEditableEl, chars) {
  if (chars >= 0) {
      var selection = window.getSelection();

      let range = createRange(contendEditableEl, { count: chars });

      if (range) {
          selection.removeAllRanges();
          selection.addRange(range);
          let docFrag = range.extractContents()
          let tempDiv = document.createElement('div')
          tempDiv.append(docFrag)
          return tempDiv.innerHTML
      }
  }
};



export function extractHTMLContentFromCaretToEnd(contendEditableEl, chars) {
  function createRangeToEnd(node, chars, range) {
    if (!range) {
        range = document.createRange()
        range.selectNode(node)
        let endNode = node
        while (endNode.nodeType !== Node.TEXT_NODE) endNode = endNode.lastChild
        range.setEnd(endNode, endNode.length)
    }
    if (chars.count === 0) {
        range.setStart(node, chars.count);
    } else if (node && chars.count >0) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (node.textContent.length < chars.count) {
                chars.count -= node.textContent.length;
            } else {
                range.setStart(node, chars.count);
                chars.count = 0;
            }
        } else {
           for (var lp = 0; lp < node.childNodes.length; lp++) {
                range = createRangeToEnd(node.childNodes[lp], chars, range);

                if (chars.count === 0) {
                    break;
                }
            }
        }
    } 


    return range;
  }

  if (chars >= 0) {
    var selection = window.getSelection();

    let range = createRangeToEnd(contendEditableEl, { count: chars });

    if (range) {
        selection.removeAllRanges();
        selection.addRange(range);
        let docFrag = range.extractContents()
        let tempDiv = document.createElement('div')
        tempDiv.append(docFrag)
        return tempDiv.innerHTML
    }
  }
}



function isChildOf(node, parentId) {
  while (node !== null) {
      if (node.id === parentId) {
          return true;
      }
      node = node.parentNode;
  }

  return false;
};

export function getCurrentCursorPosition(parentId) {
  var selection = window.getSelection(),
      charCount = -1,
      node;

  if (selection.focusNode) {
      if (isChildOf(selection.focusNode, parentId)) {
          node = selection.focusNode; 
          charCount = selection.focusOffset;

          while (node) {
              if (node.id === parentId) {
                  break;
              }

              if (node.previousSibling) {
                  node = node.previousSibling;
                  charCount += node.textContent.length;
              } else {
                   node = node.parentNode;
                   if (node === null) {
                       break
                   }
              }
         }
    }
 }

  return charCount;
};


export { placeCaretAtEnd, getLastOfLastNoteChild, setCaret, getCaretPosition, setNestedDict, getNestedDict, getAndInsertDict }