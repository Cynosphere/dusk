import "./style.css";

import {definePluginSettings} from "@api/Settings";
import {Devs} from "@utils/constants";
import definePlugin, {OptionType} from "@utils/types";

import activities from "./webpackModules/activities";
import icons from "./webpackModules/icons";

const settings = definePluginSettings({
  icons: {
    type: OptionType.BOOLEAN,
    description: "Enable activity icons in member list",
    default: true,
  },
});

export default definePlugin({
  name: "All Activites",
  authors: [Devs.Cyn],
  description: "Shows all activities in user popouts, and optionally icons in the member list (moonlight port)",

  settings,

  patches: [
    // Replace the existing activity/stream wrapper component with one we can add to easier
    {
      find: '"UserProfileFeaturedActivity"',
      replacement: {
        match: /:\(\)=>(\i)}/,
        replace: ":()=>$self.activities}",
      },
    },

    // Make streams account for "Competing In"
    {
      find: '.STREAM_PREVIEW="StreamPreview"',
      replacement: {
        match: /\(null==\i\?void 0:\i\.type\)!==\i\.\i\.PLAYING&&/,
        replace: (orig: string) => orig + orig.replace("PLAYING", "COMPETING"),
      },
    },

    // Do not de-duplicate entries in useUserProfileActivity
    {
      find: '"use-user-profile-activity"',
      replacement: {
        match: /\(0,\i\.uniqWith\)/,
        replace: "((inp)=>inp)",
      },
    },

    // Icons
    {
      find: ".lostPermission",
      predicate: () => settings.store.icons,
      replacement: {
        match: /name:null==\i\?(\(0,\i\.jsx\))\("span"/,
        replace: (orig, createElement) => `children:${createElement}($self.icons,{user:arguments[0].user}),${orig}`,
      },
    },
  ],

  activities,
  icons,
});
