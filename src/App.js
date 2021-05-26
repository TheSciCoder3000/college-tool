import './assets/css/app.css'
import './components/fontAwesome/index'
import AppBar from './components/AppBar'

import Viewer from './components/dashboard/viewer'
import SidePanel from './components/dashboard/SidePanel'

import Notes from './components/note_taking/Notes'

import CalendarViewer from './components/calendar/CalendarViewer'
import TaskPanel from './components/calendar/TaskPanel'
import background from './assets/img/dashBackground.jpg'
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";

function DashboardRoute() {
  return(
    <>
      {/* tool viewer*/}
      <Viewer />

      {/* side panel */}
      <SidePanel />
    </>
  )
}

function CalendarRoute() {
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
  return(
    <>
      <Notes />
    </>
  )
}

function App() {
  return (
    <HashRouter>
      <div className="App"
        style={{ backgroundImage: `url(${background})` }}>
        <div className="menu-bar"></div>
        <div className="app-content">
          <AppBar />
          <Switch>
            <Route exact path="/">
              <Redirect to="/dashboard"/>
            </Route>
            <Route exact path="/dashboard" component={DashboardRoute}/>
            <Route exact path="/Notes" component={NotesRoute}/>
            <Route exact path="/Calendar" component={CalendarRoute}/>
          </Switch>
        </div>
      </div>
    </HashRouter>
  );
}

export default App;
