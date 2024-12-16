import {findByPropsLazy} from "@webpack";

const MetadataClasses = findByPropsLazy("metadataDownload");

type MetadataProps = {
  fileName: string | null;
  fileSize: string;
};

export default function VideoMetadata({fileName, fileSize}: MetadataProps) {
  return fileName == null ? null : (
    <div className="mediaTweaks-metadata">
      <div className={MetadataClasses.metadataContent}>
        {fileName}
        <div className={MetadataClasses.metadataSize}>{fileSize}</div>
      </div>
    </div>
  );
}
