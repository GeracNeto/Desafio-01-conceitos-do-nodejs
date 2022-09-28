const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

// Middleware
function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  // Busca pelo usuário passado no header
  const user = users.find(user => user.username === username)

  if (!user) {
    return response.status(404).json({ error: "user not found!" })
  }

  request.user = user // Faz com que o usuário fique disponível para ser acessado

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  // Verifica se o username já existe
  const existsUsername = users.some(user => user.username === username)

  if (existsUsername) {
    return response.status(400).json({ error: "username already exists!" })
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  const { title, deadline } = request.body

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const { title, deadline } = request.body

  // Verifica se existe um todo com o id passado na rota
  const existsTodoWithSameId = user.todos.some(todo => todo.id === id)

  if (!existsTodoWithSameId) {
    return response.status(404).json({ error: "todo not found!" })
  }

  // atualiza somente o todo que tiver o id igual o passado na rota
  user.todos.forEach(todo => {
    if (todo.id === id) {
      todo.title = title
      todo.deadline = new Date(deadline)
    }
  })

  /*
  Outra forna de fazer

  const todo = user.todos.find(todo => todo.id === id)

  todo.title = title
  todo.deadeline = new Date(deadline)
  */

  return response.status(200).send()
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  // Verifica se existe um todo com o id passado na rota
  const existsTodoWithSameId = user.todos.some(todo => todo.id === id)

  if (!existsTodoWithSameId) {
    return response.status(404).json({ error: "todo not found!" })
  }

  // Atualiza somente o todo que tiver o id igual o passado na rota
  user.todos.forEach(todo => {
    if (todo.id === id) {
      todo.done = true
    }
  })

  /*
  Outra forna de fazer

  const todo = user.todos.find(todo => todo.id === id)

  todo.done = true
  */

  return response.status(200).send()

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  // Verifica se existe um todo com o id passado na rota
  const todoTobeDeleted = user.todos.find(todo => todo.id === id)

  if (!todoTobeDeleted) {
    return response.status(404).json({ error: "todo not found!" })
  }

  // Deleta o todo com id igual o da rota
  user.todos.splice(todoTobeDeleted, 1)

  return response.status(204).send()
});

module.exports = app;