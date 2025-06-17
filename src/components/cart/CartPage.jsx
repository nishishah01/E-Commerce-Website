import React from 'react'
import useCartData from '../../hooks/useCartData'
import Spinner from '../ui/Spinner'
import CartItem from './CartItem'
import CartSummary from './CartSummary'

const CartPage = ({setNumCartItems}) => {
  const {cartItems, setCartItems, cartTotal, setCartTotal, loading, tax} = useCartData()

if(loading){
  return <Spinner loading={loading}/>
}

if(cartItems.length < 1) {
  return(
    <div className="alert alert-primary my-5"  role="alert">
  You haven't any items to your cart.
</div>
  )
}


    return (
      <div className="container my-3 py-3" style={{height:"80vh", overflow:"scroll"}}>
        <h5 className="mb-4">Shopping Cart</h5>
        <div className="row">
          <div className="col-md-8">
            {cartItems.map(item=><CartItem key={item.id} item={item}
             cartItems={cartItems} 
             setCartTotal={setCartTotal}
             setNumCartItems={setNumCartItems}
             setCartItems={setCartItems}
             />)}
            
           

          </div>
          <CartSummary cartTotal={cartTotal} tax={tax}/>
        </div>
      </div>
    )
  }
  
  export default CartPage
