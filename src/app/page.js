import Image from "next/image";
import Tetriss from "../app/tetris";
import Header from "../app/components/Header";

export default function Home() {
  return (
    <div>
      <Header/>
     <Tetriss/>
    </div>
  );
}
