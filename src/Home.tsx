import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
const Home: React.FC = () => {
 
  const navigate = useNavigate();
  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      localStorage.setItem("userData", JSON.stringify(userData));
    }
  }, []);
 console.log("hello")
  return<>
      <h1>HEllo</h1>

      <img style = {{position:"static",maxHeight:"1000px"}}src="https://cdn.pixabay.com/photo/2023/11/02/00/19/ai-generated-8359510_640.jpg" alt="" />
      </>
    
  };
  
  export default Home;