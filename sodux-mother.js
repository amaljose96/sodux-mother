const WebSocket = require("ws");
const { defaultReducer, childReducer, getChildInfo } = require("./utils");
const SODUX_RESERVED_ACTIONS = ["CONNECTED","DISCONNECTED"];
class SoduxMother {
  constructor(options = {}) {
    return (initialState = {}, reducer = defaultReducer) => {
      this.server = new WebSocket.Server(options);
      this.state = {
        default: initialState,
      };
      this.defaultState = initialState;
      this.reducer = reducer;
      this.debug = options.debug;
      this.children = {};
      this.log("Started", "");
      return this;
    };
  }
  listen() {
    this.server.on("connection", (ws) => {
      let newChild = {
        _id: Date.now(),
        space: "default",
        socket: ws,
      };

      this.children[newChild._id] = newChild;
      let connectAction = {
          type: "CONNECTED",
          child: getChildInfo(newChild)
      }
      this.work(connectAction,newChild._id);
      this.log("New User", connectAction);

      ws.on("message", (message) => {
        let dispatchedAction = JSON.parse(message);
        if(!SODUX_RESERVED_ACTIONS.include(action.type)){
            this.work(dispatchedAction,newChild._id);
            this.log("Action", dispatchedAction);
        }
      });

      ws.on("close", () => {
        let currentChild = this.children[newChild._id];
        let disconnectAction = {
            type: "DISCONNECTED",
            child: getChildInfo(currentChild),
          };
        this.work(disconnectAction,currentChild._id)
        this.log("Disconnected", disconnectAction);
      });
    });
  }
  work(action,childId){
    let currentChild = childReducer(this.children[childId], action);
    this.children[currentChild._id] = currentChild;
    action.child = getChildInfo(currentChild);
    let newSpaceState = this.reducer(
      this.state[currentChild.space],
      action
    );
    if (!newSpaceState) {
      newSpaceState = this.state[currentChild.space] || this.defaultState;
    }
    this.state[currentChild.space] = newSpaceState;
    Object.values(this.children)
      .filter((child) => child.space === currentChild.space)
      .forEach((child) => {
        child.socket.send(
          JSON.stringify({
            ...getChildInfo(child),
            ...this.state[currentChild.space],
          })
        );
      });
  }
  log(actionType, action) {
    if (this.debug) {
      console.log("======" + actionType + "===========");
      console.log(JSON.stringify(action, null, 4));
      console.log("State : ");
      console.log(JSON.stringify(this.state, null, 4));
      console.log("Swarm");
      Object.values(this.children).forEach((child) => {
        console.log(child._id, JSON.stringify(getChildInfo(child)));
      });
    }
  }

  useReducer(reducer) {
    this.reducer = reducer;
  }
}

module.exports = SoduxMother;
