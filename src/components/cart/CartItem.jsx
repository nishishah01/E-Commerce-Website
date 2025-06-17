import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api, { BASE_URL } from '../../api';

const CartItem = ({item, setCartTotal,setCartItems, cartItems, setNumCartItems}) => {

const[quantity, setQuantity]=useState(item.quantity)
const[loading, setLoading]= useState(false)


const itemData={quantity:quantity,item_id:item.id}
const itemID={item_id:item.id}

function deleteCartitem(){
  const confirmDelete=window.confirm('Are you sure you want to delete this cart item?')

  if (confirmDelete){
    api.post("delete_cartitem",itemID )
    .then(res=>{
      console.log(res.data)
      toast.success("cartitem deleted successfully")
      setCartItems(cartItems.filter(cartitem=>cartitem.id !== item.id))
      setCartTotal(cartItems.filter(cartitem=>cartitem.id !== item.id)
    .reduce((acc,curr)=>acc+curr.total,0))


    setNumCartItems(cartItems.filter(cartitem=>cartitem.id !== item.id)
    .reduce((acc,curr)=>acc+curr.quantity,0))
    }
    )
    .catch(err => {
      console.log(err.message)
    })
  }
}

function updateCartitem(){
  setLoading(true)
  api.patch("update_quantity/", itemData)
  .then(res => {
    console.log(res.data);
    setLoading(false)
    toast.success("Cartitem updated successfully!")
    setCartTotal(cartItems.map((cartitem)=> cartitem.id==item.id? res.data.data: cartitem)
    .reduce((acc,curr)=>acc+curr.total,0))


    setNumCartItems(cartItems.map((cartitem)=> cartitem.id===item.id ? res.data.data:cartitem )
    .reduce((acc,curr)=>acc+curr.quantity,0))
    

})
.catch(err => {
    console.log(err.message);
    setLoading(false)
});
}


    return (
      <div className="col-md-12">
        <div
          className="cart-item d-flex align-items-center mb-3 p-3"
          style={{ backgroundColor: "#f8f9fa", borderRadius: "8px" }}
        >
          <img
            src={`${BASE_URL}${item.product.image}`}
            alt="Product Image"
            className="img-fluid"
            style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "5px" }}
          />
          <div className="ms-3 flex-grow-1">
            <h5 className="product-name">{item.product.name}</h5>
            <p className="text-muted">₹{item.product.price}</p>         
             </div>
          <div className="d-flex align-items-center">
            <input
              type="number"
              min="1"
              className="form-control mx-3"
              value={quantity}
              onChange={(e)=>setQuantity(e.target.value)}
              style={{ width: "70px" }}
            />
            <button className="btn btn-sm mx-2" 
            onClick={updateCartitem}
            style={{backgroundColor: "#4b3bcd", color:"white"}} disabled={loading}>
              {loading? "Updating": "Update"}
              </button>
            <button className="btn btn-danger btn-sm" onClick={deleteCartitem}>
              Remove
              </button>
          </div>
        </div>
        {/* Add more cart items here */}
      </div>
    );
  };
  
  export default CartItem;
  


