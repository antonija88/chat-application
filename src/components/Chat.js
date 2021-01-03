import React, { useState, useEffect, useRef} from "react";
import Messages from "./Messages";
import {channelID, randomColor, randomName} from "../helpers";
import Members from "./Members";


const Chat = () => {
const [user, setUser] = useState({username: randomName(), color: randomColor()});
const [messages, setMessages] = useState([]);
const [newMessage, setNewMessage] = useState("");
const [members, setMembers] = useState({ inRoom: []});
const drone = useRef();


useEffect(() => {

  drone.current = new window.Scaledrone(channelID, {
    data: user,
  });

  const room = drone.current.subscribe('observable-room');

  drone.current.on("open", (error) => {
    if (error) {
      console.error(error);
    } else {
      console.log("Connected");
      const droneState = {...user};
      droneState.id = drone.current.clientId;
      setUser({droneState});
    }
  });

  room.on("message", (message) => {
    const {data, id, timestamp, member} = message;
    const time = new Date(timestamp * 1000).toLocaleTimeString("hr-HR");
    messages.push({id, member, text: data, time});
    setMessages([...messages], messages);
    console.log(messages);
  });

  room.on("members", (mems)=> {
    members.inRoom = mems;
    setMembers({...members});
  });

  room.on("member_join", (member) => {
    members.inRoom.push(member);
    setMembers({...members} );
  });
  room.on("member_leave", (member) => {
    const mems = members.inRoom.filter(
      (memberIndex) => memberIndex.id !== member.id
    );
    members.inRoom = mems;
    setMembers({...members});
  })
}, [])



function handleOnChange(event) {
    setNewMessage(event.target.value);
}

function sendMessage() {
  console.log(drone.current);
  drone.current.publish({
    room: "observable-room",
    message: newMessage,
  });
  setNewMessage("");
}

return (
        <div className="container">
          <div className="sidebar">
            <ul>
              {members.inRoom.map((member) => {
                return (
                  <Members key={member.id} name={member.clientData.username} color={member.clientData.color}/>
                )
              })
              }
            </ul>
          </div>
          <div className="chatbox">
            <Messages messages={messages} user={user.droneState} />
          <div className="input_field_box">
          <input
            value={newMessage}
            onChange={handleOnChange}
            placeholder="Upišite poruku..."
            className="input_field"
            type="text"
          />

        <button onClick={sendMessage} className="send-message-button">
          Šalji
        </button>
        </div>
      </div>
    </div>
    );
};

export default Chat;
