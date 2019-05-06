const mapTodo = todo => {
  const { _id: id, content, link, completed, updatedAt } = todo;
  return { id, content, link, completed, updatedAt };
};

const mapContext = context => {
  const { label, archived, todos, _id: id, updatedAt } = context;

  return {
    label,
    archived,
    id,
    todos: todos.map(mapTodo),
    updatedAt: Date.parse(updatedAt),
  };
};

module.exports = { mapContext, mapTodo };
