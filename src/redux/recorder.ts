import { Action } from "redux";
import { RootState } from "./store";

interface RecorderState {
  dateStart: string;
}

const START = "recorder/start";
const STOP = "recorder/stop";

type StartAction = Action<typeof START>;
type StopAction = Action<typeof STOP>;

export const start = (): StartAction => ({
  type: START,
});

export const stop = (): StopAction => ({
  type: STOP,
});

export const selectRecorderState = (rootstate: RootState) => rootstate.recorder;

export const selectDateStart = (rootstate: RootState) =>
  selectRecorderState(rootstate).dateStart;

const intialState: RecorderState = {
  dateStart: "",
};
const recorderReducer = (
  state: RecorderState = intialState,
  action: StartAction | StopAction
) => {
  switch (action.type) {
    case START:
      return { ...state, dateStart: new Date().toISOString() };
    case STOP:
      return { ...state, dateStart: "" };
    default:
      return state;
  }
};

export default recorderReducer;
