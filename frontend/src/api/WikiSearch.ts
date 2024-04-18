import { useState, useEffect } from 'react';

export type WikiResult = {
    ns: number;
    title: string;
    pageid: number;
    size: number;
    snippet: string;
    timestamp: string;
    wordcount: number;
}


export function useWikiSearch(searchQuery: string):{
  data: WikiResult[];
  isLoading: boolean;
  error: boolean;
}{
  const [data, setData] = useState<WikiResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);


  useEffect(() => {

    if (searchQuery === '') {
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(false);
      const endpoint = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=prefixsearch&gpslimit=50&gpssearch=${searchQuery}`;
      
      try {
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        const json = await response.json();
        const result = Object.keys(json.query.pages).map((key) => json.query.pages[key])
        setData(result);
      } catch (error: any) {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchQuery]);

  return { data, isLoading, error };
};