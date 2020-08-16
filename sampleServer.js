let SoduxMother = require("./sodux-mother");

const initialState = {
  messages: [],
  count: 0,
};
function motherReducer(oldState, action) {
  switch (action.type) {
    case "CONNECTED":return {
      ...oldState,
      count:oldState.count+1
    }
    case "DISCONNECTED":return {
      ...oldState,
      count:oldState.count-1
    }
    case "ADD_MESSAGE":
      let newMessage = {
        text: action.text,
        time: Date.now(),
        name: action.child.name,
      };
      return {
        ...oldState,
        messages: [...oldState.messages, newMessage],
      };
    case "CLEAR":
      return {
        messages: [],
      };
    default:
      return oldState;
  }
}

let soduxMother = new SoduxMother({ port: 12345, debug: true })(
  initialState,
  motherReducer
);

soduxMother.listen();
