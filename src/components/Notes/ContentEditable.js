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

    onTextChangeHandler(e) {
        this.state.text = e.target.value
        this.state.textChange(e.target.value)
    }

    render() {
        return (
            <ContentEditable
                    className="note-content"
                    data-placeholder="type '/' for commands"
                    html={this.state.text} 

                    onChange={this.onTextChangeHandler.bind(this)}
                    onKeyDown={this.state.keyDown} />
        )
    }
}
