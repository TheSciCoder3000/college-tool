export function getDocNotes() {
    return [
        {
            id: 'a594726d',
            content: "test",
            insideNote: null
        },
        {
            id: 'd528a56b',
            content: "this is another note with sub text pls ",
            insideNote: [
                {
                    id: 'gh4822g5',
                    content: "this is a sub text",
                    insideNote: [
                        {
                            id: '813gh689',
                            content: "only one child note",
                            insideNote: null
                        }
                    ]
                },
                {
                    id: '56472vh5',
                    content: "does this sub text update",
                    insideNote: [
                        {
                            id: '78vh79ab',
                            content: "sub text inside subtext",
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
                        }
                    ]
                }
            ]
        },
        {
            id: '54g8v621',
            content: "Hope this works",
            insideNote: null
        }
    ]
}
