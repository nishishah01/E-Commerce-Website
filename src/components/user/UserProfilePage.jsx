import React, { useEffect, useState } from 'react';
import api from '../../api';
import Spinner from '../ui/spinner';
import OrderHistoryItemContainer from './OrderHistoryItemContainer';
import UserInfo from './UserInfo';

const UserProfilePage = () => {
  const [userInfo, setUserInfo] = useState({});
  const [orderitems, setOrderitems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get('user_info')
      .then((res) => {
        console.log("User Data:", res.data);
        setUserInfo(res.data || {});  // Ensure userInfo is an object
        setOrderitems(res.data?.items || []);  // Ensure orderitems is an array
      })
      .catch((err) => {
        console.error("API Error:", err.response || err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Spinner loading={loading} />;
  }

  return (
    <div className="container my-5">
      <UserInfo userInfo={userInfo} />
      <OrderHistoryItemContainer orderitems={orderitems} />
    </div>
  );
};

export default UserProfilePage;
