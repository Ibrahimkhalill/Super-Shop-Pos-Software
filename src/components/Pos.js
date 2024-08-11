import React, { useState } from "react";
// import Barcode from "react-barcode";
import "./pos.css";
export const PosInvoice = React.forwardRef((props, ref) => {
  const {
    fixData,
    netTotal,
    discount,
    VAT,
    due,
    invoice_no,
    pay,
    change,
    cuttingCharge,
    dressingCharge,
    vatAmount,
    discountAmount,
    saleBy,
  } = props;
  // eslint-disable-next-line no-unused-vars
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0]; // Format the date as 'YYYY-MM-DD'
    return formattedDate;
  });
  // eslint-disable-next-line no-unused-vars
  const [currentTime, setCurrentTime] = useState(new Date());
  // Update current time every second
  const today = new Date();
  const time = today.toLocaleTimeString();
  // setCurrentTime(new Date());
  return (
    <>
      <div ref={ref} className="pos-pinter">
        <div className="container">
          <div className="receipt_header">
            <h1>
              <span>IRANI MINI BAZAR</span>
            </h1>
            <h2>
              Address: Khilpara Bazar, Chatkhil, Noakhali{" "}
              <span>Phone: +8801830112972</span>
            </h2>
          </div>

          <div className="receipt_body">
            <div
              style={{
                fontSize: "13px",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Invoice/Bill
            </div>
            <div className="date_time_con">
              <div className="date">
                <span>Date : </span>
                {currentDate}&nbsp;&nbsp;&nbsp;&nbsp;<span>Time: {time}</span>
              </div>
            </div>

            <div className="items">
              <div className="separator">
                <div>Invoice No : {invoice_no}</div>
                <div>Sale By : {saleBy}</div>
              </div>

              <div className="hrline"></div>
              <table>
                <thead>
                  <tr>
                    <th>Serial</th>
                    <th colSpan={3}>Description</th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th>QTY</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {fixData &&
                    fixData.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td colSpan={6}>{item.product_name}</td>
                          <td>
                            {item.quantity} {item.unit}
                          </td>
                          <td>{item.sale_price}</td>
                          <td>{item.itemTotal}</td>
                        </tr>
                      );
                    })}
                </tbody>

                <tfoot>
                  {VAT > 0 && (
                    <tr>
                      <td colSpan={6}>Vat({VAT}%)</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td>{vatAmount}</td>
                    </tr>
                  )}
                  {discount > 0 && (
                    <tr>
                      <td colSpan={6}>Discount({discount}%)</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td>{discountAmount}</td>
                    </tr>
                  )}
                  {cuttingCharge && (
                    <tr>
                      <td colSpan={6}>Cutting Charge</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td>{cuttingCharge}</td>
                    </tr>
                  )}
                  {dressingCharge && (
                    <tr>
                      <td colSpan={6}>Dressing Charge</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td>{dressingCharge}</td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={6}> Net Total</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>{netTotal}</td>
                  </tr>
                  <div className="hr"></div>
                  {pay > 0 && (
                    <tr>
                      <td colSpan={6}>Pay</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td>{pay}</td>
                    </tr>
                  )}
                  {due > 0 && (
                    <tr>
                      <td colSpan={6}>Due</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td>{due}</td>
                    </tr>
                  )}
                  {change > 0 && (
                    <>
                      <tr>
                        <td colSpan={6}>Change</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>{Math.round(change)}</td>
                      </tr>
                    </>
                  )}
                </tfoot>
              </table>
            </div>
          </div>

          <h3 className="thank">Thank You, Come Again</h3>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "12px" }}>
              Terms & Conditions : No Cash Refund
            </div>
            <div style={{ fontSize: "12px" }}>Powered By</div>

            <span style={{ fontSize: "12px" }}>
              &copy; MerinaSoft, 173 Arambag, Motijheel
            </span>
          </div>
        </div>
      </div>
    </>
  );
});
