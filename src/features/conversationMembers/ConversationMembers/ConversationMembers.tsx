import React, { useEffect, useContext, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "reselect";
import { getViewStates } from "features/layout/Selectors";
import { UsersIndexedById, getUsersById } from "features/users/userModel";
import { UserInitialsAvatar } from "foundations/components/UserInitialsAvatar";
import Tooltip from 'rc-tooltip';
import 'rc-tooltip/assets/bootstrap.css';
import {
  Avatar,
  PresenceDot,
} from "../MemberDescription/MemberDescription.style";
import {Container, TextArea, SendButton} from '../../messages/TextMessageEditor/TextMessageEditor.style'
import {
  getUsersByConversationId,
  MembershipHash
} from "../conversationMemberModel";
import {
  getPresenceByConversationId,
  ConversationPresence
} from "features/memberPresence/memberPresenceModel";
import { MemberDescription, UserFragment } from "../MemberDescription";
import { getCurrentConversationId } from "features/currentConversation/currentConversationModel";
import { CrossIcon } from "foundations/components/icons/CrossIcon";
import {
  Wrapper,
  getAnimatedWrapperVariants,
  CloseIcon,
  ScrollableView,
  Header,
  Controls,
  ConversationIcon,
  IconWrapper,
  Details,
  Title,
  Channel
} from "./ConversationMembers.style";
import { fetchMembers, fetchHereNow } from "pubnub-redux";
import { usePubNub } from "pubnub-react";
import { conversationMembersViewHidden } from "features/layout/LayoutActions";
import { ThemeContext } from "styled-components";
import { useMediaQuery } from "foundations/hooks/useMediaQuery";
import { getLoggedInUserId } from "features/authentication/authenticationModel";
import getUniqueColor from "foundations/utilities/getUniqueColor";
import { getCurrentConversationDescription } from "features/currentConversation/Header";

export const getCurrentConversationMembers = createSelector(
  [
    getUsersById,
    getCurrentConversationId,
    getUsersByConversationId,
    getPresenceByConversationId
  ],
  (
    users: UsersIndexedById,
    conversationId: string,
    conversationMemberships: MembershipHash,
    conversationPresence: ConversationPresence
  ): UserFragment[] => {
    let presence = conversationPresence[conversationId];
    return conversationMemberships[conversationId]
      ? conversationMemberships[conversationId].map(user => {
          return {
            ...users[user.id],
            presence: presence
              ? presence.occupants.filter(occupant => {
                  return occupant.uuid === user.id;
                }).length > 0
              : false
          };
        })
      : [];
  }
);

const orderByPresence = (members: UserFragment[]) => {
  return members.sort((userA, userB) =>
    userA.presence === userB.presence ? 0 : userA.presence ? -1 : 1
  );
};
interface ConversationMembersProps{
  isOutClicked:number
}
const ConversationMembers = ({isOutClicked}:ConversationMembersProps) => {
  const userId = useSelector(getLoggedInUserId);
  const members: UserFragment[] = useSelector(getCurrentConversationMembers);
  const currentConversationId = useSelector(getCurrentConversationId);
  const dispatch = useDispatch();
  const pubnub = usePubNub();
  const views = useSelector(getViewStates);
  const theme = useContext(ThemeContext);
  const isMedium = useMediaQuery(theme.mediaQueries.medium);
  const conversation = useSelector(getCurrentConversationDescription);
  const conversationColor = getUniqueColor(
    conversation.name,
    (theme.colors.avatars as unknown) as string[]
  );
 
  const [isSelectedUser, setIsSelectedUser] = useState(false);
  const [isRightSelectedUser, setIsRightSelectedUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserFragment|undefined>(undefined);
  const [rightSelectedUser, setRightSelectedUser] = useState<UserFragment|undefined>(undefined);
  const [rightY, setRightY] = useState(0);
  const [isPrivateMessage, setIsPrivateMessage] = useState(false);
  const [privateMessage, setPrivateMessage] = useState('');

  useEffect(()=>{
    setIsSelectedUser(false);
    setIsRightSelectedUser(false);
  }, [isOutClicked])
  useEffect(() => {
    if (members.length === 0) {
      dispatch(
        fetchMembers({
          spaceId: currentConversationId,
          include: {
            userFields: true,
            customUserFields: true,
            totalCount: false
          }
        })
      );

      dispatch(
        fetchHereNow({
          channels: [currentConversationId]
        })
      );
    }
  }, [members, currentConversationId, pubnub, dispatch]);
  const clickedMember = (user:any)=>{
    setIsPrivateMessage(false);
    setSelectedUser(user);
    setIsSelectedUser(!isSelectedUser);
    setIsRightSelectedUser(false);
  }

  const rightclickedMember = (user:any, position:number)=>{
    setIsPrivateMessage(false);
    setRightSelectedUser(user);
    setIsRightSelectedUser(!isRightSelectedUser);
    setRightY(position);
     
  }
  const clickHandler = ()=>{
    setIsSelectedUser(false);
    setIsRightSelectedUser(false);
  }
  const clickPrivateHandler=(e:any)=>{
   
    e.stopPropagation();
  }
  const onPrivateMessage = (e:any)=>{
    setPrivateMessage(e.target.value);
  }
  const messageHandler = ()=>{
    setIsPrivateMessage(true);
  }
  const sendPrivateMessage = ()=>{

  }
  return (<div style={{position:'relative'}} onClick={(e)=>clickHandler()}>
  {
    isSelectedUser &&selectedUser!==undefined && <div style={{borderRadius:'10%',padding:'20px',background:'#65b365', position:'absolute', left:'-200px',height:'200px',width:'200px',bottom:'0px'}}>
    <Avatar style={{margin:'auto'}}>
        <UserInitialsAvatar
          size={36}
          name={selectedUser.name}
          userId={selectedUser.id}
          muted={!selectedUser.presence}
        />
        {selectedUser.presence && <PresenceDot presence={selectedUser.presence} size={7} />}
      </Avatar>
      <h3 style={{color:'grey'}}>Role</h3>
      
      <Tooltip placement="bottom"  overlay={<div><h3>{selectedUser.name}</h3><div>{selectedUser.custom.title}</div></div> }>
      <div  style={{padding:'10px',border:'1px solid grey', borderRadius:'15%'}}>Minecraft Staff</div>
        
      </Tooltip>
     
    </div>
  }
     {
    isRightSelectedUser &&rightSelectedUser!==undefined && <div onClick={(e)=>clickPrivateHandler(e)} style={{borderRadius:'10%',padding:'20px',background:'#c1c1c1', position:'absolute', left:'-150px',height:'250px',width:'150px', top:`${rightY}px`}}>
    <div>Profile</div>   <br/>
    <div style={{cursor:'pointer'}} onClick = {(e)=>messageHandler()}>Message</div>   <br/>
    <div style={{cursor:'pointer'}}>Call</div>  <br/> 
    <div style={{cursor:'pointer'}}>Mute</div>   <br/>
    <div style={{cursor:'pointer'}}>Add Note</div>   
    
     {isPrivateMessage && <><input type='text' value={privateMessage} onChange={(e)=>onPrivateMessage(e)} style={{width:'100%'}}></input><div><button onClick={()=>sendPrivateMessage()}>Send</button></div></> }
    </div>
  }
    <Wrapper
      animate={views.ConversationMembers ? "open" : "closed"}
      variants={getAnimatedWrapperVariants(isMedium, theme.sizes[4])}
      transition={{ ease: "linear", duration: 0.15 }}
    >
      <Controls>
        <CloseIcon
          onClick={() => {
            dispatch(conversationMembersViewHidden());
          }}
        >
          <CrossIcon
            color={theme.colors.normalText}
            title="close members list"
          />
        </CloseIcon>
      </Controls>
      <Header>
        <IconWrapper>
          <ConversationIcon color={conversationColor}>#</ConversationIcon>
          <Details>
            <Channel>{conversation.name}</Channel>
          </Details>
        </IconWrapper>
      </Header>
      <Title>Members</Title>
      <ScrollableView>
        {orderByPresence(members).map((user, index) => {
          if(index ===2)
            return <div key={user.id} style={{color:'grey', marginLeft:'20px'}}>Moderate</div>;
          return <MemberDescription
            user={user}
            userindex={index}
            key={user.id}
            clickHandler={clickedMember}
            rightclickHandler={rightclickedMember}
            you={user.id === userId}
          />
})}
      </ScrollableView>
    </Wrapper></div>
  );
};

export { ConversationMembers };
