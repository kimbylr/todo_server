const mapTodo = todo => {
  if (!todo) throw Error('got no todo in mapTodo!');

  const { _id: id, content, link, completed, updatedAt } = todo;
  return { id, content, link, completed, updatedAt };
};

const mapContext = context => {
  if (!context) throw Error('got no todo in mapTodo!');

  const { label, archived, todos, _id: id, updatedAt } = context;

  return {
    label,
    archived,
    id,
    todos: todos.map(mapTodo),
    updatedAt: Date.parse(updatedAt),
  };
};

const WEB_SOCKET_OPEN = 1;
const triggerRefresh = (connections = []) => {
  connections.forEach(ws => {
    ws.readyState === WEB_SOCKET_OPEN && ws.send('refresh');
  });
};

module.exports = { mapContext, mapTodo, triggerRefresh };
