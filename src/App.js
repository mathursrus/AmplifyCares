import ReactDOM from "react-dom/client";
import Leaderboard from "./Leaderboard";
import SubmitTimePage from "./SubmitTime";
import SummaryPage from "./SummaryPage";
import TeamList from "./TeamList";
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from "./Layout";

export default function AppPage() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout/>}>
            <Route index path="submit-time-page" element={<SubmitTimePage/>}/>
            <Route path="summary-page" element={<SummaryPage/>}/>
            <Route path="leaderboard" element={<Leaderboard/>}/>
            <Route path="team-list" element={<TeamList/>}/>
          </Route>
        </Routes>
      </BrowserRouter>
  );
};