import React from "react";
import styles from "./OrderHistoryItem.module.css"; 
import { BASE_URL } from "../../api"; 
import { FormatDate } from "../../FormatDate";
const OrderHistoryItem = ({ item }) => {
  return (
    <div className="card-body">
      <div className={`order-item mb-3 ${styles.orderItem || ""}`}>
        <div className="row">
          <div className="col-md-2">
            <img
              src={item.product?.image ? `${BASE_URL}${item.product.image}` : "/fallback-image.jpg"}
              alt="Order Item"
              className="img-fluid"
              style={{ borderRadius: "5px" }}
            />
          </div>
          <div className="col-md-6">
            <h6>{item.product?.name || "Product Name"}</h6>
            <p>{`Order Date: ${FormatDate(item.order_date) || "N/A"}`}</p>
            <p>{`Order ID: ${item.id || "N/A"}`}</p>
          </div>
          <div className="col-md-2 text-center">
            <h6 className="text-muted">{`Quantity: ${item.quantity || 0}`}</h6>
          </div>
          <div className="col-md-2 text-center">
            <h6 className="text-muted">{`₹${item.product?.price || 0}`}</h6>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryItem;
