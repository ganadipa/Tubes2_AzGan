import React, { useEffect, useRef, useState } from 'react'
import { NavigationContainer } from './Main'
import BallBackground from '../components/BallBackground'
import {useWikiSearch } from '../api/WikiSearch'
import { COLOR } from '../const'
import MethodSwitch from '../components/Switch'
import toast from 'react-hot-toast'

type Node = {
  id: number,
  label: string,
  url: string,
  level: number,
}

type Path = number[];

type GraphResult = {
  nodes: Node[],
  paths: Path[],
}

type Position = {
  row: number,
  col: number,
}

const result = {
  nodes: [
    {id: 0, label: 'Azmi Mahmud Bazeid Kapten Azmi', url: 'https://en.wikipedia.org/wiki/A', level: 0},
    {id: 1, label: 'B', url: 'https://en.wikipedia.org/wiki/B', level: 1},
    {id: 2, label: 'C', url: 'https://en.wikipedia.org/wiki/C', level: 1},
    {id: 3, label: 'D', url: 'https://en.wikipedia.org/wiki/D', level: 2},
    {id: 4, label: 'E', url: 'https://en.wikipedia.org/wiki/E', level: 2},
    {id: 5, label: 'F', url: 'https://en.wikipedia.org/wiki/F', level: 3},
  ],

  paths: [[0,1,3,5], [0,2,4,5],[0,1,3,5], [0,2,4,5], [0,1,3,5], [0,2,4,5], [0,1,3,5], [0,2,4,5], [0,1,3,5], [0,2,4,5],[0,1,3,5], [0,2,4,5], [0,1,3,5], [0,2,4,5], [0,1,3,5], [0,2,4,5], [0,1,3,5], [0,2,4,5],[0,1,3,5], [0,2,4,5], [0,1,3,5], [0,2,4,5], [0,1,3,5], [0,2,4,5]]
}

const Game = () => {

  return (

<main className='overflow-x-hidden mb-24'>
  <BallBackground blur maximumBallSize={50} minimumBallSize={20} className='bg-gradient-to-b from-[#0B1F36]/15 from-60% to-sky-500 to-96%'>
    <LandingAndInputSection />
  </BallBackground>
  <ResultSection />
</main>
  )
}

const LandingAndInputSection = () => {
  return (
    <>
    <div>
        <NavigationContainer/>
    </div>
    <section className='flex flex-col w-full flex items-center gap-8 justify-center max-md:my-8 md:my-12 text-center text-white'>
      <InputSection/>
    </section>
    </>
  );
};


const ResultSection = () => {

  return (
    <>
  <section className='flex flex-col gap-4  items-center justify-center h-screen w-screen bg-sky-500 '>
    <h2 className='lg:text-4xl md:text-3xl max-md:text-xl font-semibold text-white'>Graph Result</h2>
    <ResultGraph result={result}/>
  </section>
  <BallBackground blur maximumBallSize={50} minimumBallSize={20} className='bg-gradient-to-t from-[#0B1F36]/15 from-80% to-sky-500 to-9%'>
    <IndividualResultsSection/>
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
  const [isSuggestionClicked, setIsSuggestionClicked] = useState(false);  // New state to track suggestion clicks

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

  // Handle setting 'setted' when searchQuery changes
  useEffect(() => {
    if (!isSuggestionClicked) {
      setSetted(false);
    }
    setIsSuggestionClicked(false);  // Reset after checking
  }, [searchQuery]);

  // Function to handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setIsSuggestionClicked(true);  // Indicate that the change was made via suggestion click
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setSetted(true);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <input
        ref={inputRef}
        className={`w-full px-4 py-2 border-2 text-sky-700 ${setted ? 'border-green-500' : 'border-red-700'} rounded-md focus:outline-none focus:border-blue-500`}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full text-sky-700 bg-white border border-gray-300 mt-1 max-h-40 overflow-auto rounded-md shadow-lg">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
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

  console.log(positions);

  const gap = 100 / (numLevels + 1);

  const offset = isMediumWidth ? 16 : 8;


  return (
    <div className='w-[90%] h-[90%] md:aspect-video bg-white border border-[#FFEB3B] relative rounded'>
      <svg style={{ width: "100%", height: "100%", position: "absolute", top: offset, left: offset }}>
      {/* Define the arrow marker */}
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="black" />
          </marker>
        </defs>
      {/* Draw edges with arrows in the middle */}
      {
        result.paths.map((path, i) => {
          return path.map((nodeId, j) => {
            if (j === 0) return <></>;

            const from = positions[path[j-1]];
            const to = positions[path[j]];

            const fromLeft = gap*(from.col + 1);
            const fromTop = (100/(rowCounter[result.nodes[path[j-1]].level] + 1))*(from.row + 1);

            const toLeft = gap*(to.col + 1);
            const toTop = (100/(rowCounter[result.nodes[path[j]].level] + 1))*(to.row + 1);

            const midX = (fromLeft + toLeft) / 2;
            const midY = (fromTop + toTop) / 2;


            const responsiveFromLeft = isMediumWidth ? `${fromLeft}%`: `${fromTop}%`;
            const responsiveFromTop = isMediumWidth ? `${fromTop}%`: `${fromLeft}%`;
            const responsiveToLeft = isMediumWidth ? `${toLeft}%`: `${toTop}%`;
            const responsiveToTop = isMediumWidth ? `${toTop}%`: `${toLeft}%`;
            const responsiveMidX = isMediumWidth ? `${midX}%`: `${midY}%`;
            const responsiveMidY = isMediumWidth ? `${midY}%`: `${midX}%`;


            return (
              <>

                <line key = {`${fromLeft}-${midX}`} x1 = {responsiveFromLeft} y1 = {responsiveFromTop} x2 = {responsiveMidX} y2 = {responsiveMidY} stroke='black' strokeWidth='2' markerEnd="url(#arrow)"></line>
                <line key = {`${midX}-${toLeft}`} x1={responsiveMidX} y1={responsiveMidY} x2={responsiveToLeft} y2={responsiveToTop} stroke="black" strokeWidth="2" />

              </>
            );
          });
        })
      }
      </svg>
  
      {/* Draw nodes*/}
      {
        Array.from({length: result.nodes.length}).map((_, i) => {
          const node = result.nodes[i];
          const left = `${gap*(positions[i].col + 1)}%`;
          const top = `${(100/(rowCounter[node.level] + 1))*(positions[i].row + 1)}%`;

          const responsiveLeft = isMediumWidth ? left: top;
          const responsiveTop = isMediumWidth ? top: left;
          
  
          return <NodeComponent key={node.id} node={node} style={{left: responsiveLeft, top:  responsiveTop}} isMediumWidth = {isMediumWidth}/> 
        })
      }
    </div>
  );
}

const NodeComponent = ({ node, className, style, isMediumWidth }: {node: Node, className?: string, style?: React.CSSProperties | undefined, isMediumWidth: boolean}) => {
  function handleNodeClick() {
    window.open(node.url, '_blank');
  }

  return (
    <div className={`${className} absolute`} style={style}>
      <div className="relative cursor-pointer rounded-full" style={{
        backgroundColor: COLOR[node.level % 8],
        width: isMediumWidth ? '32px': '16px',
        height: isMediumWidth ? '32px': '16px',
      }}
      onClick={handleNodeClick}
      >
        <span className='absolute top-[-10px] right-[-5px] text-black'> {node.label} </span>
      </div>
      </div>
  );
}

const IndividualResult = ({ result, index }: { result: GraphResult, index: number }) => {
  return (
    <div className='rounded-lg overflow-hidden shadow-lg my-4 bg-white'>
      <div className='bg-sky-700 p-2'>
        <h3 className='text-sm lg:text-lg text-white'>Result {index + 1}</h3>
      </div>
      {result.paths[index].map((nodeId, i) => (
        <div className='flex items-center p-2 border-b last:border-b-0' key={i}>
          <div className='w-2 h-6 mr-2 rounded' style={{
            backgroundColor: COLOR[result.nodes[nodeId].level % 8],
          }}></div>
          <h4 className='text-sm lg:text-base'>{result.nodes[nodeId].label}</h4>
        </div>
      ))}
    </div>
  );
}

const IndividualResultsSection = () => {
  return (
    <section className='md:py-20 flex flex-col items-center justify-center w-9/10'>
      <h2 className='md:text-4xl font-semibold text-white'>Individual Results</h2>
      <div className='h-screen overflow-y-scroll w-9/10'>
        <div className='grid grid-cols-4 gap-x-4'>
        {
          result.paths.map((path, i) => {
            return <IndividualResult result={result} index={i}/>
          })
        }
        </div>
      </div>
    </section>
  );
}


export default Game
