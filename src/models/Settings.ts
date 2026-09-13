export type ProfileVisibility = "public" | "connections" | "private";
export type ConnectionsVisibility = "onlyMe" | "level1";
export type WeeklyDigestFrequency = "off" | "monday" | "friday";

export interface AccountSettings {
  profileVisibility: ProfileVisibility;
  searchVisible: boolean;
  connectionsVisibility: ConnectionsVisibility;
  anonymousBrowsing: boolean;
  connectionRequestNotifications: boolean;
  postReactionNotifications: boolean;
  messageNotifications: boolean;
  skillEndorsementNotifications: boolean;
  weeklyDigest: WeeklyDigestFrequency;
  twoFactorEnabled: boolean;
}
