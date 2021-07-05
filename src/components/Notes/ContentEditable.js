import React, { Component } from 'react'
import ContentEditable from 'react-contenteditable'
import { noteDataContext } from './NoteRow';

export default class NoteContentEditable extends Component {
    constructor(props) {
        super(props);
        this.textRef = React.createRef(this.props.text)
        this.textRef.current = this.props.text
        this.state = {
            keyDown: this.props.keyDown,
            textChange: this.props.onTextChange,
            noteData: this.props.noteData,
            sync: false
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.noteData !== prevState.noteData) {
            return {...prevState, noteData: nextProps.noteData}
        }
        return null
    }

    componentDidUpdate(prevProps) {
        if (this.props.text !== this.textRef.current && this.textRef.current == prevProps.text) {
            this.textRef.current = this.props.text
            this.setState(currState => {
                return { ...currState, sync: true }
            })
        }
    }

    onTextChangeHandler(e) {
        if (e.target.value === '<br>') {
            this.textRef.current = ''
            this.state.textChange("", this.props.path, this.contentEditable)
        } else {
            this.textRef.current = e.target.value
            this.state.textChange(e.target.value, this.props.path, this.contentEditable)
            
        }
    }

    onKeyDownHandler(e) {
        let permittedKeyCodes = [8, 9, 13, 38, 40]
        if (permittedKeyCodes.includes(e.keyCode)){
            this.state.keyDown(e, this.props.indx, this.props.path, this.state.text, this.state.noteData)
        }
    }

    render() {
        return (
            <ContentEditable
                    id={`note-content-${this.props.noteId}`}
                    className="note-content"
                    data-testid={`note-content-${this.props.noteId}`}
                    data-placeholder="type '/' for commands"
                    html={this.textRef.current} 

                    // onSelect={(e) => console.log(document.getSelection())}
                    
                    tagName={'div'}
                    onKeyDown={this.onKeyDownHandler.bind(this)}
                    onChange={this.onTextChangeHandler.bind(this)} />
        )
    }
}
