import React, { useEffect } from "react";
import "./Calendar.css";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "../../redux/store";
import {
  selectUserEventsArray,
  loadUserEvents,
  UserEvent,
} from "../../redux/user-events";
import { addZero } from "../../lib/utils";
import EventItem from "./EventItem";

const mapStateToProps = (state: RootState) => ({
  events: selectUserEventsArray(state),
});

const mapDispatch = {
  loadUserEvents,
};

const connector = connect(mapStateToProps, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props extends PropsFromRedux {}

const createDateKey = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  return `${year}-${addZero(month)}-${addZero(day)}`;
};

const groupEventsByDay = (events: UserEvent[]) => {
  const groups: Record<string, UserEvent[]> = {};
  const addToGroup = (date: string, event: UserEvent) => {
    if (groups[date] === undefined) {
      groups[date] = [];
    }
    groups[date].push(event);
  };
  events.forEach((event) => {
    const st = createDateKey(new Date(event.dateStart));
    const end = createDateKey(new Date(event.dateEnd));

    addToGroup(st, event);
    if (end !== st) {
      addToGroup(end, event);
    }
  });
  return groups;
};

const Calendar: React.FC<Props> = ({ events, loadUserEvents }) => {
  useEffect(() => {
    loadUserEvents();
  }, []);

  let groupedEvents: ReturnType<typeof groupEventsByDay> | undefined;
  let sortedGroupKeys: string[] | undefined;
  if (events.length) {
    groupedEvents = groupEventsByDay(events);
    sortedGroupKeys = Object.keys(groupedEvents).sort(
      (date1, date2) => +new Date(date1) - +new Date(date2)
    );
  }

  return groupedEvents && sortedGroupKeys ? (
    <div className="calendar">
      {sortedGroupKeys.map((d) => {
        const events = groupedEvents![d];
        const groupDate = new Date(d);
        const day = groupDate.getDay();
        const month = groupDate.toLocaleString(undefined, { month: "long" });
        return (
          <div className="calendar-day">
            <div className="calendar-day-label">
              <span>
                {day} {month}
              </span>
            </div>
            <div className="calendar-events">
              {events.map((event) => {
                return <EventItem key={event.id} event={event} />;
              })}
            </div>
          </div>
        );
      })}
      ;
    </div>
  ) : (
    <p>Loading...</p>
  );
};

export default connector(Calendar);
