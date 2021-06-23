import React, { Component } from 'react'
import ContentEditable from 'react-contenteditable'

export default class NoteContentEditable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: this.props.text,
            keyDown: this.props.keyDown,
            textChange: this.props.onTextChange
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.text !== prevState.text) {
            return({...prevState, text: nextProps.text})
        }
        return null
    }

    onTextChangeHandler(e) {
        this.setState({...this.state, text: e.target.value})
        this.state.textChange(e.target.value, this.props.path, this.contentEditable)
    }

    onKeyDownHandler(e) {
        this.state.keyDown(e, this.props.indx, this.props.path, this.state.text)
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
