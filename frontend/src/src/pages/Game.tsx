import React, { useEffect, useRef, useState } from 'react'
import { NavigationContainer } from './Main'
import BallBackground from '../components/BallBackground'
import { WikiResult, useWikiSearch } from '../api/WikiSearch'
import { COLOR } from '../const'
import MethodSwitch from '../components/Switch'
import toast from 'react-hot-toast'

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
    {id: 0, label: 'Azmi Mahmud Bazeid Kapten Azmi', url: 'https://en.wikipedia.org/wiki/A', level: 0, adjacencies: [1, 2]},
    {id: 1, label: 'B', url: 'https://en.wikipedia.org/wiki/B', level: 1, adjacencies: [3, 4]},
    {id: 2, label: 'C', url: 'https://en.wikipedia.org/wiki/C', level: 1, adjacencies: [4]},
    {id: 3, label: 'D', url: 'https://en.wikipedia.org/wiki/D', level: 2, adjacencies: [5]},
    {id: 4, label: 'E', url: 'https://en.wikipedia.org/wiki/E', level: 2, adjacencies: [5]},
    {id: 5, label: 'F', url: 'https://en.wikipedia.org/wiki/F', level: 3, adjacencies: []},
  ],
}

const Game = () => {

  return (

      <GameSection/>

  )
}

const GameSection = () => {
  const [inputResults, setInputResults] = React.useState([]);


return  <main className='overflow-x-hidden'>
      <BallBackground blur maximumBallSize={50} minimumBallSize={20} className='bg-gradient-to-b from-[#0B1F36]/15 from-60% to-sky-500 to-96%'>
  <div>
      <NavigationContainer/>
  </div>
  <section className='flex flex-col w-full flex items-center gap-8 justify-center max-md:my-8 md:my-12 text-center text-white'>
    <InputSection/>
  </section>
  </BallBackground>
  <ResultSection />
</main>
}

const ResultSection = () => {

  return (
    <>
  <section className='flex flex-col gap-4  items-center justify-center h-screen w-screen bg-sky-500 '>
      <h2 className='lg:text-4xl md:text-3xl max-md:text-xl font-semibold text-white'>Wikirace path result in graph</h2>
    <ResultGraph result={result}/>
  </section>
  <BallBackground blur maximumBallSize={50} minimumBallSize={20} className='bg-gradient-to-t from-[#0B1F36]/15 from-80% to-sky-500 to-9%'>
    <section>
      hello world
    </section>
  </BallBackground>
  </>
  );
}

const InputSection = () => {
  const [from, setFrom] = React.useState<string>('');
  const [to, setTo] = React.useState<string>('');
  const [BFSMethod, setBFSMethod] = React.useState<boolean>(true);

  const [settedFrom, setSettedFrom] = React.useState<boolean>(false);
  const [settedTo, setSettedTo] = React.useState<boolean>(false);

  function handleSwitchChange(event: React.ChangeEvent<HTMLInputElement>) {
    setBFSMethod(event.target.checked);
  }

  function handleSubmit() {
    if (!settedFrom || !settedTo) {
      toast.error("Use the suggestions to set the 'From' and 'To' fields.")
      return;
    }
  }

  return (
    <>
      <h2 className='text-2xl md:text-4xl lg:text-6xl font-semibold text-center my-5'>Find the Shortest Path</h2>
      <div className='flex flex-col items-center'>
        <MethodSwitch BFSMethod={BFSMethod} handleChange={handleSwitchChange} />
        <div className='flex flex-col md:flex-row gap-8 items-center my-4'>
          <div>
            <span className='text-xl md:text-3xl lg:text-4xl'>From</span>
            <InputWithSuggestions searchQuery={from} setSearchQuery={setFrom} setted={settedFrom} setSetted={setSettedFrom} />
          </div>
          <div>
            <span className='text-xl md:text-3xl lg:text-4xl'>To</span>
            <InputWithSuggestions searchQuery={to} setSearchQuery={setTo} setted={settedTo} setSetted={setSettedTo} />
          </div>
        </div>
        <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200 ease-in-out' onClick={() => handleSubmit()}>
          Find Path
        </button>
      </div>
    </>
  );
};

interface InputWithSuggestionsProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setted: boolean;
  setSetted: React.Dispatch<React.SetStateAction<boolean>>;
}

const InputWithSuggestions: React.FC<InputWithSuggestionsProps> = ({ searchQuery, setSearchQuery, setted, setSetted }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  // Debounce input to limit API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Fetch suggestions
  const {data, isLoading, error} = useWikiSearch(debouncedQuery);
  useEffect(() => {
    if (!isLoading && !error) {
      const suggestions = data.map((result) => result.title);
      setSuggestions(suggestions);
    }
  }, [data, isLoading, error]);

  // Function to handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setSetted(true);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <input
        ref={inputRef}
        className={`w-full px-4 py-2 border-2 border-gray-300 text-black rounded-md focus:outline-none focus:border-blue-500 ${setted ? 'border-green-500' : 'border-red-700 border-lg'}`}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 max-h-40 overflow-auto rounded-md shadow-lg text-sky-900">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="px-4 py-2 hover:bg-gray-100 border-gray-300 border cursor-pointer"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};


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
    <div className='w-3/4 aspect-video bg-white border border-[#FFEB3B] relative rounded'>
      <svg style={{ width: "100%", height: "100%", position: "absolute", top: 16, left: 16 }}>
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
          const leftParent = gap*(positions[i].col + 1);
          const topParent = (100/(rowCounter[parent.level] + 1))*(positions[i].row + 1);
  
          return parent.adjacencies.map(adjIndex => {
            const child = result.nodes[adjIndex];
            const leftChild = gap*(positions[adjIndex].col + 1);
            const topChild = (100/(rowCounter[child.level] + 1))*(positions[adjIndex].row + 1);
  
            const midX = `${(leftParent + leftChild)/2}%`;
            const midY = `${(topParent + topChild)/2}%`;
  
            return (
              <>
                <line key = {`${leftParent}-${midX}`} x1 = {`${leftParent}%`} y1 = {`${topParent}%`} x2 = {midX} y2 = {midY} stroke='black' strokeWidth='2' markerEnd="url(#arrow)"></line>
                <line key = {`${midX}-${leftChild}`} x1={midX} y1={midY} x2={`${leftChild}%`} y2={`${topChild}%`} stroke="black" strokeWidth="2" />

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
