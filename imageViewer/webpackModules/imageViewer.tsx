import {findByCodeLazy, filters, mapMangledModuleLazy} from "@webpack";

import {Clipboard, React, Text, TextInput} from "@webpack/common";
const {Image} = mapMangledModuleLazy(",Text:()=>", {
  Image: filters.componentByCode(",dataSafeSrc:"),
});

const XLargeIcon = findByCodeLazy("M19.3 20.7a1 1 0 0 0 1.4-1.4L13.42");
const CopyIcon = findByCodeLazy("M3 16a1 1 0 0 1-1-1v-5a8 8 0 0 1 8-8h5a1");
const LinkIcon = findByCodeLazy("M16.32 14.72a1 1 0 0 1 0-1.41l2.51-2.51a3.98");
const PlusLargeIcon = findByCodeLazy("M13 3a1 1 0 1 0-2 0v8H3a1 1 0 1 0 0 2h8v8a1");
const MinusIcon = findByCodeLazy("M22 12a1 1 0 0 1-1 1H3a1 1 0 1 1 0-2h18a1 1 0 0 1 1 1Z");
const FullscreenEnterIcon = findByCodeLazy(
  "2h3ZM20 18a2 2 0 0 1-2 2h-3a1 1 0 1 0 0 2h3a4 4 0 0 0 4-4v-3a1 1 0 1 0-2 0v3Z",
);
const ArrowAngleLeftUpIcon = findByCodeLazy("M2.3 7.3a1 1 0 0 0 0 1.4l5 5a1 1 0 0 0 1.4-1.4L5.42 9H11a7");
const ArrowAngleRightUpIcon = findByCodeLazy("M21.7 7.3a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4-1.4L18.58 9H13a7");
const WindowLaunchIcon = findByCodeLazy("1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6a1");

const HeaderBar = findByCodeLazy(".HEADER_BAR),");
const NativeUtils = findByCodeLazy("Data fetch" + " unsuccessful");
const RawVideo = findByCodeLazy('MOSAIC?{width:"100%",height:"100%",' + 'maxHeight:"inherit",objectFit:"contain"}');
const Video = findByCodeLazy(".VIDEO,", ",onVolume" + "Change:");

const {closeModal, useModalsStore} = mapMangledModuleLazy("onCloseCallback()", {
  closeModal: filters.byCode("onCloseCallback()"),
  useModalsStore: filters.byCode(/^.=>.\(.,.\)$/),
});

type SourceMetadata = {
  identifier: {
    type: string;
    embedIndex?: number;
  };
  message: {
    embeds?: any[];
  };
};

type Props = {
  src: string;
  url: string;
  original: string;
  proxyUrl?: string;
  alt?: string;
  width: number;
  height: number;
  children?: React.ReactNode;
  animated: boolean;
  onClose: () => void;
  type: "IMAGE" | "VIDEO";
  sourceMetadata: SourceMetadata;
};

const STEP_MAX = 50;
const ZOOM_SCALE = 1 / (4 * STEP_MAX);
const MAX_ZOOM = Math.log2(32) / ZOOM_SCALE;

function calculateInitialZoom(width: number, height: number) {
  const padding = 128;
  const maxWidth = window.innerWidth - padding;
  const maxHeight = window.innerHeight - padding;

  if (width <= maxWidth && height <= maxHeight) return 0;

  const widthScale = maxWidth / width;
  const heightScale = maxHeight / height;

  const zoom = Math.log2(Math.min(widthScale, heightScale)) / ZOOM_SCALE;
  return Math.floor(zoom / STEP_MAX) * STEP_MAX;
}

function close() {
  const ModalStore = useModalsStore.getState();
  closeModal(ModalStore.default[0].key);
}

const noop = () => {};

function stopPropagation(event: any) {
  event.stopPropagation();
}

export default function ImageViewer({
  proxyUrl,
  url,
  original,
  width,
  height,
  alt,
  type,
  animated,
  sourceMetadata,
}: Props) {
  const initialZoom = calculateInitialZoom(width, height);
  const minZoom = initialZoom - MAX_ZOOM;

  const [x, setX] = React.useState(0);
  const [y, setY] = React.useState(0);
  const [rotate, setRotate] = React.useState(0);
  const [zoom, setZoom] = React.useState(initialZoom);
  const scale = 2 ** (zoom * ZOOM_SCALE);
  const [dragging, setDragging] = React.useState(false);
  const [editingZoom, setEditingZoom] = React.useState(false);
  const [zoomEdit, setZoomEdit] = React.useState(100);
  const wrapperRef = React.createRef<HTMLDivElement>();

  let src = proxyUrl ?? url;
  if (animated) {
    src = sourceMetadata.message.embeds?.[sourceMetadata.identifier.embedIndex ?? -1]?.video?.proxyURL ?? src;
  }
  const filename = React.useMemo(() => {
    return new URL(src).pathname.split("/").pop();
  }, [src]);
  const isVideo = type === "VIDEO";
  const poster = React.useMemo(() => {
    const urlObj = new URL(src);
    urlObj.searchParams.set("format", "webp");
    return urlObj.toString();
  }, [src]);

  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!dragging) return;

      setX((prevX) => prevX + e.movementX / (scale * window.devicePixelRatio));
      setY((prevY) => prevY + e.movementY / (scale * window.devicePixelRatio));
    },
    [dragging, zoom],
  );
  const handleMouseDown = React.useCallback(() => {
    setDragging(true);
  }, []);
  const handleMouseUp = React.useCallback(() => {
    setDragging(false);
  }, []);
  const handleWheel = React.useCallback((e: WheelEvent) => {
    setZoom((zoom) => {
      // clamp delta, for linear scrolling (e.g. trackpads)
      const delta = Math.min(STEP_MAX, Math.max(-STEP_MAX, -e.deltaY));
      return Math.min(MAX_ZOOM, Math.max(minZoom, zoom + delta));
    });
  }, []);

  React.useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    wrapper.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("wheel", handleWheel);

    return () => {
      wrapper.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("wheel", handleWheel);
    };
  }, [wrapperRef.current, handleMouseDown, handleMouseMove, handleMouseUp, handleWheel]);

  const transformStyle = `scale(${scale}) translate(${x}px, ${y}px) rotate(${rotate}deg)`;
  const zoomLabel = scale < 0.1 ? (scale * 100).toFixed(2) : Math.round(scale * 100);

  return (
    <div className="imageViewer">
      <div
        className="imageViewer-container"
        ref={wrapperRef}
        style={{
          transform: transformStyle,
        }}
        onClick={stopPropagation}
      >
        {animated ? (
          <RawVideo
            src={src}
            width={width}
            height={height}
            autoPlay={true}
            loop={true}
            muted={true}
            preload="none"
            aria-label={alt}
          />
        ) : isVideo ? (
          <Video
            src={src}
            width={width}
            height={height}
            naturalWidth={width}
            naturalHeight={height}
            maxWidth={width}
            maxHeight={height}
            poster={poster}
            autoPlay={true}
            renderLinkComponent={noop}
          />
        ) : (
          <Image
            className={`imageViewer-image${scale >= 1 ? " imageViewer-pixelate" : ""}`}
            src={src}
            placeholder={src}
            alt={alt}
            width={width}
            height={height}
            zoomable={true}
          />
        )}
      </div>
      <div className="imageViewer-toolbar theme-dark">
        <div className="imageViewer-toolbar-buttons" onClick={stopPropagation}>
          <HeaderBar.Icon tooltip={"Close"} tooltipPosition="top" icon={XLargeIcon} onClick={close} />

          <HeaderBar.Divider />

          <HeaderBar.Icon
            tooltip={"Open in Browser"}
            tooltipPosition="top"
            icon={WindowLaunchIcon}
            onClick={() => {
              window.open(original);
            }}
          />
          <HeaderBar.Icon
            tooltip="Copy Link"
            tooltipPosition="top"
            icon={LinkIcon}
            onClick={() => {
              Clipboard.copy(src);
            }}
          />
          {/* @ts-expect-error missing typing for window.DiscordNative */}
          {!isVideo && !animated && window.DiscordNative != null ? (
            <HeaderBar.Icon
              tooltip={"Copy Image"}
              tooltipPosition="top"
              icon={CopyIcon}
              onClick={() => {
                NativeUtils.copyImage(src);
              }}
            />
          ) : null}

          <HeaderBar.Divider />

          <HeaderBar.Icon
            tooltip="Recenter"
            tooltipPosition="top"
            icon={FullscreenEnterIcon}
            onClick={() => {
              setX(0);
              setY(0);
              setZoom(initialZoom);
            }}
          />
          <HeaderBar.Icon
            tooltip="Zoom In"
            tooltipPosition="top"
            icon={PlusLargeIcon}
            onClick={() => {
              setZoom((zoom) => Math.min(MAX_ZOOM, zoom + STEP_MAX));
            }}
          />
          <HeaderBar.Icon
            tooltip="Zoom Out"
            tooltipPosition="top"
            icon={MinusIcon}
            onClick={() => {
              setZoom((zoom) => Math.max(minZoom, zoom - STEP_MAX));
            }}
          />

          <HeaderBar.Divider />

          <HeaderBar.Icon
            tooltip="Rotate Counter-clockwise"
            tooltipPosition="top"
            icon={ArrowAngleLeftUpIcon}
            onClick={() => {
              setRotate((prevRotate) => prevRotate - 90);
            }}
          />
          <HeaderBar.Icon
            tooltip="Rotate Clockwise"
            tooltipPosition="top"
            icon={ArrowAngleRightUpIcon}
            onClick={() => {
              setRotate((prevRotate) => prevRotate + 90);
            }}
          />
        </div>

        <div className="imageViewer-toolbar-label" onClick={stopPropagation}>
          <Text variant="text-sm/medium">{filename}</Text>

          <HeaderBar.Divider />

          <Text variant="text-sm/medium">{`${width}x${height}`}</Text>

          <HeaderBar.Divider />

          {editingZoom ? (
            <TextInput
              className="imageViewer-edit-zoom"
              size={TextInput.Sizes.MINI}
              type="number"
              autoFocus={true}
              value={zoomEdit.toString()}
              placeholder="100"
              onChange={(value: string) => {
                if (!Number.isNaN(value)) setZoomEdit(Number(value));
              }}
              onFocus={() => {
                setZoomEdit(Number(zoomLabel));
              }}
              onBlur={() => {
                setZoom(Math.log2(zoomEdit / 100) / ZOOM_SCALE);
                setEditingZoom(false);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  setZoom(Math.log2(zoomEdit / 100) / ZOOM_SCALE);
                  setEditingZoom(false);
                }
              }}
            />
          ) : (
            <Text variant="text-sm/medium" onClick={() => setEditingZoom(true)}>
              {zoomLabel}%
            </Text>
          )}
        </div>
      </div>
    </div>
  );
}
