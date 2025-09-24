import { motion } from "motion/react";
import { forwardRef, useState } from "react";

const boxVariants = {
  visible: { x: 0, opacity: 1, rotate: 0 },
  hidden: { x: 100, opacity: 0.5, rotate: 45 },
};

const Box = forwardRef(({ children }, ref) => (
  <div className="border w-min" ref={ref}>
    {children}
  </div>
));

const MotionBox = motion(Box);

function ExempleFramerMotion() {
  const [toggle, setToggle] = useState(false);    
  const handleClick = () => {
    setToggle(!toggle);
  };

  return (
    <>
      <div className="container m-4 border gap-2 ">
        <div className="m-2">
          <MotionBox
            variants={boxVariants}
            whileTap={{ scale: 1.1 }}
            animate={toggle ? "visible" : "hidden"}
          >
            <span>1</span>
          </MotionBox>
          <motion.div
            className="w-[100px] border aspect-square flex justify-center items-center bg-amber-200 rounded-3xl"
            variants={boxVariants}
            whileTap={{ scale: 1.1 }}
            animate={toggle ? "visible" : "hidden"}
          >
            <span>1</span>
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
