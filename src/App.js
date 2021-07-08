import './assets/css/app.css'
import './components/fontAwesome/index'
import AppBar from './components/AppBar'

import DashRoute from './components/Routes/DashRoute';

// import Notes from './components/note_taking/Notes';
import RevNotes from './components/Notes/Note'

import CalendarViewer from './components/calendar/CalendarViewer';
import TaskPanel from './components/calendar/TaskPanel';
import background from './assets/img/dashBackground.jpg';

import { Route, Switch, Redirect, useLocation } from "react-router-dom";
import { useReducer, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';


const routeVariant = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1, 
    transition: { type: 'linear', duration: 2 }
  },
  exit: {
    opacity: 0,
    transition: { ease: 'easeOut', duration: 2 }
  }
}

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



function App() {
  const location = useLocation()
  console.log(location)
  const [ShowAppBar, setShowAppBar] = useState(location.pathname === '/dashboard' ? false : true)
  console.log('appbar', ShowAppBar)
  useEffect(() => {
    if (location.pathname === '/dashboard') setShowAppBar(false)
    else setTimeout(() => {
      setShowAppBar(true)
    }, 800);
  }, [location])
  return (
    <>
      <div className="App"
        style={{ backgroundImage: `url(${background})` }}>
        <div id="menu-bar-cont" className="menu-bar"></div>
        <div className="app-content">
          <AnimatePresence>
            {ShowAppBar && (<AppBar />)}
          </AnimatePresence>
          <AnimatePresence exitBeforeEnter>
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
