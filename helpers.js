const fetch = require('node-fetch');

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

const ECHO_LINK_BASE = 'https://www.srf.ch/play/radio/echo-der-zeit/';
const ECHO_PREFIX = 'ECHO: ';
const resolveLink = async (content, link) => {
  if (content.startsWith(ECHO_LINK_BASE)) {
    try {
      const response = await fetch(content);
      const body = await response.text();
      const title =
        ECHO_PREFIX +
        body
          .split('<title>')[1]
          .split('</title>')[0]
          .replace(' - Radio - Play SRF', '');
      return { content: title, link: content };
    } catch (e) {
      console.error(e);
    }
  }

  return { content, link };
};

module.exports = { mapContext, mapTodo, triggerRefresh, resolveLink };
