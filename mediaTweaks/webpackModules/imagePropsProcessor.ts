const filetypeWhitelist = [".gif", ".mov", ".mp4", ".webm", ".webp"];

type ImageProps = {
  src: string;
  sourceWidth: number;
  sourceHeight: number;
  targetWidth: number;
  targetHeight: number;
  format?: string;
  quality?: string;
  animated?: boolean;
  srcIsAnimated?: boolean;
};

export default function processProps(props: ImageProps, settings: any) {
  if (settings.store.noWebp) {
    let whitelisted = false;
    for (const type of filetypeWhitelist) {
      if (props.src.indexOf(type) > -1) {
        whitelisted = true;
        break;
      }
    }

    if (props.format === "webp" && !whitelisted && !props.animated && !props.srcIsAnimated) {
      props.format = undefined;
    }
  }

  if (settings.store.noThumbnailSize) {
    props.targetWidth = props.sourceWidth * window.devicePixelRatio;
    props.targetHeight = props.sourceHeight * window.devicePixelRatio;
  }
}
