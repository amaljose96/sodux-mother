# Sodux Mothership

Sodux is a wrapper on web sockets for Node. This goes along with Sodux Child here[https://github.com/amaljose96/sodux-child]
This follows a format similar to Redux to share state between users using web sockets.

## Concept

This repository is for Sodux Mothership, which is the server to which the webapps (swarm) connects to.
Each instance of the WebApp (website opened in browser/Sodux Child) has a copy of the state (hivemind) stored in the server (Mothership).
Each child can dispatch actions to the server based on user interaction, which server would use to change the state and then update all connected children.
In other words, children can dispatch actions to the mothership, according to which mothership would update the hivemind and update the swarm.

In the server, a reducer is used to determine the next state based on the action dispatched by the child.

## How to install?

All you need is node and npm.
Then run
``` npm install sodux-mother ```

To import the module to your application
```
let SoduxMother = require("sodux-mother");
```

## How to use?

Just like an express server, Sodux requires a WS server.
```
let soduxMother = new SoduxMother([WS options])([initialState], [reducer]);
```
An example:
```
let soduxMother = new SoduxMother({ port: 12345 })(initialState, reducer);
```
This would initiate a Sodux server at ws://localhost:12345

Note: For v0.1 we only support ws. wss support will be added soon.

### Initial State and Reducer?

Initial state is synonymous with the initial state used in Redux.
This is the initial state of a space.
Default value is ```{}```

Reducer is a function which takes in the oldState and action as parameters and returns newState.
This can be used similar to reducer in Redux.
Example:
```
function reducer(oldState, action) {
  switch (action.type) {
    case "ADD_MESSAGE":
      let newMessage = {
        text: action.text,
        time:Date.now(),
        name:action._child.name
      };
      return {
        messages: [...oldState.messages, newMessage],
      };
    case "CLEAR":
      return {
        messages: [],
      };
    default: return oldState;
  }
}
```

Note: Action.child would have the info of the dispatcher child. This can be set using SET_INFO Sodux Action.
Also avoid "childInfo" key in the state since this would be overriden with the child's information while sending data.

We'll be adding a combineReducers later to separate out domains

### Space

When a child is connected to the server, it joins a space called "default".
This is synonymous with a room in chat applications.
This can be changed using the Sodux Actions.

##### Why Space?

This is to segregate states between users.

Usually on recieving dispatch from the child, the server would send the updated state to all connected children (broadcast).
In other words, hivemind is shared with the entire swarm.

With spaces, children can be split into groups to share state within that group.
In other words, the hivemind is divided into spaces and children belong to one of the spaces.

In a messaging app, this corresponds to a chat-window ie. a group with multiple users or a DM with 2 users
In a shared-editing app (like Google Sheets/Google Docs), this corresponds to a document editing session which can have multiple users editing at a time.

### Child

Every child is identified by child._id.
_id is uniquely generated and should not be overriden by Sodux action SET_INFO.
This can be accessed from action.child._id in the reducer.

When a user joins the server, CONNECTED Sodux action is dispatched.
When a user closes the tab or disconnects, the corresponding child is deleted and DISCONNECTED Sodux action is dispatched

To handle a situation of user returning to the session, SET_INFO can be dispatched with user related info.
This can keep the user information consistent, though it would be considered as a different session


### Sodux Actions

These are some inbuilt Sodux actions which manipulate Child information.

##### 1. CHANGE_SPACE
This changes the space of the child to the required space.
This would also update the child's state with the state of the new space.
Example:
```
{
    type: "CHANGE_SPACE",
    space: "Milky Way"
}
```
##### 2. SET_INFO
This is used to set child's information so that its available in action.child in the reducer.
Example:
```
{
    type:"SET_INFO",
    info:{
        name:"Some name"
    }
}
```

The details in info can be used to identify each user. However, if 2 children have the same info, they would not be merged into a single user.
Each child is defined by session rather than user information set in SET_INFO

##### 3. CONNECTED
This cannot be dispatched by the child.
This is dispatched automatically when a child connects to the server.
Example action dispatched:
```
{
    "type": "CONNECTED",
    "child": {
        "_id": "AXSCA",
        "space": "default"
    }
}
```

##### 4. DISCONNECTED
This cannot be dispatched by the child.
This is dispatched automatically when a child disconnects from the server.
Example action dispatched:
```
{
    type: "DISCONNECTED",
    child: {
        _id: "AXSCA",
        name:"Some name",
        space:"default"
    },
}
```

These Sodux actions can also be used in the reducer to update the state in any of these scenarios.







