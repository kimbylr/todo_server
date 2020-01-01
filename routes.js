const express = require('express');
const router = express.Router();
const Todo = require('./models').Todo;
const Context = require('./models').Context;
const { mapContext, mapTodo, resolveLink } = require('./helpers');

// if id parameter is supplied -> loads context in req.context
router.param('contextId', (req, res, next, id) => {
  Context.findById(req.params.contextId, (error, context) => {
    if (error) return next(error);

    if (!context) {
      error = new Error('Not found');
      error.status = 404;
      return next(error);
    }
    req.context = context;
    return next();
  });
});

// return all active (not archived) contexts + todos
router.get('/', (req, res, next) => {
  Context.find({ archived: false })
    .then(contexts => {
      res.json(contexts.map(mapContext));
    })
    .catch(error => next(error));
});

// create new context
router.post('/context', (req, res, next) => {
  if (!req.body.label) {
    const err = new Error('no content provided.');
    return next(err);
  }

  const newContext = new Context({ label: req.body.label });
  newContext.save(error => {
    if (error) {
      console.error('creating context failed: ' + error);
      return next(error);
    }

    res.json(mapContext(newContext));
  });
});

// change context label
router.put('/:contextId', (req, res, next) => {
  if (!req.body.label) {
    const err = new Error('no content provided.');
    return next(err);
  }

  const newContext = req.context;
  newContext.label = req.body.label;
  newContext.updatedAt = new Date();
  newContext.save(error => {
    if (error) {
      console.error('could not save: ' + error);
      return next(error);
    }

    res.json(mapContext(newContext));
  });
});

// remove context (set archived flag)
router.delete('/:contextId', (req, res, next) => {
  const newContext = req.context;
  newContext.archived = true;
  newContext.save(error => {
    if (error) {
      console.error('could not flag as archived: ' + error);
      return next(error);
    }

    res.json(newContext._id);
  });
});

// change order
router.put('/:contextId/order/', (req, res, next) => {
  const todosBefore = req.context.todos;
  let todos = req.body
    .map(id => {
      return todosBefore.find(todo => todo._id == id);
    })
    .filter(Boolean); // drop todos not found in DB

  // if not all todo.ids were sent along -> add rest to the end
  if (todosBefore.length > todos.length) {
    const notSortedTodos = todosBefore.filter(
      ({ _id }) => !todos.find(todo => todo._id == _id),
    );
    todos = [...todos, ...notSortedTodos];
  }

  const newContext = req.context;
  newContext.todos = todos;
  newContext.updatedAt = new Date();

  newContext.save(error => {
    if (error) {
      console.error('could not save: ' + error);
      return next(error);
    }

    res.json(mapContext(newContext));
  });
});

// create new todo
router.post('/:contextId', async (req, res, next) => {
  if (!req.body.content) {
    const err = new Error('no content provided.');
    return next(err);
  }

  const { content, link } = req.body;
  const todo = await resolveLink(content, link); // magically resolve echo links
  const newTodo = new Todo(todo);
  req.context.addTodo(newTodo, (error, result) => {
    if (error) {
      console.error('saving todo failed: ' + error);
      return next(error);
    }

    res.json(mapTodo(newTodo));
  });
});

// change single todo
router.put('/:contextId/:todoId', (req, res, next) => {
  const newContext = req.context;
  let changedTodo;

  newContext.todos.map(todo => {
    if (String(todo._id) === req.params.todoId) {
      const { content, link, completed } = req.body;
      if (content) todo.content = content;
      if (link || link === null) todo.link = link;
      if (completed !== undefined) todo.completed = completed;
      changedTodo = Object.assign(todo, { updatedAt: new Date() });
      return changedTodo;
    }

    return todo;
  });

  if (!changedTodo) {
    console.error('todo to change not found');
    return next(new Error('todo to change not found'));
  }

  newContext.updatedAt = new Date();

  newContext.save(error => {
    if (error) {
      console.error('could not save: ' + error);
      return next(error);
    }

    res.json(mapTodo(changedTodo));
  });
});

module.exports = router;
