import React from 'react'
import { render, fireEvent, createEvent, act } from '@testing-library/react'
import { getAllByTestId, prettyDOM, screen } from '@testing-library/dom'
import NoteDoc from '../NoteDoc'
import * as Editable from '../../../assets/js/editable'
import * as NoteContext from '../NoteContext'
import * as NoteData from '../NoteData'

var NoteIdList 
const theNotes = [
    {
        id: 'a594726d',
        content: "1st parent with no child",
        insideNote: null
    },
    {
        id: 'd528a56b',
        content: "2nd parent with child",
        insideNote: [
            {
                id: 'gh4822g5',
                content: "fist child of 2nd parent",
                insideNote: [
                    {
                        id: '813gh689',
                        content: "only child of of first child of 2nd parent",
                        insideNote: null
                    }
                ]
            },
            {
                id: '46dd816a',
                content: "2nd child of 2nd parent",
                insideNote: null
            },
            {
                id: '56472vh5',
                content: "last child of 2nd parent",
                insideNote: [
                    {
                        id: '78vh79ab',
                        content: "first child of last cild of 2nd parent",
                        insideNote: [
                            {
                                id: '725chb46',
                                content: "this is some high level branching you got here",
                                insideNote: null
                            },
                            {
                                id: 'b46ag83a',
                                content: "look what we have here",
                                insideNote: null
                            }
                        ]
                    },
                    {
                        id: 'ag452a47',
                        content: "last child of last child of 2nd parent",
                        insideNote: null
                    },
                ]
            }
        ]
    },
    {
        id: '54g8v621',
        content: "last parent with no child",
        insideNote: null
    }
]


var NestedNoteRow


beforeEach(() => {
    NoteIdList = [['a594726d', false], 
                  ['d528a56b', true], 
                  ['gh4822g5', true], 
                  ['813gh689', false], 
                  ['46dd816a', false], 
                  ['56472vh5', true], 
                  ['78vh79ab', true], 
                  ['725chb46', false], 
                  ['b46ag83a', false], 
                  ['ag452a47', false], 
                  ['54g8v621', false]]
                  
    jest.spyOn(NoteData, 'getDocNotes').mockReturnValue(theNotes)
    NestedNoteRow = render(
        <NoteContext.NoteProvider>
            <NoteDoc />
        </NoteContext.NoteProvider>
    )
    // NestedNoteRow = render(<BtnCont/>)
})

describe('<NoteDoc />', () => {
    it('matches with snapshot', () => {
        expect(NestedNoteRow).toMatchSnapshot()
    })

    // EVENTS
    describe('on Enter Key pressed', () => {
        function triggerEnterOn(noteId, hasChildren) {
            let { getByTestId } = screen
            let NoteRow = getByTestId(`note-content-${noteId}`)
            fireEvent.keyDown(NoteRow, { key: 'Enter', keyCode: 13 })
            let NoteRows = getAllByTestId(document.body, /note-row/)
            NoteRows.forEach(note => {
                if (NoteIdList.some(row => row.includes(note.id.replace('note-', '')))) return
                expect(note.textContent).toBe('')
                let newNoteDOM = !hasChildren ? getByTestId(`note-row-${noteId}`).nextSibling
                                             : getByTestId(`note-child-cont-${noteId}`).firstChild
                expect(newNoteDOM.id).toBe(note.id)
                NoteIdList.push([note.id.replace('note-', ''), false])
            })
        }

        test('add note without text', () => {
            for (let i = 0; i < 10; i++) {
                let randomIdArr = NoteIdList[Math.floor(Math.random()*NoteIdList.length)]
                triggerEnterOn(randomIdArr[0], randomIdArr[1])
            }
        })

        
    })

    
    describe('on Backspace Key pressed', () => {
        const MockSetCaret =  jest.spyOn(Editable, 'setCaret')

        function triggerBackspaceOn(noteId, hasChildren, noteIndx) {
            let { getByTestId } = screen
            jest.useFakeTimers()

            let NoteRow = getByTestId(`note-row-${noteId}`)
            let NoteRowContent = NoteRow.querySelector('.note-content').textContent
            let parentNoteRow = NoteRow.parentNode.parentNode.parentNode
            let previousNoteRow = NoteRow.previousSibling
            
            let isFirstChild = previousNoteRow ? false : true
            let isLastChild = NoteRow.nextSibling ? false : true
            let prevNoteTextAppend = isFirstChild && !isLastChild ? parentNoteRow
                : isLastChild && parentNoteRow.classList.contains('note-row')  ? NoteRow
                : previousNoteRow

            if (!(isFirstChild && !isLastChild) && !(isLastChild && parentNoteRow.classList.contains('note-row')))
                while(prevNoteTextAppend.querySelector('.child-note-cont')) prevNoteTextAppend = prevNoteTextAppend.querySelector('.child-note-cont').lastChild
              
            prevNoteTextAppend = prevNoteTextAppend.querySelector('.note-content').textContent
            fireEvent.keyDown(NoteRow.querySelector('.note-content'), { key: 'Backspace', keyCode: 8})

            jest.runAllTimers()
            // jest.setTimeout(1000)
            // setTimeout(() => {
            expect(Editable.setCaret).toBeCalled()
            // console.log('running test')
            let noteAppendRef

            if (isFirstChild && !isLastChild) {
                noteAppendRef = parentNoteRow
                if (!parentNoteRow.classList.contains('note-row')) return console.log('first child but on root')
                expect(noteAppendRef.querySelector('.note-content')).toHaveFocus()
                // console.log('prev text content:', prettyDOM(prevNoteTextAppend.querySelector('.note-content')))
                // console.log('prev text content:', prevNoteTextAppend)
                // console.log('note content:', NoteRowContent)
                // console.log('currNote content:', noteAppendRef.querySelector('.note-content').textContent)
                expect(noteAppendRef.querySelector('.note-content').textContent).toBe(prevNoteTextAppend+NoteRowContent)

            } else if (isLastChild && parentNoteRow.classList.contains('note-row')) {
                noteAppendRef = getByTestId(`note-row-${noteId}`)
                expect(noteAppendRef.querySelector('.note-content')).toHaveFocus()
                // console.log('prev text content', prevNoteTextAppend)
                // console.log('note content:', NoteRowContent)
                // console.log('currNote content:', noteAppendRef.querySelector('.note-content').textContent)
                expect(noteAppendRef.querySelector('.note-content').textContent).toEqual(NoteRowContent)

            } else {
                noteAppendRef = previousNoteRow
                while (noteAppendRef.querySelector('.child-note-cont')) {
                    noteAppendRef = noteAppendRef.querySelector('.child-note-cont').lastChild
                }
                expect(noteAppendRef.querySelector('.note-content')).toHaveFocus()
                // console.log('prev text content', prevNoteTextAppend)
                // console.log('note content:', NoteRowContent)
                // console.log('currNote content:', noteAppendRef.querySelector('.note-content').textContent)
                expect(noteAppendRef.querySelector('.note-content').textContent).toBe(prevNoteTextAppend+NoteRowContent)
            }
                
            // }, 10)
            
        }

        test('remove note', () => {
            for (let i = 0; i < 11; i++) {
                let randArrIndx = Math.floor(Math.random()*NoteIdList.length)
                let randomIdArr = NoteIdList[randArrIndx]
                console.log('arr: ', randomIdArr, ' iteration: ', i)
                triggerBackspaceOn(randomIdArr[0], randomIdArr[1], randArrIndx)
                NoteIdList.splice(randArrIndx, 1)
            }
        })
    })

    
    
})