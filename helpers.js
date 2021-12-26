const mapTodo = (todo) => {
  if (!todo) throw Error('got no todo in mapTodo!');

  const { _id: id, content, link, completed, updatedAt } = todo;
  return { id, content, link, completed, updatedAt };
};

const mapContext = (context) => {
  if (!context) throw Error('got no todo in mapTodo!');

  const { label, archived, todos, _id: id, updatedAt } = context;

  return {
    label,
    archived,
    id,
    updatedAt: new Date(updatedAt).getTime(), // Date.parse swallows milliseconds ¯\_(ツ)_/¯
    todos: todos.map(mapTodo),
  };
};

module.exports = { mapContext, mapTodo };
