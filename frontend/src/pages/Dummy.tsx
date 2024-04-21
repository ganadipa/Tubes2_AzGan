import React from 'react'
import { SearchPayload} from '../api/search'

const dummyPayload: SearchPayload = {source: 'a', target: 'b', using_bfs: true, all_paths: true}


const Dummy = () => {
  const [dummyData, setDummyData] = React.useState<SearchPayload>(dummyPayload)
  return (
    <div>

    </div>
  )
}

export default Dummy
