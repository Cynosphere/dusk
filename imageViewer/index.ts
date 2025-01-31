import "./style.css";

import {Devs} from "@utils/constants";
import definePlugin from "@utils/types";

import imageViewer from "./webpackModules/imageViewer";

export default definePlugin({
  name: "Image Viewer",
  authors: [Devs.Cyn, {name: "NotNite", id: 164469624463818752n}],
  description: "Pan and zoom in image popouts, plus some other tools (moonlight port)",

  patches: [
    {
      find: ".zoomedMediaFitWrapper,",
      replacement: {
        match: /(?<=\.Fragment,{children:)(\(0,\i\.jsx\))\(\i\.animated\.div,{.+?},(\i)\.url\)/,
        replace: (_, createElement, media) => `${createElement}($self.imageViewer,${media},${media}.url)`,
      },
    },

    // media proxy cannot upscale images, prevent fetching images larger than possible
    {
      find: '.startsWith("data:image"))return',
      replacement: {
        match: /function( \i)?\((\i)\){(let{src:\i,sourceWidth:\i,sourceHeight:\i,targetWidth:\i,targetHeight:\i)/,
        replace: (_, name, props, orig) =>
          `function${
            name ?? ""
          }(${props}){if(${props}.sourceWidth<${props}.targetWidth){${props}.targetWidth=${props}.sourceWidth;${props}.targetHeight=${props}.sourceHeight;}${orig}`,
      },
    },
  ],

  imageViewer,
});
