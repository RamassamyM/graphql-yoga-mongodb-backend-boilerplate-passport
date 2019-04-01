Node express graphql-yoga API boilerplate
========

This boilerplate can be used to quickly start an API project with GraphQL, GraphQL-Yoga (based on Apollo and Express for NodeJs).
I created it to set a backend for a Vue frontend project and to reuse it.
I read these posts before starting implementing the boilerplate : [1](https://itnext.io/build-a-project-management-software-with-vue-js-and-apollo-part1-d12ee75a7641) [2](https://medium.freecodecamp.org/how-to-set-up-a-graphql-server-using-node-js-express-mongodb-52421b73f474) [3](https://medium.com/@bensigo/securing-your-graphql-endpoint-with-authentication-23870bcf3a0d)


Look how easy it is to use:

    git clone <git_url_of_the_project>
    cd <project_folder>
    yarn # or npm install
    yarn dev # or npm run dev

Important
---------
This boilerplate use token authentication : it is important to use https !


Features
--------

- uses `yarn` for node package manager

###### Hot reloading
- Hot reloading configuration for fast developement with `yarn dev`


###### Quality tools, doc and syntax
- logging integration to see api requests, queries and response from the graphql serverOptions
- documenting code with [jsdoc](http://usejsdoc.org/) style and [flow](https://flow.org/) inspired from this [post](https://medium.com/4thought-studios/documenting-javascript-projects-f72429da2eea)
- documentation generator tool with : [documentation.js](http://documentation.js.org/) (see also [github doc](https://github.com/documentationjs/documentation#documentation))
- using babel for using all new javascript syntax
- using eslint to have nice consistent code syntax. For linting code, use in root app directory :


    yarn eslint




###### Technology stack

- node, express
- [graphql-yoga](https://github.com/prisma/graphql-yoga) : it uses apollo ([doc](https://www.apollographql.com/docs/) is useful)
- mongoDb for database with mongoose ORM : doc [here](https://mongoosejs.com/)

###### Clean code organization and modularization for growing project easy maintenability

Code is modularized in `src` directory:
- `config.js` contains all environment variables that can be used by the project (for the server, for the database...)
- The app start with `app.js` that will setup database and graphql server : all setup files are in `setup` folder.
- graphql server is set in `src/setup/graphqlserver.js` : it uses the graphql schema which is generated with `graphql/schema.js`.
- All graphql files for typeDefs and resolvers are kept in `graphql` folder. IT is organized in subfolders for each entity needed. Each entity folder contains 2 files : a `.resolvers.js` file and a `xxxType.graphql` file for typeDef (type definitions that compose the graphql schema), so it is easy to see the link between these files and easy to maintain. All resolvers and typeDefs files are then merged with [merge-graphql-schema](https://www.npmjs.com/package/merge-graphql-schemas) in `schema.js` the modularized organization is easy.
- All models built with mongoose are kept in `models` : `utils` folder contains all utility functions for model, every model is created in a **.model.js** extension file and will be imported in graphql resolvers. See the `exempleObject.model.js` file to see how to create a model. As your model files list is growing, you can organize your models in subfolders.
- There is also a `utils` folder to create utility functions in js files to be used by various files in the project.  
- **Code architecture design choice** : As graphql typedefs are like routes of a router, and resolvers are like controllers to define actions with the routes, we put all model logic in the models like in MVC paradigm and not in resolvers.

###### Security, authentication, authorization
- git is used with a .gitignore : .env file is ignored and contains secret environment variables : you have to recreate yours. [Dotenv](https://www.npmjs.com/package/dotenv) package is used to grab the environment variables from .env file. [Cross-env](https://www.npmjs.com/package/cross-env) package is used to start server giving variables in command line (ex : for production)
- Authentication with node and graphql is not that easy as there is not any plataformec/device like complete package that exists. So this is a part to consider. Read these posts first : [1](https://hackernoon.com/your-node-js-authentication-tutorial-is-wrong-f1a3bf831a46) [2](https://github.com/P-H-C/phc-winner-argon2) [3](https://www.howtographql.com/advanced/4-security/) [4](https://expressjs.com/fr/advanced/best-practice-security.html) [5](https://www.codeheroes.fr/index.php/2018/03/23/securiser-une-api-rest/)
- Authentication can be set by providing the currentUser (can be null) to the resolvers ([explanation](https://medium.com/the-guild/authentication-and-authorization-in-graphql-and-how-graphql-modules-can-help-fadc1ee5b0c2)) and implement an authenticated() method wrapper but it is better to use [schema directives]() to set all authentication and authorization rules (note : graphql [doc](https://graphql.org/learn/authorization/) suggest to avoid putting authorization logic and duplication in resolvers according to [single source of truth](https://graphql.org/learn/thinking-in-graphs/#business-logic-layer) rule.) in the GraphQL Schema : read [this](https://hackernoon.com/easy-peasy-graphql-authentication-and-authorization-using-schema-directives-f28f1845da20) and [this](https://blog.grandstack.io/authorization-in-graphql-using-custom-schema-directives-eafa6f5b4658) : 
- uses `passport` for authentication with... TODO
- Note : specs for authentication and authorization ([read](https://medium.com/the-guild/authentication-and-authorization-in-graphql-and-how-graphql-modules-can-help-fadc1ee5b0c2)) :
We learned that a good implementation for GraphQL **authentication** has the following features regarding authentication:

Your authentication implementation should eventually provide the currentUser to the resolvers
Your resolvers should not know about the authentication logic (separation between the business logic and the authentication logic)
You wish to protect only parts of your GraphQL schema, and not all of it.
You want to be able to authenticate parts of your schema, on a field level.

And the following features regarding **authorization**:

You wish to protect some fields, according to custom rules.
You wish to run custom logics that protects parts of your GraphQL schema.
Our custom rules should not be coupled to a specific resolver.

- Security concerns : different security protections with [helmet](https://www.npmjs.com/package/helmet), express-rate-limit (todo), express-brute(todo), csurf(todo)

###### Other tools
- Sending emails with `nodemailer`
- hot reloading in dev mode with `nodemon`

###### Testing tools
- todo

###### Deployment tools
-todo : use `pm2` ...

###### Error handling consideration
If you look at the code of `user.resolvers.js` or `user.model.js`, you will see how errors are handled.
As Node is asynchronous, we can use Promise to queue asynchronous operation or use the Async/Await introduced by ES2017 (read [this article](https://medium.com/@tkssharma/writing-neat-asynchronous-node-js-code-with-promises-async-await-fa8d8b0bcd7c) to understand).
Async/await makes code much more readable for developers.

But even with Async/Await, handling error is not that simple : read these posts [1](https://medium.com/@pyrolistical/the-hard-error-handling-case-made-easy-with-async-await-597fd4b908b1) [2](https://medium.com/@pyrolistical/the-hard-error-handling-case-made-easy-with-async-await-597fd4b908b1)
[3](https://www.valentinog.com/blog/throw-errors-async-functions-javascript/)

As this boilerplate uses graphql-yoga which is a layer on top of Apollo, you need to understand that graphql and Apollo handle add also specificities for handling errors : read this helping [post](https://blog.apollographql.com/full-stack-error-handling-with-graphql-apollo-5c12da407210) from Apollo

In each entity folder for graphql, you can create your own exceptions (see ExempleObject model : the exemple.errors.js file) and use it in the resolvers file.
There is [apollo-error](https://www.npmjs.com/package/apollo-errors).

But it may be better to use apollo-server-errors with the help of this [post](https://blog.apollographql.com/full-stack-error-handling-with-graphql-apollo-5c12da407210) because apollo-server-errors exposes a set of classes and functions (see the [doc on github](https://github.com/apollographql/apollo-server/blob/master/packages/apollo-server-errors/src/index.ts)) and make it possible to use [extensions code](https://www.apollographql.com/docs/apollo-server/features/errors#codes). It is the package usedd by apollo but not exposed by graphql-yoga(read this [issue](https://github.com/prisma/graphql-yoga/issues/167)).
You can use the class Error to create an error.
So with apollo-server-errors, you can import these :
- ApolloError (class(message: string, code?: string, properties? Record<string, any>))
- toApolloError (function(error: Error & {extensions?}, code: string = 'INTERNAL_SERVER_ERROR'))
- formatApolloErrors (function(errors: Array<Error>, options?: {formatter?: (error: GraphQLError) => GraphQLFormattedError, debug?: boolean}))

Classes that extend ApolloError class:
- SyntaxError (class(message: String))
- ValidationError (class(message: String))
- AuthenticationError (class(message: String))
- ForbiddenError (class(message: String))
- UserInputError (class(message: String, properties?))
- PersistedQueryNotFoundError (?) (class())
- PersistedQueryNotSupportedError (?) (class())

**Note**: in order to avoid 'new invokation' problem for apollo-server-errors classes, we had to configure .babelrc like that :

    {
      "presets": [
        [
          "env",
          {
            "targets": {
              "node": "current"
            }
          }
        ],
      ]
    }

Read this [issue](https://github.com/apollographql/apollo-server/issues/1304#issuecomment-405072540).

**Tip** : mongoose functions on model like findOne or findOneAndUpdate... let you give a callback function that can handle errors while requesting models and database. But when you throw an error in the callback, the app will crash because of an unhandled 'error' event : so you have to handle the error in the code that call the function
(use `try` `catch`) or throw manually an error.


Installation
------------

Install this boilerplate by running:

    git clone <git_url_of_the_project>

Create a .env file for environment variables (see [Dotenv](https://www.npmjs.com/package/dotenv) package).
In `config.js` file, you can see the variables that can or need to be set for this boilerplate. `config.js` set variables that will be used with .env variables or with **default** variables.

**Tip** 😅 : To generate a secret token key : you can use **python** commands in your terminal if you have it installed :

    import secrets
    secrets.token_urlsafe(32)


You need to have mongodb installed to be able to use this boilerplate.
See mongodb documentation for installation.

You also need Node (includes npm during installation) and yarn (install with npm) :
**Tip** : use nvm to manage different node versions : see installation [doc](https://github.com/creationix/nvm#install--update-script)


Other commands
--------------

Todo : see scripts in `package.json`:

    "dev": "nodemon src/index.js --exec babel-node",
    "clean": "rm -rf build && mkdir build",
    "build": "cross-env NODE_ENV=production yarn run clean && babel -d ./build ./src -s",
    "start": "cross-env NODE_ENV=production yarn run start:single",
    "start:single": "node server.js",
    "start:deamon": "pm2 start server.js",
    "stop": "pm2 stop server.js",
    "logs": "pm2 logs",
    "eslint": "eslint src"


Configuration
-------------  

- for babel : `.babelrc`
- for eslint : `.eslintrc.js`
- for gitignore: `.gitignore`
- scripts commands configuration are kept in `package.json` : see scripts

Improvement plan
-----------------

- [ ] add [Flow](https://flow.org/en/docs/usage/) (read also this [post](https://codeburst.io/getting-started-with-flow-and-nodejs-b8442d3d2e57)) or [Typescript](https://www.typescriptlang.org/) for type annotations, type checking, code refactoring...
- [ ] add CI (continuous integration) tool
- [ ] protect from introspection in production

Contribute
----------

- Issue Tracker: todo
- Source Code: this repo (todo : update)

Support
-------

If you are having issues, please let us know.

License
-------

The project is licensed under proprietary (open source?) license. (todo : update)
