import { GraphResult } from '../pages/Game';

export type SearchPayload = {
  source: string;
  target: string;
  using_bfs: boolean;
  all_paths: boolean;
};

export type ExpectedResponse = {
    data: GraphResult | null;
    time: number;
    degreesOfSeparation: number;
    ok: boolean;
    totalNodesVisited: number;
    totalNodesCrawled: number;
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



export async function search(payload: SearchPayload): Promise<{data: ExpectedResponse, error: boolean}> {
  if (!payload.source || !payload.target) {
    return Promise.resolve({data: {data: null, time: 0, degreesOfSeparation: 0, ok: false, totalNodesVisited: 0, totalNodesCrawled: 0}, error: true});
  }

  const endpoint = `http://localhost:8000/get?source=${payload.source}&target=${payload.target}&using_bfs=${payload.using_bfs}&all_paths=${payload.all_paths}`;
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Introducing a delay to simulate network latency
  await delay(2000);  // Delay for 2000 milliseconds (2 seconds)

  try {
    const response = await fetch(endpoint, requestOptions);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.statusText}`);
    }
    const result = await response.json();
    return Promise.resolve({data: result, error: false});
  } catch (error) {
    return Promise.resolve({data: {data: null, time: 0, degreesOfSeparation: 0, ok: false, totalNodesCrawled: 0, totalNodesVisited: 0}, error: true});
  }
}

