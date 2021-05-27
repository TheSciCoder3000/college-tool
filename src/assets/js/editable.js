const placeCaretAtEnd = (el) => {
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

export { placeCaretAtEnd }