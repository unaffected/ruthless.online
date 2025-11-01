import { type PropsWithChildren } from "react";
import "./index.css";

export interface AppProps extends PropsWithChildren {}

export const App = (props: AppProps) => {
  return (
    <div className="flex items-center justify-center h-screen text-white z-10 absolute top-0 left-0 w-full">
      {props.children}
    </div>
  )
}

export default App;
