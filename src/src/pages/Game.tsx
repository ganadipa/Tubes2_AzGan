import React, { useEffect, useRef } from 'react'
import { NavigationContainer } from './Main'
import BallBackground from '../components/BallBackground'
import { WikiResult, useWikiSearch } from '../api/WikiSearch'
import { COLOR } from '../const'

type Node = {
  id: number,
  label: string,
  url: string,
  level: number,
  adjacencies: number[],
}

type GraphResult = {
  nodes: Node[],

}

type Position = {
  row: number,
  col: number,
}

const result = {
  nodes: [
    {id: 0, label: 'A', url: 'https://en.wikipedia.org/wiki/A', level: 0, adjacencies: [1, 2]},
    {id: 1, label: 'B', url: 'https://en.wikipedia.org/wiki/B', level: 1, adjacencies: [3, 4]},
    {id: 2, label: 'C', url: 'https://en.wikipedia.org/wiki/C', level: 1, adjacencies: []},
    {id: 3, label: 'D', url: 'https://en.wikipedia.org/wiki/D', level: 2, adjacencies: [5, 6]},
    {id: 4, label: 'E', url: 'https://en.wikipedia.org/wiki/E', level: 2, adjacencies: []},
    {id: 5, label: 'F', url: 'https://en.wikipedia.org/wiki/F', level: 3, adjacencies: []},
    {id: 6, label: 'G', url: 'https://en.wikipedia.org/wiki/G', level: 3, adjacencies: []},
  ],
}

const Game = () => {

  return (

      <GameSection/>

  )
}

const GameSection = () => {
  const [searchQuery, setSearchQuery] = React.useState<string>('test');
return  <main className='overflow-x-hidden'>
      <BallBackground blur maximumBallSize={50} minimumBallSize={20}>
  <div>
      <NavigationContainer/>
  </div>
  <section className='flex flex-col w-full flex items-center gap-8 justify-center max-md:my-8 md:my-12 text-center text-white'>
      <h2 className='lg:text-6xl md:text-4xl max-md:text-2xl  font-semibold'>Find the shortest path</h2>
      <div className='flex gap-12'>
        <div>
          <span className='lg:text-4xl md:text-3xl max-md:text-xl'>from</span>
          <InputWithSuggestions searchQuery = {searchQuery} setSearchQuery = {setSearchQuery}/>
        </div>
        <div>
          <span className='lg:text-4xl md:text-3xl max-md:text-xl'>to</span>
          <InputWithSuggestions searchQuery = {searchQuery} setSearchQuery = {setSearchQuery}/>
        </div>
      </div>
  </section>
  </BallBackground>
  <section className='flex items-center justify-center h-screen w-screen bg-sky-500 '>
    <ResultGraph result={result}/>
  </section>
</main>
}

interface InputWithSuggestionsProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

const InputWithSuggestions: React.FC<InputWithSuggestionsProps> = ({ searchQuery, setSearchQuery }) => {
  const [from, setFrom] = React.useState<string>('');
  const fromInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      fromInputRef.current?.setAttribute('disabled', 'true');
    }, 2000);

    // Clear the timeout if the component unmounts or if searchQuery changes
    return () => clearTimeout(timer);
  }, [searchQuery]); // This will reset the timer every time searchQuery changes

  const [result, setResult] = React.useState<WikiResult[]>([]);
  const { data, isLoading, error } = useWikiSearch(searchQuery);

  useEffect(() => {
    setResult(data);
  }, [data]);

  console.log(data)

  return (
    <div className='relative flex items-center justify-center text-black'> 
      <input 
        className='' 
        value={searchQuery} 
        onChange={(e) => setSearchQuery(e.target.value)}
        ref = {fromInputRef}
      />
    </div>
  );
}

const ResultGraph = ({ result }: {result: GraphResult}) => {
  const [isMediumWidth, setIsMediumWidth] = React.useState<boolean>(window.innerWidth > 768);

  const handleResize = () => {
    setIsMediumWidth(window.innerWidth > 768);
  }

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);



  let numLevels = 0;
  for (let i = 0; i < result.nodes.length; i++) {
    numLevels = Math.max(numLevels, result.nodes[i].level + 1);
  }

  let positions: Position[] = Array.from({length: result.nodes.length}, () => ({row: 0, col: 0}));
  let rowCounter: number[] = Array.from({length: numLevels}, () => 0);
  for (let i = 0; i < result.nodes.length; i++) {
    let col = result.nodes[i].level
    let row = rowCounter[col];
    positions[i] = {row, col};

    rowCounter[col]++;
  }

  const gap = 100 / (numLevels + 1);


  return (
    <div className='w-1/2 aspect-video bg-white border border-[#FFEB3B] relative rounded'>
      <svg style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}>
      {/* Define the arrow marker */}
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="black" />
          </marker>
        </defs>
      {/* Draw edges with arrows in the middle */}
      {
        Array.from({length: result.nodes.length}).map((_, i) => {
          const parent = result.nodes[i];
          const leftParent = `calc(${gap*(positions[i].col + 1)}% + 16px)`;
          const topParent = `calc(${(100/(rowCounter[parent.level] + 1))*(positions[i].row + 1)}% + 16px)`;
  
          return parent.adjacencies.map(adjIndex => {
            const child = result.nodes[adjIndex];
            const leftChild = `calc(${gap*(positions[adjIndex].col + 1)}% + 16px)`;
            const topChild = `calc(${(100/(rowCounter[child.level] + 1))*(positions[adjIndex].row + 1)}% + 16px)`;
  
            const midX = `calc((${leftParent} + ${leftChild}) / 2)`;
            const midY = `calc((${topParent} + ${topChild}) / 2)`;
  
            return (
              <>
                <line x1={leftParent} y1={topParent} x2={midX} y2={midY} stroke="black" strokeWidth="2" marker-end="url(#arrow)" />
                <line x1={midX} y1={midY} x2={leftChild} y2={topChild} stroke="black" strokeWidth="2" />
              </>
            );
          })
        })
      }
      </svg>
  
      {/* Draw nodes*/}
      {
        Array.from({length: result.nodes.length}).map((_, i) => {
          const node = result.nodes[i];
          const left = `${gap*(positions[i].col + 1)}%`;
          const top = `${(100/(rowCounter[node.level] + 1))*(positions[i].row + 1)}%`;
  
          return <NodeComponent key={node.id} node={node} style={{left, top}}/> 
        })
      }
    </div>
  );
}

const NodeComponent = ({ node, className, style }: {node: Node, className?: string, style?: React.CSSProperties | undefined}) => {
  return (
    <div className={`${className} absolute`} style={style}>
      <div className="relative w-8 h-8  rounded-full" style={{
        backgroundColor: COLOR[node.level % 8],
      }}>
        <span className='absolute top-[-10px] right-[-5px] text-black'> {node.label} </span>
      </div>
      </div>
  );
}

export default Game
