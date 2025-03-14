import {findByPropsLazy, findByCodeLazy, findModuleId, wreq, proxyLazyWebpack} from "@webpack";

import {Clickable, Tooltip} from "@webpack/common";
const MaximizeIcon = findByCodeLazy("M14 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0V5.41l-5.3");

const HoverButtonClasses = findByPropsLazy("hoverButton");

type HoverButtonsProps = {
  mimeType: string[];
  item: Record<string, any>;
};

type VideoProps = {
  video: {
    width: number;
    height: number;
    proxyURL: string;
    url: string;
  };
};

type MimeType = {
  source: string;
  extensions?: string[];
  compressible?: boolean;
};

const LazyMediaModalFind = ".MEDIA_VIEWER,source:";
const LazyMediaModal = findByCodeLazy(LazyMediaModalFind, LazyMediaModalFind);
const MediaModalClasses = proxyLazyWebpack(() => wreq(findModuleId(/{modal:"modal_[a-z0-9]+"}/)));

const MimeTypes = proxyLazyWebpack(() =>
  Object.entries(wreq(findModuleId(`JSON.parse('{"application/1d-interleaved-parityfec":`))),
);

export default function EnlargeVideoButton({mimeType, item}: HoverButtonsProps) {
  return mimeType?.[0] !== "video" ? null : (
    <Tooltip text="Enlarge Video">
      {(tooltipProps: any) => (
        <Clickable
          {...tooltipProps}
          className={HoverButtonClasses.hoverButton}
          focusProps={{offset: 2}}
          aria-label="Enlarge Video"
          onClick={() => {
            LazyMediaModal({
              className: MediaModalClasses.modal,
              items: [
                {
                  url: item.originalItem.proxy_url,
                  proxyUrl: item.originalItem.proxy_url,
                  width: item.originalItem.width,
                  height: item.originalItem.height,
                  type: "VIDEO",
                  origina: item.originalItem.proxy_url,
                },
              ],
            });
          }}
        >
          <MaximizeIcon size="custom" color="currentColor" width={20} height={20} />
        </Clickable>
      )}
    </Tooltip>
  );
}

export function createButtonGroup({video}: VideoProps) {
  const urlObj = new URL(video.proxyURL);
  const filename = urlObj.pathname.substring(urlObj.pathname.lastIndexOf("/") + 1);
  const extension = filename.substring(filename.lastIndexOf(".") + 1);
  const contentType =
    MimeTypes.find(([mime, data]) => (data as MimeType).extensions?.includes(extension))?.[0] ?? "unknown/unknown";
  const mimeType = contentType.split("/");

  return function MediaTweaksHoverButtons() {
    return (
      <div className={HoverButtonClasses.hoverButtonGroup}>
        <EnlargeVideoButton
          mimeType={mimeType}
          item={{
            contentType,
            originalItem: {
              proxy_url: video.proxyURL,
              url: video.proxyURL,
              width: video.width,
              height: video.height,
            },
          }}
        />
      </div>
    );
  };
}
