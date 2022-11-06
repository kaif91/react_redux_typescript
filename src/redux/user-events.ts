import { Action } from "redux";
import { ThunkAction } from "redux-thunk";
import { selectDateStart } from "./recorder";
import { RootState } from "./store";

export interface UserEvent {
  id: number;
  title: string;
  dateStart: string;
  dateEnd: string;
}

interface UserEventState {
  byIds: Record<UserEvent["id"], UserEvent>;
  allIds: UserEvent["id"][];
}

const LOAD_REQUEST = "userEvents/load_requests";

const LOAD_SUCCESS = "userEvents/load_success";

const LOAD_FAILURE = "userEvents/load_failure";

interface LoadFailureAction extends Action<typeof LOAD_FAILURE> {
  error: string;
}

interface LoadRequestAction extends Action<typeof LOAD_REQUEST> {}

interface LoadSuccessAction extends Action<typeof LOAD_SUCCESS> {
  payload: {
    events: UserEvent[];
  };
}

export const createUserEvent =
  (): ThunkAction<
    Promise<void>,
    RootState,
    undefined,
    CreateFailureAction | CreateSuccessAction | CreateRequestAction
  > =>
  async (dispatch, getState) => {
    dispatch({
      type: CREATE_REQUEST,
    });

    try {
      const dateStart = selectDateStart(getState());
      const event: Omit<UserEvent, "id"> = {
        title: "No Name",
        dateStart,
        dateEnd: new Date().toISOString(),
      };

      const response = await fetch("http://localhost:3001/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      });

      const createdEvent: UserEvent = await response.json();
      dispatch({
        type: CREATE_SUCCESS,
        payload: {
          event: createdEvent,
        },
      });
    } catch (e) {
      dispatch({
        type: CREATE_FAILURE,
      });
    }
  };

const CREATE_REQUEST = "userEvents/create_request";

const CREATE_SUCCESS = "userEvents/create_success";

const CREATE_FAILURE = "userEvents/create_failure";

interface CreateFailureAction extends Action<typeof CREATE_FAILURE> {}

interface CreateRequestAction extends Action<typeof CREATE_REQUEST> {}

interface CreateSuccessAction extends Action<typeof CREATE_SUCCESS> {
  payload: {
    event: UserEvent;
  };
}

const DELETE_REQUEST = "userEvents/delte_request";
const DELETE_SUCCESS = "userEvents/delete_success";
const DELETE_FAILURE = "userEvents/delete_failure";

interface DeleteRequestAction extends Action<typeof DELETE_REQUEST> {}
interface DeleteSuccessAction extends Action<typeof DELETE_SUCCESS> {
  payload: {
    id: UserEvent["id"];
  };
}

interface DeleteFailure extends Action<typeof DELETE_FAILURE> {}

export const deleteUserEvent =
  (
    id: UserEvent["id"]
  ): ThunkAction<
    Promise<void>,
    RootState,
    undefined,
    DeleteSuccessAction | DeleteFailure | DeleteRequestAction
  > =>
  async (dispatch, getstate) => {
    dispatch({
      type: DELETE_REQUEST,
    });

    try {
      const response = await fetch(`http://localhost:3001/events/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        dispatch({
          type: DELETE_SUCCESS,
          payload: { id },
        });
      }
    } catch (e) {
      dispatch({
        type: DELETE_FAILURE,
      });
    }
  };

const selectUserEventState = (rootstate: RootState) => rootstate.userEvents;

export const selectUserEventsArray = (rootstate: RootState) => {
  const state = selectUserEventState(rootstate)!;
  return state.allIds.map((id) => state.byIds[id]);
};

const initialstate: UserEventState = {
  byIds: {},
  allIds: [],
};

export const loadUserEvents =
  (): ThunkAction<
    void,
    RootState,
    undefined,
    LoadFailureAction | LoadRequestAction | LoadSuccessAction
  > =>
  async (dispatch, getState) => {
    dispatch({
      type: LOAD_REQUEST,
    });
    try {
      const response = await fetch("http://localhost:3001/events");
      const events: UserEvent[] = await response.json();

      dispatch({
        type: LOAD_SUCCESS,
        payload: { events },
      });
    } catch (e) {
      dispatch({
        type: LOAD_FAILURE,
        error: "Failed to load",
      });
    }
  };

const userEventReducer = (
  state: UserEventState = initialstate,
  action: DeleteSuccessAction | LoadSuccessAction | CreateSuccessAction
) => {
  switch (action.type) {
    case LOAD_SUCCESS:
      const { events } = action.payload;
      return {
        ...state,
        allIds: events.map(({ id }) => id),
        byIds: events.reduce<UserEventState["byIds"]>((byIds, event) => {
          byIds[event.id] = event;
          return byIds;
        }, {}),
      };

    case CREATE_SUCCESS:
      const { event } = action.payload;
      return {
        ...state,
        allIds: [...state.allIds, event.id],
        byIds: { ...state.byIds, [event.id]: event },
      };

    case DELETE_SUCCESS:
      const { id } = action.payload;
      const newState = {
        ...state,
        byIds: { ...state.byIds },
        allIds: state.allIds.filter((sid) => sid !== id),
      };
      delete newState.byIds[id];
      return;
    default:
      return state;
  }
};

export default userEventReducer;
