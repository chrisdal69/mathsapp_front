import MyForm from "./DragAndDropUpload";
import EnTete from "./EnTete";
import Login from "./Login";
import Logout from "./Logout";
import TestRefresh from "./TestRefresh";

import TestRequete from "./TestRequete";

export default function Home() {
  return (
    <div className="">
      <div className="md:px-[22%] px-[10%] mx-auto py-2 mt-5 border-b-[2px] border-blue-500  ">
        <EnTete />
      </div>

      <div className=" md:px-[22%] md:mx-auto w-full mt-5 px-[10%]   ">
        <MyForm />
      </div>

      <div className=" md:px-[22%] md:mx-auto w-full mt-20 px-[10%] border  ">
        <Login />
      </div>
      <div className=" md:px-[22%] md:mx-auto w-full mt-20 px-[10%] border  ">
        <Logout />
      </div>
      <div className=" md:px-[22%] md:mx-auto w-full mt-20 px-[10%] border  ">
        <TestRequete />
      </div>
            <div className=" md:px-[22%] md:mx-auto w-full mt-20 px-[10%] border  ">
        <TestRefresh />
      </div>
    </div>
  );
}
