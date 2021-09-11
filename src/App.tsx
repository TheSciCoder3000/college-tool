import './assets/css/app.css'
import './components/fontAwesome/index'
import AppBar from './components/AppBar'

import DashRoute from './components/Routes/DashRoute';

// import Notes from './components/note_taking/Notes';
import RevNotes from './components/Notes'

import CalendarViewer from './components/calendar/CalendarViewer';
import TaskPanel from './components/calendar/TaskPanel';
import background from './assets/img/dashBackground.jpg';

import { Route, Switch, Redirect, useLocation } from "react-router-dom";
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppBarVariants } from './AnimationVariants';

import { useDispatch } from 'react-redux';
import { InitializeReduxStoreStates } from './redux';


function CalendarRoute() {
  document.onkeydown = null
  return(
    <>
      {/* tool viewer*/}
      <CalendarViewer />

      {/* side panel */}
      <TaskPanel />
    </>
  )
}

function NotesRoute() {
  document.onkeydown = null
  return(
    <>
      {/* <Notes /> */}
      <RevNotes />
    </>
  )
}


// =================================================== App Component ===================================================
function App() {
  const dispatch = useDispatch()
  // initalize redux state on render
  useEffect(() => InitializeReduxStoreStates(dispatch), [])

  const location = useLocation()
  const [ShowAppBar, setShowAppBar] = useState(location.pathname === '/dashboard' ? false : true)
  useEffect(() => {
    if (location.pathname === '/dashboard') setShowAppBar(false)
  }, [location.pathname])
  

  const SetShowAppBarHandler = () => {
    let pathStrings = ['/', '/dashboard']
    if (!pathStrings.includes(location.pathname)) setShowAppBar(true)
  }

  return (
    <>
      <div className="App"
        style={{ backgroundImage: `url(${background})` }}>
        <AnimatePresence>
          {ShowAppBar && (
            <motion.div id="menu-bar-cont" className="menu-bar" 
              variants={AppBarVariants.MenuBar}
              initial='hidden'
              animate='visible'
              exit='exit'
            />
          )}
        </AnimatePresence>

        <div className="app-content">
          <AnimatePresence>
            {ShowAppBar && (<AppBar />)}
          </AnimatePresence>

          <AnimatePresence
            exitBeforeEnter
            onExitComplete={SetShowAppBarHandler}
          >
            <Switch location={location} key={location.pathname} >
              <Route exact path="/">
                <Redirect to="/dashboard"/>
              </Route>

              <Route exact path="/dashboard">
                <DashRoute />
              </Route>

              <Route exact path="/Notes">
                <NotesRoute />
              </Route>
              
              <Route exact path="/Calendar">
                <CalendarRoute />
              </Route>
            </Switch>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

export default App;
