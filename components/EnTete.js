import { TypeAnimation } from 'react-type-animation';


export default function EnTete() {
  return (
    <TypeAnimation
      sequence={[
        // Same substring at the start will only be typed out once, initially
        'Mathsapp',
        1000, // wait 1s before replacing "Mice" with "Hamsters"
        'Mathsapp upload',
        1000,
        'Mathsapp upload de vos fichiers',
        1000
      ]}
      wrapper="h2"
      className='font-thin text-xl md:text-3xl'
      speed={50}
      style={{  display: 'inline-block' , fontWeight:'lighter'}}
    />
  );
}
