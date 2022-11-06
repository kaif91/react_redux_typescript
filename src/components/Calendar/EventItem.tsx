import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { deleteUserEvent, UserEvent } from "../../redux/user-events";
import { AppDispatch } from "../Recorder/Recorder";

interface Props {
  event: UserEvent;
}

const EventItem: React.FC<Props> = ({ event }) => {
  const dispatch = useDispatch<AppDispatch>();
  const handleClick = () => {
    dispatch(deleteUserEvent(event.id));
  };

  const [edit, setEdit] = useState(false);
  const [title, setTitle] = useState(event.title);
  const hadleTitleClick = () => {
    setEdit(true);
  };

  const inputRef = useRef<HTMLInputElement>;
  useEffect(() => {
    if (edit) {
      inputRef.current?.focus();
    }
  }, [edit]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  return (
    <div className="calendar-event">
      <div className="calendar-event-info">
        <div className="calendar-event-time">10:00 - 12:00</div>
        <div className="calendar-event-title">
          {edit ? (
            <input
              onChange={handleChange}
              ref={inputRef}
              type="text"
              value={event.title}
            />
          ) : (
            <span onClick={hadleTitleClick}>{event.title}</span>
          )}
        </div>
      </div>
      <button onClick={handleClick} className="calendar-event-delete-button">
        &times;
      </button>
    </div>
  );
};

export default EventItem;
