import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { BASE_URL } from '../../api';
import ProductPagePlaceholder from './ProductPagePlaceHolder';
import RelatedProducts from './RelatedProducts';
import { toast } from 'react-toastify';
const ProductPage = ({setNumCartItems}) => {
  const {slug}= useParams()
  const[product,setProduct]=useState({})
  const[similarProduct,setSimilarProducts]=useState([])
  const[loading, setLoading]=useState(false)
  const[inCart, setInCart]=useState(false)
  const cart_code=localStorage.getItem("cart_code")

  const newItem = { cart_code: cart_code, product_id: product.id };
 //should have same name as the serializer

 useEffect(() => {
  if (cart_code && product?.id) {
    api.get(`product_in_cart?cart_code=${cart_code}&product_id=${product.id}`)
      .then(res => {
        console.log(res.data);
        setInCart(res.data.product_in_cart);
        setNumCartItems(curr=>curr+1)
      })
      .catch(err => {
        console.log(err.message);
      });
  }
}, [cart_code, product?.id]);

  function add_item(){
    api.post("add_item/", newItem)
    .then(res=>{
      console.log(res.data)
      setInCart(true)
      toast.success("Product added to the cart")
    })
    .catch(err=>{
      console.log(err.message)
    })
  }
  useEffect(function(){
    setLoading(true)
    api.get(`product_detail/${slug}`)
    .then(res=>{
      console.log(res.data)
      setProduct(res.data)
      setSimilarProducts(res.data.similar_products)
      setLoading(false)
    })
    .catch(err=>{
      console.log(err.message)
      setLoading(false)
    })
  },[slug])
if (loading){
  return <ProductPagePlaceholder/>
}
  


  return (
    <div>
      
      <section className="py-3">
        <div className="container px-4 px-lg-5 my-5">
          <div className="row gx-4 gx-lg-5 align-items-center">
            <div className="col-md-6">
              <img 
                className="card-img-top mb-5 mb-md-0"
                src={`${BASE_URL}${product.image}`}
                alt="..."
              />
            </div>
            <div className="col-md-6">
              <div className="small mb-1">SKU: BST-498</div>
              <h1 className="display-5 fw-bolder">{product.name}</h1>
              <span className="text-decoration-line-through">₹45.00</span>
              <span>{`₹${product.price}`}</span>
              <div className="lead">
                <p>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Praesentium at dolores quibusdam enim. Nam sequi consequatur
                  obcaecati excepturi alias magni, accusamus eius blanditiis
                  delectus ipsam minima ea iste laborum vero?
                </p>
              </div>
              <div className="d-flex">
                
                <button 
                  className="btn btn-outline-dark flex-shrink-0" 
                  type="button"
                  onClick={add_item}
                  disabled={inCart}
                >
                  <i className="bi-cart-fill me-1"></i>
                  {inCart ? "Product added to cart" : "Add to cart"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <RelatedProducts products={similarProduct}/>
    </div>
  );
};

export default ProductPage;