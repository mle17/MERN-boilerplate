
import './Navbar.css';
import React, { Component } from 'react';
import {DropdownButton, MenuItem} from 'react-bootstrap';
import { Link } from 'react-router-dom';

class Main extends Component {

   constructor(props) {
      super(props);
   }

   logout() {
      console.log(this.props);
      this.props.logout(() => this.props.history.push('/login'));
   }
   
   renderNotLoggedIn() {
      return (
         <nav className="navbar">
            <Link to={'/login'}>
               <div>Login</div>
            </Link>
         </nav>
      );
   }
   
   renderLoggedIn() {
      console.log("PROPS:", this.props);
      let loggedInDisplayName =
         <div className="navbar-el display-name">{this.props.User.info.email} &nbsp;
            <a href="" onClick={() => this.logout()}>
               Logout
            </a>
         </div>;
         
      return (
         <nav className="navbar">
            <div className="navbar-left">
               <Link to={'/home'} className={this.props.location.pathname.includes('/home') ? 'active navbar-el': 'navbar-el'}>
                  <div>Home</div>
               </Link>

               <Link to={'/courses'} className={this.props.location.pathname.includes('/courses') ? 'active navbar-el': 'navbar-el'}>
                  <div>Course Sections</div>
               </Link>

               <Link to={'/help'} className={this.props.location.pathname.includes('/help') ? 'active navbar-el': 'navbar-el'}>
                  <div>Help</div>
               </Link>

               <Link to={'/settings'} className={this.props.location.pathname.includes('/settings') ? 'active navbar-el': 'navbar-el'}>
                  <div>Settings</div>
               </Link>

               <Link to={'/about'} className={this.props.location.pathname.includes('/about') ? 'active navbar-el': 'navbar-el'}>
                  <div>About</div>
               </Link>
            </div>

            <div className="navbar-right">
               {loggedInDisplayName}
            </div>
         </nav>
      );
   }
   
   renderNavbar() {
      if (this.props.User.isLoggedIn)
         return this.renderLoggedIn();
      else
         return this.renderNotLoggedIn();
   }

   render() {
      return (
         <div>{this.renderNavbar()}</div>
      )
   }
}

export default Main

