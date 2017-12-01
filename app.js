const Hapi = require('hapi');
const mongoose = require('mongoose');

// connect to MongoDB
mongoose.connect('mongodb://localhost/hapidb', { useMongoClient: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Task model
const Task = mongoose.model('Task', {text: String});

// Init server
const server = new Hapi.Server();

server.connection({
    port: 8000,
    host: 'localhost'
});

// home route
server.route({
  method: 'GET',
  path: '/',
  handler: (request, reply) => {
    reply('<h1>Hello World</h1>');
  }
});

// dynamic route
server.route({
  method: 'GET',
  path: '/user/{name}',
  handler: (request, reply) => {
    reply('<h2>Hello, ' + request.params.name + '</h2>');
  }
});

// static routes
server.register(require('inert'), (err) => {
  if (err) {
    throw err;
  }

  server.route({
    method: 'GET',
    path: '/about',
    handler: (request, reply) => {
      reply.file('./public/about.html');
    }
  });

  server.route({
    method: 'GET',
    path: '/image',
    handler: (request, reply) => {
      reply.file('./public/towersofzeyron.png');
    }
  });

});

// vision templates
server.register(require('vision'), (err) => {
  if (err) {
    throw err;
  }

  server.views({
    engines: {
      html:require('handlebars'),
    },
    path: __dirname + '/templates'
  });
});


// serve a template
server.route({
  method: 'GET',
  path: '/home',
  handler: (request, reply) => {
    reply.view('index', {
      name: "John Doe"
    });
  }
});

// get tasks
server.route({
  method: 'GET',
  path: '/tasks',
  handler: (request, reply) => {

    // reply.view('tasks', {
    //   tasks: [
    //     {text: "Buy the milk"},
    //     {text: "Play guitar"},
    //     {text: "Eat chocolate"},
    //     {text: "Be a rockstar"},
    //     {text: "Exit stage left"}
    //   ]
    // });

    let tasks = Task.find((err, tasks) => {
      console.log(tasks);
      reply.view('tasks', {tasks: tasks});
    });
  }
});



// post tasks
server.route({
  method: 'POST',
  path: '/tasks',
  handler: (request, reply) => {

    let text = request.payload.text;
    let newTask = new Task({text: text});
    newTask.save((err, task) => {
        if (err) {
          console.error(err);
        }

        return reply.redirect().location('tasks');
    })
  }
});

// start the server
server.start((err) => {
  if (err) {
    throw err;
  }

  console.log(`Server started at: ${server.info.uri}`);
});
