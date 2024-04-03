import React from 'react'
import { NavigationContainer } from './Main'

const Game = () => {
  return (
    <main className='overflow-x-hidden'>
        <div>
            <NavigationContainer/>
        </div>
        <section className='flex flex-col w-full h-full flex items-center justify-center max-md:my-8 md:my-12 text-center text-white'>
            <h5 className='md:text-4xl max-md:text-2xl  font-semibold'>Find the shortest path</h5>
            <span className='md:text-xl max-md:text-md'>from</span>
            <input></input>
        </section>
    </main>
  )
}

export default Game
