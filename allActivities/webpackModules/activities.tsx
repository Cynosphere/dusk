import {findByCodeLazy} from "@webpack";

const UserProfileActivityCardWrapper = findByCodeLazy('location:"' + 'UserProfileActivityCardWrapper"');
const UserProfileStreamActivityCard = findByCodeLazy('surface:"' + 'user-profile-stream-activity-card",');
const useUserProfileActivity = findByCodeLazy('"use-user-' + 'profile-activity"');

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
  const {live, stream} = useUserProfileActivity(user.id);
  const [firstActivity] = live;

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
