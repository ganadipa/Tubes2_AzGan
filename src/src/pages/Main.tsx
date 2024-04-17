import { useNavigate } from "react-router-dom";
import BallBackground from "../components/BallBackground";

const Main = () => {
  return <BallBackground blur maximumBallSize={20} minimumBallSize={20} className="flex items-center justify-center">
    <NavigationContainer clickable/>
  </BallBackground>
}

export const NavigationContainer = ({clickable = false}: {clickable?:boolean}) => {
  const navigate = useNavigate();
  const NavigateMain = () => {
    if (clickable) {
      navigate('/Game');
    }
  }

  return (
    <section className={`px-6 py-4 b-2 border-red relative z-10 bg-[#BDBDBD] rounded ${clickable ? 'cursor-pointer':''}`} onClick={() => NavigateMain()}>
      <div className='flex gap-8'>
      <h1 className='text-4xl font-bold text-[#FFFFFF] font-poppins'><span className='text-[#0A3A6B]'>Go</span> WikiRace</h1>
      {
        clickable || <img src = "Wikipedia.png" alt = '' className='h-full aspect-auto w-12'/>
      }
      </div>
    </section>
  )
}

export default Main
