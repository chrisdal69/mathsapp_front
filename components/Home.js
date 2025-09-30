import MyForm from "./DragAndDropUpload";
import EnTete from "./EnTete";

export default function Home() {
  return (
    <div className="">
      <div className="md:px-[22%] px-[10%] mx-auto py-2 mt-5 border-b-[2px] border-blue-500  ">
        <EnTete />
      </div>

      <div className=" md:px-[22%] md:mx-auto w-full mt-5 px-[10%]   ">
        <MyForm />
      </div>
    </div>
  );
}
