import React, {Component} from 'react';
import {connect} from "react-redux";
import {Link, withRouter} from "react-router-dom";
import {getUserQuotes} from "../redux/actions/quotesActions";

//вывод цитат: если сообщение есть, то мапим в li, если нет то выводим текст НЕТ цитат
class QuotesList extends Component {

  render() {
    const {user} = this.props.auth;
    const userParse = JSON.parse(user);
    const userId = userParse.userId;

    const {quotes} = this.props.quotes;
    return (
      <ul>
        {
          quotes &&
          quotes.length > 0 ?
            (
              quotes.map(messages => {

                return (
                  <li key={messages._id}>{messages.quotes}

                  {(userId === messages.userId) ?
                    <Link className='edit-button' to={"/quote/"+ messages._id}>Edit</Link> : <p></p>}</li>
                )
              })
            )
            :
            (
              <li>No messages</li>
            )
        }
      </ul>
    )
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  quotes: state.quotes
});

export default connect(mapStateToProps, {getUserQuotes})(withRouter(QuotesList));