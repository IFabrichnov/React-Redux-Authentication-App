import React, {Component} from 'react';
import {connect} from "react-redux";
import {getNewPost} from "../redux/actions/quotesActions";


class Input extends Component {

  state = {
    quotes: ""
  };


  //добавление сообщения
  addMessage = () => {
    const storageObject = JSON.parse(localStorage.getItem('usertoken'));
    const tokenString = storageObject.token;
    const newMessage = {quotes: this.state.quotes};

    if (newMessage.quotes && newMessage.quotes.length > 0) {

      //добавление нового сообщ
      this.props.getNewPost(newMessage, tokenString);
      //перерисовка после нового поста
      this.props.getUserQuotes(tokenString);
      this.setState({quotes: ""})
    } else {
      console.log('Поле не должно быть пустым')
    }
  };

  //изменение инпута
  handleChange = (e) => {
    this.setState({
      quotes: e.target.value
    })
  };

  render() {
    let {quotes} = this.state;
    return (
      <div>
        <input type="text" onChange={this.handleChange} value={quotes}/>
        <button onClick={this.addMessage} className="btn  green darken-1">Отправить</button>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  quotes: state.quotes
});

export default connect(mapStateToProps, {getNewPost})(Input);