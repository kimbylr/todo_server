const mapTodo = todo => {
  const { _id: id, content, completed, updatedAt } = todo;
  return { id, content, completed, updatedAt };
};

const mapContext = context => {
  updated = context.todos
    .map(todo => Date.parse(todo.updatedAt))
    .sort((a, b) => b - a);

  const { label, archived, todos, _id: id } = context;
  const updatedAt = updated[0] || 0;
  const todosWithId = todos.map(mapTodo);
  return { label, archived, todos: todosWithId, id, updatedAt };
};

module.exports = { mapContext, mapTodo };
