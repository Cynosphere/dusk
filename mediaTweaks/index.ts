import "./style.css";

import {definePluginSettings} from "@api/Settings";
import {Devs} from "@utils/constants";
import definePlugin, {OptionType} from "@utils/types";

import enlargeVideoButton, {createButtonGroup} from "./webpackModules/enlargeVideoButton";
import videoMetadata from "./webpackModules/videoMetadata";
import imagePropsProcessor from "./webpackModules/imagePropsProcessor";

export const settings = definePluginSettings({
  imageUrls: {
    type: OptionType.BOOLEAN,
    description: "Image URLs",
    default: true,
  },
  noGifAutosend: {
    type: OptionType.BOOLEAN,
    description: "Puts the URL in the textbox when clicking a GIF instead of automatically sending it",
    default: true,
  },
  videoMetadata: {
    type: OptionType.BOOLEAN,
    description: "Restores filename and filesize on video attachments",
    default: true,
  },
  inlineMosaicPlayback: {
    type: OptionType.BOOLEAN,
    description: "Allows videos in a media mosaic to be played inline instead of playing in a modal",
    default: true,
  },
  enlargeVideoButton: {
    type: OptionType.BOOLEAN,
    description: "Adds a button to open videos in the image preview modal",
    default: true,
  },
  noWebp: {
    type: OptionType.BOOLEAN,
    description: "Disables fetching WebP versions of images for better clarity",
    default: true,
  },
  noThumbnailSize: {
    type: OptionType.BOOLEAN,
    description:
      "Removes size parameters from thumbnails. **This will cause your client to freeze in channels with lots of high resolution images in them**",
    default: true,
  },
});

export default definePlugin({
  name: "Media Tweaks",
  authors: [Devs.Cyn],
  description: "Various tweaks to images and videos. Every feature togglable. (moonlight port)",

  settings,

  patches: [
    // Image URLs
    {
      find: "allowLinks:!!",
      replacement: {
        match: /,(\(null!=\i\?\i:\i\)\.embeds\)\),)/,
        replace: (_, orig) => `,$self.settings.store.imageUrls?{}:${orig}`,
      },
    },

    // No GIF Autosend
    {
      find: ".TOGGLE_GIF_PICKER,handler:",
      replacement: {
        match: /\i===\i\.\i\.CREATE_FORUM_POST/,
        replace: (orig: string) => `($self.settings.store.noGifAutosend?true:${orig})`,
      },
    },

    // Video Metadata
    {
      find: "renderMetadata()",
      replacement: {
        match:
          /(?<=(\i===\i\.VIDEO)\?.+?(\(0,\i\.jsx\))\("div",{className:(.+?\.overlayContentHidden]:)\i\|\|\i\}\),children:\i\(\)}\):null)]/,
        replace: (_, videoCheck, createElement, className) =>
          `,${videoCheck}&&$self.settings.store.videoMetadata?${createElement}("div",{className:${className}this.state.playing&&!this.state.hovering}),children:${createElement}($self.videoMetadata,this.props)}):null]`,
      },
    },

    // Inline Mosaic Playback
    {
      find: 'location:"MessageAccessories"',
      replacement: {
        match: /=(\(0,\i\.\i\))\((\i),({shouldRedactExplicitContent:\i,shouldHideMediaOptions:\i}),(\i)\),/,
        replace: (_, createCarousel, attachments, props, analytics) =>
          `=${createCarousel}($self.settings.store.inlineMosaicPlayback?${attachments}.filter(x=>x.type!="VIDEO"):${attachments},${props},${analytics}),`,
      },
    },

    // Enlarge Video Button
    // TODO: Move this patch to a library
    {
      find: ".spoilerRemoveMosaicItemButton:",
      replacement: [
        // Send the full item over
        {
          match: /,downloadURL:(\i)\.downloadUrl,/,
          replace: (orig, item) => `,item:${item}${orig}`,
        },

        // Add button
        {
          match:
            /(?<=isVisualMediaType:\i,channelId:.+?}=(\i);.+?(\(0,\i\.jsx\)).+?\.forceShowHover]:\i}\),children:\[)/,
          replace: (_, props, createElement) => `${createElement}($self.enlargeVideoButton,${props}),`,
        },
      ],
    },
    {
      find: ".VIDEO_EMBED_PLAYBACK_STARTED,",
      replacement: {
        match: ".proxyURL,placeholder:",
        replace: ".proxyURL,renderAdjacentContent:$self.createButtonGroup(arguments[0]),placeholder:",
      },
    },

    // No WebP and No Thumbnail Size
    {
      find: /\(\i\+="\?"\+\i\.stringify\(\i\)\)/,
      replacement: {
        match: /if\((\i)\.sourceWidth<.\.targetWidth\){/,
        replace: (orig, props) => `$self.imagePropsProcessor(${props},$self.settings);${orig}`,
      },
    },
  ],

  enlargeVideoButton,
  createButtonGroup,
  videoMetadata,
  imagePropsProcessor,
});
