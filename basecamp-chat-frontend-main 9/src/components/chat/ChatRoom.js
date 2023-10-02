import { useState, useEffect, useRef } from "react";

import {
  getMessagesOfChatRoom,
  getUser,
  sendMessage,
} from "../../services/ChatService";

import Message from "./Message";
import Contact from "./Contact";
import ChatForm from "./ChatForm";
import { toast } from "react-toastify";

export default function ChatRoom({
  currentChat,
  currentUser,
  onlineUsersId,
  socket,
}) {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [incomingMessage, setIncomingMessage] = useState(null);
  const [is_typing, setTyping] = useState("");
  const scrollRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      const res = await getMessagesOfChatRoom(currentChat._id);
      setMessages(res.messages);
      setUsers(res.userinfo);
    };

    fetchData();
  }, [currentChat._id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    socket.current?.on("getMessage", (data) => {
      if (currentChat._id === data.chatRoomId)
        setIncomingMessage({
          senderId: data.senderId,
          message: data.message,
          photo: data.photo,
        });
    });
    socket.current?.on("someonetyping", (data) => {
      if (currentChat._id === data.chatRoomId) setTyping(data.senderEmail);
    });
    socket.current?.on("stoptyping", (data) => {
      if (currentChat._id === data.chatRoomId) setTyping("");
    });
    
    return () => {
      socket.current.off("getMessage");
      socket.current.off("someonetyping");
      socket.current.off("stoptyping")
    };
  }, [currentChat]);

  useEffect(() => {
    incomingMessage && setMessages((prev) => [...prev, incomingMessage]);
  }, [incomingMessage]);

  const handleFormSubmit = async (message) => {
    const receiverId = currentChat.members.find(
      (member) => member !== currentUser.uid
    );
    socket.current.emit("sendMessage", {
      senderId: currentUser.uid,
      receiverId: receiverId,
      message: message,
      id: currentChat._id,
      senderName: currentUser.displayName,
    });
    const messageBody = {
      chatRoomId: currentChat._id,
      sender: currentUser.uid,
      message: message,
      photo: currentUser.photoURL,
    };
    const res = await sendMessage(messageBody);
    setMessages([...messages, res]);
  };

  const handleTyping = async () => {
    const receiverId = currentChat.members.find(
      (member) => member !== currentUser.uid
    );
    socket.current.emit("typing", {
      senderId: currentUser.uid,
      senderEmail: currentUser.displayName,
      receiverId: receiverId,
      id: currentChat._id,
    });
  };

  const handleCancleTyping = async () => {
    const receiverId = currentChat.members.find(
      (member) => member !== currentUser.uid
    );
    socket.current.emit("cancle_typing", {
      senderId: currentUser.uid,
      receiverId: receiverId,
      id: currentChat._id,
    });
  };

  //Remove mention keys
  const handlecheck = (message) => {
    const index = message.message.indexOf("](");
    if (index < 0) return message;
    const string = message.message;
    var mention = "";
    for (let i = index; i < string.length; i++) {
      if (string.charAt(i - 1) === ")") break;
      mention += string.charAt(i);
    }
    message.message = message.message.replace(mention, "").replace("@[", "");
    return message;
  };

  return (
    <div className="lg:col-span-2 lg:block">
      <div className="w-full">
        <div className="p-3 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
          <Contact
            chatRoom={currentChat}
            onlineUsersId={onlineUsersId}
            currentUser={currentUser}
          />
        </div>
        <div className="relative w-full p-6 overflow-y-auto h-[30rem] bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
          <ul className="space-y-2">
            {messages.map((message, index) => (
              <div key={index} ref={scrollRef}>
                <Message
                  message={handlecheck(message)}
                  self={currentUser.uid}
                />
              </div>
            ))}
            {is_typing ? (
              <p className="text-black dark:text-white">
                {is_typing} is typing...
              </p>
            ) : (
              ""
            )}
          </ul>
        </div>
        <ChatForm
          handleFormSubmit={handleFormSubmit}
          handleTyping={handleTyping}
          handleCancleTyping={handleCancleTyping}
          members={currentChat}
          users={users}
        />
      </div>
    </div>
  );
}
