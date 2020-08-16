import React, {Component} from "react";
import axios from 'axios';
import {connect} from "react-redux";
import {getEditPost} from "../redux/actions/quotesActions";

class EditPage extends Component {
  constructor() {
    super();
    this.state = {
      quote: ''
    };

    this.onSubmit = this.onSubmit.bind(this);
  }



  componentDidMount() {
    //подгрузка поста по айди и передача его в инпут
    axios.get('/quotes/' + this.props.match.params.id)
      .then(response => {
        this.setState({
          quote: response.data.quotes
        })
      })
      .catch(function(error) {
        console.log(error)
      })
  }

  //изменение инпута
  handleChange = (e) => {
    this.setState({
      quote: e.target.value
    })
  };

  onSubmit(e)  {
    e.preventDefault();
    let storageObject = JSON.parse(localStorage.getItem('usertoken'));
    let tokenString = storageObject.token;
    //запись нового объекта для передачи его на бэк и перезаписи
    const obj = {
      quotes: this.state.quote
    };

    this.props.getEditPost(obj, this.props.match.params.id, tokenString);

    this.props.history.push('/quotes');
  }


  render() {
    let {quote} = this.state;
    return (
      <div className="row">
        <div className="col s6 offset-s3">
          <div className="card blue-grey lighten-5">
            <div className="card-content gray-text">
              <span className="card-title">Цитата</span>
              <input type="text" onChange={this.handleChange} value={quote}/>
              <button onClick={this.onSubmit} className="btn  green darken-1">Сохранить</button>

            </div>

          </div>
        </div>
      </div>
    )
  }
};

const mapStateToProps = state => ({
  quotes: state.quotes
});

export default connect(mapStateToProps, {getEditPost})(EditPage);