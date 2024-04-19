import { useState, useEffect } from 'react';
import { GraphResult } from '../pages/Game';

export type SearchPayload = {
  source: string;
  target: string;
  using_bfs: boolean;
};

export type ExpectedResponse = {
    data: GraphResult | null;
    time: number;
    degreesOfSeparation: number;
    ok: boolean;
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



export async function search(payload: SearchPayload): Promise<{data: ExpectedResponse, error: boolean}> {
  if (!payload.source || !payload.target) {
    return Promise.resolve({data: {data: null, time: 0, degreesOfSeparation: 0, ok: false}, error: true});
  }

  const endpoint = 'http://localhost:8000';
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
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
    return Promise.resolve({data: {data: null, time: 0, degreesOfSeparation: 0, ok: false}, error: true});
  }
}

