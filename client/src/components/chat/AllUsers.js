import { useState, useEffect } from "react";

import { createChatRoom } from "../../services/ChatService";
import Contact from "./Contact";
import UserLayout from "../layouts/UserLayout";
import Groups from "./Groups";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function AllUsers({
  users,
  chatRooms,
  setChatRooms,
  onlineUsersId,
  currentUser,
  changeChat,
  socket,
}) {
  const [selectedChat, setSelectedChat] = useState();
  const [nonContacts, setNonContacts] = useState([]);
  const [contactIds, setContactIds] = useState([]);
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    // const Ids = chatRooms.map((chatRoom) => {
    //   return chatRoom.members.find((member) => member === currentUser.uid);
    // });
    let Ids = [];
    chatRooms.map((chatRoom) => {
      if(chatRoom.members.includes(currentUser.uid)){
        chatRoom.members.map((member) => {
          if(!Ids.includes(member))
            Ids.push(member)
        })
      }
    })
    setContactIds(Ids);
  }, [chatRooms, currentUser.uid]);

  useEffect(() => {
    setNonContacts(
      users.filter(
        (f) => f.uid !== currentUser.uid && !contactIds.includes(f.uid)
      )
    );
  }, [contactIds, users, currentUser.uid]);

  const changeCurrentChat = (index, chat) => {
    setSelectedChat(index);
    changeChat(chat);
  };

  const handleNewChatRoom = async (user) => {
    const members = {
      senderId: currentUser.uid,
      receiverId: user.uid,
    };
    socket.current?.emit("RoomCreated", members);
    const res = await createChatRoom(members);
    setChatRooms((prev) => [...prev, res]);
    changeChat(res);
  };

  const handleNewGroupChat = async () => {
    if (!groupName) {
      alert("Please enter group name");
      return;
    }
    const members = {
      senderId: currentUser.uid,
      receiverId: "Group",
      groupName: groupName,
    };
    socket.current?.emit("RoomCreated", members);
    const res = await createChatRoom(members);
    setChatRooms((prev) => [...prev, res]);
    changeChat(res);
  };

  return (
    <>
      <ul className="overflow-auto h-[30rem]">
        <h2 className="my-2 mb-2 ml-2 text-gray-900 dark:text-white">
          1:1 Chat rooms
        </h2>
        <li>
          {chatRooms.map((chatRoom, index) =>
            chatRoom.name || chatRoom.members.indexOf(currentUser.uid) < 0 ? (
              ""
            ) : (
              <div
                key={index}
                className={classNames(
                  index === selectedChat
                    ? "bg-gray-100 dark:bg-gray-700"
                    : "transition duration-150 ease-in-out cursor-pointer bg-red-100 border-b border-gray-200 hover:bg-gray-100 dark:text-white dark:bg-gray-900 dark:border-gray-700 dark:hover:bg-gray-700",
                  "flex items-center px-3 py-2 text-sm "
                )}
                onClick={() => changeCurrentChat(index, chatRoom)}
              >
                <Contact
                  chatRoom={chatRoom}
                  onlineUsersId={onlineUsersId}
                  currentUser={currentUser}
                />
              </div>
            )
          )}
        </li>
        <h2 className="my-2 mb-2 ml-2 text-gray-900 dark:text-white">
          Other Users
        </h2>
        <li>
          {nonContacts.map((nonContact, index) => (
            <div
              key={index}
              className="flex items-center px-3 py-2 text-sm bg-white border-b border-gray-200 hover:bg-gray-100 dark:bg-gray-900 dark:border-gray-700 dark:hover:bg-gray-700 cursor-pointer"
              onClick={() => handleNewChatRoom(nonContact)}
            >
              <UserLayout user={nonContact} onlineUsersId={onlineUsersId} />
            </div>
          ))}
        </li>
        <h2 className="my-2 mb-2 ml-2 text-gray-900 dark:text-white">
          Chat rooms
        </h2>
        <li>
          {chatRooms.map((chatRoom, index) =>
            !chatRoom.name ? (
              ""
            ) : (
              <div
                key={index}
                className={classNames(
                  index === selectedChat
                    ? "bg-gray-100 dark:bg-gray-700"
                    : "transition duration-150 ease-in-out cursor-pointer bg-blue-100 border-b border-gray-200 hover:bg-gray-100 dark:bg-gray-900 dark:border-gray-700 dark:hover:bg-gray-700",
                  "flex items-center px-3 py-2 text-sm "
                )}
                onClick={() => changeCurrentChat(index, chatRoom)}
              >
                <Groups
                  chatRoom={chatRoom}
                  onlineUsersId={onlineUsersId}
                  currentUser={currentUser}
                />
              </div>
            )
          )}
        </li>
        <li>
          <input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="border dark:border-white border-black"
          />
          <button
            className="border border-black rounded-lg p-2 dark:text-white dark:border-white hover:bg-green-300"
            onClick={handleNewGroupChat}
          >
            Create Room
          </button>
        </li>
      </ul>
    </>
  );
}
