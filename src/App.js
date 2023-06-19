import Leaderboard from "./Leaderboard";
import SubmitTimePage from "./SubmitTime";
import SummaryPage from "./SummaryPage";
import TeamList from "./TeamList";
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from "./Layout";
import FeedbackWidget from "./FeedbackWidget";
import './FeedbackWidget.css';

export default function AppPage() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout/>}>
            <Route index element={<SubmitTimePage/>}/>
            <Route path="submit-time-page" element={<SubmitTimePage/>}/>
            <Route path="summary-page" element={<SummaryPage/>}/>
            <Route path="leaderboard" element={<Leaderboard/>}/>
            <Route path="team-list" element={<TeamList/>}/>
          </Route>
        </Routes>    
      </BrowserRouter>
      <FeedbackWidget />
    </div>
  );
};