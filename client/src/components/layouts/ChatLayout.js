import { useEffect, useRef, useState } from "react";

import {
  getAllUsers,
  getChatRooms,
  initiateSocketConnection,
} from "../../services/ChatService";
import { useAuth } from "../../contexts/AuthContext";

import ChatRoom from "../chat/ChatRoom";
import Welcome from "../chat/Welcome";
import AllUsers from "../chat/AllUsers";

import { toast } from "react-toastify";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { useNavigate } from "react-router-dom";


export default function ChatLayout() {
  const [users, SetUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);

  const [currentChat, setCurrentChat] = useState();
  const [onlineUsersId, setonlineUsersId] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [isContact, setIsContact] = useState(false);
  const { route } = useAuthenticator((context) => [
    context.route,
  ]);
  const navigate = useNavigate();

  useEffect(()=>{
    if(route !== 'authenticated')
    navigate('/login');
  },[route])
  
  const socket = useRef();

  const { currentUser } = useAuth();
  useEffect(() => {
    const getSocket = async () => {
      const res = await initiateSocketConnection();
      socket.current = res;
      socket.current.emit("addUser", currentUser.uid);
      socket.current.on("getUsers", async (users) => {
      //   const res = await getAllUsers();
      // SetUsers(res);  
        const userId = users.map((u) => u[0]);
        setonlineUsersId(userId);
      });
      socket.current.on("RoomCreatedFrom", async (data) => {
        const res = await getChatRooms(currentUser.uid);
        setChatRooms(res);
      });
      socket.current?.on("receive_notification", (data) => {
        if (currentChat?._id !== data.chatRoomId && data.senderId !== currentUser.uid) toast.warning(data.text);
      });
      return () => {
        socket.current.off("getUsers");
        socket.current.off("RoomCreatedFrom");
        socket.current.off("receive_notification");
      }
    };

    getSocket();
  }, [currentUser]);

  useEffect(()=>{
    socket.current?.on("receive_notification", (data) => {
      if (currentChat?._id !== data.chatRoomId) toast.warning(data.text);
    });
    return () => {
      socket.current?.off("receive_notification");
    }
  },[currentChat])

  useEffect(() => {
    const fetchData = async () => {
      const res = await getChatRooms(currentUser.uid);
      setChatRooms(res);
    };

    fetchData();
  }, [currentUser.uid]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getAllUsers();
      SetUsers(res);
    };

    fetchData();
  }, []);

  useEffect(() => {
    setFilteredUsers(users);
    setFilteredRooms(chatRooms);
  }, [users, chatRooms]);

  useEffect(() => {
    if (isContact) {
      setFilteredUsers([]);
    } else {
      setFilteredRooms([]);
    }
  }, [isContact]);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
    if(chat.name)
       socket.current.emit('chatchanged', {id: currentUser.uid, name: chat.name});
  };

  const handleSearch = (newSearchQuery) => {
    setSearchQuery(newSearchQuery);

    const searchedUsers = users.filter((user) => {
      return user.displayName
        .toLowerCase()
        .includes(newSearchQuery.toLowerCase());
    });

    const searchedUsersId = searchedUsers.map((u) => u.uid);

    // If there are initial contacts
    if (chatRooms.length !== 0) {
      chatRooms.forEach((chatRoom) => {
        // Check if searched user is a contact or not.
        const isUserContact = chatRoom.members.some(
          (e) => e !== currentUser.uid && searchedUsersId.includes(e)
        );
        setIsContact(isUserContact);

        isUserContact
          ? setFilteredRooms([chatRoom])
          : setFilteredUsers(searchedUsers);
      });
    } else {
      setFilteredUsers(searchedUsers);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="min-w-full bg-white border-x border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded lg:grid lg:grid-cols-3">
        <div className="bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-700 lg:col-span-1">
          {/* <SearchUsers handleSearch={handleSearch} /> */}

          <AllUsers
            users={searchQuery !== "" ? filteredUsers : users}
            chatRooms={searchQuery !== "" ? filteredRooms : chatRooms}
            setChatRooms={setChatRooms}
            onlineUsersId={onlineUsersId}
            currentUser={currentUser}
            changeChat={handleChatChange}
            socket={socket}
          />
        </div>

        {currentChat ? (
          <ChatRoom
            currentChat={currentChat}
            currentUser={currentUser}
            socket={socket}
            onlineUsersId={onlineUsersId}
          />
        ) : (
          <Welcome />
        )}
      </div>
    </div>
  );
}
