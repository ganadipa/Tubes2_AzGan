import { useAnimationFrame } from 'framer-motion';
import React, { useRef } from 'react';

const NotFound: React.FC = () => {
  const moon_ref = useRef<HTMLImageElement | null>(null);
  const starRef = useRef<HTMLImageElement | null>(null);



  useAnimationFrame((t) => {
    const current = moon_ref.current;
    if (!current) return;
    

    const rotate = (t / 100) % 360;
    current.style.transform = `rotate(${rotate}deg)`;

  });

  useAnimationFrame((t) => {
    const current = starRef.current;
    if (!current) return;
    

    const rotate = (t / 500) % 360;
    current.style.transform = `rotate(${rotate}deg)`;

  });



  return (
    <div className='flex flex-col h-[100vh] w-[100vw] items-center justify-center gap-12 relative overflow-hidden'>
      <div className='w-72 h-72'>
        <img src='Wikipedia.png' alt='' className='aspect-auto z-10 relative'></img>
      </div>
      <div>
          <h1 className='text-4xl font-bold text-center text-white'>Oops, page not found :(</h1>
      </div>
      <img  src= "moon-bg.png" alt='' className='absolute md:h-[70vh] lg:h-[90vh] md:left-[-25vw] max-md:w-[80vw] max-md:bottom-[-60vw] sm:h-[50vh]' ref = {moon_ref}/>
      <img  src= "stars-bg.png" alt='' className='absolute md:h-[90vh] md:left-[-25vw] max-md:bottom-[-60vw] sm:h-[50vh]' ref = {starRef}/>
      <img  src= "asteroids-bg.png" alt='' className='absolute md:h-[120vh] md:left-[-25vw] max-md:w-[100vw] max-md:bottom-[-60vw] sm:h-[50vh]' ref = {starRef}/>
      <img  src= "spark.png" alt='' className='absolute h-[100vh] right-0 z-0'/>

      {/* <img  src= "spark-mini.png" alt='' className='absolute h-[50vh] right-0 z-0'/>
      <img  src= "spark-mini.png" alt='' className='absolute h-[50vh] right-0 z-0'/> */}
      {/* <img  src= "asteroids-sm.png" alt='' className='absolute h-[50vh] right-4 z-0'/>
      <img  src= "asteroids-mini-sm.png" alt='' className='absolute h-[50vh] right-4 z-0'/> */}


    </div>
  );
};

export default NotFound;