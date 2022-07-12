import React from 'react';
import { Container } from 'react-bootstrap';

import Disclaimer from '../../info/Disclaimer';
import Header from '../Header/Header';
import Body from '../Body';
import "./app-initialization";

import './App.css';

export default function App() {
  return (
    <Container fluid className="App">
      <Disclaimer/>
      <Header/>
      <Body/>
    </Container>
  );
}
