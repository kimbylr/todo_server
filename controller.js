const express = require('express');
const router = express.Router();
const Todo = require('./models').Todo;
const Context = require('./models').Context;

require('dotenv').config();
const secret = process.env.FRONTEND_PASSPHRASE;

// very basic security is enough in this case
router.use ( (req, res, next) => {
  console.log('authstring: ' + req.headers.authorization);
  if ( secret === req.headers.authorization ) {
    console.log('secret stimmt überein');
    next();
  } else {
    console.log('secret stimmt nicht überein');
    const err = new Error('No permission');
    err.status = 401;
    next(err);
    // next();
  }
})

// executed when "id" parameter (-> put)
router.param('contextId', (req, res, next, id) => {
  Context.findById( req.params.contextId, (error, context) => {
    if ( error ) return next(error);
    if ( !context ) {
      error = new Error('Not found');
      error.status = 404;
      return next(error)
    }
    req.context = context;
    return next();
  });
});


// return all active (not archived) contexts + todos
router.get( '/', (req, res, next) => {
  Context.find({ archived: false })
    .then( contexts => {
      res.json( contexts )
    })
    .catch( error => next(error) );
});


// create new context
router.post( '/context', (req, res, next) => {
  if ( !req.body.label ) {
    const err = new Error( 'no content provided.' );
    next(err);
  } else next();
}, (req, res) => {
  const newContext = new Context({ label: req.body.label });
  newContext.save( error => {
    if (error) console.error('creating context failed: ' + error);
    res.json( newContext );
  });
});


// change context label
router.put( '/:contextId', (req, res, next) => {
  if ( !req.body.label ) {
    const err = new Error( 'no content provided.' );
    next(err);
  } else next();
}, (req, res, next) => {
  const newContext = req.context;
  newContext.label = req.body.label;
  newContext.save( error => {
    if (error) console.error('could not save: ' + error);
    res.json( newContext );
  });
});


// remove context (sed archived flag)
router.delete( '/:contextId', (req, res, next) => {
  const newContext = req.context;
  newContext.archived = true;
  newContext.save( error => {
    if (error) console.error('could not flag as archived: ' + error);
    res.json( newContext._id );
  });
});


// create new todo
router.post( '/:contextId', (req, res, next) => {
  if ( !req.body.content ) {
    const err = new Error( 'no content provided.' );
    next(err);
  } else next();
}, (req, res) => {
  const newTodo = new Todo({
    content: req.body.content,
    context: req.body.context
  });
  req.context.addTodo( newTodo, (error, result) => {

    if (error) console.error('saving todo failed: ' + error);
    res.json( newTodo );
  })
});


// change single todo
router.put( '/:contextId/:todoId', (req, res, next) => {
  const newContext = req.context;
  let changedTodo;

  newContext.todos.map( todo => {
    if ( String(todo._id) === req.params.todoId ) {
      if ( req.body.content ) todo.content = req.body.content;
      if ( req.body.completed !== undefined ) todo.completed = req.body.completed;
      changedTodo = Object.assign(todo, {updatedAt: new Date()} );
      return changedTodo;
    }
    return todo;
  });

  newContext.save( error => {
    if (error) console.error('could not save: ' + error);
    res.json( changedTodo );
  });
});


module.exports = router;
