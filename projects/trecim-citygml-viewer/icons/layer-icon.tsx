// https://spectrum.adobe.com/page/icons/
export default function layerIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="18"
      viewBox="0 0 18 18"
      width="18"
      fill={props.fill || '#999'}
    >
      <title>S Layers 18 N</title>
      <rect id="Canvas" fill="#ff13dc" opacity="0" width="18" height="18" />
      <path
        className="fill"
        d="M14.144,9.969,9.2245,13.3825a.3945.3945,0,0,1-.45,0L3.856,9.969.929,12a.1255.1255,0,0,0,0,.2055l7.925,5.5a.2575.2575,0,0,0,.292,0l7.925-5.5a.1255.1255,0,0,0,0-.2055Z"
      />
      <path
        className="fill"
        d="M8.85,11.494.929,6a.1245.1245,0,0,1,0-.205L8.85.297a.265.265,0,0,1,.3,0l7.921,5.496a.1245.1245,0,0,1,0,.205L9.15,11.494A.265.265,0,0,1,8.85,11.494Z"
      />
    </svg>
  );
}
