
import { withRouter, Switch, Route, Redirect } from 'react-router-dom';
import React, { Component } from 'react';
import Home from '../Home/Home';
import Courses from '../Courses/Courses';
import Help from '../Help/Help';
import Navbar from '../Navbar/Navbar';
import Settings from '../Settings/Settings';
import About from '../About/About';

export default class LoggedIn extends Component {
   constructor(props) {
      super(props);
      console.log(this.props);
      if (!this.props.User.isLoggedIn) {
         console.log('User is not logged in; sending to /login')
         this.props.history.push("/login")
      }
   }

   render() {
      return (
         <div>
            <Navbar {...this.props} />

            <Switch>
               <Route exact path="/home" component={Home} />
               <Route exact path="/courses" component={Courses} />
               <Route exact path="/help" component={Help} />
               <Route exact path="/settings" component={Settings} />
               <Route exact path="/about" component={About} />
            </Switch>

         </div>

      )

   }
}
