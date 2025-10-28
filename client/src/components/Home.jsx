import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { user } = useAuth();

  return (
    <div>
      <link rel="stylesheet" href="/normalize.css" />
      <link rel="stylesheet" href="/style.css" />
      <link href="https://fonts.googleapis.com/css?family=Lato|Playfair+Display|Playfair+Display+SC&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.12.1/css/all.min.css" />
      
      <header>
        <h1><img src="/images/booksWhiote.png" alt="BookIt! Logo" /></h1>
        <section>
          {user ? (
            <Link to="/profile" className="btn btn-default" id="loginIcon">
              <i className="fas fa-user fa-2x"></i>
              <p>PROFILE</p>
            </Link>
          ) : (
            <Link to="/login" className="btn btn-default" id="loginIcon">
              <i className="fas fa-user fa-2x"></i>
              <p>LOGIN</p>
            </Link>
          )}
        </section>
      </header>
      <section id="hero">
        <section id="leftPanel">
          <p id="discoverMemo">Discover your next adventure</p>
          <p id="curatedMemo">Curated Books Made Just For You</p>
          <Link to="/signup"><button type="submit">CREATE AN ACCOUNT</button></Link>
        </section>
        <section id="rightPanel">
          <img src="/images/Reader-on-Books.png" alt="" />
        </section>
      </section>
    </div>
  );
}

export default Home;
