import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { NavigationContainer } from './Main'
import BallBackground from '../components/BallBackground'
import {useWikiSearch } from '../api/WikiSearch'
import { COLOR } from '../const'
import {MethodSwitch, FindPathSwitch} from '../components/Switch'

import toast from 'react-hot-toast'
import { ExpectedResponse, search} from '../api/search'

type Node = {
  id: number,
  label: string,
  url: string,
  level: number,
}

type Path = number[];

export type GraphResult = {
  nodes: Node[],
  paths: Path[],
}



type Position = {
  row: number,
  col: number,
}

type DrillingProps = {
  setSource: React.Dispatch<React.SetStateAction<string>>,
  setTarget: React.Dispatch<React.SetStateAction<string>>,
  setUsingBFS: React.Dispatch<React.SetStateAction<boolean>>,
  setAllPaths: React.Dispatch<React.SetStateAction<boolean>>,
  handleSubmit: () => void,
  isLoading: boolean,
}

const Game = () => {
  const [source, setSource] = useState<string>('');
  const [target, setTarget] = useState<string>('');
  const [usingBFS, setUsingBFS] = useState<boolean>(true);
  const [allPaths, setAllPaths] = useState<boolean>(true);
  const [data, setData] = useState<ExpectedResponse | null>(null); // State to hold the fetched data
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  async function handleSubmit() {
    if (!source || !target) return;

    setIsLoading(true);
    setError(false);
    try {
      toast.success("Path finding started. Please wait...")
      const result = await search({source, target, using_bfs: usingBFS, all_paths: allPaths});
      setData(result.data)
      if (result.error) {
        setError(true)
      }
    } catch (err) {
      setError(true)
      toast.error("Error occured.")
    }
    if (data && !data?.ok) {
      console.log(data)
      toast.error("Error occured.")
    }
    setIsLoading(false)
  }


  return (
    <main className='overflow-x-hidden'>
      <BallBackground blur maximumBallSize={50} minimumBallSize={20} className='bg-gradient-to-b from-[#0B1F36]/15 from-60% to-sky-500 to-96%'>
        <LandingAndInputSection 
          setSource={setSource}
          setTarget={setTarget}
          setUsingBFS={setUsingBFS}
          setAllPaths={setAllPaths}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
        {data?.ok && !isLoading ?
        <div className='text-white md:text-4xl text-xl flex items-center justify-center text-center'>
          <span>Found {data.data?.paths.length} paths with {data.degreesOfSeparation} degrees of separation from {source} to {target} in {data.time} seconds!</span>
        </div> : null }
      </BallBackground>
      {data?.ok ? <ResultSection result = {data.data as GraphResult}/> : null}
    </main>
  );
}

const LandingAndInputSection = ( {setSource, setTarget, setUsingBFS, handleSubmit, isLoading, setAllPaths}: DrillingProps  
) => {
  return (
    <>
    <div>
      <NavigationContainer/>
    </div>
    <section className='flex flex-col w-full flex items-center gap-8 justify-center max-md:my-8 md:my-12 text-center text-white'>
      <InputSection setSource = {setSource}
      setAllPaths={setAllPaths}
      setTarget = {setTarget}
      setUsingBFS = {setUsingBFS}
      handleSubmit={handleSubmit}
      isLoading={isLoading}
      />
    </section>
    </>
  );
};


const ResultSection = ({result}: {result: GraphResult}) => {

  return (
    <>
  <section className='flex flex-col gap-4  items-center justify-center h-screen w-screen bg-sky-500 '>
    <h2 className='lg:text-4xl md:text-3xl max-md:text-xl font-semibold text-white'>Graph Result</h2>
    <ResultGraph result={result}/>
  </section>
  <BallBackground blur maximumBallSize={50} minimumBallSize={20} className='bg-gradient-to-t from-[#0B1F36]/15 from-80% to-sky-500 to-9%'>
    <IndividualResultsSection result={result}/>
  </BallBackground>
  </>
  );
}


const InputSection = (
  {setSource, setTarget, setUsingBFS, handleSubmit, isLoading, setAllPaths: setFindAllPath}: DrillingProps
) => {
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [BFSMethod, setBFSMethod] = useState<boolean>(true);
  const [AllPaths, setAllPaths] = useState<boolean>(true);

  const [settedFrom, setSettedFrom] = useState<boolean>(false);
  const [settedTo, setSettedTo] = useState<boolean>(false);
  const [submitCounter, setSubmitCounter] = useState<number>(0);

  function handleSwitchChange(event: ChangeEvent<HTMLInputElement>) {
    setBFSMethod(event.target.checked);
  }

  function hanldePathSwitchChange(event: ChangeEvent<HTMLInputElement>) {
    setAllPaths(event.target.checked);
  }

  function handleSearch(force: boolean) {

    if ((!settedFrom || !settedTo) && !force) {
      toast.error("Use the suggestions to set the 'From' and 'To' fields.")
      return;
    }

    setSource(from);
    setTarget(to);
    setUsingBFS(BFSMethod);
    setFindAllPath(AllPaths);
    setSubmitCounter(submitCounter + 1);
  }

  useEffect(() => {
    if (submitCounter > 0) {
      handleSubmit();
    }
  }, [submitCounter]);

  if (isLoading) {
    return (
      <div className='text-4xl text-white font-semibold'> This may takes a while...
      <br/>
      <span className='font-normal'>
        Enjoy our animation!  
      </span>
      </div>
    )
  }

  return (
    <>
      <h2 className='text-2xl md:text-4xl lg:text-6xl font-semibold text-center my-5'>Find the Shortest Path</h2>
      <div className='flex flex-col items-center'>
        <div className='flex gap-8'>
        <MethodSwitch BFSMethod={BFSMethod} handleChange={handleSwitchChange} />
        <FindPathSwitch AllPaths={AllPaths} handleChange={hanldePathSwitchChange} />
        </div>
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
        <div className='flex gap-4'>
        <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200 ease-in-out' onClick={() => handleSearch(false)}>
          Find Path
        </button>
        <button className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200 ease-in-out' onClick={() => handleSearch(true)}>
          Force Find!
        </button>
        </div>
      </div>
    </>
  );
};



interface InputWithSuggestionsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setted: boolean;
  setSetted: (setted: boolean) => void;
}

const InputWithSuggestions: React.FC<InputWithSuggestionsProps> = ({
  searchQuery, setSearchQuery, setted, setSetted
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isSuggestionClicked, setIsSuggestionClicked] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const {data, isLoading, error} = useWikiSearch(debouncedQuery);

  useEffect(() => {
    if (!isLoading && !error && data) {
      setSuggestions(data.map(result => result.title));
    }
  }, [data, isLoading, error]);

  useEffect(() => {
    if (!isSuggestionClicked) {
      setSetted(false);
    }
    setIsSuggestionClicked(false);
  }, [searchQuery]);

  useEffect(() => {
    if (isSuggestionClicked) {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  }, [isSuggestionClicked]);

  const handleSuggestionClick = (suggestion: string) => {
    setIsSuggestionClicked(true);
    setSearchQuery(suggestion);
    setSetted(true);
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <input
        ref={inputRef}
        className={`w-full px-4 py-2 border-2 text-sky-700 ${setted ? 'border-green-500' : 'border-red-700'} rounded-md focus:outline-none focus:border-blue-500`}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => {
          if (!isSuggestionClicked) setShowSuggestions(false);
        }, 100)}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full text-sky-700 bg-white border border-gray-300 mt-1 max-h-40 overflow-auto rounded-md shadow-lg">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onMouseDown={(e) => e.preventDefault()} // Prevent onBlur from firing when the suggestion is clicked
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
  // let rowCounter: number[] = Array.from({length: numLevels}, () => 0);
  // for (let i = 0; i < result.nodes.length; i++) {
  //   let col = result.nodes[i].level
  //   let row = rowCounter[col];
  //   positions[i] = {row, col};

  //   rowCounter[col]++;
  // }

  let NodesIdOnEachLevel = Array.from({length: numLevels}, () => Array<number>());
  for (let i = 0; i < result.nodes.length; i++) {
    NodesIdOnEachLevel[result.nodes[i].level].push(i);
  }

  let rowCounter = 0, colCounter = 0;
  for (let i = 0; i < numLevels; i++) {
    for (let j = 0; j < NodesIdOnEachLevel[i].length; j++) {
      if (i === 0 && j === 0) {
        positions[NodesIdOnEachLevel[i][j]] = {row: 0, col: 0};
      } else {
        if (j === 0) {
          rowCounter = 0;
          colCounter++;
        } else if (rowCounter < 15) {
          rowCounter++;
        } else {
          rowCounter = 0;
          colCounter++;
        }

        positions[NodesIdOnEachLevel[i][j]] = {row: rowCounter, col: colCounter};
      }
    }
  }

  console.log(NodesIdOnEachLevel )
  console.log(positions)

  const horizontalGap = 100 / (colCounter + 2);

  const offset = isMediumWidth ? 8 : 4;

  let MaxRowOnEachCol = Array.from({length: colCounter + 1}, () => 0);
  for (let i = 0; i < result.nodes.length; i++) {
    MaxRowOnEachCol[positions[i].col] = Math.max(MaxRowOnEachCol[positions[i].col], positions[i].row + 1);
  }


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

            const fromVerticalGap = 100/ (MaxRowOnEachCol[from.col] + 1);
            const toVerticalGap = 100/ (MaxRowOnEachCol[to.col] + 1);

            const fromLeft = horizontalGap*(from.col + 1);
            const fromTop = (fromVerticalGap)*(from.row + 1);

            const toLeft = horizontalGap*(to.col + 1);
            const toTop = (toVerticalGap)*(to.row + 1);

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

                <line key = {`${fromLeft}-${midX}`} x1 = {responsiveFromLeft} y1 = {responsiveFromTop} x2 = {responsiveMidX} y2 = {responsiveMidY} stroke='black' strokeWidth='1' markerEnd="url(#arrow)"></line>
                <line key = {`${midX}-${toLeft}`} x1={responsiveMidX} y1={responsiveMidY} x2={responsiveToLeft} y2={responsiveToTop} stroke="black" strokeWidth="1" />

              </>
            );
          });
        })
      }
      </svg>
  
      {/* Draw nodes*/}
      {
        Array.from({length: result.nodes.length}).map((_, i) => {
          const verticalGap = 100 / (MaxRowOnEachCol[positions[i].col] + 1);

          const node = result.nodes[i];
          const left = `${horizontalGap*(positions[i].col + 1)}%`;
          const top = `${verticalGap*(positions[i].row + 1)}%`;

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
        width: isMediumWidth ? '16px': '8px',
        height: isMediumWidth ? '16px': '8px',
      }}
      onClick={handleNodeClick}
      >
        <span className='absolute top-[-10px] right-[-5px] text-black'> {node.label} </span>
      </div>
      </div>
  );
}

const IndividualResult = ({ result, index }: { result: GraphResult, index: number }) => {
  function handleNodeClick(node: number) {
    window.open(result.nodes[node].url, '_blank');
  } 


  return (
    <div className='rounded-lg overflow-hidden shadow-lg my-4 bg-white'>
      <div className='bg-sky-700 p-2'>
        <h3 className='text-sm lg:text-lg text-white'>Result {index + 1}</h3>
      </div>
      {result.paths[index].map((nodeId, i) => (
        <div className='flex items-center p-2 border-b last:border-b-0 cursor-pointer' key={i} onClick={() => handleNodeClick(nodeId)}>
          <div className='w-2 h-6 mr-2 rounded' style={{
            backgroundColor: COLOR[result.nodes[nodeId].level % 8],
          }}></div>
          <h4 className='text-sm lg:text-base'>{result.nodes[nodeId].label}</h4>
        </div>
      ))}
    </div>
  );
}

const IndividualResultsSection = ({result}: {result: GraphResult}) => {
  return (
    <section className='md:py-20 flex flex-col items-center justify-center w-9/10'>
      <h2 className='md:text-4xl font-semibold text-white mb-12'>Individual Results</h2>
      <div className='h-[70vh] overflow-y-scroll'>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-x-4'>
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
