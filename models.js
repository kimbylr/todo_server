const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const TodoSchema = new mongoose.Schema({
  content: String,
  updatedAt: { type: Date, default: Date.now },
  completed: { type: Boolean, default: false },
});

const ContextSchema = new mongoose.Schema({
  label: String,
  archived: { type: Boolean, default: false },
  todos: [TodoSchema],
});

ContextSchema.method('addTodo', function(todo, callback) {
  Object.assign(this, { todos: [...this.todos, todo] });
  this.save(callback);
});

// create collection ("todos")
const Todo = mongoose.model('Todo', TodoSchema);
const Context = mongoose.model('Context', ContextSchema);

module.exports.Todo = Todo;
module.exports.Context = Context;
