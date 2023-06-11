import React, { useState, useEffect } from 'react';
import './RecommendationsPage.css';
import { getApiUrl } from './utils/urlUtil';

/*
const recommendationsData = [
  {
    contributor: 'Sid',
    title: 'Meditation Video',
    url: 'https://www.youtube.com/embed/erZK7JBpOaI&t=1146s',
  },
  {
    contributor: 'Alice',
    title: 'Running book',
    url: 'https://www.amazon.com/Fourth-Wing-Empyrean-Rebecca-Yarros/dp/1649374046/ref=zg_sccl_2/134-4893920-4839467?pd_rd_w=LweOu&content-id=amzn1.sym.193afb92-0c19-4833-86f8-850b5ba40291&pf_rd_p=193afb92-0c19-4833-86f8-850b5ba40291&pf_rd_r=4GM1TR2D713XK0KRAJQS&pd_rd_wg=dPYD1&pd_rd_r=be352e14-2b97-447e-8e75-751339b30d04&pd_rd_i=1649374046&psc=1',
  },
  {
    contributor: 'Bob',
    title: 'Spirituality podcast',
    url: 'https://www.amazon.com/Fourth-Wing-Empyrean-Rebecca-Yarros/dp/1649374046/ref=zg_sccl_2/134-4893920-4839467?pd_rd_w=LweOu&content-id=amzn1.sym.193afb92-0c19-4833-86f8-850b5ba40291&pf_rd_p=193afb92-0c19-4833-86f8-850b5ba40291&pf_rd_r=4GM1TR2D713XK0KRAJQS&pd_rd_wg=dPYD1&pd_rd_r=be352e14-2b97-447e-8e75-751339b30d04&pd_rd_i=1649374046&psc=1',    
  },
  // Add more recommendations here
];
*/

const RecommendationsPage = (props) => {
  const [showInputFields, setShowInputFields] = useState(false);
  const [newRecommendation, setNewRecommendation] = useState({ title: '', url: '' });

  const recoType = props.type;
  const [recos, setRecos] = useState([]);

  const headlines = [
    [1, "Taking care of your mental health is essential for overall well-being and happiness. It empowers you to manage stress, build resilience, maintain healthy relationships, and unlock your full potential in both personal and professional aspects of life."],
    [2, "Prioritizing physical health is crucial for a fulfilling and vibrant life. It enables you to maintain energy levels, prevent illness and chronic conditions, improve cognitive function, enhance productivity, and enjoy a higher quality of life."],
    [3, "Nurturing spiritual health brings purpose, inner peace, and interconnectedness to your life. It cultivates resilience, joy, and a deeper understanding of life's purpose."],
    [4, "Investing in social health fosters meaningful connections and strengthens communities. By helping others, you will contribute to positive change, experience fulfillment, and create a ripple effect of kindness and compassion."]
  ];

  useEffect(() => {
    async function fetchData() {
        const response = await fetch(getApiUrl("/getrecommendations/?item="+recoType));
        const data = await response.json();
        const recos = JSON.parse(data);
        setRecos(recos);
        console.log("Recos is ", recos);
    }
    fetchData();
  }, [props, recoType]);
  
  const handleChange = (e) => {
    setNewRecommendation({ ...newRecommendation, [e.target.name]: e.target.value });
  };

  async function handleAddRecommendation(e)   {
    e.preventDefault();
    if (newRecommendation.title.trim() !== '' && newRecommendation.url.trim() !== '') {
      recos.push(newRecommendation);
      setNewRecommendation({ title: '', url: '' });
      const itemData = {
        title: newRecommendation.title,
        type: recoType,
        url: newRecommendation.url,
        contributor: localStorage.getItem('userName'),
      }
      await fetch(getApiUrl("/writerecommendation/?item="+JSON.stringify(itemData)));
    }
    setShowInputFields(false);
  };

  return (
    <div className="recommendations-page">
      <h5><i>{headlines.find(item => item[0] === recoType)[1]}</i></h5>
      <br></br>
      <h6><center>Here are a few recommendations from your colleagues</center></h6>
      {recos.map((recommendation, index) => (
        <div className="recommendation-tile" key={index}>
          <a className="URL" href={recommendation.url} target="_blank" rel="noopener noreferrer">
            <h3 className="title">{recommendation.title}</h3>
          </a>
          <h4 className="contributor">Recommended by: {recommendation.contributor}</h4>
        </div>
      ))}

      <div className="add-recommendation">
        {!showInputFields && (
            <button onClick={() => setShowInputFields(true)}>Have a Recommendation?</button>
        )}

        {showInputFields && (
            <>
            <input
                type="text"
                name="title"
                placeholder="Enter Title"
                value={newRecommendation.title}
                onChange={handleChange}
            />
            <input
                type="text"
                name="url"
                placeholder="Enter URL"
                value={newRecommendation.url}
                onChange={handleChange}
            />
            <button onClick={handleAddRecommendation}>Save</button>
            <button onClick={() => setShowInputFields(false)}>Cancel</button>
            </>
        )}
    </div>
  </div>
  );
};

export default RecommendationsPage;
