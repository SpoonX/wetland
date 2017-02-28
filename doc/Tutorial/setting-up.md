# Setting up
> To clone the finished code for this part of the tutorial, run the following command:
>
> `git clone git@github.com:SpoonX/wetland-tutorial.git -b 1-setting-up --single-branch`
> 
> Find the full repository on github [here](https://github.com/SpoonX/wetland-tutorial).

Before we get started, we need to set up a base project structure in which we can start building an application.

In this first part of the tutorial, we'll be setting up a project and configuring a server.

## Initializing
First, we need to get a directory set up to start working in.

- Create a project directory somewhere. `mkdir ~/projects/nodejs/wetland-tutorial`
- `npm init -y`
- `git init`

We now have a directory that's ready to get started in.

### Directory structure
To get started, we'll create a directory structure for our application. I'll explain what the directories are for.

Run this command to create the project directories:

`mkdir -p app/{entity,repository,resource}`

#### Structure explained
```
.
└── app
    ├── entity
    ├── repository
    └── resource
```

##### app
App is the home of all the files we'll be writing in this tutorial, split into three different directories.

##### app/entity
This directory is going to hold our entities. Entities are simple classes that represent tables in our database.

##### app/repository
In this directory, we'll be storing our repositories.
A repository is the layer between the domain (your logic) and the data mapper (wetland). They're what allow you to create queries and fetch data in a logical, expressive and flexible format.

##### app/resource
Resources will be where our endpoints go. Our routes will be defined here, as well as the actions that handle calls to them.

**Note:** this is not a recommended structure. It's simply the easiest structure for the purpose of this tutorial.

### Dependencies
For this tutorial, we'll be using a couple of dependencies to make the application we'll be building look like a real world application.

Run the following command to install the dependencies:

`npm install --save express body-parser wetland express-wetland sqlite3`

We're using [express](http://expressjs.com/), [body-parser](https://github.com/expressjs/body-parser) and [express-wetland](https://github.com/SpoonX/express-wetland) to make it easy to set up a simple server. Our first application will run on sqlite.

## Configuring our server
Now the structure of our project has been laid out, it's time to start writing some code. First off, we'll be configuring a server. Because this tutorial is about _wetland_ and not about _building an api_, I'll just be supplying you with the code required to set up the server.

### App.js
First, create a file called `app.js` in the root of the project, with the following contents.

```js
const express        = require('express');
const bodyParser     = require('body-parser');
const expressWetland = require('express-wetland');
const Wetland        = require('wetland').Wetland;
const app            = express();
const wetland        = new Wetland(require('./wetland'));

// Makes json prettier to read for the purpose of this tutorial
app.set('json spaces', 2);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressWetland(wetland));

// Resources
app.use('/product', require('./app/resource/product'));
app.use('/category', require('./app/resource/category'));

// Start server
app.listen(3000, () => console.log('Inventory manager ready! Available on http://127.0.0.1:3000'));
```

### wetland.js
Now create a file in the root of your project called `wetland.js` with the following contents.

```js
const path = require('path');

module.exports = {
  entityPath: path.resolve(process.cwd(), 'app', 'entity')
};
```

### resource/product.js
It's time to start creating the resources. First create a file in `resource/product.js` with the following contents.

```js
const express = require('express');
const router  = express.Router();

router.get('/', (req, res) => res.json({hello: 'from product.js'}));

module.exports = router;
```

### resource/category.js
Now create a file in `resource/category.js` with the following contents.

```js
const express = require('express');
const router  = express.Router();

router.get('/', (req, res) => res.json({hello: 'from category.js'}));

module.exports = router;
```

## All done

### Test setup
You can test this setup with the following steps:

1. run `node app.js`
2. Visit these links: [http://127.0.0.1:3000/category](http://127.0.0.1:3000/category) and [http://127.0.0.1:3000/product](http://127.0.0.1:3000/product)
3. If all goes well, you should get a response similar to this: `{hello: "from category.js"}`

### Next step
Now our project is all ready to start building something. In the next part of this tutorial, we'll be creating our first entity, and take a look at the CLI tool.

[Go to the next part](entities.md).
