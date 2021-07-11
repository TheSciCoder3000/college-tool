const AppBarTransition = { type: 'linear', duration: 0.4, delay: 0.45 }
export const AppBarVariants = {
    NavBar: {
        hidden: { x: '-5rem' },
        visible: { x: 0, transition: AppBarTransition },
        exit: { x: '-5rem', transition: { ease: 'easeOut' } }
    },
    MenuBar: {
        hidden: { y: '-5rem' },
        visible: { y: 0, transition: AppBarTransition },
        exit: { y: '-5rem', transition: { ease: 'easeOut' } }
    }
}



// ========================= Dashboard =========================
export const DashboardVariants = {
    Viewer: {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0, transition: { duration: 1 } }
    },
    SidePanel: {
        hidden: { x: '20rem' },
        visible: { x: 0, transition: {
            type: 'linear',
            duration: 0.5,
            delay: 0.5
        } },
        exit: { x: '20rem', transition: {
            ease: 'easeIn',
            duration: 0.2,
            delay: 0.25
        } }
    }
}


// ========================= Notes =========================
export const NotesVariants = {
    Window: {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: {
            type: 'linear',
            duration: 0.5,
            delay: 1.3,
            when: 'afterChildren'
        } },
        exit: { opacity: 0, transition: { ease: 'easeOut' } }
    },
    FolderTree: {
        hidden: { x: '100vw' },
        visible: { x: 0, transition: {
            type: 'linear',
            ease: 'easeOut',
            duration: 1
        } },
        exit: { x: '100vw', transition: { ease: 'easeIn' } }
    }
}