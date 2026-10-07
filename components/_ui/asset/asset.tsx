import dynamic from "next/dynamic";
import AssetFrame from "./asset-frame";
import AssetImage from "./asset-image";
import AssetVideo from "./asset-video";
import type { AssetProps } from "./asset-types";

// Rive and Lottie are heavy runtimes the CRM UI never renders — load them
// only if a rive/lottie asset actually appears (splits them out of the
// initial bundle instead of shipping ~250KB gz of animation runtime).
const AssetRive = dynamic(() => import("./asset-rive"));
const AssetLottie = dynamic(() => import("./asset-lottie"));

function AssetMedia(props: AssetProps) {
  switch (props.type) {
    case "video":
      return <AssetVideo {...props} />;
    case "rive":
      return <AssetRive {...props} />;
    case "lottie":
      return <AssetLottie {...props} />;
    default:
      return <AssetImage {...props} />;
  }
}

function Asset(props: AssetProps) {
  return (
    <AssetFrame
      width={props.width}
      height={props.height}
      className={props.className}
    >
      <AssetMedia {...props} />
    </AssetFrame>
  );
}

export default Asset;
