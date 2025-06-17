import React, { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import api from './api';
import CartPage from './components/cart/CartPage';
import CheckoutPage from './components/checkout/CheckoutPage';
import HomePage from './components/home/HomePage';
import PaymentStatusPage from './components/payment/PaymentStatusPage';
import ProductPage from './components/product/ProductPage';
import NotFoundPage from './components/ui/NotFoundPage';
import ProtectedRoute from './components/ui/ProtectedRoute';
import LoginPage from './components/user/LoginPage';
import UserProfilePage from './components/user/UserProfilePage';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layout/MainLayout';

const App = () => {
  const [numCartItems, setNumCartItems] = useState(0);
  const cart_code = localStorage.getItem("cart_code");

  useEffect(function(){
    if(cart_code){
      api.get(`get_cart_stat?cart_code=${cart_code}`)
      .then(res=>{
        console.log(res.data)
        setNumCartItems(res.data.num_of_items)
      })
      .catch(err=>{
        console.log(err.message)
      })
    }
  },[cart_code])

  return (
    <AuthProvider>
    <Routes>
      <Route 
        path="/" 
        element={<MainLayout numCartItems={numCartItems} />}
      >
        <Route index element={<HomePage />} />
        <Route path="products/:slug" element={<ProductPage setNumCartItems={setNumCartItems} />} />
        <Route path="cart" element={<CartPage setNumCartItems={setNumCartItems} />} />
        <Route path="checkout" element={<ProtectedRoute>
          <CheckoutPage />
          </ProtectedRoute>}  />
        <Route path="login" element={<LoginPage/>} />
        <Route path="profile" element={<UserProfilePage/>}/>
        <Route path="payment-status" element={<PaymentStatusPage setNumCartItems={setNumCartItems}/>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
    </AuthProvider>
  );
};

export default App;