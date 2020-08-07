import React, {Component} from "react";
import Input from "../components/Input";
import QuotesList from "../components/QuotesList";
import {withRouter} from "react-router-dom";
import {logoutUser} from "../redux/actions/authActions";
import {connect} from "react-redux";
import {getUserName, getUserQuotes} from "../redux/actions/quotesActions";

class QuotesPage extends Component {

  state = {
    quotes: [],
    name: ''
  };

  componentDidMount() {
    let storageObject = JSON.parse(localStorage.getItem('usertoken'));
    let tokenString = storageObject.token;

    // использую экшнкреейторы для получения постов и имени (эмейла)
    //передаю в них токен, чтобы в экшенкреейторах поместить его в header
    this.props.getUserQuotes(tokenString);
    this.props.getUserName(tokenString);
  }

  //хэндлер выхода
  onLogout(e) {
    e.preventDefault();
    this.props.logoutUser(this.props.history);
  }


  render() {

    const {name, quotes} = this.props.quotes;

    return (
      <div className="row">
        <div className="col s6 offset-s3">
          <div className="card blue-grey lighten-5">
            <div className="card-content gray-text">
              <span>Пользователь: {name}</span>
              <span className="card-title">Цитаты</span>
              <Input getUserQuotes={this.props.getUserQuotes}/>
              <QuotesList messages={quotes}/>

              <button onClick={this.onLogout.bind(this)} className="btn light-blue darken-3">Выход</button>
            </div>

          </div>
        </div>
      </div>
    )
  }
};

const mapStateToProps = state => ({
  auth: state.auth,
  quotes: state.quotes
});

export default connect(mapStateToProps, {logoutUser, getUserName, getUserQuotes})(withRouter(QuotesPage));