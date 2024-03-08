import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [postIDs, setPostIDs] = useState([]);
  const [postMetadata, setPostMetadata] = useState([]);

  const getData = async (url) => {
    try {
      const res = await fetch(url);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Error: ', err);
    }
  }

  const getFormattedDate = (unixTimestamp) => {
    const date = new Date(unixTimestamp * 1000);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  const getJobTitle = (text) => {
    const arr = text.split(/\((YC [^)]+)\)/);
    return arr[0] || "N/A";
  }

  const getJobInfo = (text) => {
    const arr = text.split(/\((YC [^)]+)\)/);
    return arr[2] || "N/A";
  }

  const fetchPostMetadata = async (ids) => {
    const apiCalls = ids.map((id) => {
      const url = `https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`;
      return getData(url);
    });
    const results = await Promise.all(apiCalls);

    if (results.length) {
      const newArr = results.map((item) => ({
        jobTitle: getJobTitle(item.title),
        jobInfo: getJobInfo(item.title),
        date: getFormattedDate(item.time),
        url: item.url ? item.url : `https://news.ycombinator.com/item?id=${item.id}`
      }));

      setPostMetadata((prevMetadata) => [...prevMetadata, ...newArr]);
    }
  }

  const fetchPostIDs = async () => {
    const url = 'https://hacker-news.firebaseio.com/v0/jobstories.json';
    const data = await getData(url);
    const ids = data.splice(0, 9); // Limit to 9 initial records
    setPostIDs(data);
    fetchPostMetadata(ids);
  }

  useEffect(() => {
    fetchPostIDs();
  }, []);

  const handleLoadMore = () => {
    const copyIds = [...postIDs];
    if (copyIds.length > 0) {
      const ids = copyIds.splice(0, 6); // Load 6 more records
      fetchPostMetadata(ids);
      setPostIDs(copyIds);
    }
  }

  return (
    <div className="App">
      <h1 className='heading'>Job Search</h1>
      <div className='cards'>
        {postMetadata?.length === 0 ? (
          <div>Loading...</div>
        ) : (
          postMetadata.map((post, index) => (
            <a className='card' href={post.url} target='_blank' rel='noopener noreferrer' key={index}>
              <div className='company-info'>
                <h2>{post.jobTitle}</h2>
              </div>
              <div className='hiring-info'>
                Job Description: <b>{post.jobInfo}</b>
              </div>
              <div className='date'>
                Job Posted date: <i><b>{post.date}</b></i>
              </div>
            </a>
          ))
        )}
      </div>
      <button onClick={handleLoadMore}>Load More</button>
    </div>
  );
}

export default App;
