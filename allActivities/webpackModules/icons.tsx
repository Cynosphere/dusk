import {findByCodeLazy, findByPropsLazy, findStoreLazy, waitFor} from "@webpack";
import {useStateFromStores, UserStore, Tooltip, useMemo} from "@webpack/common";

const ApplicationStore = findStoreLazy("ApplicationStore");
const GameStore = findStoreLazy("GameStore");

const ActivityTypes = findByPropsLazy("CUSTOM_STATUS", "LISTENING");
const PlatformTypes = findByPropsLazy("LEAGUE_OF_LEGENDS");

const useUserProfileActivity = findByCodeLazy('"use-user-' + 'profile-activity"');
const UserProfileActivityCard = findByCodeLazy('location:"' + 'UserProfileActivityCard",');

const ActivityClasses = findByPropsLazy("applicationStreamingPreviewWrapper");

let SpotifyIcon, TwitchIcon;

waitFor(["getByUrl", "isSupported"], (ConnectionPlatforms) => {
  SpotifyIcon = ConnectionPlatforms.get(PlatformTypes.SPOTIFY).icon.lightSVG;
  TwitchIcon = ConnectionPlatforms.get(PlatformTypes.TWITCH).icon.lightSVG;
});

type ActivityIconsProps = {
  user: any;
};
type ActivityIconProps = {
  user: any;
  currentUser: any;
  activity: any;
};
type ActivityIconIconProps = {
  card: any;
  icon: string;
};

function ActivityIconIcon({card, icon}: ActivityIconIconProps) {
  return (
    <Tooltip text={card} position="left" tooltipClassName="allActivities-iconTooltip">
      {(tooltipProps: any) => <img {...tooltipProps} className={ActivityClasses.headerIcon} src={icon} />}
    </Tooltip>
  );
}

function ActivityIcon({user, currentUser, activity}: ActivityIconProps) {
  const game = useStateFromStores([GameStore, ApplicationStore], () => {
    return activity != null && activity.application_id
      ? ApplicationStore.getApplication(activity.application_id)
      : activity.title && GameStore.getGameByName(activity.title);
  });

  const gameIcon = useMemo(() => game?.getIconURL(24), [game]);

  const card = useMemo(
    () => (
      <UserProfileActivityCard
        user={user}
        currentUser={currentUser}
        activity={activity}
        className="allActivities-iconCard"
      />
    ),
    [user, currentUser, activity, UserProfileActivityCard],
  );

  if (activity.name === "Spotify") {
    return <ActivityIconIcon card={card} icon={SpotifyIcon} />;
  } else if (activity.type === ActivityTypes.STREAMING) {
    return <ActivityIconIcon card={card} icon={TwitchIcon} />;
  } else if (activity.application_id && activity?.assets?.large_image) {
    const icon = activity.assets.large_image.startsWith("mp:")
      ? activity.assets.large_image.replace("mp:", "https://media.discordapp.net/") + "?width=24&height=24"
      : activity.assets.large_image.startsWith("spotify:")
        ? activity.assets.large_image.replace("spotify:", "https://i.scdn.co/image/")
        : `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.png?size=24`;
    return <ActivityIconIcon card={card} icon={icon} />;
  } else if (game && gameIcon) {
    return <ActivityIconIcon card={card} icon={gameIcon} />;
  }

  return null;
}

export default function ActivityIcons({user}: ActivityIconsProps) {
  const currentUser = useStateFromStores([UserStore], () => UserStore.getCurrentUser());
  const {live} = useUserProfileActivity(user.id);

  return (
    <div className="allActivities-icons">
      {live.map((activity: any) => (
        <ActivityIcon user={user} currentUser={currentUser} activity={activity} />
      ))}
    </div>
  );
}
