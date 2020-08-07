import React, {Component} from "react";
import axios from 'axios';

class EditPage extends Component {
  state = {
    quote: ''
  };

  componentDidMount() {

    axios.get('/'+ this.props.match.params.id)
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

  onSubmit(e) {
    e.preventDefault();
    debugger
    const obj = {
      quote: this.state.quote
    };

    axios.post('/quote/'+this.props.match.params.id, obj)
      .then(res => console.log(res.data));

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

export default EditPage;