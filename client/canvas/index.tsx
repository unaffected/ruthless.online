import { type PropsWithChildren } from "react";
import "./index.css";

export interface HUDProps extends PropsWithChildren {}

export const HUD = (props: HUDProps) => {
  return (
    <div className="flex items-center justify-center h-screen text-white z-10 absolute top-0 left-0 w-full">
      {props.children}
    </div>
  )
}

export default HUD
