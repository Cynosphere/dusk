import {findByCodeLazy} from "@webpack";
import {useMemo} from "@webpack/common";

const UserProfileActivityCardWrapper = findByCodeLazy('location:"' + 'UserProfileActivityCardWrapper"');
const UserProfileStreamActivityCard = findByCodeLazy('surface:"' + 'user-profile-stream-activity-card",');
const useUserProfileActivity = findByCodeLazy('"use-user-' + 'profile-activity"');
const useUserActivityFeedRecent = findByCodeLazy('"application_id"in', ".extra.application_id", ".GAME_PROFILE_FEED");
const ActivityFeed48h = findByCodeLazy(".Millis.HOUR<48");
const UserProfileRecentActivityCard = findByCodeLazy("{recentActivityEnabled:", ".bot?(0,");

type UserPopoutActivitiesProps = {
  user: any;
  currentUser: any;
  profileGuildId: string;
  className: string;
  onClose: () => void;
};

const LOCATION = "UserProfileFeaturedActivity";

export default function UserPopoutActivities({
  user,
  currentUser,
  profileGuildId,
  className,
  onClose,
}: UserPopoutActivitiesProps) {
  const {live, recent, stream} = useUserProfileActivity(user.id);
  const [firstActivity] = live;

  const isCurrentUser = user.id === currentUser.id;

  const recentFeedEntry = useUserActivityFeedRecent(user.id, LOCATION);
  const feedEntry = useMemo(
    () => (isCurrentUser ? recent.find(ActivityFeed48h) : recentFeedEntry),
    [isCurrentUser, recent, recentFeedEntry],
  );

  const activities = [...live];
  activities.shift();

  return [
    null != stream ? (
      <UserProfileStreamActivityCard
        location={LOCATION}
        user={user}
        currentUser={currentUser}
        stream={stream}
        profileGuildId={profileGuildId}
        className={className}
        onClose={onClose}
      />
    ) : null != firstActivity ? (
      <UserProfileActivityCardWrapper
        location={LOCATION}
        user={user}
        currentUser={currentUser}
        activity={firstActivity}
        profileGuildId={profileGuildId}
        className={className}
        onClose={onClose}
      />
    ) : feedEntry != null ? (
      <UserProfileRecentActivityCard
        location={LOCATION}
        user={user}
        currentUser={currentUser}
        entry={feedEntry}
        profileGuildId={profileGuildId}
        className={className}
        onClose={onClose}
      />
    ) : null,
    ...activities.map((activity: any) => (
      <UserProfileActivityCardWrapper
        location={LOCATION}
        user={user}
        currentUser={currentUser}
        activity={activity}
        profileGuildId={profileGuildId}
        className={className}
        onClose={onClose}
      />
    )),
  ];
}
