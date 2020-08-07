import React, {Component} from "react";
import {loginUser, registerUser} from "../redux/actions/authActions";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";

class AuthPage extends Component {

  constructor() {
    super();
    this.state = {
      email: '',
      password: '',
      errors: {}
    };
    this.onChange = this.onChange.bind(this);
    this.onRegisterHandler = this.onRegisterHandler.bind(this);
    this.onLoginHandler = this.onLoginHandler.bind(this);
  }

  //изменение инпутов
  onChange(e) {
    this.setState({[e.target.name]: e.target.value})
  }

  //хэндлер реистрации
  onRegisterHandler(e) {
    e.preventDefault();
    //запись нового юзера с данными из инпутов
    const user = {
      email: this.state.email,
      password: this.state.password
    };

    //использование экшена и передача в него данных
    this.props.registerUser(user);
    //очистка инпутов
    this.setState({email:'', password: ''})
  };

  //хэндлер логина
  onLoginHandler(e) {
    e.preventDefault();

    const user = {
      email: this.state.email,
      password: this.state.password
    };

    this.props.loginUser(user);

  };

  componentDidMount() {
    if(this.props.auth.isAuthenticated) {
      this.props.history.push('/quotes');
    }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.auth.isAuthenticated) {
      this.props.history.push('/quotes');
    }
  }

  render() {
    return (
      <div className="row">
        <div className="col s6 offset-s3">
          <h3>Login и Register</h3>
          <div className="card blue-grey lighten-5">
            <div className="card-content gray-text">
              <span className="card-title">Авторизация</span>
              <div>
                <div className="input-field">
                  <input
                         id="email"
                         type="text"
                         name="email"
                         onChange={this.onChange}
                         value={this.state.email}

                  />
                  <label htmlFor="email">Email</label>
                </div>

                <div className="input-field">
                  <input
                    variant="contained"
                         id="password"
                         type="password"
                         name="password"
                         onChange={this.onChange}
                         value={this.state.password}

                  />
                  <label htmlFor="password">Пароль</label>
                </div>

              </div>
            </div>
            <div className="card-action">
              <button  onClick={this.onLoginHandler}  className="btn  green darken-1" style={{marginRight: 30}}>Войти</button>
              <button  onClick={this.onRegisterHandler} className="btn light-blue darken-3">Регистрация</button>
            </div>
          </div>
        </div>
      </div>
    )
  }
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps, {registerUser, loginUser})(withRouter(AuthPage));