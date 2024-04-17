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
}

type GraphResult = {
  nodes: Node[],
  adjacencieList: number[][],
}

type Position = {
  row: number,
  col: number,
}

const result = {
  nodes: [
    {id: 0, label: 'A', url: 'https://en.wikipedia.org/wiki/A', level: 0},
    {id: 1, label: 'B', url: 'https://en.wikipedia.org/wiki/B', level: 1},
    {id: 2, label: 'C', url: 'https://en.wikipedia.org/wiki/C', level: 1},
    {id: 3, label: 'D', url: 'https://en.wikipedia.org/wiki/D', level: 2},
    {id: 4, label: 'E', url: 'https://en.wikipedia.org/wiki/E', level: 2},
    {id: 5, label: 'F', url: 'https://en.wikipedia.org/wiki/F', level: 3},
    {id: 6, label: 'G', url: 'https://en.wikipedia.org/wiki/G', level: 3},
  ],
  adjacencieList: [
    [1, 2],
    [3, 4],
    [5, 6],
  ],
}

const Game = () => {

  return (
    <BallBackground blur maximumBallSize={50} minimumBallSize={20}>
      <GameSection/>
    </BallBackground>
  )
}

const GameSection = () => {
  const [searchQuery, setSearchQuery] = React.useState<string>('test');
return  <main className='overflow-x-hidden'>
  <div>
      <NavigationContainer/>
  </div>
  <section className='flex flex-col w-full h-full flex items-center justify-center max-md:my-8 md:my-12 text-center text-white'>
      <h5 className='md:text-4xl max-md:text-2xl  font-semibold'>Find the shortest path</h5>
      <span className='md:text-xl max-md:text-md'>from</span>
      <InputWithSuggestions searchQuery = {searchQuery} setSearchQuery = {setSearchQuery}/>
      <span className='md:text-xl max-md:text-md'>to</span>
      <InputWithSuggestions searchQuery = {searchQuery} setSearchQuery = {setSearchQuery}/>
      <ResultGraph result = {result}/>
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

  console.log("Positions")
  console.log(positions)
  console.log(gap*(positions[0].col + 1))
  console.log(rowCounter[result.nodes[2].level])
  console.log((100/(rowCounter[result.nodes[2].level] + 1))*(positions[2].row + 1))

  return (
    <div className='w-1/2 aspect-video bg-white border border-[#FFEB3B] relative rounded'>
      {/* Make sure to pass a style object with a percentage value */}
      {
        Array.from({length: result.nodes.length}).map((_, i) => {
          const node = result.nodes[i];
          const left = `${gap*(positions[i].col + 1)}%`;
          const top = `${(100/(rowCounter[node.level] + 1))*(positions[i].row + 1)}%`;
          return <NodeComponent node={node} style={{left, top}}/>
        })
      }
    </div>
  );
}

const NodeComponent = ({ node, className, style }: {node: Node, className?: string, style?: React.CSSProperties | undefined}) => {
  return (
    <div className={`${className} absolute`} style={style}>
      <div className=" relative w-8 h-8  rounded-full" style={{
        backgroundColor: COLOR[node.level % 8],
      }}>
        <span className='absolute top-[-10px] right-[-5px] text-black'> {node.label} </span>
      </div>
      </div>
  );
}

export default Game
