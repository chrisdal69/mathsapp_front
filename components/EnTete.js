import { TypeAnimation } from 'react-type-animation';


export default function EnTete() {
  return (
    <TypeAnimation
      sequence={[
        // Same substring at the start will only be typed out once, initially
        'Mathsapp',
        200, // wait 1s before replacing "Mice" with "Hamsters"
        'Mathsapp upload',
        200,
        'Mathsapp upload de vos fichiers',
        200
      ]}
      wrapper="h2"
      className='font-thin text-xl md:text-3xl'
      speed={50}
      style={{  display: 'inline-block' , fontWeight:'lighter'}}
    />
  );
}
