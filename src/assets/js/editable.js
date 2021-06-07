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

function setNoteDictionaryItem(NoteDict, ItemKey, ItemValue, NewItemValue) {

}

function getLastOfLastNoteChild(note) {
    let childCont = note.querySelector('.child-note-cont')
    if (!childCont) return note
    
    while (childCont.querySelector('.child-note-cont')) childCont = childCont.querySelector('.child-note-cont').lastChild
    return childCont
}

export { placeCaretAtEnd, getLastOfLastNoteChild }