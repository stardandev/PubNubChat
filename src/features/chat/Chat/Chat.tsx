import React, {useState} from "react";
import { Wrapper } from "./ChatUI.style";
import { Menu } from "features/chat/Menu/Menu";
import { CurrentConversation } from "features/currentConversation/CurrentConversation/CurrentConversation";
import { ConversationMembers } from "features/conversationMembers/ConversationMembers/ConversationMembers";
import { JoinConversationDialog } from "features/joinedConversations/JoinConversationDialog/JoinConversationDialog";

const ChatUI = () => {
  const [clicked, setClicked] = useState(0)
  
  const clickHandler = ()=>{
    setClicked(clicked+1);
  }
  
  return (
    <Wrapper onClick = {(e)=>clickHandler()}>
      <Menu />
      <CurrentConversation />
      <ConversationMembers isOutClicked = {clicked}/>
      <JoinConversationDialog />
    </Wrapper>
  );
};

export { ChatUI };
