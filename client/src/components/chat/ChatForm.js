import { useState, useEffect, useRef } from "react";

import { PaperAirplaneIcon } from "@heroicons/react/solid";
import { EmojiHappyIcon } from "@heroicons/react/outline";
import Picker from "emoji-picker-react";
import { getUser, getUsers } from "../../services/ChatService";
import "./mentionstyle.css";
import { Mention, MentionsInput } from "react-mentions";
import { StylesViaJss } from "substyle-jss";
import Style from "./mentioninput.css";
import CommentParagraph from "./CommentParagraph";

export default function ChatForm(props) {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  const scrollRef = useRef();

  useEffect(() => {
    const timeout = setTimeout(() => {
      props.handleCancleTyping();
    }, 500);
    return () => clearTimeout(timeout);
  }, [message]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView();
  }, [showEmojiPicker]);

  const handleEmojiClick = (event, emojiObject) => {
    let newMessage = message + emojiObject.emoji;
    setMessage(newMessage);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    props.handleFormSubmit(message);
    setMessage("");
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    // e.preventDefault();
    props.handleTyping();
  };

  return (
    <StylesViaJss>
      <div ref={scrollRef}>
        {showEmojiPicker && (
          <Picker
            className="dark:bg-gray-900"
            onEmojiClick={handleEmojiClick}
          />
        )}
        <form onSubmit={handleFormSubmit}>
          <div className="flex items-center justify-between w-full p-3 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowEmojiPicker(!showEmojiPicker);
              }}
            >
              <EmojiHappyIcon
                className="h-7 w-7 text-blue-600 dark:text-blue-500"
                aria-hidden="true"
              />
            </button>
            <div className="col-11 px-0 w-full border border-gray-300 rounded-lg bg-white">
              <MentionsInput
                value={message}
                onChange={handleChange}
                className="mentions"
                classNames={Style}
                placeholder="Write a message"
                allowSuggestionsAboveCursor={true}
              >
                <Mention
                  data={props.users}
                  className={Style.mentions__mention}
                />
              </MentionsInput>
              <div className="col-12">
                {comments.length > 0 &&
                  comments.map((c) => <CommentParagraph comment={c} />)}
              </div>
            </div>
            <button type="submit" disabled={message ? false : true}>
              <PaperAirplaneIcon
                className="h-6 w-6 text-blue-600 dark:text-blue-500 rotate-[90deg]"
                aria-hidden="true"
              />
            </button>
          </div>
        </form>
      </div>
    </StylesViaJss>
  );
}
