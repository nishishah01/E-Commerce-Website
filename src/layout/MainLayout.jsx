import React from 'react';
import { Outlet } from 'react-router-dom';
import Footer from '../components/ui/Footer';
import NavBar from '../components/ui/NavBar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MainLayout = ({numCartItems}) => {
  return (
    <>
      <NavBar numCartItems={numCartItems} />
      <ToastContainer />
      <Outlet />
      <Footer />
    </>
  );
};

export default MainLayout;
