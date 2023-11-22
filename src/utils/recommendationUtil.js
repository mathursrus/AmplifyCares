import { postWithToken, getApiUrl } from './urlUtil';

export const addCommentToRecommendation = async (recommendationId, commentString) => { 
  const user=localStorage.getItem('userName');
    const comment = {
      recommendation_id: recommendationId,
      user: user,
      text: commentString,
      date: Date.now()
    };    
    
    writeRecommendationComment(comment, user);
}

export const writeRecommendationComment = async (comment) => {
  await postWithToken("/writerecommendationcomment", comment, localStorage.getItem('userName'));
}

export const getRecommendationComments = async (recommendationId) => {
    const response = await fetch(getApiUrl("/getRecommendationComments?item="+recommendationId));
    const data = await response.json();
    const comments = JSON.parse(data);
    console.log("Comments is ", comments);
    return comments;
}