
import { Route, Routes} from "react-router-dom";
import Main from "../pages/Main";
import NotFound from "../pages/NotFound";
import Game from "../pages/Game";
import Dummy from "../pages/Dummy";

const PageRoute = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/Game" element={<Game />} />
        <Route path="/Dummy" element={<Dummy />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default PageRoute;