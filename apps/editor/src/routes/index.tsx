import { Route, Routes } from "react-router";
import IndexRouter from "@/routes/home";

const DefaultRouterIndex = () => {
  return (
    <Routes>
      <Route path="/" element={<IndexRouter />} />
    </Routes>
  );
};

export default DefaultRouterIndex;
