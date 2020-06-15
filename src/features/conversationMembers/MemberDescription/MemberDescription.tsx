import React from "react";
import { UserInitialsAvatar } from "foundations/components/UserInitialsAvatar";
import  styled from "styled-components";

import {
  Wrapper,
  Avatar,
  About,
  PresenceDot,
  UserName,
  UserTitle
} from "./MemberDescription.style";
const Img = styled.img`
  width:20px;
  height:20px;
  margin-left:20px;
`
export interface UserFragment {
  name: string;
  id: string;
  custom: {
    title: string;
  };
  profileUrl: string;
  presence: boolean;
}

interface MemberDescriptionProps {
  user: UserFragment;
  you: boolean;
  userindex:number;
  clickHandler:any;
  rightclickHandler:any;
}

const MemberDescription = ({ user, you, userindex, clickHandler, rightclickHandler}: MemberDescriptionProps) => {
  const onContextMenu = (e:any, user:UserFragment)=>{
    e.preventDefault();
    e.stopPropagation();
    let currY = e.nativeEvent.pageY;
    if(currY>window.innerHeight-150)
    currY = window.innerHeight  -150;
    rightclickHandler(user,currY-50);
  }
  const onclickHandler = (e:any, user:UserFragment)=>{
    e.stopPropagation();
    clickHandler(user);
  }
  return (
    <Wrapper onClick={(e)=>onclickHandler(e,user)} onContextMenu = {(e)=>onContextMenu(e,user)}>
      <Avatar>
        <UserInitialsAvatar
          size={36}
          name={user.name}
          userId={user.id}
          muted={!user.presence}
        />
        {user.presence && <PresenceDot presence={user.presence} size={7} />}
      </Avatar>
      <About>
        <UserName muted={!user.presence}>
          {user.name}
          {you && " (you)"}
        </UserName>
        <UserTitle muted={!user.presence}>{user.custom.title}</UserTitle>
      </About>
      {
        userindex ===3 &&<Img  src='tea.png' />
      }
      {
        userindex ===5 &&<Img  src='car.png' />
      }
    
    </Wrapper>
  );
};

export { MemberDescription };
