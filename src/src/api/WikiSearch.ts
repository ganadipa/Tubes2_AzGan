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
  error: string | null;
}{
  const [data, setData] = useState<WikiResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!searchQuery) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      const endpoint = `https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=20&srsearch=${searchQuery}`;
      
      try {
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        const json = await response.json();
        console.log("json is")
        console.log(json)
        setData(json.query.search);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchQuery]);

  return { data, isLoading, error };
};