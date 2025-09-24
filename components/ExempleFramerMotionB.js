import { motion } from "motion/react";
import { forwardRef, useState } from "react";

const boxVariants = {
  visible: { x: 0, opacity: 1, rotate: 0 },
  hidden: { x: 100, opacity: 0.5, rotate: 45 },
};
const wrapVariants = {
    visible: {opacity:1, },
    hidden: {opacity:0.2 , }
}
const Box = forwardRef(({ children }, ref) => (
  <div
    className="w-[100px] border aspect-square flex justify-center items-center bg-amber-200 rounded-3xl"
    ref={ref}
  >
    {children}
  </div>
));

const MotionBox = motion(Box);

function ExempleFramerMotion() {
  const [toggle, setToggle] = useState(false);
  const handleClick = () => {
    setToggle(!toggle);
  };
  const items = toggle ? [1, 2, 3, 4, 5] : [3, 2, 5, 1, 4];

  return (
    <>
      <div className="container m-4 border gap-2 ">
        <div className="m-2">
          <motion.div
            animate={toggle ? "visible" : "hidden"}
            variants={wrapVariants}
          >
            {items.map((i) => {
              return (
                <MotionBox
                  key={i}
                  layout
                  transition={{type:'spring' , duration:2}}
                >
                  {i}
                </MotionBox>
              );
            })}
          </motion.div>
        </div>
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

export default ExempleFramerMotion;
