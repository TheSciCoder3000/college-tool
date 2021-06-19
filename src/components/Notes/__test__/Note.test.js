import React from 'react'
import { render, fireEvent, createEvent } from '@testing-library/react'
import { getAllByTestId, prettyDOM, screen } from '@testing-library/dom'
import NoteDoc from '../NoteDoc'
import * as NoteContext from '../NoteContext'
import * as NoteData from '../NoteData'

var NoteIdList = ['a594726d', 'd528a56b', 'gh4822g5', '813gh689', '46dd816a', '56472vh5', '78vh79ab', '725chb46', 'b46ag83a', '725chb46', '54g8v621']
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
                        id: '725chb46',
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

const NoteIds = {
    firstNote: 'a594726d', 
    SecondNote: 'd528a56b',
    LastNote: '54g8v621'
}

var NestedNoteRow

beforeEach(() => {
    jest.spyOn(NoteData, 'getDocNotes').mockReturnValue(theNotes)
    NestedNoteRow = render(
        <NoteContext.NoteProvider>
            <NoteDoc />
        </NoteContext.NoteProvider>
    )
    // NestedNoteRow = render(<BtnCont/>)
})

describe('<NoteRow />', () => {
    it('matches with snapshot', () => {
        expect(NestedNoteRow).toMatchSnapshot()
    })

    // EVENTS
    describe('on Enter Key pressed', () => {
        let { getByTestId } = screen
        let NoteRow

        function triggerEnteron(noteId) {
            NoteRow = getByTestId(`note-content-${noteId}`)
            fireEvent.keyDown(NoteRow, { key: 'Enter', keyCode: 13 })
            return getAllByTestId(document.body, /note-row/)
        }

        it('creates new note after 1st note', () => {
            let NoteRows = triggerEnteron(NoteIds.firstNote)
            NoteRows.forEach(note => {
                if (NoteIdList.includes(note.id.replace('note-', ''))) return
                expect(note.textContent).toBe('')
                expect(getByTestId('note-doc').children.item(1).id).toBe(note.id)
                NoteIdList.push(note.id.replace('note-', ''))
            })

        })
        it('creates new note inside the 2nd parent note', () => {
            let NoteRows = triggerEnteron(NoteIds.SecondNote)
            NoteRows.forEach(note => {
                if (NoteIdList.includes(note.id.replace('note-', ''))) return
                expect(note.textContent).toBe('')
                expect(getByTestId(`note-child-cont-${NoteIds.SecondNote}`).children.item(0).id).toBe(note.id)
                NoteIdList.push(note.id.replace('note-', ''))
            })

        })
        it('creates new note after the last parent note', () => {
            let NoteRows = triggerEnteron(NoteIds.LastNote)
            NoteRows.forEach(note => {
                if (NoteIdList.includes(note.id.replace('note-', ''))) return
                expect(note.textContent).toBe('')
                expect(getByTestId(`note-doc`).children.item(3).id).toBe(note.id)
                NoteIdList.push(note.id.replace('note-', ''))
            })

        })
        
    })
})