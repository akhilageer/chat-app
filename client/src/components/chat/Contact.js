import { useState, useEffect } from "react";

import { getUser } from "../../services/ChatService";
import UserLayout from "../layouts/UserLayout";
import GroupLayout from "../layouts/GroupLayout";

export default function Contact({ chatRoom, onlineUsersId, currentUser }) {
  const [contact, setContact] = useState();

  useEffect(() => {
    if(chatRoom.name) return;
    const contactId = chatRoom.members?.find(
      (member) => member !== currentUser.uid
    );
    
    const fetchData = async () => {
      const res = await getUser(contactId);
      setContact(res);
    };

    fetchData();
  }, [chatRoom, currentUser]);
  if(chatRoom.name)
    return <GroupLayout information={chatRoom}/>
  else return <UserLayout user={contact} onlineUsersId={onlineUsersId} />;
}
