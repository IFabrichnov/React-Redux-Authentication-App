import React, {Component} from 'react';
import {BrowserRouter as Router, Redirect, Route, Switch} from "react-router-dom";
import 'materialize-css';
import AuthPage from "./pages/AuthPage";
import QuotesPage from "./pages/QuotesPage";
import {connect} from "react-redux";
import EditPage from "./components/EditPage";

class App extends Component {


  render() {
    const {isAuthenticated} = this.props.auth;
    return (

      <Router>
        <div className="container">
          <Switch>
            <Route path="/" exact render={(props) => {
              return <AuthPage/>
            }}/>

            <Route path="/quotes" render={(props) => {
              return isAuthenticated ?
                <QuotesPage/> :
                <Redirect to="/"/>
            }}/>

            <Route path="/quote/:id" render={(props) => {
              return isAuthenticated ?
                <EditPage {...props} /> :
                <Redirect to="/"/>
            }}/>
          </Switch>
        </div>
      </Router>

    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth
});

export default connect(mapStateToProps)(App);
