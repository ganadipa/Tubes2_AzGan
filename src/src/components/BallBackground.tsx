import { useAnimationFrame } from 'framer-motion';
import { COLOR } from '../const';
import React, { useEffect } from 'react'


const FloatToString = (value: number) => {
  return value.toFixed(2);
}



type BallBackgroundProps = {
  children?: React.ReactNode;
  blur?: boolean;
  className?: string;
  minimumBallSize: number;
  maximumBallSize: number;
}

const NUMNODES = 30;
const BallBackground = ({children, className,maximumBallSize,minimumBallSize, blur = false}:BallBackgroundProps ) => {

  const NodesRef: React.RefObject<HTMLDivElement>[] = Array.from({length: NUMNODES}, () => React.createRef());


  useEffect(() => {
    for (let i = 0; i < NUMNODES; i++) {
      const node = NodesRef[i].current;
      if (!node) continue;
      node.style.left = `${FloatToString(Math.random() * 100)}%`;
      node.style.top = `${FloatToString(Math.random() * 100)}%`;
      node.style.backgroundColor = COLOR[i%8];

      if (i % 8 === 4) {
        node.style.width = `${FloatToString(maximumBallSize * 3)}px`;
        node.style.height = `${FloatToString(maximumBallSize * 3)}px`;
        node.style.display = "relative";
        node.style.zIndex = "2";
      } else {
        const current = FloatToString(Math.random() * (maximumBallSize - minimumBallSize) + minimumBallSize);
        node.style.width = `${current}px`;
        node.style.height = `${current}px`;
      }



    }
  }, [NodesRef, maximumBallSize, minimumBallSize]);

  useAnimationFrame((t) => {
    NodesRef.forEach((node, idx) => {
      const current = node.current;
      if (!current) return;

      const tt = t / 5000;
      const i = idx > NUMNODES/2 ? idx : NUMNODES - idx - 1;

      const translateX = i*(i&1?-1:1)*Math.sin((tt**2 + i*tt + 1 % 100)/20)*15
      const translateY = i*(i&1?1:-1)*Math.cos((tt**2 - i*tt )/20)*15;
      current.style.transform = `translate(${translateX}px, ${translateY}px)`;
    });
  } );

  return (
    <div className='flex items-center justify-center h-[100vh] w-[100vw] overflow-hidden relative'>
        {NodesRef.map((node, i) => {
          return <div ref = {node} className={`absolute w-5 h-5 bg-white rounded-full`}></div>
        })}

          <div className={`${className} absolute w-full h-full relative z-10 ${blur ? "backdrop-blur-sm":""}`}>{children}</div>

    </div>
  )
}

export default BallBackground