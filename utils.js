function defaultReducer() {
  console.log("Sodux Default Reducer. Please attach a reducer");
  return initialState;
}
function childReducer(currentChild, action) {
  switch (action.type) {
    case "CHANGE_SPACE":
      return {
        ...currentChild,
        space: action.space,
      };
    case "SET_INFO":
        delete action.info._id
        return {
            ...currentChild,
            ...action.info
        }
    default:
      return currentChild;
  }
}
function getChildInfo(currentChild) {
  let childInfo = { ...currentChild };
  delete childInfo.socket;
  return childInfo;
}

module.exports = {
  defaultReducer,
  childReducer,
  getChildInfo,
};
