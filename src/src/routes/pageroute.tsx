
import { Route, Routes} from "react-router-dom";
import Main from "../pages/Main";
import NotFound from "../pages/NotFound";
import Game from "../pages/Game";

const PageRoute = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/Game" element={<Game />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default PageRoute;