import { useAnimationFrame } from 'framer-motion';
import React, { useEffect } from 'react'
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';


const FloatToString = (value: number) => {
  return value.toFixed(2);
}

const COLOR = ['#0A3A6B', '#4A306D', '#D17A22', '#4B5D67', '#9DA3A6'];


const NUMNODES = 30;
const Main = () => {

  const NodesRef: React.RefObject<HTMLDivElement>[] = Array.from({length: NUMNODES}, () => React.createRef());

  useEffect(() => {
    for (let i = 0; i < NUMNODES; i++) {
      const node = NodesRef[i].current;
      if (!node) continue;
      node.style.left = `${FloatToString(Math.random() * 100)}%`;
      node.style.top = `${FloatToString(Math.random() * 100)}%`;
      node.style.backgroundColor = COLOR[i%5];
    }
  }, [NodesRef]);

  useAnimationFrame((t) => {
    NodesRef.forEach((node, idx) => {
      const current = node.current;
      if (!current) return;

      const tt = t / 5000;
      const i = idx > NUMNODES/2 ? idx : NUMNODES - idx - 1;

      const translateX = i*(i&1?-1:1)*Math.sin((tt**2 + i*tt + 1)/20)*15
      const translateY = i*(i&1?1:-1)*Math.cos((tt**2 - i*tt )/20)*15;
      current.style.transform = `translate(${translateX}px, ${translateY}px)`;
    });
  } );

  return (
    <div className='flex items-center justify-center h-[100vh] w-[100vw] overflow-hidden relative'>
        <NavigationContainer/>
        {NodesRef.map((node, i) => {
          return <div ref = {node} className={`absolute w-5 h-5 bg-white rounded-full`}></div>
        })}
    </div>
  )
}

const NavigationContainer = () => {
  const navigate = useNavigate();
  const NavigateMain = () => {
    navigate('/game');
  }

  return (
    <section className='p-4 b-2 border-red relative z-10 bg-white rounded cursor-pointer' onClick={() => NavigateMain()}>
      <h1 className='text-4xl font-bold text-[#D17A22] font-poppins'><span className='text-[#0A3A6B]'>Go</span> WikiRace</h1>
    </section>
  )
}

export default Main
