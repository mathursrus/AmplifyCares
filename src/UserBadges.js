import React from 'react';
import './UserBadges.css';

const BadgeIcon = ({ badge }) => {
    let icon = '';
  
    if (badge.badgetype === 'streak') {
      icon = '🔥';
    } else if (badge.badgetype === 'rookie') {
      icon = '🌟';
    } else if (badge.badgetype === 'winner') {
      icon = '🏆';
    } else if (badge.badgetype === 'team') {
      icon = '🏅';
    }
  
    return (
      <div className="badge-icon" title={badge.badgetext}>
        <span className="icon">{icon}</span>        
      </div>
    );
  };

  const UserBadges = ({ badges }) => {
    const currentBadges = badges.find((badge) => badge.badgelisttype === 'current');
    const historicalBadges = badges.find((badge) => badge.badgelisttype === 'historical');
  
    return (
      <div className="user-badges">
        {currentBadges && currentBadges.badgelist.length > 0 && (
          <div className="badge-row">
            <div className="badge-heading">
            {localStorage.getItem('userDisplayName')}, take care of yourself and earn these badges
            </div>
            <div className="badge-icons">
              {currentBadges.badgelist.map((badge, index) => (
                <BadgeIcon key={index} badge={badge} />
              ))}
            </div>
          </div>
        )}
        {historicalBadges && historicalBadges.badgelist.length > 0 && (
          <div className="badge-row">
            <div className="badge-heading">
              <b>Your badgelist. Keep it growing!</b>
            </div>
            <div className="badge-icons">
              {historicalBadges.badgelist.map((badge, index) => (
                <BadgeIcon key={index} badge={badge} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

export default UserBadges;
