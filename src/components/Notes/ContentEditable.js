import React, { Component } from 'react'
import ContentEditable from 'react-contenteditable'
import { noteDataContext } from './NoteRow';

export default class NoteContentEditable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: this.props.text,
            keyDown: this.props.keyDown,
            textChange: this.props.onTextChange,
            noteData: this.props.noteData
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.text !== prevState.text) {
            console.log('text change')
            return({...prevState, text: nextProps.text})
        }
        if (nextProps.noteData !== prevState.noteData) {
            return {...prevState, noteData: nextProps.noteData}
        }
        return null
    }

    onTextChangeHandler(e) {
        console.log('onChange', this.contentEditable)
        if (e.target.value === '<br>') {
            this.setState({...this.state, text: ""})
            this.state.textChange("", this.props.path, this.contentEditable)
        } else {
            this.setState({...this.state, text: e.target.value})
            this.state.textChange(e.target.value, this.props.path, this.contentEditable)
        }
    }

    onKeyDownHandler(e) {
        this.state.keyDown(e, this.props.indx, this.props.path, this.state.text, this.state.noteData)
    }

    render() {
        return (
            <ContentEditable
                    id={`note-content-${this.props.noteId}`}
                    className="note-content"
                    data-testid={`note-content-${this.props.noteId}`}
                    data-placeholder="type '/' for commands"
                    html={this.state.text} 

                    onChange={this.onTextChangeHandler.bind(this)}
                    onKeyDown={this.onKeyDownHandler.bind(this)} />
        )
    }
}
