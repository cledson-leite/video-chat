import { User } from "@clerk/nextjs/server";
import Peer, { SignalData } from 'simple-peer';

export type SocketUser = {
  userId: string
  socketId: string
  profile: User
}

export type OngoingCall = {
  participants: Participants
  isRinging: boolean
}

export type Participants = {
  origem: SocketUser
  destino: SocketUser
}

export type PeerData = {
  peer: Peer.Instance
  stream: MediaStream | undefined
  participantUser: SocketUser
}

export type ConnectionData = {
  sdp: SignalData,
  onGoingCall: OngoingCall,
  isCaller: boolean
}