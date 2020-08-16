# Приложение регистрации, авторизации и отправки сообщений (React, Redux)

![1](https://github.com/IFabrichnov/React-Redux-Authentication-App/raw/master/README-IMG/1.gif)

## Пакет package.json

Приложение использует пакеты: **expressjs, mongoose, axios, react, redux, bcrypt-nodejs.** 


## Настройка приложения

**index.js** - файл, в котором подключены все пакеты, включая сервер и базу данных MongoDB.

```javascript
const express = require('express');
const config = require('config');
const mongoose = require('mongoose');

const app = express();
const PORT = config.get('port') || 5000;

//для чтения json
app.use(express.json({extended: true}));

//регистрация роутов
app.use('/', require('./routes/auth'));

async function start() {
  try {
    //подключаемся к БД
    await mongoose.connect(config.get('mongoURi'), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });
    //после того как подлключились к БД, подключаем сервер
    app.listen(PORT, () => console.log(`App has been started on port ${PORT}...`));
  } catch (e) {
    console.log('Server Error', e.message);
    process.exit(1);
  }
}

start();

```

Теперь приложение прослушивает порт 5000. 


## База данных 

Регистрируюсь на **MongoDB**, создаю базу данных для приложения, помещаю uri в файл db.jd (своего рода конфиг), куда помещаю еще и port.
```javascript
module.exports = {
"port": 5000,
"mongoURi": "mongodb+srv://ivan@cluster0.fixsz.azure.mongodb.net/fullstack?retryWrites=true&w=majority"
};
```

## Роуты (routes/auth.js)

Приложение имеет следующие маршруты:
1) Домашняя страница (/)
2) Страница логина (/login)
3) Страница регистрации (/register)
4) Страница отправки сообщений (/quotes)

Создаю файл **auth.js** в котором находятся все роуты и рендеринг страниц.

Пояснения к каждому роуту присутствуют в комментариях.


```javascript

// /register
router.post('/register',
  //проверка валидации
  [
    check('email', 'Некорректный email').isEmail(),
    check('password', 'Минимальная длина 6 символов')
      .isLength({min: 6})
  ],
  async (req, res) => {

    try {
      //обработка валидации
      //таким образом экспресс валидатор как раз валидирует входящие поля
      const errors = validationResult(req);
      //если объект error не пустой,то сразу возвращаем на фронтенд
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Некорректные данные при регистрации'
        })
      }

      //получаем поля email и pass из request body
      const {email, password} = req.body;
      //проверка, если уже есть такой email, то будет ошибка
      //проверка на уникальность по почте
      const candidate = await User.findOne({email: email});
      //если такой уже есть, то выдаем данное сообщение и возвращаем
      if (candidate) {
        return res.status(400).json({message: 'Такой пользователь уже существует'})
      }

      //с помощью библиотеки bcryptjs хэшируем пароли и сравниваем
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({email: email, password: hashedPassword});

      await user.save();

      res.status(201).json({message: 'Пользователь создан'});

    } catch (e) {
      res.status(500).json({message: 'Что-то пошло не так'});
    }
  });

// /login
router.post('/login',
  [
    check('email', 'Введите корректный email').normalizeEmail().isEmail(),
    check('password', 'Введите пароль').exists()
  ],
  async (req, res) => {

    try {
      //обработка валидации
      //таким образом экспресс валидатор как раз валидирует входящие поля
      const errors = validationResult(req);
      //если объект error не пустой,то сразу возвращаем на фронтенд
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Некорректные данные при входе в систему'
        })
      }

      //получаем поля email и pass из request body
      const {email, password} = req.body;
      //ищем по email пользователя
      const user = await User.findOne({email: email});

      //если нет, то пишем статус и возвращаем
      if (!user) {
        return res.status(400).json({message: 'Пользователь не найден'})
      }
      //проверяем, совпадают ли пароли с помощью bcrypt
      //первый агрумент пароль введенный, второй у юзера, которого нашли по email
      const isMatch = await bcrypt.compare(password, user.password);
      //если пароли не совпадают
      if (!isMatch) {
        return res.status(400).json({message: 'Неверный пароль'});
      }
      //если все ок, то делаем авторизацию с помощью библиотеки jsonwebtoken
      //генерируем token, передаем параметры с помощью которых инициализируем юзера
      const token = jwt.sign(
        {userId: user.id},
        config.get("jwtSecret"),
        {expiresIn: '1h'}
      );

     await res.json({token: token, userId: user.id});
    } catch (e) {
      res.status(500).json({message: 'Что-то пошло не так'});
    }
  });


//помещаем посты в базу данных
router.post('/quotes', async (req, res) => {

  let auth = req.headers.authorization;
  let profile = jwt.verify(auth, config.get("jwtSecret"));
  let profileUserId = profile.userId;

    const article = new Article({
      quotes: req.body.quotes,
      userId: profileUserId
    });

    await article.save();

  res.json(article)
  }
);

//возврат клиенту постов
router.get('/quotes', (req, res, next) => {
  //возврат клиенту всех данных
  Article.find({})
    .then(data => res.json(data))
    .catch(next)
});

//данные с токена
router.get('/me', async (req, res) => {
  let auth = req.headers.authorization;

  let profile = jwt.verify(auth, config.get("jwtSecret"));

  const user = await User.findById({_id: profile.userId}).exec();

  if (!user) {
    return res.status(400).json({message: 'Пользователь не найден'})
  }

  res.json({email: user.email});

});


//редактирование поста
//подгрузка по айди именно этого поста в инпут
router.get('/quotes/:id', async (req,res) => {
  let id = req.params.id;
  Article.findById(id, function(err, quote) {
    res.json(quote);
  });
});

//перезапись поста
router.post('/quote/:id', async (req,res) => {
 await Article.findById(req.params.id, function (err, quote) {

    if (!quote) {
      res.status(404).send('Нет сообщения');
    } else {
      quote.quotes = req.body.quotes;

      quote.save().then(quote => {
        res.json('update quote')
      })
    }
  })
});

module.exports = router;
```


## Модели

Чтобы создавать посты, изначально нужно создать модель поста (Article). Имеется два свойства - цитата и айди юзера, для дальнейшего определения этого юзера с помощью токена и отображения именно его сообщений.

```javascripta
const {model, Schema} = require('mongoose');

const Article = new Schema({
  quotes: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  }
});

module.exports = model('article', Article);
```

Помимо схемы сообщения, есть схема нового пользователя.

```javascript
const {Schema, model} = require('mongoose');

const schema = new Schema({
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true}
});

module.exports = model('User', schema);
```


## Фронтенд 

### Redux 

**Сразу же покажу, что находится в Redux. Так будет легче ознакомиться с кодом.**

### Экшены/ЭкшенКреейторы

Как для входа, как и для отрисовки сообщений были созданы разные файлы.

**redux/actions/authActions**
Экшенкреейторы для авторизации

```react
import axios from 'axios';
import {SET_CURRENT_USER} from "./constants";
import setAuthToken from "../setAuthToken";

export const registerUser = (user) => dispatch => {
  axios.post('/register', user)
    .then(res =>
      console.log('Registered!')
    )
};

export const loginUser = (user) => async dispatch => {

 await axios
    .post('/login', user)
    .then(response => {

      localStorage.setItem('usertoken', JSON.stringify(response.data));

      dispatch(setCurrentUser(JSON.stringify(response.data)))
    })

};

export const setCurrentUser = decoded => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded
  }
};

export const logoutUser = (history) => dispatch => {
  localStorage.removeItem('usertoken');
  setAuthToken(false);
  dispatch(setCurrentUser({}));
  history.push('/');
};

```

**redux/actions/quotesActions**
Экшенкреейторы для сообщений

```react
import axios from 'axios';
import {GET_NAME, GET_QUOTES} from "./constants";


//экшнкреатор для получения имени (почта)
export const getUserName = (token) => async dispatch => {

  await axios.get('/me', {headers: {Authorization: token}})
    .then(user => {
      dispatch(getUserNameAction(user.data.email))
    })
    .catch(err => console.log(err));
};

export const getUserNameAction = name => {
  return {
    type: GET_NAME,
    payload: name
  }
};

//для постов
export const getUserQuotes = (token) => async dispatch => {

  await axios.get('/quotes', {headers: {Authorization: token}})
    .then(res => {
      dispatch(getUserQuotesAction(res.data))
    })
    .catch(err => console.log(err));
};

export const getUserQuotesAction = quote => {
  return {
    type: GET_QUOTES,
    payload: quote
  }
};

//для нового поста
export const getNewPost = (quote, token) => async dispatch => {

  await axios.post('/quotes', quote, {headers: {Authorization: token}})
    .then(res => {

    })
    .catch(err => console.log(err));

  await axios.get('/quotes', {headers: {Authorization: token}})
    .then(res => {
      dispatch(getUserQuotesAction(res.data))
    })
    .catch(err => console.log(err));
};

//редактирование поста
export const getEditPost = (quote, id, token) => async dispatch => {

  await axios.post('/quote/'+id, quote)
    .then(res => console.log(res.data));

  await axios.get('/quotes', {headers: {Authorization: token}})
    .then(res => {
      dispatch(getUserQuotesAction(res.data))
    })
    .catch(err => console.log(err));
};
```

**Reducers**
**authReducers.js**
Редьюсер авторизации.
```react
import {SET_CURRENT_USER} from "../actions/constants";
import isEmpty from "../is-empty";

const initialState = {
  isAuthenticated: false,
  user: {}
};

export default function(state = initialState, action ) {
  switch(action.type) {
    case SET_CURRENT_USER:
      return {
        ...state,
        isAuthenticated: !isEmpty(action.payload),
        user: action.payload
      }
    default:
      return state;
  }
};
```

**quotesReducers.js**
Редьюсер сообщений.
```react
import {GET_NAME, GET_QUOTES} from "../actions/constants";

const initialState = {
  quotes: {},
  name: ''
};

export default function(state = initialState, action ) {
  switch(action.type) {
    case GET_NAME:
      return {
        ...state,
        name: action.payload
      }
    case GET_QUOTES:
      return {
        ...state,
        quotes: action.payload
      }
    default:
      return state;
  }
};

```

Далее комбайню редьюсеры, чтобы получить store

```react
import { combineReducers } from 'redux';
import errorReducer from './errorsReducer';
import authReducer from './authReducers';
import quotesReducers from "./quotesReducers";

export const rootReducer = combineReducers({
  errors: errorReducer,
  auth: authReducer,
  quotes: quotesReducers
});
```

### App (/)

Приложение написано с помощью **React и Redux**.

Подключаю Redux к компоненте. так же проверяю пользователя на авторизацию. Если isAuthenticated, то происходит отрисовка, если нет, то редирект.

```react
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
  auth: state.auth,
  quotes: state.quotes
});

export default connect(mapStateToProps)(App);


```

### Авторизация, регистрация (AuthPage)

Авторизация написана с помощью классовой компоненты. Так же подключаю Redux, в котором есть экшнкреейторы, которые тут применены registerUser и loginUser. 
С помощью **componentDidMount и componentWillReceiveProps** происходит редирект на **/quotes** после авторизации.

```react
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
```


### Цитаты (/quotes) (QuotesPage)

**/quotes**. Подгружаю сообщения из Redux и отрисовываю их.

```react
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

    const {name} = this.props.quotes;

    return (
      <div className="row">
        <div className="col s6 offset-s3">
          <div className="card blue-grey lighten-5">
            <div className="card-content gray-text">
              <span>Пользователь: {name}</span>
              <span className="card-title">Цитаты</span>
              <Input />
              <QuotesList />

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
```



## Компонент Input и QuotesList

### Input

Тут происходит написание и сохранение цитат в БД. С помощью post запроса происходит добавление нового сообщения.


```react

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

export default connect(mapStateToProps, {getNewPost, getUserQuotes})(Input);
```

### QuotesList

Тут происходит отрисовка новых цитат. Так же добавлена функция редактирования сообщений (**EditPage**).

```react
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
```

### EditPage
Тут происходит подгрузка сообщения по id, так же задан путь /quotes/:id. После редактирования, сообщение перезаписывается в БД, редиректит на /quotes и происходит перерисовка с новыми данными.

```react
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
```
