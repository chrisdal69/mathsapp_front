import { motion } from "motion/react";
import { forwardRef, useState } from "react";
import Image from "next/image";

const boxVariants = {
  visible: { x: 0, opacity: 1, rotate: 0 },
  hidden: { x: 100, opacity: 0.5, rotate: 45 },
};
const wrapVariants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0.2 },
};
const Box = forwardRef(({ children }, ref) => (
  <div
    className="w-[100px] border aspect-square flex justify-center items-center bg-amber-200 rounded-3xl"
    ref={ref}
  >
    {children}
  </div>
));

const MotionBox = motion(Box);

export default function ExempleFramerMotion() {
  const [toggle, setToggle] = useState(false);
  const handleClick = () => {
    setToggle(!toggle);
  };
  const items = toggle ? [1, 2, 3, 4, 5] : [3, 2, 5, 1, 4];

  return (
    <>
      <div className="container m-4 border gap-2 ">
        <div className="m-2 ">
          <motion.div
            animate={toggle ? "visible" : "hidden"}
            variants={wrapVariants}
            className="flex"
          >
            {items.map((i) => {
              return (
                <MotionBox
                  key={i}
                  layout
                  transition={{ type: "spring", duration: 2 }}
                >
                  {i}
                </MotionBox>
              );
            })}
          </motion.div>
        </div>
        {toggle ? <Page1 /> : <Page2 />}
        <div>
          <button
            onClick={handleClick}
            className="border bg-blue-700 text-blue-50 p-3 rounded-2xl"
          >
            Afficher / Masquer
          </button>
          <p>{toggle ? "TRUE" : "FALSE"}</p>
        </div>
      </div>
    </>
  );
}

function Page1() {
  const src = "/desert.jpeg";
  return (
    <div>
      <motion.img
        layoutId="im"
        className="object-cover"
        width={300}
        height={300}
        transition={{ duration: 1 , type:"spring" }}
        src={src}
        /* Here we define the sizes of the image in the different tailwind breakpoints according to the grid layout */
        /* With this configuration, the browser will download the (closest) image dimension to the according rendered image size */
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />
    </div>
  );
}

function Page2() {
  const src = "/water.jpeg";
  return (
    <div>
      <motion.img
        layoutId="im"
        className="object-cover"
        transition={{ duration: 1 , type:"spring"}}
        width={400}
        height={500}
        src={src}
        /* Here we define the sizes of the image in the different tailwind breakpoints according to the grid layout */
        /* With this configuration, the browser will download the (closest) image dimension to the according rendered image size */
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />
    </div>
  );
}
